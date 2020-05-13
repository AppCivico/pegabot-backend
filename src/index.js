// Imports dependencies and set up http server
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import async from 'async';
import Twitter from 'twitter';
import mcache from 'memory-cache';
import qs from 'querystring';
import fs from 'fs';
import TwitterLite from 'twitter-lite';
import spottingbot from './analyze';

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

        client.get(`${searchFor}/list`, params, (err, userTweets, responseTwitter) => {
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
};

// If you get an error 415, add your callback url to your Twitter App.
async function getTokenUrl(req, searchFor, profile, limit) {
  try {
    const ssl = req.connection.encrypted ? 'https://' : 'http://';
    const oauthCallback = `${ssl + req.headers.host}/resultados?socialnetwork=twitter&authenticated=true&profile=${profile}&search_for=${searchFor}&limit=${limit}#conteudo`;

    const client = new TwitterLite({
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
    });

    const reqData = await client.getRequestToken(oauthCallback);
    const uri = `${'https://api.twitter.com/oauth/authenticate?'}${qs.stringify({ oauth_token: reqData.oauth_token })}`;
    return uri;
  } catch (error) {
    return error;
  }
}

app.get('/botometer', async (req, response) => {
  const target = req.query.search_for;
  const { profile } = req.query;
  let { limit } = req.query;
  const { authenticated } = req.query;
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
      return response.json(result);
    });
  } else if (target === 'followers' || target === 'friends') {
    if (authenticated === 'true') {
      let token = req.query.oauth_token;
      let tokenSecret = mcache.get(token);
      const verifier = req.query.oauth_verifier;

      let client = new TwitterLite({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
      });

      const permData = await client.getAccessToken({ oauth_verifier: verifier, oauth_token: token });

      token = permData.oauth_token;
      tokenSecret = permData.oauth_token_secret;

      client = new Twitter({
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
    } else {
      const result = await getTokenUrl(req, target, profile, limit);
      if (result.errors) {
        response.status(500).send(result);
      } else {
        response.json({ request_url: result });
      }
    }
  } else {
    response.status(400).send('search_for is wrong');
  }
});


// request
app.post('/feedback', (req, response) => {
  const { opinion } = req.body;
  const { profile } = req.body;
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
  const screenName = profile.username;
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
  const index = data[opinion].profiles.findIndex((element) => element.username === screenName);

  if (index !== -1) {
    if (data[opinion].profiles[index].bot_probability.all <= (profile.bot_probability.all + 0.10)
      && data[opinion].profiles[index].bot_probability.all >= (profile.bot_probability.all - 0.10)) {
      data[opinion].profiles[index].count += 1;
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

app.get('/feedback', (req, response) => {
  if (fs.existsSync('opinion.json') === false) {
    response.send('No feedback yet');
    return;
  }
  const content = fs.readFileSync('opinion.json');
  const data = JSON.parse(content);
  response.json(data);
});

// dev: get the /resultados callback params, use them to test followers/friends on /botometer with authenticated user
app.get('/resultados', (req) => {
  console.log('req', req._parsedUrl.search); // eslint-disable-line no-underscore-dangle
});
