// Import external modules
import async from 'async';
import TwitterLite from 'twitter-lite';

// Import our modules
import userIndex from './index/user';
import friendsIndex from './index/friends';
import temporalIndex from './index/temporal';
import networkIndex from './index/network';
import sentimentIndex from './index/sentiment';
import library from './library';
import document from './document';
import { Op } from 'sequelize';

// Import DB modules
import {
  Request, Analysis, UserData, ApiData, CachedRequest, Cache
} from './infra/database/index';


// Object that will save the weights values;
const weights = {};

module.exports = (screenName, config, index = {
  user: true, friend: true, network: true, temporal: true, sentiment: true,
}, sentimentLang, getData, cacheInterval, verbose, origin, wantDocument, isFullAnalysis, fullAnalysisCache, cb) => new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor

  let useCache = process.env.USE_CACHE;
  if (typeof fullAnalysisCache != 'undefined' && fullAnalysisCache === 0) useCache = 0;

  if (!screenName || !config) {
    const error = 'You need to provide an username to analyze and a config for twitter app';
    if (cb) cb(error, null);
    reject(error);
    return error;
  }
  if (!config.consumer_key || !config.consumer_secret) {
    const error = 'twitter.js config file should have the following parameters:\nconsumer_key\nconsumer_secret';
    if (cb) cb(error, null);
    reject(error);
    return error;
  }

  const extraDetails = {};
  extraDetails.TWITTER_HANDLE = screenName;
  extraDetails.TWITTER_LINK = `https://twitter.com/${screenName}`;


  const twitterParams = config;
  // Create Twitter client
  let client = new TwitterLite(twitterParams);

  // If no access token and secret are provided, request a bearer token to make an App-auth
  if (!config.access_token_key || !config.access_token_secret) {
    const bearerToken = await client.getBearerToken();
    twitterParams.bearer_token = bearerToken.access_token;
    client = new TwitterLite(twitterParams); // create new Twitter Client with bearerToken
  }

  // used to return twitter user data
  let hashtagsUsed;
  let mentionsUsed;
  const param = { screen_name: screenName, count: 200 };

  // Index count is the divisor for the final average score, it is increase at same time of the index score calculation according to the
  // weight of these index
  let indexCount = 0;

  // store new client request and get request instance
  // const newRequest = await Request.create({ screenName, gitHead: await library.getGitHead(), origin });

  // get tweets timeline. We will use it for both the user and sentiment/temporal/network calculations
  const apiAnswer = await client.get('statuses/user_timeline', param).catch((err) => err);

  // if there's an error, save the api response as is and update the new request entry with it
  if (!apiAnswer || apiAnswer.error || apiAnswer.errors || apiAnswer.length === 0) {
    // TODO: Salvar erro
    if (cb) cb(apiAnswer, null);
    reject(apiAnswer);
    return apiAnswer;
  }

  // format api answer
  const { timeline, user } = library.getTimelineUser(apiAnswer);

  // check if we have a saved analysis of that user withing the desired time interval
  if (useCache === '1') {
    const cacheInterval = library.getCacheInterval();

    const cachedResponse = await Cache.findOne({
      attributes: ['simple_analysis', 'full_analysis', 'times_served', 'id'],
      where: {
        '$analysis.twitter_user_id$': user.id_str,
        '$analysis.createdAt$': { [Op.between]: [cacheInterval, new Date()] },
      },
      include: 'analysis'
    });

    if (cachedResponse) {
      const currentTimesServed = cachedResponse['times_served'];
      const responseToUse = isFullAnalysis ? cachedResponse['full_analysis'] : cachedResponse['simple_analysis'];

      if (responseToUse) {
        const cachedJSON = JSON.parse(responseToUse);

        if (isFullAnalysis) {
          const fullAnalysisRet = await library.buildAnalyzeReturn(cachedJSON);
          resolve(fullAnalysisRet);
          return fullAnalysisRet;
        }

        cachedResponse.times_served = currentTimesServed + 1;
        await cachedResponse.save();

        resolve(cachedJSON);
        return cachedJSON;
      }
    }
  }

  // get and store rate limits
  if (getData && timeline) timeline.rateLimit = await library.getRateStatus(timeline);

  const explanations = [`Análise do usuário: ${screenName}`];
  explanations.push('Carregou a timeline com o endpoint "statuses/user_timeline"');

  // All the following functions will be executing at the same time and then call the final one
  async.parallel([
    // This function is used to get the users/show endpoint and to calculate the "user" index
    async (callback) => {
      try {
        if (index.user === false) {
          callback();
        } else {
          const data = user;
          const res = await userIndex(data, explanations, extraDetails);
          explanations.push(`Score User: ${res[0]}`);
          explanations.push(`Peso do Score Network: ${res[1]}`);
          weights.USER_INDEX_WEIGHT = res[1];
          indexCount += res[1];
          callback(null, res[0], data);
        }
      } catch (error) {
        callback(error);
      }
    },
    // This function is used to get the followers/list endpoint and to calculate the "friend" index
    async (callback) => {
      try {
        if (index.friend === false) {
          callback();
        } else {
          param.count = 200;
          const data = await client.get('followers/list', param);
          const res = await friendsIndex(data);
          indexCount += res[1];
          callback(null, res[0], data);
        }
      } catch (error) {
        callback(error);
      }
    },
    // This function is used to get the friends/list endpoint and to calculate the "friend" index
    async (callback) => {
      try {
        if (index.friend === false) {
          callback();
        } else {
          param.count = 200;
          const data = await client.get('friends/list', param);
          const res = await friendsIndex(data);
          indexCount += res[1];
          callback(null, res[0], data);
        }
      } catch (error) {
        callback(error);
      }
    },
    // This function is used to get the friends/list endpoint and to calculate the "temporal", "network" and "sentiment" indexes
    async (callback) => {
      try {
        if (index.temporal === false && index.network === false && index.sentiment === false) {
          callback();
        } else {
          param.count = 200;
          const data = timeline;
          let res1 = [];
          let res2 = [];
          let res3 = [];
          if (index.temporal !== false) {
            res1 = await temporalIndex(data, user, explanations, extraDetails);
            explanations.push(`Score Temporal: ${res1[0]}`);
            explanations.push(`Peso do Score Temporal: ${res1[1]}`);
            weights.TEMPORAL_INDEX_WEIGHT = res1[1];

            indexCount += res1[1];
          }
          if (index.network !== false) {
            res2 = await networkIndex(data, explanations, extraDetails);
            explanations.push(`Score Network: ${res2[0]}`);
            explanations.push(`Peso do Score Network: ${res2[1]}`);
            weights.NETWORK_INDEX_WEIGHT = res2[1];
            hashtagsUsed = res2[2]; // eslint-disable-line prefer-destructuring
            mentionsUsed = res2[3]; // eslint-disable-line prefer-destructuring
            indexCount += res2[1];
          }
          if (index.sentiment !== false) {
            res3 = await sentimentIndex(data, sentimentLang, explanations, extraDetails);
            explanations.push(`Score Sentiment: ${res3[0]}`);
            explanations.push(`Peso do Score Sentiment: ${res3[1]}`);
            weights.SENTIMENT_INDEX_WEIGHT = res3[1];
            indexCount += res3[1];
          }
          callback(null, [res1[0], res2[0], res3[0]]);
        }
      } catch (error) {
        callback(error);
      }
    },
  ],
    //  This function is the final one and occurs when all indexes get calculated
    async (err, results) => {
      if (err) {
        if (cb) cb(err, null);
        reject(err);
        return err;
      }

      explanations.push('\nCálculo do resultado final\n');

      // Save all results in the correct variable
      let userScore = results[0][0];
      let friendsScore = (results[1] + (results[2] * 1.5)) / (2 * 1.5);
      let temporalScore = results[3][0];
      let networkScore = results[3][1];
      let sentimentScore = results[3][2];

      // If any scores is not calculated, null is set for avoid error during the final calculation
      const isNumber = (value) => !Number.isNaN(Number(value));
      if (!isNumber(userScore)) userScore = null;
      if (!isNumber(friendsScore)) friendsScore = null;
      if (!isNumber(temporalScore)) temporalScore = null;
      if (!isNumber(networkScore)) networkScore = null;
      if (!isNumber(sentimentScore)) sentimentScore = null;

      explanations.push(`Score User: ${userScore}`);
      explanations.push(`Score Friend (Ignorado): ${friendsScore}`);
      explanations.push(`Score Temporal: ${temporalScore}`);
      explanations.push(`Score Netword: ${networkScore}`);
      explanations.push(`Score Sentiment: ${sentimentScore}`);

      const scoreSum = userScore + friendsScore + temporalScore + networkScore + sentimentScore;

      // Adjustment for not getting any score more than 0.99 in the final result
      const total = Math.min(scoreSum / indexCount, 0.99);

      explanations.push(`Somamos todos os ${indexCount} scores que temos: ${userScore} + ${friendsScore} + ${temporalScore} + ${networkScore} + ${sentimentScore} = ${scoreSum}`);
      explanations.push('Dividimos a soma pela quantidade de scores e limitamos o resultado a 0.99');
      explanations.push(`Fica: ${scoreSum} / ${indexCount} = ${total}`);
      explanations.push(`Total: ${total}`);

      if (networkScore > 1) {
        networkScore /= 2;
      } else if (networkScore > 2) {
        networkScore = 1;
      }

      if (temporalScore > 1) {
        temporalScore /= 2;
      } else if (temporalScore > 2) {
        temporalScore = 1;
      }

      // Sorting weights
      const sortedWeights = {};
      var keys = Object.keys(weights);

      keys.sort(function (a, b) {
        return weights[b] - weights[a]   //inverted comparison
      }).forEach(function (k) {
        sortedWeights[k] = weights[k];
      });

      // Using the first key of weights to build the info
      const weightKey = Object.keys(sortedWeights)[0];
      let info;

      if (weightKey === 'USER_INDEX_WEIGHT') {
        info = '<p>Um dos critérios que mais teve peso na análise foi o índice de Perfil</p>';
      }
      else if (weightKey === 'NETWORK_INDEX_WEIGHT:') {
        info = '<p>Um dos critérios que mais teve peso na análise foi o índice de Rede</p>';
      }
      else if (weightKey === 'TEMPORAL_INDEX_WEIGHT') {
        info = '<p>Um dos critérios que mais teve peso na análise foi o índice Temporal</p>';
      }
      else {
        info = '<p>Um dos critérios que mais teve peso na análise foi o índice de Sentimento</p>';
      }

      // Create the response object
      const object = {
        metadata: {
          count: 1,
        },
        profiles: [{
          username: param.screen_name,
          url: `https://twitter.com/${param.screen_name}`,
          avatar: user.profile_image_url,
          language_dependent: {
            sentiment: {
              value: sentimentScore,
            },
          },
          language_independent: {
            friend: friendsScore,
            temporal: temporalScore,
            network: networkScore,
            user: userScore,
          },
          bot_probability: {
            all: total,
            info: info,
          },
          user_profile_language: user.lang,
        }],
      };

      // add data from twitter to complement return (if getDate is true) and save to database
      const data = {};

      data.created_at = user.created_at;
      data.user_id = user.id_str;
      data.user_name = user.name;
      data.following = user.friends_count;
      data.followers = user.followers_count;
      data.number_tweets = user.statuses_count;

      data.hashtags = hashtagsUsed;
      data.mentions = mentionsUsed;

      if (getData) {
        object.twitter_data = data;
        object.rate_limit = timeline.rateLimit;
      }

      // save Analysis Data on database
      const { id: newAnalysisID } = await Analysis.create({
        total,
        user: userScore,
        friend: friendsScore,
        sentiment: sentimentScore,
        temporal: temporalScore,
        network: networkScore,
        twitter_user_id: user.id_str,
        twitter_handle: param.screen_name,
        twitter_created_at: data.created_at,
        twitter_following_count: data.following,
        twitter_followers_count: data.followers,
        twitter_tweets_count: data.number_tweets,
        origin: origin
      }).then((res) => res.dataValues);

      // Saving cache
      const details = await document.getExtraDetails(extraDetails);
      const detailsAsString = JSON.stringify(details);
      await Cache.create({
        analysis_id: newAnalysisID,
        simple_analysis: JSON.stringify(object),
        full_analysis: detailsAsString,
        updatedAt: null
      });

      // save User Data on database
      // const { id: newUserDataID } = await UserData.create({
      //   username: data.user_name,
      //   twitterID: data.user_id,
      //   profileCreatedAt: data.created_at,
      //   followingCount: data.following,
      //   followersCount: data.followers,
      //   statusesCount: data.number_tweets,
      //   hashtagsUsed: data.hashtags,
      //   mentionsUsed: data.mentions,
      // }).then((res) => res.dataValues);

      // update request
      // newRequest.analysisID = newAnalysisID;
      // newRequest.userDataID = newUserDataID;
      // newRequest.save();

      if (verbose) object.profiles[0].bot_probability.info = library.getLoggingtext(explanations);
      if (wantDocument) object.profiles[0].bot_probability.extraDetails = details;

      if (newAnalysisID) object.analysis_id = newAnalysisID;

      if (cb) cb(null, object);
      resolve(object);
      return object;
    });
  return null;
});
