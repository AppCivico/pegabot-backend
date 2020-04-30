require('dotenv').config();

// Imports dependencies and set up http server
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const async = require('async');
const Twitter = require('twitter');
const getBearerToken = require('get-twitter-bearer-token');
const mcache = require('memory-cache');
const qs = require('querystring');
const fs = require('fs');
const spottingbot = require('./../source/analyze');

// creates express http server
const app = express().use(bodyParser.json());

// Sets server port and logs message on success
const port = process.env.PORT || 1337;
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));
server.timeout = 0;

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
};

const cache_duration = process.env.CACHE_DURATION || 2592000;

app.get('/botometer', function (request, response) {
  let target = request.query.search_for;
  let profile = request.query.profile;
  let limit = request.query.limit;
  let authenticated = request.query.authenticated;
  let key = target + ':' + profile;
  let cachedKey = mcache.get(key);
  if (!limit || limit > 200) {
    limit = 200;
  }
  console.log('Request ' + target + ' for ' + profile);
  if (typeof target === 'undefined' || typeof profile === 'undefined') {
    response.status(400).send('One parameter is missing');
  } else if (cachedKey) {
    response.send(cachedKey);
  } else if (target === 'profile') {
    spottingbot(profile, config, {friend: false, sentiment: false}, function (err, result) {
      if (err) {
        let err = {
          metadata: {
            error: profile + ' não encontrado',
          },
        };
        response.json(err);
        return;
      }
      result.profiles[0].language_dependent = null;
      result.profiles.forEach((profile) => {
        profile.bot_probability.all = Math.min(profile.bot_probability.all, 0.99);
      });
      response.json(result);
    });
  } else if (target === 'followers' || target === 'friends') {
    if (authenticated === 'true') {
      let token = request.query.oauth_token;
      let token_secret = mcache.get(token);
      let verifier = request.query.oauth_verifier;
      let oauth = {
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        token: token,
        token_secret: token_secret,
        verifier: verifier,
      };
      let url = 'https://api.twitter.com/oauth/access_token';
      let request2 = require('request');
      request2.post({url: url, oauth: oauth}, function (e, r, body) {
        var perm_data = qs.parse(body);
        token = perm_data.oauth_token;
        token_secret = perm_data.oauth_token_secret;
        let client = new Twitter({
          consumer_key: config.consumer_key,
          consumer_secret: config.consumer_secret,
          access_token_key: token,
          access_token_secret: token_secret,
        });
        requestTwitterList(client, target, profile, limit, function (object) {
          if (typeof object.metadata.error === 'undefined') {
            mcache.put(key, JSON.stringify(object), cache_duration * 1000);
          }
          response.json(object);
        });
      });
    } else {
      getTokenUrl(request, target, profile, limit, function (err, uri) {
        if (err) {
          response.status(500).send(err);
          return;
        }
        let object = {
          request_url: uri,
        };
        response.json(object);
      });
    }
  } else {
    response.status(400).send('search_for is wrong');
  }
});

function getTokenUrl(req, search_for, profile, limit, callback) {
  let ssl = 'http://';
  if (req.connection.encrypted) {
    ssl = 'https://';
  }
  let oauth = {
    callback: ssl + req.headers.host + '/resultados?socialnetwork=twitter&authenticated=true&profile=' + profile + '&search_for=' + search_for + '&limit=' + limit + '#conteudo',
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
  };
  let url = 'https://api.twitter.com/oauth/request_token';
  request.post({url: url, oauth: oauth}, function (err, r, body) {
    if (err) {
      callback(err, null);
    }
    var req_data = qs.parse(body);
    if (!req_data.oauth_token || !req_data.oauth_token_secret) {
      callback(body, null);
    }
    mcache.put(req_data.oauth_token, req_data.oauth_token_secret, 3600 * 1000);
    let uri = 'https://api.twitter.com/oauth/authenticate' + '?' + qs.stringify({oauth_token: req_data.oauth_token});
    callback(null, uri);
  });
}

function requestTwitterList(client, search_for, profile, limit, callback) {
  let cursor = -1;
  let list = new Array();
  let total = 0;
  let param = {
    screen_name: profile,
  };
  client.get('users/show', param, function (error, tweets, response_twitter_user) {
    if (error) {
      console.log(error);
    }
    total = JSON.parse(response_twitter_user.body)[search_for + '_count'];
    async.whilst(
      function () { return cursor == -1; },
      function (next) {
        let params = {
          screen_name: profile,
          count: limit,
          cursor: cursor,
        };
        client.get(search_for + '/list', params, function (error, tweets, response_twitter) {
          if (error) {
            console.log(error);
            next(error);
          } else {
            let data = JSON.parse(response_twitter.body);
            data.users.forEach(function (current) {
              list.push(current);
            });
            cursor = data.next_cursor;
            next();
          }
        });
      },
      function (err) {
        let object = {
          metadata: {
            count: list.length,
            total: total,
          },
          profiles: [],
        };
        list.forEach(function (value) {
          object.profiles.push({
            username: value.screen_name,
            url: 'https://twitter.com/' + value.screen_name,
            avatar: value.profile_image_url,
            user_profile_language: value.lang,
          });
        });
        if (err) {
          object.metadata.error = err;
        }
        callback(object);
      }
    );
  });
}

app.post('/feedback', function (request, response) {
  let opinion = request.body.opinion;
  let profile = request.body.profile;
  if (!opinion || !profile) {
    response.status(400).send('JSON Parameters opinion and profile required.');
    return;
  }
  if (opinion !== 'approve' && opinion !== 'disapprove') {
    response.status(400).send('opinion is not correct, should be approve or disapprove.');
    return;
  }
  if (typeof profile !== 'object' || typeof profile.username === 'undefined' || typeof profile.bot_probability === 'undefined') {
    response.status(400).send('profile should be a JSON object and need to contains at least an username and a bot_probability.');
    return;
  }
  let screen_name = profile.username;
  if (fs.existsSync('opinion.json') === false) {
    let object = {
      approve: {
        profiles: [],
      },
      disapprove: {
        profiles: [],
      },
    };
    fs.writeFileSync('opinion.json', JSON.stringify(object));
  }
  let content = fs.readFileSync('opinion.json');
  let data = JSON.parse(content);
  let index = data[opinion].profiles.findIndex(function (element) {
    return element.username === screen_name;
  });

  if (index !== -1) {
    if (data[opinion].profiles[index].bot_probability.all <= (profile.bot_probability.all + 0.10) && data[opinion].profiles[index].bot_probability.all >= (profile.bot_probability.all - 0.10)) {
      data[opinion].profiles[index].count++;
    } else {
      profile.count = 1;
      data[opinion].profiles[index] = profile;
    }
  } else {
    profile.count = 1;
    data[opinion].profiles.push(profile);
  }

  fs.writeFileSync('opinion.json', JSON.stringify(data));
  response.send('OK');
});

app.get('/feedback', function (request, response) {
  if (fs.existsSync('opinion.json') === false) {
    response.send('No feedback yet');
    return;
  }
  let content = fs.readFileSync('opinion.json');
  let data = JSON.parse(content);
  response.json(data);
});
