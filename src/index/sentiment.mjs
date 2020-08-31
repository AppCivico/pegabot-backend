import sentiment from 'multilang-sentiment';

export default async (data, defaultLanguage = 'pt', explanations = []) => {
  explanations.push('\n-Análise do Score Sentimento:\n');

  let sentimentNeutralSum = 0;

  let tweets = [];
  if (data.length <= 100) {
    tweets = data;
    explanations.push(`Quantos tweets serão contados: ${tweets.length}`);
  } else {
    tweets = data.slice(0, 100);
    explanations.push(`Quantos tweets serão contados: ${tweets.length}`);
    explanations.push('Mais de 100 tweets nós limitamos a análise de sentimento em 100.');
  }

  explanations.push('Para cada tweet, pegamos sua língua e seu texto.');
  explanations.push(`Exemplo texto: ${tweets[0].text}`);
  explanations.push(`Exemplo língua: ${tweets[0].lang}`);
  explanations.push(`Para línguas que são "und" ou "in", nós usamos a língua padrão ${defaultLanguage}.`);

  explanations.push('Calculamos um score para o sentimento usando um módulo chamado "multilang-sentiment".');
  explanations.push('Usamos esse score para calcular quantos tweets tem um score neutro, ou seja, igual a zero.');
  let savedRes = false;

  tweets.forEach((current) => {
    let { lang } = current;
    const { text } = current;
    try {
      let res = {};

      if (!lang || ['und', 'in'].includes(lang)) lang = defaultLanguage;

      res = sentiment(text, lang);
      if (!savedRes) {
        explanations.push(`Exemplo do score do tweet: ${res.comparative}`);
        savedRes = true;
      }

      if (res.comparative === 0) sentimentNeutralSum += 1;
    } catch (error) {
      console.log('Error trying to analyse sentiment');
      console.log('text', text);
      console.log('lang', lang);
      console.log(error);
    }
  });

  explanations.push(`Temos ${sentimentNeutralSum} tweet(s) neutros`);

  const scoreSentiment = sentimentNeutralSum / tweets.length;
  const weight = 2;

  explanations.push('Calculamos o score do sentimento dessa forma: [Quantos tweets neutros] / [Quantos tweets contamos]');
  explanations.push(`A conta fica: ${sentimentNeutralSum} / ${tweets.length} = ${scoreSentiment}`);

  return [scoreSentiment, weight];
};
