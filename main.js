'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  request = require('request'),
  bodyParser = require('body-parser'),
  async = require('async'),
  spottingbot = require('spottingbot'),
  Twitter = require('twitter'),
  getBearerToken = require('get-twitter-bearer-token'),
  mcache = require('memory-cache'),
  qs = require('querystring'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
const server = app.listen(process.env.PORT || 1337, () => console.log('server is launched'));
server.timeout = 0;

const config = {
  twitter_consumer_key: "7FCkRJ5B5pA5WdVc8taFqSkMH",
  twitter_consumer_secret: "bgK8NV9oCj7CPuczKHySvk177DBzYFflP4BuW4DgItTvgRvdD5",
  twitter_access_token_key: "950378405337350144-8cKAr0MnDlxQgLPeOYDY9r7CTbmjijW",
  twitter_access_token_secret: "K9xGx6AhKB7o3NpnIvGe5PxKBwLP9DUORvDmQwgmy99Ys"
}

const cache_duration = 2592000;

app.get("/botometer", function(request, response) {
    let target = request.query.search_for;
    let profile = request.query.profile;
    let limit = request.query.limit;
    let authenticated = request.query.authenticated;
    let names = new Array();
    let key = target + ':' + profile
    let cachedKey = mcache.get(key)
    if (!limit || limit > 200) {
      limit = 200;
    }

    console.log('Request ' + target + ' for ' + profile);
    if (typeof target === 'undefined' || typeof profile === 'undefined') {
      response.status(400).send('One parameter is missing')
    }
    else if (cachedKey) {
      response.send(cachedKey)
    }
    else if (target === 'profile') {
      spottingbot(profile, config, function(err, result) {
        if (err) {
          let err = {
            metadata: {
              error: profile + " não encontrado"
            }
          }
          response.json(err)
          return;
        }
        response.json(object)
      })
    }
    else if (target === 'followers' || target === 'friends') {
      if (authenticated === 'true') {
        ga('send', 'event', 'Analyze', target);
        let token = request.query.oauth_token;
        let token_secret = mcache.get(token);
        let verifier = request.query.oauth_verifier;
        let oauth = {
          consumer_key: twitter_consumer_key,
          consumer_secret: twitter_consumer_secret,
          token: token,
          token_secret: token_secret,
          verifier: verifier
        };
        let url = 'https://api.twitter.com/oauth/access_token';
        let request2 = require('request');
        request2.post({url:url, oauth:oauth}, function (e, r, body) {
          var perm_data = qs.parse(body)
          token = perm_data.oauth_token
          token_secret = perm_data.oauth_token_secret
          let client = new Twitter({
                consumer_key: twitter_consumer_key,
                consumer_secret: twitter_consumer_secret,
                access_token_key: token,
                access_token_secret: token_secret
          });
          requestTwitterList(client, target, profile, limit, function(object) {
            if (typeof object.metadata.error === 'undefined') {
              mcache.put(key, JSON.stringify(object), cache_duration * 1000)
            }
            response.send(JSON.stringify(object))
            console.log(object);
          })
        })
      }
      else {
        getTokenUrl(request, target, profile, limit, function(uri) {
          let object = {
            request_url: uri
          }
          response.send(object)
        })
      }
    }
    else {
      response.status(400).send('search_for is wrong')
    }
});

function getTokenUrl(req, search_for, profile, limit, callback) {
  let ssl = 'http://'
  if (req.connection.encrypted) {
    ssl = 'https://'
  }
  let oauth = {
        callback: ssl + req.headers.host + '/resultados?socialnetwork=twitter&authenticated=true&profile=' + profile + '&search_for=' + search_for + '&limit=' + limit + '#conteudo',
        consumer_key: twitter_consumer_key,
        consumer_secret: twitter_consumer_secret
      },
      url = 'https://api.twitter.com/oauth/request_token';
  request.post({url:url, oauth:oauth}, function (err, r, body) {
    var req_data = qs.parse(body)
    mcache.put(req_data.oauth_token, req_data.oauth_token_secret, 3600 * 1000)
    let uri = 'https://api.twitter.com/oauth/authenticate' + '?' + qs.stringify({oauth_token: req_data.oauth_token})
    callback(uri);
  })
}

function requestTwitterList(client, search_for, profile, limit, callback) {
  let cursor = -1;
  let list = new Array();
  let total = 0;
  let param = {
    screen_name: profile
  };
  client.get('users/show', param, function(error, tweets, response_twitter_user) {
    if (error) {
      console.log(error);
    }
    total = JSON.parse(response_twitter_user.body)[search_for + '_count']
    async.whilst(
      function() { return cursor == -1; },
      function(next) {
        let params = {
          screen_name: profile,
          count: limit,
          cursor: cursor
        };
        client.get(search_for + '/list', params, function(error, tweets, response_twitter) {
          if (error) {
            console.log(error);
            next(error);
          }
          else {
            let data = JSON.parse(response_twitter.body)
            data.users.forEach(function(current) {
              list.push(current)
            })
            cursor = data.next_cursor;
            next();
          }
        })
      },
      function (err) {
        let object = {
          metadata: {
            count: list.length,
            total: total
          },
          profiles: new Array()
        };
        list.forEach(function(value) {
          object.profiles.push({
              username: value.screen_name,
              url: 'https://twitter.com/' + value.screen_name,
              avatar: value.profile_image_url,
              user_profile_language: value.lang
          })
        })
        if (err) {
          object.metadata.error = err
        }
        callback(object)
      }
    )
  })
}
