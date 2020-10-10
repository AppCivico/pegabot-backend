import { execSync } from 'child_process';
import { Op } from 'sequelize';
import TwitterLite from 'twitter-lite';
import { getExtraDetails } from './document';
import { Request, Feedback } from './infra/database/index';
const superagent = require('superagent');
const md5Hex = require('md5-hex');

async function getTwitterClient(useBearerToke) {
  const config = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  };

  const twitterParams = config;
  // Create Twitter client
  let client = new TwitterLite(twitterParams);

  // If no access token and secret are provided, request a bearer token to make an App-auth
  if (!config.access_token_key || !config.access_token_secret || useBearerToke) {
    const bearerToken = await client.getBearerToken();
    twitterParams.bearer_token = bearerToken.access_token;
    client = new TwitterLite(twitterParams); // create new Twitter Client with bearerToken
  }

  return client;
}

function convertTwitterResetTime(timestamp) {
  try {
    const delta = (timestamp * 1000) - Date.now();
    const toReset = Math.ceil(delta / 1000 / 60);
    return toReset;
  } catch (error) {
    console.log('error', error);
    return null;
  }
}

async function getRateLimits(client, useBearerToke) {
  try {
    let twitterClient = client;
    if (!twitterClient) twitterClient = await getTwitterClient(useBearerToke);
    const results = await twitterClient.get('application/rate_limit_status', { resources: 'statuses' }).catch((e) => e);
    if (results && results.resources && results.resources.statuses && results.resources.statuses) {
      const aux = results.resources.statuses['/statuses/user_timeline'];
      aux.toReset = convertTwitterResetTime(aux.reset);
      if (aux.toReset) {
        delete aux.reset;
      } else {
        aux.toReset = aux.reset;
      }
      return aux;
    }

    return results;
  } catch (error) {
    return { error };
  }
}


/**
 * Configure a date to complete the cached result time rante
 * @param {string} interval - This string must be a number and a valid time period (days|hours|minutes|seconds) separated by an underline
 * @return {Date} A date object
 * @example
 * getCacheInterval('2_days')
 */
function getCacheInterval(interval) {
  let newInterval = interval || process.env.DEFAULT_CACHE_INTERVAL;
  if (!newInterval || !newInterval.match(/[0-9]{1,}_(days|hours|minutes|seconds)/i)) newInterval = '1_days';
  const splitStr = newInterval.split('_');

  const value = splitStr[0];
  const time = splitStr[1];
  const date = new Date();

  if (time === 'days') date.setDate(date.getDate() - value);
  if (time === 'hours') date.setHours(date.getHours() - value);
  if (time === 'minutes') date.setMinutes(date.getMinutes() - value);
  if (time === 'seconds') date.setSeconds(date.getSeconds() - value);

  return date;
}

const editDistance = (string1, string2) => {
  const s1 = string1.toLowerCase();
  const s2 = string2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i += 1) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j += 1) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

