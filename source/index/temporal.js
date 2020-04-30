const library = require('../library');

module.exports = (data) => new Promise((resolve) => {
  const creationArray = [];
  const delayTwoTweets = [];

  // Put the date of each tweet in array
  data.forEach((current) => {
    const date = new Date(`${current.created_at}Z`);
    creationArray.push(date);
  });

  // Calculate the difference in time between each tweet
  for (let i = 0; i < creationArray.length - 1; i++) { // eslint-disable-line no-plusplus
    const diff = creationArray[i].getTime() - creationArray[i + 1].getTime();

    // If the difference time is not already in the array, add it in
    if (delayTwoTweets.indexOf(diff) === -1) delayTwoTweets.push(diff);
    // The shorter this array is, the more tweets are posted in a suspiciously regular frequency
  }

  const age = library.convertTwitterDateToDaysAge(data[0].user.created_at);
  const numberOfTweets = data[0].user.statuses_count;
  const ratioTweetsDay = numberOfTweets / age;
  const ratioTweetScore = ratioTweetsDay * 0.015;

  let temporalScore = ((1 - (delayTwoTweets.length + 2) / creationArray.length) + ratioTweetScore);
  if (temporalScore < 0) temporalScore = 0;

  let weight = 1;
  if (temporalScore === 0) weight += 1;

  resolve([temporalScore, weight]);
});
