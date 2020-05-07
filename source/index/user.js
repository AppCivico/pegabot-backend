const library = require('../library');

module.exports = (data) => new Promise((resolve) => {
  // if user is verified, the final result will be 0
  if (data.verified) return resolve([0, 3]);

  // let friends_ratio = 0;
  const { name } = data;
  const nameLength = data.name.length;
  const screenName = data.screen_name;
  const screenNameLength = screenName.length;
  const screenNameDigits = library.getNumberOfDigit(screenName);
  const descriptionLength = data.description.length;
  const profileImage = data.profile_image_url;

  // get tweets ratio
  const age = library.convertTwitterDateToDaysAge(data.created_at);
  const ratioTweetsDay = data.statuses_count / age;

  // Similarity score
  const nameCut = name.replace(/[\s_]+/g, '');
  const screenNameCut = screenName.replace(/[\s_]+/g, '');
  let nameSimilarityScore;

  // searches for "bot" substring
  if (name.toLowerCase().indexOf('bot') !== -1 || screenName.toLowerCase().indexOf('bot') !== -1) nameSimilarityScore = 1;
  // calculates the similarity between name and screenName
  else nameSimilarityScore = 1 - library.similarity(nameCut, screenNameCut);

  // Number of digits
  let numberDigitScore = 0.15;
  if (screenNameDigits > 2) {
    numberDigitScore = screenNameDigits * 0.12;
    numberDigitScore = Math.min(numberDigitScore, 1);
  }

  // Length of name
  let nameLengthScore = 0.15;
  if (nameLength > 15) {
    nameLengthScore = nameLength * 0.009;
    nameLengthScore = Math.min(nameLengthScore, 1);
  }

  // Length of screen name
  let screenNameLengthScore = 0.15;
  if (screenNameLength > 10) {
    screenNameLengthScore = screenNameLength * 0.012;
    screenNameLengthScore = Math.min(screenNameLengthScore, 1);
  }

  // Length of description
  let descriptionLengthScore = 0.15;
  if (descriptionLength < 10) {
    descriptionLengthScore = 1 - (descriptionLength * 0.1);
    descriptionLengthScore = Math.max(descriptionLengthScore, 0);
  }

  // Age
  let ageScore = 1;
  if (age > 90) {
    ageScore -= (age * 0.001);
    ageScore = Math.max(ageScore, 0);
  }

  // Image Score
  let imageScore = 0.15;
  if (!profileImage) imageScore = 1;

  // Tweets by day
  const ratioTweetScore = ratioTweetsDay * 0.05;

  // Favorite Score
  let favoritesScore = 1 - data.favourites_count * 0.01;
  favoritesScore = Math.max(favoritesScore, 0);

  const totalSum = nameSimilarityScore + numberDigitScore + nameLengthScore + screenNameLengthScore
    + descriptionLengthScore + ageScore + ratioTweetScore + favoritesScore + imageScore;

  let userScore = totalSum / 9;

  // limits userScore to range 0 and 1
  userScore = Math.min(1, Math.max(0, userScore));
  return resolve([userScore, 1]);
});
