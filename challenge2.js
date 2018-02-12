'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  request = require('request'),
  bodyParser = require('body-parser'),
  async = require('async'),
  botometer = require('node-botometer'),
  Twitter = require('twitter'),
  getBearerToken = require('get-twitter-bearer-token'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
const server = app.listen(process.env.PORT || 1337, () => console.log('server is launched'));
server.timeout = 0;

const twitter_consumer_key = '7FCkRJ5B5pA5WdVc8taFqSkMH'
const twitter_consumer_secret = 'bgK8NV9oCj7CPuczKHySvk177DBzYFflP4BuW4DgItTvgRvdD5'
const twitter_access_token_key = '950378405337350144-8cKAr0MnDlxQgLPeOYDY9r7CTbmjijW'
const twitter_access_token_secret = 'K9xGx6AhKB7o3NpnIvGe5PxKBwLP9DUORvDmQwgmy99Ys'

let client = new Twitter({
      consumer_key: twitter_consumer_key,
      consumer_secret: twitter_consumer_secret,
      access_token_key: twitter_access_token_key,
      access_token_secret: twitter_access_token_secret
});


const B = new botometer({
  consumer_key: twitter_consumer_key,
  consumer_secret: twitter_consumer_secret,
  access_token: null,
  access_token_secret: null,
  app_only_auth: true,
  mashape_key: 'GhALQRqDbHmshcQXZhatEYKsScyBp1STVehjsno98Aa0hsXUqI',
  rate_limit: 0,
  log_progress: true,
  include_user: true,
  include_timeline: false,
  include_mentions: false
});

app.get("/botometer", function(request, response) {
    let names = new Array();

      let params = {
        q: '@BurgerKing',
        lang: 'pt',
        until: '2018-02-11'
      };
      client.get('search/tweets.json', params, function(error, tweets, response_twitter) {
        if (error) {
          console.log(error);
          throw error;
        }
        let tweets_count = 0;
        async.eachOf(tweets.statuses, function(value, key, callback) {
          if (value.created_at.substring(0, 10) == 'Fri Feb 09') {
            tweets_count++;
            names.push(value.user.screen_name);
          }
          callback();
        }, function (err) {
            if (err) console.error(err.message);
            names = removeDuplicates(names)
            B.getBatchBotScores(names,data_user => {
              let count_bot = 0;
              async.eachOf(data_user, function(value_current, key, callback) {
                if (value_current.botometer.scores.universal >= 0.50)
                {
                  count_bot++;
                }
                callback();
              }, function(err) {
                if (err) console.error(err.message);
                let object = {
                  count_tweet: tweets_count,
                  count_bot: count_bot
                };
                response.send(JSON.stringify(object))
                console.log(object);
            });
          });
        });
      });
});

function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}
