#!/usr/bin/env node
import 'dotenv/config';
import analyze from './analyze';

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

const screenName = process.argv[2];
if (!screenName) {
  console.error('Please specify a screen name to analyze as an argument. Example: npm run cli <screen_name>');
  process.exit();
}

(async () => {
  console.log(`Starting user ${screenName} analysis...`);
  const info = await analyze(screenName, config, { friend: false });

  const userScore = Math.round(info.profiles[0].language_independent.user * 100);
  const friendsScore = Math.round(info.profiles[0].language_independent.friend * 100);
  const temporalScore = Math.round(info.profiles[0].language_independent.temporal * 100);
  const networkScore = Math.round(info.profiles[0].language_independent.network * 100);
  const sentimentScore = Math.round(info.profiles[0].language_dependent.sentiment.value * 100);
  const finalScore = Math.round(info.profiles[0].bot_probability.all * 100);

  const msg = `User score: ${userScore}%\nFriends score: ${friendsScore}%\nTemporal score: ${temporalScore}%\nNetwork score ${networkScore}%\nSentiment score: ${sentimentScore}%\nFinal score: ${finalScore}%`;
  console.log(msg);
})();
