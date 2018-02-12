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
    let target = request.query.search_for;
    let profile = request.query.profile;
    let names = new Array();

    console.log(target);
    console.log(profile);
    if (typeof target === 'undefined' || typeof profile === 'undefined') {
      response.status(400).send('One parameter is missing')
    }
    else if (target === 'profile') {
      names.push(profile)
      B.getBatchBotScores(names,data => {
        let object = {
          metadata: {
            count: 1
          },
          profiles: {
            username: data[0].user.screen_name,
            url: data[0].user.url,
            avatar: data[0].user.profile_image_url,
            language_dependent: {
              content: {
                value: data[0].botometer.categories.content
              },
              sentiment: {
                value: data[0].botometer.categories.sentiment
              }
            },
            language_independent: {
              friend: data[0].botometer.categories.friend,
              temporal: data[0].botometer.categories.temporal,
              network: data[0].botometer.categories.network,
              user: data[0].botometer.categories.user
            },
            bot_probability: {
              all: data[0].botometer.scores.universal,
              language_independent: data[0].botometer.scores.english
            },
            share_link_on_social_network: ".",
            user_profile_language: data[0].user.lang,
            feedback_report_link: "."
          }
        };
        response.send(JSON.stringify(object))
        console.log(object);
      });
    }
    else if (target === 'followers') {
      let params = {
        screen_name: profile
      };
      client.get('followers/list', params, function(error, tweets, response_twitter) {
        if (error) {
          console.log(error);
          throw error;
        }
        let data = JSON.parse(response_twitter.body)
        let count = data.users.length;
        async.eachOf(data.users, function(value, key, callback) {
          let current_follower = value.screen_name;
          names.push(current_follower);
          callback();
        }, function (err) {
            if (err) console.error(err.message);
            B.getBatchBotScores(names,data_user => {
              let object = {
                metadata: {
                  count: count
                },
                profiles: new Array()
              };
              async.eachOf(data_user, function(value_current, key, callback) {
                object.profiles.push(
                  {
                    username: value_current.user.screen_name,
                    url: value_current.user.url,
                    avatar: value_current.user.profile_image_url,
                    language_dependent: {
                      content: {
                        value: value_current.botometer.categories.content
                      },
                      sentiment: {
                        value: value_current.botometer.categories.sentiment
                      }
                    },
                    language_independent: {
                      friend: value_current.botometer.categories.friend,
                      temporal: value_current.botometer.categories.temporal,
                      network: value_current.botometer.categories.network,
                      user: value_current.botometer.categories.user
                    },
                    bot_probability: {
                      all: value_current.botometer.scores.universal,
                      language_independent: value_current.botometer.scores.english
                    },
                    share_link_on_social_network: ".",
              			user_profile_language: value_current.user.lang,
              			feedback_report_link: "."
                  }
                )
                callback();
              }, function(err) {
                if (err) console.error(err.message);
                response.send(JSON.stringify(object))
                console.log(object);
            });
          });
        });
      });
    }
    else if (target === 'friends') {
       let params = {
        screen_name: profile
      };
      client.get('friends/list', params, function(error, tweets, response_twitter) {
        if (error) {
          console.log(error);
          throw error;
        }
        let data = JSON.parse(response_twitter.body)
        let count = data.users.length;
        async.eachOf(data.users, function(value, key, callback) {
          let current_follower = value.screen_name;
          names.push(current_follower);
          callback();
        }, function (err) {
            if (err) console.error(err.message);
            B.getBatchBotScores(names,data_user => {
              let object = {
                metadata: {
                  count: count
                },
                profiles: new Array()
              };
              async.eachOf(data_user, function(value_current, key, callback) {
                object.profiles.push(
                  {
                    username: value_current.user.screen_name,
                    url: value_current.user.url,
                    avatar: value_current.user.profile_image_url,
                    language_dependent: {
                      content: {
                        value: value_current.botometer.categories.content
                      },
                      sentiment: {
                        value: value_current.botometer.categories.sentiment
                      }
                    },
                    language_independent: {
                      friend: value_current.botometer.categories.friend,
                      temporal: value_current.botometer.categories.temporal,
                      network: value_current.botometer.categories.network,
                      user: value_current.botometer.categories.user
                    },
                    bot_probability: {
                      all: value_current.botometer.scores.universal,
                      language_independent: value_current.botometer.scores.english
                    },
                    share_link_on_social_network: ".",
              			user_profile_language: value_current.user.lang,
              			feedback_report_link: "."
                  }
                )
                callback();
              }, function(err) {
                if (err) console.error(err.message);
                response.send(JSON.stringify(object))
                console.log(object);
            });
          });
        });
      });
    }
    else {
      response.status(400).send('search_for is wrong')
    }
});
