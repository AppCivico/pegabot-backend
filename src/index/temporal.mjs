import library from '../library';

export default async (data, user, explanations = []) => {
  explanations.push('\n-Análise do Score Temporal:\n');
  const creationArray = [];
  const delayTwoTweets = [];

  explanations.push(`Quantos tweets serão contados: ${data.length}`);
  explanations.push('Adicionar a data de cada tweet em um array');
  // Put the date of each tweet in array
  data.forEach((current) => {
    const date = new Date(`${current.created_at}Z`);
    creationArray.push(date);
  });

  let sampleExample = creationArray.length >= 6 ? 6 : creationArray.length;

  explanations.push(`Quantas datas temos nesse array: ${creationArray.length}`);
  explanations.push(`Exemplo dos ${sampleExample} primeiros valores:\n${creationArray.slice(0, sampleExample).join('\n')}`);

  explanations.push('Para cada duas datas, calcule a diferença de tempo entre elas, em milisengundos.');
  explanations.push('As diferenças que são únicas adicionamos em um array.');
  // Calculate the difference in time between each tweet
  for (let i = 0; i < creationArray.length - 1; i++) { // eslint-disable-line no-plusplus
    const diff = creationArray[i].getTime() - creationArray[i + 1].getTime();


    // If the difference time is not already in the array, add it in
    if (delayTwoTweets.indexOf(diff) === -1) delayTwoTweets.push(diff);
    // The shorter this array is, the more tweets are posted in a suspiciously regular frequency
  }

  sampleExample = delayTwoTweets.length >= 6 ? 6 : delayTwoTweets.length;

  explanations.push(`Quantas diferenças únicas temos: ${delayTwoTweets.length}`);
  explanations.push(`Exemplo dos ${sampleExample} primeiros valores:\n${delayTwoTweets.slice(0, sampleExample).join('\n')}`);


  // Calculate tweets-by-day ratio
  const age = library.convertTwitterDateToDaysAge(user.created_at);
  explanations.push(`Calculamos há quantos dias o usuário criou sua conta: ${age}`);

  const numberOfTweets = user.statuses_count;
  explanations.push(`Quantos tweets o usuário tem no total: ${numberOfTweets}`);

  const ratioTweetsDay = numberOfTweets / age;
  explanations.push(`Calculamos a razão de tweets por dia: ${numberOfTweets} / ${age} = ${ratioTweetsDay}`);

  const ratioTweetScore = ratioTweetsDay * 0.015;
  explanations.push(`Calculamos uma pontuação com essa razão: ${ratioTweetsDay} * ${0.015} = ${ratioTweetScore}`);

  let temporalScore = ((1 - (delayTwoTweets.length + 2) / creationArray.length) + ratioTweetScore);
  explanations.push('Calculamos o score temporal: ((1 - ([Diferenças Únicas] + 2) / [Todas as datas]) + [Pontuação da razão]');
  explanations.push(`A conta fica: ((1 - (${delayTwoTweets.length} + 2) / ${creationArray.length}) + ${ratioTweetScore} = ${temporalScore}`);

  if (temporalScore < 0) {
    temporalScore = 0;
    explanations.push(`Score menor do que zero é travado em zero: ${temporalScore}`);
  }

  let weight = 1;
  explanations.push(`Damos peso ${weight} a essa pontuação`);

  if (temporalScore === 0) {
    weight += 1;
    explanations.push(`Score igual a zero, damos peso ${weight} a essa pontuação`);
  }

  return [temporalScore, weight];
};
