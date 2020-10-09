export default async (data, explanations = [], extraDetails = {}) => {
  explanations.push('\n-Análise do Score Rede:\n');

  let countHashtags = 0;
  let countMentions = 0;
  const distributionHashtags = [];
  const distributionUserMentions = [];

  const mentionsDetails = [];

  extraDetails.TWEET_ANALIZED_COUNT = data.length;

  explanations.push(`Quantos tweets serão contados: ${data.length}`);
  explanations.push('Para cada tweet, conte quantas hashtags existem no total e salve quantas hashtags únicas existem em um array.');
  explanations.push('Para cada tweet, conte quantas menções existem no total e salve quantas menções únicas existem em um array. Ignoramos as menções que estão na resposta de um tweet.');
  data.forEach((current) => {
    // Add the count of hashtags and mentions for each tweets to the total
    countHashtags += current.entities.hashtags.length;
    countMentions += current.entities.user_mentions.length;

    // Add news values for each distribution array if the value is not present yet
    current.entities.hashtags.forEach((hashtag) => {
      if (distributionHashtags.indexOf(hashtag.text) === -1) {
        distributionHashtags.push(hashtag.text);
      }
    });

    current.entities.user_mentions.forEach((userMention) => {
      if (current.in_reply_to_screen_name !== userMention.screen_name && distributionUserMentions.indexOf(userMention.screen_name) === -1) {
        distributionUserMentions.push(userMention.screen_name);
        mentionsDetails.push(userMention);
      } else if (current.in_reply_to_screen_name === userMention.screen_name) {
        // If the current mention is actually in a reply, remove it from the count
        countMentions -= 1;
      }
    });
  });

  let sampleExample = distributionHashtags.length >= 6 ? 6 : distributionHashtags.length;

  explanations.push(`Quantas hashtags no total: ${countHashtags}`);
  explanations.push(`Quantas hashtags únicas no total: ${distributionHashtags.length}`);
  if (sampleExample) explanations.push(`Exemplo das ${sampleExample} primeiras hashtags:\n${distributionHashtags.slice(0, sampleExample).join('\n')}`);

  sampleExample = distributionUserMentions.length >= 6 ? 6 : distributionUserMentions.length;

  explanations.push(`Quantas menções no total: ${countMentions}`);
  explanations.push(`Quantas menções únicas no total: ${distributionUserMentions.length}`);
  if (sampleExample) explanations.push(`Exemplo das ${sampleExample} primeiras menções:\n${distributionUserMentions.slice(0, sampleExample).join('\n')}`);

  const countNetwork = countHashtags + countMentions;
  let averageNetwork = (countNetwork / (data.length * 2));

  explanations.push('Calculamos a média das redes: ([Quantas hashtags total] + [Quantas menções total]) / ([Quantos tweets analisados * 2])');
  explanations.push(`Fica: (${countNetwork} / (${data.length} * 2)) = ${averageNetwork}`);

  if (averageNetwork > 2) {
    averageNetwork /= 2;
    explanations.push(`Se a média da rede for maior do que 2, dividimos ela por 2 e facamos com: ${averageNetwork}`);
  } else if (averageNetwork > 1) {
    averageNetwork = 1;
    explanations.push(`Se a média da rede for maior do que 1, travamos ela em: ${averageNetwork}`);
  }

  let scoreHashtags = 0;
  explanations.push('Configuramos o score de hashtags em zero');
  if (countHashtags > 0) {
    scoreHashtags = 1 - (distributionHashtags.length / countHashtags);
    explanations.push('Se foi usada alguma hashtag, calculamos o score de hashtags com a seguinte fórmula:');
    explanations.push('1 - ([Quantas hashtags únicas] / [Quantas hashtags no total]');
    explanations.push(`Fica:  1 - (${distributionHashtags.length} / ${countHashtags}) = ${scoreHashtags}`);
  }

  extraDetails.HASHTAGS_ANALYSIS = `Total: ${countHashtags}. Únicas: ${distributionHashtags.length}`;
  extraDetails.HASHTAGS_SCORE = scoreHashtags;

  let scoreMentions = 0;
  explanations.push('Configuramos o score de menções em zero');
  if (countMentions > 0) {
    scoreMentions = 1 - (distributionUserMentions.length / countMentions);
    explanations.push('Se foi usada alguma menção, calculamos o score de menções com a seguinte fórmula:');
    explanations.push('1 - ([Quantas menções únicas] / [Quantas menções no total]');
    explanations.push(`Fica:  1 - (${distributionUserMentions.length} / ${countMentions}) = ${scoreMentions}`);
  }


  extraDetails.MENTIONS_ANALYSIS = `Total: ${countMentions}. Únicas: ${distributionUserMentions.length}`;
  extraDetails.MENTIONS_SCORE = scoreMentions;

  const scoreDistrib = (scoreHashtags + scoreMentions) / 2;
  explanations.push('Calculamos o score distríbuido: ([Score das hashtags] + [Score das menções]) / 2');
  explanations.push(`Fica: (${scoreHashtags} + ${scoreMentions}) / 2 = ${scoreDistrib}`);

  const scoreNetwork = averageNetwork + scoreDistrib;
  explanations.push('Calculamos o score de rede: [Média da rede] + [Score distríbuido]');
  explanations.push(`Fica: ${averageNetwork} + ${scoreDistrib} = ${scoreNetwork}`);

  let weight = 1;
  explanations.push(`Configuramos peso ${weight}`);

  if (scoreNetwork === 0) {
    weight += 1;
    explanations.push(`Se o score de rede for zero, configuramos o peso em ${weight}`);
  }

  extraDetails.NETWORK_ANALYSIS = `Calculamos o score distríbuido (${scoreDistrib}) e o tamanho da rede (${averageNetwork})`;
  extraDetails.NETWORK_SCORE = scoreNetwork;

  extraDetails.HASHTAGS = distributionHashtags;
  extraDetails.MENTIONS = mentionsDetails;

  return [scoreNetwork, weight, distributionHashtags, distributionUserMentions];
};
