#!/usr/bin/env node
require('dotenv').config();

// Import our module
const analyze = require('./analyze');

// import config keys
const config = require('../twitter');

const screen_name = process.argv[2];
if (!screen_name) {
  console.error('Please specific in argument a screen name to analyze');
  return;
}
console.log('Start analyzing the user', screen_name);

analyze(screen_name, config).then(function (info) {
  let userScore = Math.round(info.profiles[0].language_independent.user * 100);
  let friendsScore = Math.round(info.profiles[0].language_independent.friend * 100);
  let temporalScore = Math.round(info.profiles[0].language_independent.temporal * 100);
  let networkScore = Math.round(info.profiles[0].language_independent.network * 100);
  let sentimentScore = Math.round(info.profiles[0].language_dependent.sentiment.value * 100);
  let total = Math.round(info.profiles[0].bot_probability.all * 100);
  console.log('User score:', userScore + '%\nFriends score:', friendsScore + '%\nTemporal score:', temporalScore + '%\nNetwork score:', networkScore + '%\nSentiment score:', sentimentScore + '%\nFinal score:', total + '%');
}).catch(function (err) {
  console.error(err);
});
