require('dotenv').config();

// Imports dependencies and set up http server
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const async = require('async');
const Twitter = require('twitter');
const mcache = require('memory-cache');
const qs = require('querystring');
const fs = require('fs');
const spottingbot = require('./analyze');

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

const cacheDuration = process.env.CACHE_DURATION || 2592000;

const requestTwitterList = (client, searchFor, profile, limit, callback) => {
  let cursor = -1;
  const list = [];
  let total = 0;
  const param = {
    screen_name: profile,
  };

  client.get('users/show', param, (error, tweets, responseTwitterUser) => {
    if (error) {
      console.log(error);
    }
    total = JSON.parse(responseTwitterUser.body)[`${searchFor}_count`];

    async.whilst(
      () => cursor === -1,
      (next) => {
        const params = {
          screen_name: profile,
          count: limit,
          cursor,
        };

        client.get(`${searchFor}/list`, params, (err, tweets, responseTwitter) => {
          if (err) {
            console.log(err);
            next(err);
          } else {
            const data = JSON.parse(responseTwitter.body);
            data.users.forEach((current) => {
              list.push(current);
            });
            cursor = data.next_cursor;
            next();
          }
        });
      },
      (err) => {
        const object = {
          metadata: {
            count: list.length,
            total,
          },
          profiles: [],
        };
        list.forEach((value) => {
          object.profiles.push({
            username: value.screen_name,
            url: `https://twitter.com/${value.screen_name}`,
            avatar: value.profile_image_url,
            user_profile_language: value.lang,
          });
        });
        if (err) {
          object.metadata.error = err;
        }
        callback(object);
      },
    );
  });
}

app.get('/botometer', (request, response) => {
  const target = request.query.search_for;
  const { profile } = request.query;
  let { limit } = request.query;
  const { authenticated } = request.query;
  const key = `${target}:${profile}`;
  const cachedKey = mcache.get(key);

  if (!limit || limit > 200) {
    limit = 200;
  }
  console.log(`Request ${target} for ${profile}`);
  if (typeof target === 'undefined' || typeof profile === 'undefined') {
    response.status(400).send('One parameter is missing');
  } else if (cachedKey) {
    response.send(cachedKey);
  } else if (target === 'profile') {
    spottingbot(profile, config, { friend: false, sentiment: false }, (err, result) => {
      if (err) {
        return response.json({
          metadata: {
            error: `${profile} não encontrado`,
          },
        });
      }
      result.profiles[0].language_dependent = null;
      // result.profiles.forEach((profile) => {
      //   profile.bot_probability.all = Math.min(profile.bot_probability.all, 0.99);
      // });
      response.json(result);
    });
  } else if (target === 'followers' || target === 'friends') {
    if (authenticated === 'true') {
      let token = request.query.oauth_token;
      let tokenSecret = mcache.get(token);
      const verifier = request.query.oauth_verifier;
      const oauth = {
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        token,
        tokenSecret,
        verifier,
      };
      const url = 'https://api.twitter.com/oauth/access_token';
      const request2 = require('request');
      request2.post({ url, oauth }, (e, r, body) => {
        const permData = qs.parse(body);
        token = permData.oauth_token;
        tokenSecret = permData.oauth_token_secret;
        const client = new Twitter({
          consumer_key: config.consumer_key,
          consumer_secret: config.consumer_secret,
          access_token_key: token,
          access_token_secret: tokenSecret,
        });
        requestTwitterList(client, target, profile, limit, (object) => {
          if (typeof object.metadata.error === 'undefined') {
            mcache.put(key, JSON.stringify(object), cacheDuration * 1000);
          }
          response.json(object);
        });
      });
    } else {
      getTokenUrl(request, target, profile, limit, (err, uri) => {
        if (err) {
          response.status(500).send(err);
          return;
        }
        const object = {
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
  const oauth = {
    callback: `${ssl + req.headers.host}/resultados?socialnetwork=twitter&authenticated=true&profile=${profile}&search_for=${search_for}&limit=${limit}#conteudo`,
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
  };
  const url = 'https://api.twitter.com/oauth/request_token';
  request.post({ url, oauth }, (err, r, body) => {
    if (err) {
      callback(err, null);
    }
    const req_data = qs.parse(body);
    if (!req_data.oauth_token || !req_data.oauth_token_secret) {
      callback(body, null);
    }
    mcache.put(req_data.oauth_token, req_data.oauth_token_secret, 3600 * 1000);
    const uri = `${'https://api.twitter.com/oauth/authenticate' + '?'}${qs.stringify({ oauth_token: req_data.oauth_token })}`;
    callback(null, uri);
  });
}


app.post('/feedback', (request, response) => {
  const { opinion } = request.body;
  const { profile } = request.body;
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
  const screen_name = profile.username;
  if (fs.existsSync('opinion.json') === false) {
    const object = {
      approve: {
        profiles: [],
      },
      disapprove: {
        profiles: [],
      },
    };
    fs.writeFileSync('opinion.json', JSON.stringify(object));
  }
  const content = fs.readFileSync('opinion.json');
  const data = JSON.parse(content);
  const index = data[opinion].profiles.findIndex((element) => element.username === screen_name);

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

app.get('/feedback', (request, response) => {
  if (fs.existsSync('opinion.json') === false) {
    response.send('No feedback yet');
    return;
  }
  const content = fs.readFileSync('opinion.json');
  const data = JSON.parse(content);
  response.json(data);
});
