// Import external modules
import async from 'async';
import TwitterLite from 'twitter-lite';

// Import our modules
import userIndex from './index/user';
import friendsIndex from './index/friends';
import temporalIndex from './index/temporal';
import networkIndex from './index/network';
import sentimentIndex from './index/sentiment';

module.exports = (screenName, config, index = {
  user: true, friend: true, network: true, temporal: true, sentiment: true,
}, sentimentLang, getData, cb) => new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
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
  // get tweets timeline. We will use it for both the user and sentiment/temporal/network calculations
  const timeline = await client.get('statuses/user_timeline', param);

  // All the following functions will be executing at the same time and then call the final one
  async.parallel([
    // This function is used to get the users/show endpoint and to calculate the "user" index
    async (callback) => {
      try {
        if (index.user === false) {
          callback();
        } else {
          let data = {};
          // get user data from statuses/user_timeline endpoint instead of the users/show endpoint
          if (timeline && timeline[0] && timeline[0].user2) {
            data = timeline[0].user;
          } else { // if we couldn't get the user data from the timeline, get from the users/show endpoint
            data = await client.get('users/show', param);
          }
          const res = await userIndex(data);
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
            res1 = await temporalIndex(data);
            indexCount += res1[1];
          }
          if (index.network !== false) {
            res2 = await networkIndex(data);
            indexCount += res2[1];
            if (getData) {
              hashtagsUsed = res2[2]; // eslint-disable-line prefer-destructuring
              mentionsUsed = res2[3]; // eslint-disable-line prefer-destructuring
            }
          }
          if (index.sentiment !== false) {
            res3 = await sentimentIndex(data, sentimentLang);
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
  (err, results) => {
    if (err) {
      if (cb) cb(err, null);
      reject(err);
      return err;
    }
    // Save all results in the correct variable
    const user = results[0][1];
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

    const scoreSum = userScore + friendsScore + temporalScore + networkScore + sentimentScore;

    // Adjustment for not getting any score more than 0.99 in the final result
    const total = Math.min(scoreSum / indexCount, 0.99);

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

    // Create the response object
    const object = {
      metadata: {
        count: 1,
      },
      profiles: new Array({
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
        },
        user_profile_language: user.lang,
      }),
    };

    // add data from twitter to return
    if (getData) {
      const data = {};
      const userData = timeline[0].user;

      data.created_at = userData.created_at;
      data.user_id = userData.id_str;
      data.user_name = userData.name;
      data.following = userData.friends_count;
      data.followers = userData.followers_count;
      data.number_tweets = userData.statuses_count;

      data.hashtags = hashtagsUsed;
      data.mentions = mentionsUsed;

      object.twitter_data = data;
    }

    if (cb) cb(null, object);
    resolve(object);
    return object;
  });
  return null;
});