export default {

  getLoggingtext: (explanations) => {
    if (!explanations || Array.isArray(explanations) === false) return '';
    const res = explanations.join('\n');
    return res;
  },

  getNumberOfDigit: (string) => string.replace(/[^0-9]/g, '').length,

  convertTwitterDateToDaysAge: (date) => {
    const split = date.split(' ');
    const month = new Date(Date.parse(`${split[1]} 1, 2012`)).getMonth();
    const day = split[2];
    const year = split[split.length - 1];
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(year, month, day);
    const now = new Date();
    const diffDays = Math.round(Math.abs((firstDate.getTime() - now.getTime()) / (oneDay)));

    return diffDays;
  },

  similarity: (s1, s2) => {
    let longer = s1;
    let shorter = s2;

    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }

    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  },

  getDefaultLanguage: (origin = '') => {
    if (!origin || typeof origin !== 'string') return 'pt';
    if (origin.includes('es.pegabots')) return 'es';
    if (origin.includes('en.pegabots')) return 'en';
    return 'pt';
  },

  getRateStatus: (res) => {
    if (!res || !res._headers) return getRateLimits(null, true) || {}; // eslint-disable-line no-underscore-dangle
    const remaining = res._headers.get('x-rate-limit-remaining'); // eslint-disable-line no-underscore-dangle
    const limit = res._headers.get('x-rate-limit-limit'); // eslint-disable-line no-underscore-dangle
    const delta = (res._headers.get('x-rate-limit-reset') * 1000) - Date.now(); // eslint-disable-line no-underscore-dangle
    const toReset = Math.ceil(delta / 1000 / 60);
    return { remaining, limit, toReset };
  },

  getGitHead: async () => execSync('git rev-parse HEAD', { encoding: 'utf8' }),

  getTimelineUser: (apiRes) => {
    if (!apiRes || !apiRes[0]) return {};
    const { user } = apiRes[0];
    const timeline = apiRes;
    timeline.forEach((e) => { delete e.user; });

    return { user, timeline };
  },


  /**
 * Get cached result data for an user withing the desired time interval
 * @param {string} screenName - the name of the user
 * @param {string} interval - a string to set the desired time range (See: getCacheInterval)
 * @return {object} An object containing the results of a previous analysis
 * @example
 * getCachedRequest('myUnser123','3_hours')
 */
  getCachedRequest: async (screenName, interval) => {
    const startDate = new Date();
    const endDate = getCacheInterval(interval);

    const cached = await Request.findOne({
      where: {
        screenName,
        createdAt: { [Op.between]: [endDate, startDate] },
        cachedRequestID: null, // cant be a request that used another cached request
      },
      order: [['createdAt', 'DESC']], // select the newest entry
      include: ['analysis', 'userdata'], // get extra data as well
      raw: true,
    });

    // cached result need to have both the analysis.explanations and the analysis.details
    if (!cached || !cached.id || !cached.analysisID
      || !cached['analysis.explanations'] || !cached['analysis.details']) return null;
    return cached;
  },

  formatCached: (cached, getData) => {
    const res = cached['analysis.fullResponse'];
    res.profiles[0].bot_probability.info = cached['analysis.explanations'];

    if (getData) {
      const data = {};
      data.created_at = cached['userdata.profileCreatedAt'];
      data.user_id = cached['userdata.twitterID'];
      data.user_name = cached['userdata.username'];
      data.following = cached['userdata.followingCount'];
      data.followers = cached['userdata.followersCount'];
      data.number_tweets = cached['userdata.statusesCount'];

      data.hashtags = cached['userdata.hashtagsUsed'];
      data.mentions = cached['userdata.hashtagsUsed'];

      data.usedCache = true;
      res.twitter_data = data;
      res.rate_limit = {};
    }

    return res;
  },

  getRateLimits,
  saveFeedback: async (analysisID, opinion) => {
    try {
      if (['approve', 'disapprove'].includes(opinion) === false) {
        return { error: 'Opinion is not correct, should be "approve" or "disapprove".' };
      }

      if (!analysisID || !parseInt(analysisID, 10)) {
        return { error: 'Send analysis_id as a number' };
      }

      const { id: newFeedbackID } = await Feedback.create({ analysisID, opinion }).then((res) => res.dataValues);
      return { id: newFeedbackID };
    } catch (error) {
      console.log('error', error);
      return { error: 'Could not save feedback.' };
    }
  },

  getProfileCreationDate: (dateStr) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const newDate = new Date(dateStr);
    const month = months[newDate.getMonth()];
    const year = newDate.getFullYear();
    return `${month} de ${year}`;
  },

  formatPercentage: (number) => {
    try {
      return number.toFixed(2);
    } catch (error) {
      return number;
    }
  },

  getEmojiOnString(str) {
    const happy = [':)', '(:', ':D'];
    const sad = [':(', '):', 'D:'];

    const result = {};

    happy.forEach((e) => { if (str.includes(e)) result.happy = true; });
    sad.forEach((e) => { if (str.includes(e)) result.sad = true; });

    return result;
  },


// sub puppetter_signed_url {
//   my %config = @_;

//   my $secret = $ENV{PUPPETER_SECRET_TOKEN};
//   my $host   = $ENV{PUPPETER_SERVICE_ROOT_URL};

//   die 'missing PUPPETER_SECRET_TOKEN'     if !$secret;
//   die 'missing PUPPETER_SERVICE_ROOT_URL' if !$host;
//   die 'invalid width'                     if $config{w} !~ /^\d+$/a;
//   die 'invalid height'                    if exists $config{h} && $config{h} !~ /^\d+$/a;
//   die 'invalid resize width'              if exists $config{rw} && $config{rw} !~ /^\d+$/a;
//   die 'invalid url' if $config{u} !~ /^http/i;

//   my $my_url = Mojo::URL->new($host);

//   my $calcBuffer = $secret . "\n";
//   for my $field (keys %config) {
//       $calcBuffer .= $field . '=' . $config{$field} . "\n";
//       $my_url->query->merge($field, $config{$field});
//   }

