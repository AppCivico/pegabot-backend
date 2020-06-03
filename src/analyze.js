// Import external modules
import TwitterLite from 'twitter-lite';

// Import our modules
import userIndex from './index/user';
import friendsIndex from './index/friends';
import temporalIndex from './index/temporal';
import networkIndex from './index/network';
import sentimentIndex from './index/sentiment';

module.exports = async (screenName, config, index = {
  user: true, friend: true, network: true, temporal: true, sentiment: true,
}) => {
  if (!screenName || !config) {
    const error = 'You need to provide an username to analyze and a config for twitter app';
    return { error };
  }
  if (!config.consumer_key || !config.consumer_secret) {
    const error = 'twitter.js config file should have the following parameters:\nconsumer_key\nconsumer_secret';
    return { error };
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

  const param = { screen_name: screenName };

  try {
    // Index count is the divisor for the final average score
    // It increases at same time as the index score calculation according to the weight of these indexes

    let indexCount = 0;
    const results = [];
    // get users/show and calculate "user" index
    if (index.user !== false) {
      const data = await client.get('users/show', param);
      console.log(JSON.stringify(data, null, 2));
      const res = await userIndex(data);
      indexCount += res[1];
      results.push([res[0], data]);
    } else {
      results.push([]);
    }

    // get followers/list and calculate "friend" index
    if (index.friend !== false) {
      param.count = 200;
      const data = await client.get('followers/list', param);
      const res = await friendsIndex(data);
      indexCount += res[1];
      results.push([res[0], data]);
    } else {
      results.push([]);
    }

    // get friends/list and calculate "friend" index
    if (index.friend !== false) {
      param.count = 200;
      const data = await client.get('friends/list', param);
      const res = await friendsIndex(data);
      indexCount += res[1];
      results.push([res[0], data]);
    } else {
      results.push([]);
    }

    // get statuses/user_timeline and calculate "temporal", "network" and "sentiment" indexes
    if (index.temporal !== false || index.network !== false || index.sentiment !== false) {
      param.count = 200;
      const data = await client.get('statuses/user_timeline', param);
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
      }
      if (index.sentiment !== false) {
        res3 = await sentimentIndex(data);
        indexCount += res3[1];
      }
      results.push([res1[0], res2[0], res3[0]]);
    } else {
      results.push([]);
    }

    // Save all results in the correct variable
    const user = results[0][1];
    let userScore = results[0][0];
    let friendsScore = (results[1] + (results[2] * 1.5)) / (2 * 1.5);
    let temporalScore = results[3][0];
    let networkScore = results[3][1];
    let sentimentScore = results[3][2];

    // If any scores is not calculated, null is set to avoid error during the final calculation
    const isNumber = (value) => !Number.isNaN(Number(value));
    if (!isNumber(userScore)) userScore = null;
    if (!isNumber(friendsScore)) friendsScore = null;
    if (!isNumber(temporalScore)) temporalScore = null;
    if (!isNumber(networkScore)) networkScore = null;
    if (!isNumber(sentimentScore)) sentimentScore = null;

    const scoreSum = userScore + friendsScore + temporalScore + networkScore + sentimentScore;

    // Limit the final result at 0.99
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
    const finalResult = {
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
        },
        user_profile_language: user.lang,
      }],
    };

    return finalResult;
  } catch (error) {
    return { error };
  }
};
