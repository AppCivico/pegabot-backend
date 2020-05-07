module.exports = (data) => new Promise((resolve) => {
  let countHashtags = 0;
  let countMentions = 0;
  const distributionHashtags = [];
  const distributionUserMentions = [];

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
      } else if (current.in_reply_to_screen_name === userMention.screen_name) {
        // If the current mention is actually in a reply, remove it from the count
        countMentions -= 1;
      }
    });
  });

  const countNetwork = countHashtags + countMentions;
  let averageNetwork = (countNetwork / (data.length * 2));
  if (averageNetwork > 2) {
    averageNetwork /= 2;
  } else if (averageNetwork > 1) {
    averageNetwork = 1;
  }

  let scoreHashtags = 0;
  if (countHashtags > 0) scoreHashtags = 1 - (distributionHashtags.length / countHashtags);

  let scoreMentions = 0;
  if (countMentions > 0) scoreMentions = 1 - (distributionUserMentions.length / countMentions);

  const scoreDistrib = (scoreHashtags + scoreMentions) / 2;
  const scoreNetwork = averageNetwork + scoreDistrib;
  let weight = 1;

  if (scoreNetwork === 0) weight += 1;

  resolve([scoreNetwork, weight]);
});
