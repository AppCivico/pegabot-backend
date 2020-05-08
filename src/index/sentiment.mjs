import sentiment from 'multilang-sentiment';

export default (data) => new Promise((resolve) => {
  let sentimentNeutralSum = 0;

  data.forEach((current) => {
    let { lang } = current;
    const { text } = current;
    if (lang === 'und') lang = null;

    const res = sentiment(text, lang);
    if (res.comparative === 0) sentimentNeutralSum += 1;
  });

  const scoreSentiment = sentimentNeutralSum / data.length;
  const weight = 2;

  resolve([scoreSentiment, weight]);
});
