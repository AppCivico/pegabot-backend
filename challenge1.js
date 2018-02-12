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
    console.log(request.params); /* This prints the  JSON document received (if it is a JSON document) */
    let profile = request.query.profile;
    let names = new Array();

    if (typeof profile === 'undefined') {
      response.status(400).send('One parameter is missing')
    }
    else {
      let params = {
        screen_name: profile
      };
      client.get('followers/list', params, function(error, tweets, response_twitter) {
        if (error) {
          console.log(error);
          throw error;
        }
        let data = JSON.parse(response_twitter.body)
        async.eachOf(data.users, function(value, key, callback) {
          let current_follower = value.screen_name;
          names.push(current_follower);
          callback();
        }, function (err) {
            if (err) console.error(err.message);
            B.getBatchBotScores(names,data_user => {
              let count = 0;
              async.eachOf(data_user, function(value_current, key, callback) {
                if (value_current.botometer.scores.universal >= 0.50)
                {
                  count++;
                }
                callback();
              }, function(err) {
                if (err) console.error(err.message);
                let object = {
                  count: count
                };
                response.send(JSON.stringify(object))
                console.log(object);
            });
          });
        });
      });
    }
});
