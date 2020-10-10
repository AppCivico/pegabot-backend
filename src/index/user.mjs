import library from '../library';

export default async (data, explanations = [], extraDetails = {}) => {
  explanations.push('\n-Análise de score de usuário');

  const ret   = {};
  ret.details = {};

  // if user is verified, the final result will be 0
  if (data.verified) {
    const score = 0;
    const weight = 3;
    explanations.push(`Usuário é verificado, seu score de usuário será ${score} e o peso ${weight}`);
    extraDetails.VERIFIED_ANALYSIS = 'Usuário verificado';
    extraDetails.VERIFIED_SCORE = '0 (Total do usuário)';

    ret.score = 0;
    ret.weight = 0;
    ret.details.verified_user = 1;

    return ret;
  }

  extraDetails.VERIFIED_ANALYSIS = 'Usuário não verificado';
  extraDetails.VERIFIED_SCORE = '-';

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
    explanations.push(`Existe o termo "bot" no nome ou no handle do usuário, setamos como ${nameSimilarityScore}.`);
    extraDetails.SIMILARITY_ANALYSIS = `Existe o termo "bot" no nome de usuário (@${screenName}) ou no nome de perfil (${name}) do usuário.`;
  } else {
    explanations.push('Removemos o espaço do nome e do screen_name do usuário.');
    const nameCut = name.replace(/[\s_]+/g, '');
    const screenNameCut = screenName.replace(/[\s_]+/g, '');
    const similarity = library.similarity(nameCut, screenNameCut);
    nameSimilarityScore = 1 - similarity;
    explanations.push('Calculamos a similariedade do nome e do screen_name e removemos esse valor de 1');
    explanations.push(`Fica: 1 - ${similarity} = ${nameSimilarityScore}`);
    extraDetails.SIMILARITY_ANALYSIS = `O nome de usuário (@${screenName}) e o nome de perfil (${name}) são ${library.formatPercentage(similarity * 100)}% iguais.`;
  }

  explanations.push(`Resultado: ${nameSimilarityScore}`);
  extraDetails.SIMILARITY_SCORE = library.formatPercentage(nameSimilarityScore);


  // Number of digits
  explanations.push('\nCálculo de dígitos no screen_name:');

  let numberDigitScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${numberDigitScore}`);

  const screenNameDigits = library.getNumberOfDigit(screenName);
  explanations.push(`Contamos quantos digitos o screen_name do usuário tem: ${screenNameDigits}`);

  extraDetails.DIGIT_ANALYSIS = `O nome de usuário @${screenName} não possui dígitos.`;

  if (screenNameDigits > 2) {
    numberDigitScore = screenNameDigits * 0.12;
    explanations.push('Se tiver mais que dois dígitos, calculamos o score da seguinte forma: [Quantos dígitos * 0.12]');
    explanations.push(`Fica: ${screenNameDigits} * 0.12 = ${numberDigitScore}`);
    explanations.push('O resultado se limita a 1');
    numberDigitScore = Math.min(numberDigitScore, 1);
    extraDetails.DIGIT_ANALYSIS = `O nome de usuário @${screenName} possui ${screenNameDigits} dígitos.`;
  }

  explanations.push(`Resultado: ${numberDigitScore}`);
  extraDetails.DIGIT_SCORE = library.formatPercentage(numberDigitScore);


  // Length of name
  explanations.push('\nCálculo do tamanho do nome:');

  let nameLengthScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${nameLengthScore}`);


  const nameLength = data.name.length;
  explanations.push(`O nome: ${data.name}`);
  explanations.push(`O tamanho do nome: ${nameLength}`);
  extraDetails.LENGHT_PROFILE_ANALYSIS = 'o nome do perfil possui menos que 15 caracteres';

  if (nameLength > 15) {
    nameLengthScore = nameLength * 0.009;
    explanations.push('Se tiver mais que 15 caracteres, calculamos o score da seguinte forma: [Tamanho do nome] * 0.009');
    explanations.push(`Fica: ${nameLength} * 0.009 = ${nameLengthScore}`);
    explanations.push('O resultado se limita a 1');
    nameLengthScore = Math.min(nameLengthScore, 1);
    extraDetails.LENGHT_PROFILE_ANALYSIS = `o nome do perfil possui ${nameLength} caracteres`;
  }

  explanations.push(`Resultado: ${nameLengthScore}`);
  extraDetails.LENGHT_PROFILE_SCORE = nameLengthScore;

  // Length of screen name
  explanations.push('\nCálculo do tamanho do screen_name:');

  let screenNameLengthScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${nameLengthScore}`);

  const screenNameLength = screenName.length;
  explanations.push(`O screen_name: ${screenName}`);
  explanations.push(`O tamanho do screen_name: ${screenNameLength}`);
  extraDetails.LENGHT_HANDLE_ANALYSIS = 'o handle do perfil possui menos que 10 caracteres';

  if (screenNameLength > 10) {
    screenNameLengthScore = screenNameLength * 0.012;
    explanations.push('Se tiver mais que 10 caracteres, calculamos o score da seguinte forma: [Tamanho do screen_name] * 0.012');
    explanations.push(`Fica: ${screenNameLength} * 0.012 = ${screenNameLengthScore}`);
    explanations.push('O resultado se limita a 1');
    screenNameLengthScore = Math.min(screenNameLengthScore, 1);
    extraDetails.LENGHT_HANDLE_ANALYSIS = `o handle do perfil possui ${screenNameLength} caracteres`;
  }

  explanations.push(`Resultado: ${screenNameLengthScore}`);
  extraDetails.LENGHT_HANDLE_SCORE = screenNameLengthScore;

  // Length of description
  explanations.push('\nCálculo do tamanho da descrição:');

  let descriptionLengthScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${descriptionLengthScore}`);

  const descriptionLength = data.description.length;
  explanations.push(`A descrição: ${data.description}`);
  explanations.push(`O tamanho da descrição: ${descriptionLength}`);
  extraDetails.LENGHT_DESCRIPTION_ANALYSIS = 'A descrição tem menos que 10 caracteres.';

  if (descriptionLength < 10) {
    descriptionLengthScore = 1 - (descriptionLength * 0.1);
    explanations.push('Se tiver mais que 10 caracteres, calculamos o score da seguinte forma: [Tamanho da descrição] * 0.1');
    explanations.push(`Fica: ${descriptionLength} * 0.1 = ${descriptionLengthScore}`);
    explanations.push('O resultado não será menor que 0');
    descriptionLengthScore = Math.max(descriptionLengthScore, 0);
    extraDetails.LENGHT_DESCRIPTION_ANALYSIS = `A descrição tem ${descriptionLength} caracteres.`;
  }

  explanations.push(`Resultado: ${descriptionLengthScore}`);
  extraDetails.LENGHT_DESCRIPTION_SCORE = descriptionLengthScore;


  // Age
  explanations.push('\nCálculo da idade:');

  let ageScore = 1;
  explanations.push(`Por padrão, setamos o valor como ${ageScore}`);

  explanations.push(`Contamos há quantos dias a conta do usuário foi criada: ${age}`);

  extraDetails.AGE_ANALYSIS = `o perfil existe desde ${library.getProfileCreationDate(data.created_at)}. Sua idade é de ${age} dias.`;
  if (age > 90) {
    ageScore -= (age * 0.001);
    explanations.push('Se idade for maior que 90, calculamos o score da seguinte forma: score atual - ([idade] * 0.001)');
    explanations.push(`Fica: ${ageScore} - (${age}) * 0.001 = ${ageScore}`);
    explanations.push('O resultado não será menor que 0');
    ageScore = Math.max(ageScore, 0);
  }

  explanations.push(`Resultado: ${ageScore}`);
  extraDetails.AGE_SCORE = ageScore;

  // Image Score
  explanations.push('\nCálculo da imagem de perfil:');

  let imageScore = 0.15;
  explanations.push(`Por padrão, setamos o valor como ${imageScore}`);
  const profileImage = data.profile_image_url;
  explanations.push(`Imagem de perfil do usuário: ${profileImage}`);
  extraDetails.PROFILE_PIC_ANALYSIS = 'Usuário tem foto de perfil';

  if (!profileImage) {
    imageScore = 1;
    explanations.push(`Usuário não tem foto de perfil, setamos score como ${imageScore}`);
    extraDetails.PROFILE_PIC_ANALYSIS = 'Usuário não tem foto de perfil';
  }

  explanations.push(`Resultado: ${imageScore}`);
  extraDetails.PROFILE_PIC_SCORE = imageScore;

  // Tweets by day
  explanations.push('\nCálculo de tweets por dia:');
  explanations.push('Calculamos a razão de tweets por dia da seguinte forma: [Total de tweets] / [Quantos dias a conta foi criada]');
  explanations.push(`Fica: ${data.statuses_count} / ${age} = ${ratioTweetsDay}`);
  const ratioTweetScore = ratioTweetsDay * 0.05;
  explanations.push(`Para calcular o score usamos esse resultado e multiplicamos por 0.05: ${ratioTweetsDay} * 0.05 = ${ratioTweetScore}`);
  extraDetails.TWEET_NUMBER_ANALYSIS = `A média de tweets é ${ratioTweetsDay} tuites por dia`;

  explanations.push(`Resultado: ${ratioTweetScore}`);
  extraDetails.TWEET_NUMBER_SCORE = ratioTweetScore;


  // Favorite Score
  explanations.push('\nCálculo dos favoritos:');
  explanations.push(`Contamos quantos favoritos: ${data.favourites_count}`);

  let favoritesScore = 1 - data.favourites_count * 0.01;
  favoritesScore = Math.max(favoritesScore, 0);

  explanations.push('E fazemos o calculo: 1 - [Quantos favoritos] * 0.01');
  explanations.push(`Fica: 1 - ${data.favourites_count} * 0.01 = ${favoritesScore}`);
  explanations.push('O resultado não será menor que 0');
  extraDetails.FAVORITES_ANALYSIS = `O perfil tem ${data.favourites_count} favoritos.`;

  explanations.push(`Resultado: ${favoritesScore}`);
  extraDetails.FAVORITES_SCORE = favoritesScore;


  explanations.push('\nCálculo Final:');

  const totalSum = nameSimilarityScore + numberDigitScore + nameLengthScore + screenNameLengthScore
    + descriptionLengthScore + ageScore + ratioTweetScore + favoritesScore + imageScore;

  explanations.push(`Somamos todos os scores: ${nameSimilarityScore} + ${numberDigitScore} + ${nameLengthScore} + ${screenNameLengthScore} + ${descriptionLengthScore} + ${ageScore} + ${ratioTweetScore} + ${favoritesScore} + ${imageScore} = ${totalSum}`);
  let userScore = totalSum / 9;
  explanations.push(`E dividimos a soma: ${totalSum} / 9 = ${userScore}`);

  // limits userScore to range 0 and 1
  userScore = Math.min(1, Math.max(0, userScore));
  explanations.push('O score final ficará limitado entre 0 e 1');

  // Build return object
  ret.score  = userScore;
  ret.weight = 1;

  return ret;
};
