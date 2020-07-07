import sentiment from 'multilang-sentiment';

export default async (data, defaultLanguage = 'pt') => {
  let sentimentNeutralSum = 0;

  data.forEach((current) => {
    let { lang } = current;
    const { text } = current;
    try {
      let res = {};

      if (!lang || ['und', 'in'].includes(lang)) lang = defaultLanguage;

      res = sentiment(text, lang);

      if (res.comparative === 0) sentimentNeutralSum += 1;
    } catch (error) {
      console.log('Error trying to analyse sentiment');
      console.log('text', text);
      console.log('lang', lang);
      console.log(error);
    }
  });

  const scoreSentiment = sentimentNeutralSum / data.length;
  const weight = 2;

  return [scoreSentiment, weight];
};
