// Imports dependencies and set up http server
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import TwitterLite from 'twitter-lite';
import async from 'async';
import mcache from 'memory-cache';
import qs from 'querystring';
import fs from 'fs';
import spottingbot from './analyze';
import library from './library';

// creates express http server
const app = express();

// body parser
app.use(bodyParser.json());

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
};

const cacheDuration = process.env.DEFAULT_CACHE_INTERVAL || 2592000;

const requestTwitterList = async (client, searchFor, profile, limit, callback) => {
  let cursor = -1;
  const list = [];
  let total = 0;
  const param = {
    screen_name: profile,
  };

  const responseUser = await client.get('users/show', param);
  total = responseUser[`${searchFor}_count`];

  async.whilst(
    () => cursor === -1,
    async (next) => {
      const params = {
        screen_name: profile,
        count: limit,
        cursor,
      };

      try {
        const responseList = await client.get(`${searchFor}/list`, params);
        responseList.users.forEach((current) => {
          list.push(current);
        });
        cursor = responseList.next_cursor;
        next();
      } catch (error) {
        console.error(error);
        next(error);
      }
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

app.all('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '"$http_origin" always');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, Accept");
  next();
});

app.get('/botometer', async (req, res) => {

  const target = req.query.search_for;
  const { profile } = req.query;
  let { limit } = req.query;
  const { authenticated } = req.query;
  const cacheInterval = req.query.cache_duration;
  const key = `${target}:${profile}`;
  const cachedKey = mcache.get(key);
  const verbose = req.query.verbose || req.query.logging;
  const isAdmin = req.query.is_admin;
  const origin = isAdmin ? 'admin' : 'website';
  const wantsDocument = req.query.documento;
  const lang = req.headers["accept-language"];

  const referer = req.get('referer');
  const sentimentLang = library.getDefaultLanguage(referer);

  const { getData } = req.query;

  if (!limit || limit > 200) {
    limit = 200;
  }
  if (typeof target === 'undefined' || typeof profile === 'undefined') {
    res.status(400).send('One parameter is missing');
  } else if (cachedKey) {
    res.send(cachedKey);
  } else if (target === 'profile') {
    try {
      const result = await spottingbot(profile, config, { friend: false },
        sentimentLang, getData, cacheInterval, verbose, origin, wantsDocument, lang).catch((err) => err);

      if (!result || result.errors || result.error) {
        let toSend = result;
        if (result.errors) toSend = result.errors;

        // The error format varies according to the error
        // Not all of them will have an error code
        // Use first error to determine message
        const firstError = result.errors ? result.errors[0] : result;
        console.log(firstError);

        let errorMessage;
        if (firstError.code === 34) {
          errorMessage = 'Esse usuário não existe'
        }
        else if (firstError.error === 'Not authorized.') {
          errorMessage = 'Sem permissão para acessar. Usuário pode estar bloqueado/suspendido.'
        }
        else {
          errorMessage = 'Erro ao procurar pelo perfil'
        }

        res.status(400).json({ metadata: { error: toSend }, message: errorMessage });
        return;
      }

      if (wantsDocument === '1' && result.profiles[0].bot_probability.extraDetails) {
        res.send(result.profiles[0].bot_probability.extraDetails);
      } else if (verbose === '1' && result.profiles[0].bot_probability.info) {
        const loggingText = result.profiles[0].bot_probability.info;
        const fileName = `${profile}_analise.txt`;
        res.set({ 'Content-Disposition': `attachment; filename="${fileName}"`, 'Content-type': 'application/octet-stream' });
        res.send(loggingText);
      } else {
        res.json(result);
      }
    } catch (error) {
      console.log('error', error);
      res.status(500).json({ metadata: { error } });
    }
  } else if (target === 'followers' || target === 'friends') {
    if (authenticated === 'true') {
      // const token = req.query.oauth_token;
      // const tokenSecret = mcache.get(token);
      // const verifier = req.query.oauth_verifier;

      const client = new TwitterLite({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        access_token_key: undefined,
        access_token_secret: undefined,
      });

      requestTwitterList(client, target, profile, limit, (object) => {
        if (typeof object.metadata.error === 'undefined') {
          mcache.put(key, JSON.stringify(object), cacheDuration * 1000);
        }
        res.json(object);
      });
    } else {
      const result = await getTokenUrl(req, target, profile, limit);
      if (result.errors) {
        res.status(500).send(result);
      } else {
        res.json({ request_url: result });
      }
    }
  } else {
    res.status(400).send('search_for is wrong');
  }
});


// request
app.post('/feedback', async (req, res) => {
  const { opinion } = req.body;
  const analysisID = req.body.analysis_id;

  const result = await library.saveFeedback(analysisID, opinion);
  if (result && result.id) {
    res.status(200).send(result);
  } else {
    res.status(500).send(result);
  }
});

app.get('/feedback', (req, res) => {
  if (fs.existsSync('opinion.json') === false) {
    res.send('No feedback yet');
    return;
  }
  const content = fs.readFileSync('opinion.json');
  const data = JSON.parse(content);
  res.json(data);
});

app.get('/user-timeline-rate-limit', async (req, res) => {
  const rateLimits = await library.getRateLimits(null, true);
  let status = 200;
  if (!rateLimits || rateLimits.error) status = 500;
  res.status(status).json(rateLimits);
});

app.get('/status', (req, res) => {
  res.sendStatus(200);
});

app.get('/analyze', async (req, res) => {
  const target = req.query.search_for;

  const { profile } = req.query;
  let { limit } = req.query;
  const { authenticated } = req.query;

  const cacheInterval = req.query.cache_duration;
  const key = `${target}:${profile}`;
  const cachedKey = mcache.get(key);
  const fullAnalysisCache = 1;
  const isFullAnalysis = 1;

  const verbose = req.query.verbose || req.query.logging;
  const isAdmin = req.query.is_admin;
  const origin = isAdmin ? 'admin' : 'website';
  const wantsDocument = 1;

  const referer = req.get('referer');
  const sentimentLang = library.getDefaultLanguage(referer);

  const lang = req.headers["accept-language"];

  const { getData } = req.query;

  if (!limit || limit > 200) {
    limit = 200;
  }
  if (typeof target === 'undefined' || typeof profile === 'undefined') {
    res.status(400).send('One parameter is missing');
  } else if (cachedKey) {
    res.send(cachedKey);
  } else if (target === 'profile') {
    try {
      const result = await spottingbot(profile, config, { friend: false },
        sentimentLang, getData, cacheInterval, verbose, origin, wantsDocument, fullAnalysisCache, isFullAnalysis).catch((err) => err);

      if (!result || result.errors || result.error) {
        let toSend = result;
        if (result.errors) toSend = result.errors;

        res.status(404).json({ metadata: { error: toSend } });
        return;
      }

      res.send(result);

    } catch (error) {
      console.log('error', error);
      res.status(500).json({ metadata: { error } });
    }
  } else if (target === 'followers' || target === 'friends') {
    if (authenticated === 'true') {
      // const token = req.query.oauth_token;
      // const tokenSecret = mcache.get(token);
      // const verifier = req.query.oauth_verifier;

      const client = new TwitterLite({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        access_token_key: undefined,
        access_token_secret: undefined,
      });

      requestTwitterList(client, target, profile, limit, (object) => {
        if (typeof object.metadata.error === 'undefined') {
          mcache.put(key, JSON.stringify(object), cacheDuration * 1000);
        }
        res.json(object);
      });
    } else {
      const result = await getTokenUrl(req, target, profile, limit);
      if (result.errors) {
        res.status(500).send(result);
      } else {
        res.json({ request_url: result });
      }
    }
  } else {
    res.status(400).send('search_for is wrong');
  }
});

app.get('/botometer-bulk', async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey != process.env.BULK_API_KEY) return res.status(403).send('forbidden');


  const { profiles, is_admin, twitter_api_consumer_key, twitter_api_consumer_secret, cache_interval } = req.body;
  if (profiles.length > 50) return res.status(400).json({ message: 'max profiles size is 50' });

  if (twitter_api_consumer_key && twitter_api_consumer_secret) {
    config = {
      consumer_key: twitter_api_consumer_key,
      consumer_secret: twitter_api_consumer_secret,
    };
  }

  const verbose = false;
  const getData = true;
  const origin = 'admin';
  const cacheInterval = cache_interval;
  const referer = req.get('referer');

  const profiles_results = profiles.map(profile => {

    return spottingbot(
      profile, config, { friend: false }, library.getDefaultLanguage(referer), getData, cacheInterval, verbose, origin
    ).then((result) => {
      return {
        twitter_user_data: {
          id: result.twitter_data.user_id,
          handle: '@' + result.profiles[0].username,
          user_name: result.twitter_data.user_name,
          url: result.profiles[0].url,
          avatar: result.profiles[0].avatar,
          created_at: result.twitter_data.created_at,
        },
        twitter_user_meta_data: {
          tweet_count: result.twitter_data.number_tweets,
          follower_count: result.twitter_data.followers,
          following_count: result.twitter_data.following,
          hashtags: result.twitter_data.hashtags,
          mentions: result.twitter_data.mentions,
        },
        pegabot_analysis: {
          user_index: result.profiles[0].language_independent.user,
          temporal_index: result.profiles[0].language_independent.temporal,
          network_index: result.profiles[0].language_independent.network,
          sentiment_index: result.profiles[0].language_dependent.sentiment.value,
          bot_probability: result.profiles[0].bot_probability.all,
        },
        metadata: {
          used_cache: result.twitter_data.usedCache
        }
      }
    }).catch((err) => {
      const firstError = err.errors ? err.errors[0] : err;

      let errorMessage;
      if (firstError.code === 34) {
        errorMessage = 'Esse usuário não existe'
      }
      else if (firstError.error === 'Not authorized.') {
        errorMessage = 'Sem permissão para acessar. Usuário pode estar bloqueado/suspendido.'
      }
      else {
        errorMessage = 'Erro ao procurar pelo perfil'
      }

      return {
        twitter_user_data: {
          user_handle: profile,
        },
        metadata: {
          error: errorMessage
        }
      }
    });

  });

  Promise.all(profiles_results).then(function (results) {
    res.status(200).json({ analyses_count: results.length, analyses: results });
    return;
  });

});

export default app;
