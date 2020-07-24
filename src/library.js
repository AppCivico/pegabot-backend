import { execSync } from 'child_process';

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
};
