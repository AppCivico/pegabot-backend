import library from '../library';

export default (data) => new Promise((resolve) => {
  let friendsScore = 0;
  const distributionFriendsOffset = [];
  const distributionFriendsAge = [];
  const distributionFriendsFriends = [];
  const distributionFriendsFollowers = [];
  const distributionFriendsTweets = [];

  data.users.forEach((current) => {
    // Add news values for each distribution array if the value is not present yet
    if (current.utc_offset !== null && distributionFriendsOffset.indexOf(current.utc_offset) === -1) {
      distributionFriendsOffset.push(current.utc_offset);
    }

    const currentAge = Math.round(library.convertTwitterDateToDaysAge(current.created_at) / 100) * 100;
    if (current.created_at !== null && distributionFriendsAge.indexOf(currentAge) === -1) {
      distributionFriendsAge.push(currentAge);
    }

    const currentFriends = Math.round(current.friends_count / 100) * 100;
    if (current.friends_count !== null && distributionFriendsFriends.indexOf(currentFriends) === -1) {
      distributionFriendsFriends.push(currentFriends);
    }

    const currentFollowers = Math.round(current.followers_count / 100) * 100;
    if (current.followers_count !== null && distributionFriendsFollowers.indexOf(currentFollowers) === -1) {
      distributionFriendsFollowers.push(currentFollowers);
    }

    const currentStatuses = Math.round(current.statuses_count / 100) * 100;
    if (current.statuses_count !== null && distributionFriendsTweets.indexOf(currentStatuses) === -1) {
      distributionFriendsTweets.push(currentStatuses);
    }
  });

  let scoreOffset = distributionFriendsOffset.length / 8;
  scoreOffset = Math.min(scoreOffset, 1);

  let scoreAge = distributionFriendsAge.length / 50;
  scoreAge = Math.min(scoreAge, 1);

  let scoreFriends = distributionFriendsFriends.length / 50;
  scoreFriends = Math.min(scoreFriends, 1);

  let scoreFollowers = distributionFriendsFollowers.length / 75;
  scoreFollowers = Math.min(scoreFollowers, 1);

  let scoreStatuses = distributionFriendsTweets.length / 50;
  scoreStatuses = Math.min(scoreStatuses, 1);

  friendsScore = ((scoreOffset * 2) + scoreAge + scoreFriends + scoreFollowers + scoreStatuses) / (5 * 2);
  const weight = 1;

  resolve([friendsScore, weight]);
});
