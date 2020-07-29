import { execSync } from 'child_process';
import { Op } from 'sequelize';
import { Request } from './infra/database/index';

/**
 * Configure a date to complete the cached result time rante
 * @param {string} interval - This string must be a number and a valid time period (days|hours|minutes|seconds) separated by an underline
 * @return {Date} A date object
 * @example
 * getCacheInterval('2_days')
 */
function getCacheInterval(interval) {
  let newInterval = interval || process.env.CACHE_INTERVAL;
  if (!newInterval || !newInterval.match(/[0-9]{1,}_(days|hours|minutes|seconds)/i)) newInterval = '10_days';
  const splitStr = newInterval.split('_');

  const value = splitStr[0];
  const time = splitStr[1];
  const date = new Date();

  if (time === 'days') date.setDate(date.getDate() - value);
  if (time === 'hours') date.setHours(date.getHours() - value);
  if (time === 'minutes') date.setMinutes(date.getMinutes() - value);
  if (time === 'seconds') date.setSeconds(date.getSeconds() - value);

  return date;
}

const editDistance = (string1, string2) => {
  const s1 = string1.toLowerCase();
  const s2 = string2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i += 1) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j += 1) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

export default {

  getNumberOfDigit: (string) => string.replace(/[^0-9]/g, '').length,

  convertTwitterDateToDaysAge: (date) => {
    const split = date.split(' ');
    const month = new Date(Date.parse(`${split[1]} 1, 2012`)).getMonth();
    const day = split[2];
    const year = split[split.length - 1];
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(year, month, day);
    const now = new Date();
    const diffDays = Math.round(Math.abs((firstDate.getTime() - now.getTime()) / (oneDay)));

    return diffDays;
  },

  similarity: (s1, s2) => {
    let longer = s1;
    let shorter = s2;

    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }

    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  },

  getDefaultLanguage: (origin = '') => {
    if (!origin || typeof origin !== 'string') return 'pt';
    if (origin.includes('es.pegabots')) return 'es';
    if (origin.includes('en.pegabots')) return 'en';
    return 'pt';
  },

  getRateStatus: (res) => {
    if (!res || !res._headers) return {}; // eslint-disable-line no-underscore-dangle
    const remaining = res._headers.get('x-rate-limit-remaining'); // eslint-disable-line no-underscore-dangle
    const limit = res._headers.get('x-rate-limit-limit'); // eslint-disable-line no-underscore-dangle
    const delta = (res._headers.get('x-rate-limit-reset') * 1000) - Date.now(); // eslint-disable-line no-underscore-dangle
    const toReset = Math.ceil(delta / 1000 / 60);
    return { remaining, limit, toReset };
  },

  getGitHead: async () => execSync('git rev-parse HEAD', { encoding: 'utf8' }),

  getTimelineUser: (apiRes) => {
    if (!apiRes || !apiRes[0]) return {};
    const { user } = apiRes[0];
    const timeline = apiRes;
    timeline.forEach((e) => { delete e.user; });

    return { user, timeline };
  },


  /**
 * Get cached result data for an user withing the desired time interval
 * @param {string} screenName - the name of the user
 * @param {string} interval - a string to set the desired time range (See: getCacheInterval)
 * @return {object} An object containing the results of a previous analysis
 * @example
 * getCachedRequest('myUnser123','3_hours')
 */
  getCachedRequest: async (screenName, interval) => {
    const startDate = new Date();
    const endDate = getCacheInterval(interval);

    const cached = await Request.findOne({
      where: {
        screenName,
        createdAt: { [Op.between]: [endDate, startDate] },
        cachedRequestID: null, // cant be a request that used another cached request
      },
      order: [['createdAt', 'DESC']], // select the newest entry
      include: ['analysis', 'userdata'], // get extra data as well
      raw: true,
    });

    if (!cached || !cached.id || !cached.analysisID) return null;
    return cached;
  },

  formatCached: (cached, getData) => {
    const res = cached['analysis.fullResponse'];

    if (getData) {
      const data = {};
      data.created_at = cached['userdata.profileCreatedAt'];
      data.user_id = cached['userdata.twitterID'];
      data.user_name = cached['userdata.username'];
      data.following = cached['userdata.followingCount'];
      data.followers = cached['userdata.followersCount'];
      data.number_tweets = cached['userdata.statusesCount'];

      data.hashtags = cached['userdata.hashtagsUsed'];
      data.mentions = cached['userdata.hashtagsUsed'];

      res.twitter_data = data;
      res.rate_limit = {};
    }
    return res;
  },
};