//   my $calcSecret = md5_hex($calcBuffer);
//   $my_url->query->merge('a', $calcSecret);

//   return $my_url . '';
// }

  buildAnalyzeReturn: async (extraDetails) => {
    // Getting screenshots
    const puppetterUrl = process.env.PUPPETER_SERVICE_ROOT_URL;
    const puppetterSecret = process.env.PUPPETER_SECRET_TOKEN;

    const calcBuffer = puppetterSecret + "\n" 
    + 'u=' + '' + extraDetails.TWITTER_LINK + "\n"
    + 'w=480' + "\n"
    + 'h=520' + "\n";

    const calcSecret = md5Hex(calcBuffer);    

    const pictureUrl = await (async () => {
      try {
        const res = await superagent
          .get(puppetterUrl)
          .query({
            u: '' + extraDetails.TWITTER_LINK,
            w: 480,
            h: 520,
            a: calcSecret,
          });
              
        return res.request.url;
      } catch (err) {
        console.error(err);
      }
    })();

    // Preparing the JSON that's going to be used on the return for /analyze
    const ret = {
      root: {
        profile: {
          handle: extraDetails.TWITTER_HANDLE,
          link: extraDetails.TWITTER_LINK,
          description: 'Caso você tenha dúvidas ou discorde do resultado, você pode informar AQUI. Caso você queira analisar nosso código e sugerir melhorias, você pode acessar o respositório no GITHUB.',
          figure: pictureUrl,
          analyses: []
        },

        network: {
          description: 'Lorem Ipsum',
          analyses: [],
        },

        emotions: {
          description: 'Aṕos coletar os dados, os algoritmos do PEGABOT fornecem uma pontuação, em uma escada de -5 a 5m de cada uma das palavras dos tweets coletados. A classificação se baseia em uma biblioteca, onde, cada uma das palavras possui uma pontuação, sendo considerada mais ou menos negativa, positiva ou neutra. Assim, ao final da classificação, calcula-se a pontuação média para a quantidade de palavras positivas, negativas e neutras utilizadas pelo usuário.',
          analyses: []
        },


      }
    };

    const profileData = [
      {
        title: 'SELO DE VERIFICAÇÃO',
        summary_key: 'VERIFIED_ANALYSIS',
        score_key:   'VERIFIED_SCORE',
        description: 'A presença do selo de verificação oferecido pelo Twitter influencia positivamente nos resultados, uma vez que a plataforma possui um procedimento manual para validar a identidade desses usuários.'
      },
      {
        title: 'SEMELHANÇA DE NOME DO USUÁRIO E NOME DO PERFIL',
        summary_key: 'SIMILARITY_ANALYSIS',
        score_key: 'SIMILARITY_SCORE',
        description: 'Compara cada uma das letras que compõe o nome do usuário (arroba/handle) e o nome que aparece no perfil. Caso exista a palavra "bot", um peso maior será adicionado.'
      },
      {
        title: 'NÚMERO DE DÍGITOS NO NOME DO USUÁRIO',
        summary_key: 'DIGIT_ANALYSIS',
        score_key: 'DIGIT_SCORE',
        description: 'Busca por uma composição de nome de perfil que contenha lertas e números. Caso exista uma quantidade superior a dois dígitos na composição, um peso maior é adicionado.'
      },
      {
        title: 'COMPRIMENTO DO NOME DO PERFIL',
        summary_key: 'LENGHT_PROFILE_ANALYSIS',
        score_key: 'LENGHT_PROFILE_SCORE',
        description: 'Pesos maiores são adicionados em nomes que possuem uma quantidade superior a 15 caracteres.'
      },
      {
        title: 'COMPRIMENTO DO NOME DO USUÁRIO (OU ARROBA)',
        summary_key: 'LENGHT_HANDLE_ANALYSIS',
        score_key: 'LENGHT_HANDLE_SCORE',
        description: 'Pesos maiores são adicionados em nomes de usuários que possuem uma quantidade superior a 10 caracteres.'
      },
      {
        title: 'COMPRIMENTO DA DESCRIÇÃO',
        summary_key: 'LENGHT_DESCRIPTION_ANALYSIS',
        score_key: 'LENGHT_DESCRIPTION_SCORE',
        description: 'Pesos maiores são adicionados em descrições que possuem uma quantidade inferior a 10 caracteres.'
      },
      {
        title: 'IDADE DO PERFIL',
        summary_key: 'AGE_ANALYSIS',
        score_key: 'AGE_SCORE',
        description: 'Perfis com uma data de criação inferior a 3 meses (90 dias) ganham uma pontuação maior.'
      },
      {
        title: 'FOTO DO PERFIL',
        summary_key: 'PROFILE_PIC_ANALYSIS',
        score_key: 'PROFILE_PIC_SCORE',
        description: 'Verificamos a existência de uma foto de perfil. Perfis que não possuem, recebem uma pontuação maior.',
      },
      {
        title: 'NÚMERO DE TWEETS',
        summary_key: 'TWEET_NUMBER_ANALYSIS',
        score_key: 'TWEET_NUMBER_SCORE',        
        description: 'Perfis que tuitam muito em um curto intervalo de tempo recebem uma pontuação maior.',
      },
      {
        title: 'FAVORITOS',
        summary_key: 'FAVORITES_ANALYSIS',
        score_key: 'FAVORITES_SCORE',
        description: 'A quantidade de favoritos de um perfil também é considerada. Perfis com maior quantidade de favoritos recebem uma pontuação maior.'
      },
    ];

    const networkData = [
      {
        title: 'DISTRIBUIÇÃO DAS HASHTAGS',
        summary_key: 'HASHTAGS_ANALYSIS',
        score_key: 'HASHTAGS_SCORE',
        description: 'Calcula o tamanho da distribuição dessas hashtags na rede'
      },
      {
        title: 'DISTRIBUIÇÃO DAS MENÇÕES',
        summary_key: 'MENTIONS_ANALYSIS',
        score_key: 'MENTIONS_SCORE',
        description: 'Calcula o tamanho da distribuição de menções ao perfil do usuário na rede. Usuários que apresentam resultado x recebem maior pontuação'
      },
      {
        title: 'HASHTAGS E MENÇÕES',
        summary_key: 'NETWORK_ANALYSIS',
        score_key: 'NETWORK_SCORE',
        description: 'Encontra a quantidade de hashtags utilizadas e quantidade de menções realizadas ao perfil do usuário dentro da amostra coletada'
      },
    ];

    const emotionsKeys = [
      'SENTIMENT_ANALYSIS', 'SENTIMENT_SCORE', 'SENTIMENT_TOTAL_EMOJIS', 'SENTIMENT_HAPPY_EMOJIS',
      'SENTIMENT_SAD_EMOJIS', 'LINK_TYPEFORM', 'LEXICON_TYPE', 'LEXICON_EXAMPLE'
    ];

    const networkListsData = [
      // {
      //   key: 'TWEET_MOMENT',
      //   title: ''
      // },
      {
        key: 'HASHTAGS',
        title: 'HASHTAGS MAIS UTILIZADAS'
      },
      {
        key: 'MENTIONS',
        title: '@MENÇÕES'
      },
      // {
      //   key: 'SENTIMENT_EXAMPLE',
      //   title: 'VEJA AQUI O EXEMPLO DE 3 TWEETS DO USUÁRIO'
      // }
    ];

    // Profile block root->profile
    profileData.forEach( async function(section) {

      // Verifying if index exists, only push to array if it does.
      if (typeof extraDetails[section.summary_key] != "undefined") {
        ret.root.profile.analyses.push(
          {
            title:       section.title,
            description: section.description,
            summary:     typeof extraDetails[section.summary_key] != "undefined" ? `<p>${extraDetails[section.summary_key]}</p>` : undefined,
            conclusion:  parseFloat(extraDetails[section.score_key]).toFixed(3)
          }
        );

        if ( section.title === 'NÚMERO DE TWEETS' ) {
          // Preparing the tweet array to be used on a line chart, divided by day.
          // I'm gonna treat this here instead of doing it when the array is filled, because I don't want to touch that legacy code
          const chartLabels = [];
          const chartData   = [];
      
          const sortedList = extraDetails.TWEET_MOMENT.sort();
      
          sortedList.forEach( async function(tweet) {
            const tweetStr = tweet.toString();
            const ymd      = tweetStr.substring(0, 10);
      
            if (chartLabels.indexOf(ymd) === -1) {
              chartLabels.push(ymd);
            }
      
            const ymdIndex = chartLabels.indexOf(ymd);
            chartData[ymdIndex] = chartData[ymdIndex] + 1 || 1;
      
          });
      
          const analysisKey = ret.root.profile.analyses.length - 1;

          ret.root.profile.analyses[analysisKey].chart = {};
          ret.root.profile.analyses[analysisKey].chart.labels = chartLabels;
          ret.root.profile.analyses[analysisKey].chart.data   = chartData;

        }
      }
    });

    // Network block root->network
    networkData.forEach( async function(section) {

      // Verifying if index exists, only push to array if it does.
      if (typeof extraDetails[section.summary_key] != "undefined") {
        ret.root.network.analyses.push(
          {
            title:       section.title,
            description: section.description,
            summary:     typeof extraDetails[section.summary_key] != "undefined" ? `<p>${extraDetails[section.summary_key]}</p>` : undefined,
            conclusion:  parseFloat(extraDetails[section.score_key]).toFixed(3)
          }
        );
  
        const analysisKey = ret.root.network.analyses.length - 1;
        if (section.title === 'DISTRIBUIÇÃO DAS HASHTAGS') {
          ret.root.network.analyses[analysisKey].hashtags = [];
          ret.root.network.analyses[analysisKey].hashtags = extraDetails.HASHTAGS.slice(0, 100);
        }
        else if (section.title === 'DISTRIBUIÇÃO DAS MENÇÕES') {
          const list = extraDetails.MENTIONS.slice(0, 100);
          list.forEach( function(v) { delete v.id; delete v.id_str; delete v.indices } );
  
          ret.root.network.analyses[analysisKey].mentions = [];
          ret.root.network.analyses[analysisKey].mentions = list;
        }
      }

    });

    const tweetNeutral = extraDetails.SENTIMENT_EXAMPLE.neutral;
    const tweetPositive = extraDetails.SENTIMENT_EXAMPLE.positive;
    const tweetNegative = extraDetails.SENTIMENT_EXAMPLE.negative;

    const tweetSamples = [];

    if (typeof(tweetNeutral) != 'undefined') {
      const calcBuffer = puppetterSecret + "\n" 
        + 'u=' + '' + tweetNeutral.url + "\n"
        + 'w=480' + "\n"
        + 'h=520' + "\n";

      const calcSecret = md5Hex(calcBuffer);    

      const pictureUrl = await (async () => {
        try {
          const res = await superagent
            .get(puppetterUrl)
            .query({
              u: '' + tweetNeutral.url,
              w: 480,
              h: 520,
              a: calcSecret,
            });
                
          return res.request.url;
        } catch (err) {
          console.error(err);
        }
      })();

      tweetSamples.push({
        caption: "Exemplo de tweet neutro",
        capture: pictureUrl
      });
    }

    if (typeof(tweetPositive) != 'undefined') {
      const calcBuffer = puppetterSecret + "\n" 
        + 'u=' + '' + tweetPositive.url + "\n"
        + 'w=480' + "\n"
        + 'h=520' + "\n";

      const calcSecret = md5Hex(calcBuffer);    

      const pictureUrl = await (async () => {
        try {
          const res = await superagent
            .get(puppetterUrl)
            .query({
              u: '' + tweetPositive.url,
              w: 480,
              h: 520,
              a: calcSecret,
            });
                
          return res.request.url;
        } catch (err) {
          console.error(err);
        }
      })();

      tweetSamples.push({
        caption: "Exemplo de tweet positivo",
        capture: pictureUrl
      });
    }

    if (typeof(tweetNegative) != 'undefined') {
      const calcBuffer = puppetterSecret + "\n" 
        + 'u=' + '' + tweetNegative.url + "\n"
        + 'w=480' + "\n"
        + 'h=520' + "\n";

      const calcSecret = md5Hex(calcBuffer);    

      const pictureUrl = await (async () => {
        try {
          const res = await superagent
            .get(puppetterUrl)
            .query({
              u: '' + tweetNegative.url,
              w: 480,
              h: 520,
              a: calcSecret,
            });
                
          return res.request.url;
        } catch (err) {
          console.error(err);
        }
      })();

      tweetSamples.push({
        caption: "Exemplo de tweet negativo",
        capture: pictureUrl
      });
    }

    ret.root.emotions.analyses.push(
      {
        title: undefined,
        description: undefined,
        summary: `<p>${extraDetails.SENTIMENT_ANALYSIS}</p>`,
        conclusion: extraDetails.SENTIMENT_SCORE,
        samples: {
          title: 'VEJA AQUI O EXEMPLO DE 3 TWEETS DO USUÁRIO',
          list: tweetSamples
        }
      }
    )

    return ret;
  },
};
