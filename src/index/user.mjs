import library from '../library';

export default async (data, explanations = []) => {
  explanations.push('\n-Análise de score de usuário');

  // if user is verified, the final result will be 0
  if (data.verified) {
    const score = 0;
    const weight = 3;
    explanations.push(`Usuário é verificado, seu score de usuário será ${score} e o peso ${weight}`);
    return [score, weight];
  }

  // let friends_ratio = 0;
  const { name } = data;
  const screenName = data.screen_name;


  // get tweets ratio
  const age = library.convertTwitterDateToDaysAge(data.created_at);
  const ratioTweetsDay = data.statuses_count / age;

  // Similarity score
  explanations.push('\nCálculo da similariedade entre os nome e screen_name:');
  let nameSimilarityScore;

  // searches for "bot" substring
  if (name.toLowerCase().indexOf('bot') !== -1 || screenName.toLowerCase().indexOf('bot') !== -1) {
    nameSimilarityScore = 1;
    explanations.push(`Existe o termo "bot" no nome ou na descrição do usuário, setamos como ${nameSimilarityScore}.`);
  } else {
    explanations.push('Removemos o espaço do nome e do screen_name do usuário.');
    const nameCut = name.replace(/[\s_]+/g, '');
    const screenNameCut = screenName.replace(/[\s_]+/g, '');
    const similarity = library.similarity(nameCut, screenNameCut);
    nameSimilarityScore = 1 - similarity;
    explanations.push('Calculamos a similariedade do nome e do screen_name e removemos esse valor de 1');
    explanations.push(`Fica: 1 - ${similarity} = ${nameSimilarityScore}`);
  }

  explanations.push(`Resultado: ${nameSimilarityScore}`);


  // Number of digits
  explanations.push('\nCálculo de dígitos no screen_name:');

  let numberDigitScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${numberDigitScore}`);

  const screenNameDigits = library.getNumberOfDigit(screenName);
  explanations.push(`Contamos quantos digitos o screen_name do usuário tem: ${screenNameDigits}`);

  if (screenNameDigits > 2) {
    numberDigitScore = screenNameDigits * 0.12;
    explanations.push('Se tiver mais que dois dígitos, calculamos o score da seguinte forma: [Quantos dígitos * 0.12]');
    explanations.push(`Fica: ${screenNameDigits} * 0.12 = ${numberDigitScore}`);
    explanations.push('O resultado se limita a 1');
    numberDigitScore = Math.min(numberDigitScore, 1);
  }

  explanations.push(`Resultado: ${numberDigitScore}`);


  // Length of name
  explanations.push('\nCálculo do tamanho do nome:');

  let nameLengthScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${nameLengthScore}`);

  const nameLength = data.name.length;
  explanations.push(`O nome: ${data.name}`);
  explanations.push(`O tamanho do nome: ${nameLength}`);
  if (nameLength > 15) {
    nameLengthScore = nameLength * 0.009;
    explanations.push('Se tiver mais que 15 caracteres, calculamos o score da seguinte forma: [Tamanho do nome] * 0.009');
    explanations.push(`Fica: ${nameLength} * 0.009 = ${nameLengthScore}`);
    explanations.push('O resultado se limita a 1');
    nameLengthScore = Math.min(nameLengthScore, 1);
  }

  explanations.push(`Resultado: ${nameLengthScore}`);


  // Length of screen name
  explanations.push('\nCálculo do tamanho do screen_name:');

  let screenNameLengthScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${nameLengthScore}`);

  const screenNameLength = screenName.length;
  explanations.push(`O screen_name: ${screenName}`);
  explanations.push(`O tamanho do screen_name: ${screenNameLength}`);
  if (screenNameLength > 10) {
    screenNameLengthScore = screenNameLength * 0.012;
    explanations.push('Se tiver mais que 10 caracteres, calculamos o score da seguinte forma: [Tamanho do screen_name] * 0.012');
    explanations.push(`Fica: ${screenNameLength} * 0.012 = ${screenNameLengthScore}`);
    explanations.push('O resultado se limita a 1');
    screenNameLengthScore = Math.min(screenNameLengthScore, 1);
  }

  explanations.push(`Resultado: ${screenNameLengthScore}`);

  // Length of description
  explanations.push('\nCálculo do tamanho da descrição:');

  let descriptionLengthScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${descriptionLengthScore}`);

  const descriptionLength = data.description.length;
  explanations.push(`A descrição: ${data.description}`);
  explanations.push(`O tamanho da descrição: ${descriptionLength}`);
  if (descriptionLength < 10) {
    descriptionLengthScore = 1 - (descriptionLength * 0.1);
    explanations.push('Se tiver mais que 10 caracteres, calculamos o score da seguinte forma: [Tamanho da descrição] * 0.1');
    explanations.push(`Fica: ${descriptionLength} * 0.1 = ${descriptionLengthScore}`);
    explanations.push('O resultado não será menor que 0');
    descriptionLengthScore = Math.max(descriptionLengthScore, 0);
  }

  explanations.push(`Resultado: ${descriptionLengthScore}`);

  // Age
  explanations.push('\nCálculo da idade:');

  let ageScore = 1;
  explanations.push(`Por padrão, setamos o valor como ${ageScore}`);

  explanations.push(`Contamos há quantos dias a conta do usuário foi criada: ${age}`);
  if (age > 90) {
    ageScore -= (age * 0.001);
    explanations.push('Se idade for maior que 90, calculamos o score da seguinte forma: score atual - ([idade] * 0.001)');
    explanations.push(`Fica: ${ageScore} - (${age}) * 0.001 = ${ageScore}`);
    explanations.push('O resultado não será menor que 0');
    ageScore = Math.max(ageScore, 0);
  }

  explanations.push(`Resultado: ${ageScore}`);


  // Image Score
  explanations.push('\nCálculo da imagem de perfil:');

  let imageScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${imageScore}`);
  const profileImage = data.profile_image_url;
  explanations.push(`Imagem de perfil do usuário: ${profileImage}`);

  if (!profileImage) {
    imageScore = 1;
    explanations.push(`Usuário tem foto de perfil, setamos score como ${imageScore}`);
  }

  explanations.push(`Resultado: ${imageScore}`);


  // Tweets by day
  explanations.push('\nCálculo de tweets por dia:');
  explanations.push('Calculamos a razão de tweets por dia da seguinte forma: [Total de tweets] / [Quantos dias a conta foi criada]');
  explanations.push(`Fica: ${data.statuses_count} / ${age} = ${ratioTweetsDay}`);
  const ratioTweetScore = ratioTweetsDay * 0.05;
  explanations.push(`Para calcular o score usamos esse resultado e multiplicamos por 0.05: ${ratioTweetsDay} * 0.05 = ${ratioTweetScore}`);

  explanations.push(`Resultado: ${ratioTweetScore}`);

  // Favorite Score
  explanations.push('\nCálculo dos favoritos:');
  explanations.push(`Contamos quantos favoritos: ${data.favourites_count}`);


  let favoritesScore = 1 - data.favourites_count * 0.01;
  favoritesScore = Math.max(favoritesScore, 0);

  explanations.push('E fazemos o calculo: 1 - [Quantos favoritos] * 0.01');
  explanations.push(`Fica: 1 - ${data.favourites_count} * 0.01 = ${favoritesScore}`);
  explanations.push('O resultado não será menor que 0');

  explanations.push(`Resultado: ${favoritesScore}`);

  explanations.push('\nCálculo Final:');

  const totalSum = nameSimilarityScore + numberDigitScore + nameLengthScore + screenNameLengthScore
    + descriptionLengthScore + ageScore + ratioTweetScore + favoritesScore + imageScore;

  explanations.push(`Somamos todos os scores: ${nameSimilarityScore} + ${numberDigitScore} + ${nameLengthScore} + ${screenNameLengthScore} + ${descriptionLengthScore} + ${ageScore} + ${ratioTweetScore} + ${favoritesScore} + ${imageScore} = ${totalSum}`);
  let userScore = totalSum / 9;
  explanations.push(`E dividimos a soma: ${totalSum} / 9 = ${userScore}`);

  // limits userScore to range 0 and 1
  userScore = Math.min(1, Math.max(0, userScore));
  explanations.push('O score final ficará limitado entre 0 e 1');

  return [userScore, 1];
};
