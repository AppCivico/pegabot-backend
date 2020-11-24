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

const cacheDuration = process.env.CACHE_DURATION || 2592000;

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

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '"$http_origin" always');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, Accept");
  next();
 });

app.get('/botometer', async (req, res) => {
  console.log(req.headers);

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

  const referer = req.get('referer');
  const sentimentLang = library.getDefaultLanguage(referer);

  const { getData } = req.query;

  console.log('profile', profile);
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
        sentimentLang, getData, cacheInterval, verbose, origin, wantsDocument).catch((err) => err);

      if (result && result.profiles && result.profiles[0]) console.log(result.profiles[0]);

      if (!result || result.errors || result.error) {
        let toSend = result;
        if (result.errors) toSend = result.errors;

        // The error format varies according to the error
        // Not all of them will have an error code
        // Use first error to determine message
        const firstError = result.errors ? result.errors[0] : result;
        console.log(firstError);

        let errorMessage;
        if ( firstError.code === 34 ) {
          errorMessage = 'Esse usuário não existe'
        }
        else if ( firstError.error === 'Not authorized.' ) {
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
  const target            = req.query.search_for;

  const { profile }       = req.query;
  let { limit }           = req.query;
  const { authenticated } = req.query;

  const cacheInterval     = req.query.cache_duration;
  const key               = `${target}:${profile}`;
  const cachedKey         = mcache.get(key);
  const fullAnalysisCache = 0;

  const verbose           = req.query.verbose || req.query.logging;
  const isAdmin           = req.query.is_admin;
  const origin = isAdmin ? 'admin' : 'website';
  const wantsDocument = 1;

  const referer = req.get('referer');
  const sentimentLang = library.getDefaultLanguage(referer);

  const { getData } = req.query;

  console.log('profile', profile);
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
        sentimentLang, getData, cacheInterval, verbose, origin, wantsDocument, fullAnalysisCache).catch((err) => err);

      if (!result || result.errors || result.error) {
        let toSend = result;
        if (result.errors) toSend = result.errors;

        res.status(404).json({ metadata: { error: toSend } });
        return;
      }
      
      res.send(await library.buildAnalyzeReturn(result.profiles[0].bot_probability.extraDetails));

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

export default app;
