**Key User Profile:**

Data to collect:
Name
Screen name
Description
Twitter verification label
Profile picture
Number of followers
Number of friends
Creation Date
Number of Tweets
Number of Favorites

Data Preparation:
Count the number of characters in the name
Count the number of characters in the screen name
Try to find the substring “bot” in the name or the screen name
Remove all the space and underscore in both name and screen name
Compare the similarity between name and screen name
Count the number of characters in the description
<!-- Make a ratio of friends number by followers number -->
Transform the Creation Date to the number of days since the account was created
Calculate the number of tweets posted by day

List of subindex:

- Similarity of name and screen name
- Number of digits in the screen name
- Length of the name
- Length of the screen name
- Length of the description
- Age
- Tweets by day
- Favorite
- Profile picture
<!-- - Ratio of friends/followers -->

Probability calculation:

- If the account is verified by Twitter, the final result will always be 0.
- Base value of each subindex : 0.15.
- Similarity score is calculated by comparing the number of letters and each letter in common bwetween the name and screen name,
range is between 0 and 1. If the name or screen name contains the substring “bot”, this value will be
1.
- Number of digits: If there's more than 2 digits, the number of digits is multiplied by 0.12, maximum is 1.
If not, the base value is kept.
- Length of name: If there's more than 15 characters, the length is multiplied by 0.009, maximum is 1. 
If not the base value is kept.
- Length of screen name: If there's more than 10 characters, the length is multiplied by 0.012, maximum is 1. 
If not, the base value is kept.
- Length of description:  If there's less than 10 characters, the length is multiplied by 0.1 and removed from 1 (minimum is 0). 
If not, the base value is kept.
- Age: If it's more than 90 days (3 months), the age is multiplied by 0.001 and removed from 1 (Minimum is 0).
If not, 1 is used.
- Image Score: If there's no rofile image, score is 1. If there is an image, uses base value.
- Tweets by day: Number of tweets by day multiplied by 0.05 (no maximum limit).
- Favorite Score: The number of favorites is multiplied by 0.01 and removed from 1, minimum at 0.
<!-- Ratio of friends/followers : We remove the ratio from 1, minimum at 0 -->

Then, an average of all the subindex is calculated and used for the User score.

More explanations:
A Twitter verified account (blue label) means that the account was verified by a human agent, who
confirmed that the account is authentic. The accout had to provide a lot of information and validate
it with a phone number. We can assume that an expert for evaluating accounts will always be better
than an algorithm, so we trust it.

The base value could be 0, but it would mean that we start by considering all profiles as humans. This isn't the best choice.
It could be 1, so we would start assuming all accounts checked are bots, which is worse.
The official number from Twitter is 15% of accounts are bots. So we use this base value (0.15) for our calculations.

Most of the time, humans will create a screen name similar to his/her name. A bot can, sometimes,
generate two completely different names as well. There have some official bot that put “bot” in their
name. If that happens, Similarity Score will be equal to 1.

A long name or screen name is suspicious, an humans don't usually use too many characters. But
if the bot generate a random name, it might be longer than usual.

For the description, this is opposite, a bot is more likely to have an empty description, or
a very short one, than a long one.

The usual number of digits (if any) in a name, is usually two for a human, that may represent the
two firsts number of a zip code, the user's age, or the user's birth year. More than 2, it becomes suspicious, and may be 
an indication that the name was generated randomly.

If you need to check a new Twitter account (newer than 3 month) we may consider that account
suspicious. So we use the value of 1 for the average. After 3 months, the score starts to
decrease, with a minimal of 0, for each day since the account was created.

Tweets by day is the only score that has no maximum value, if an user can post more than 5 000 tweets in
one day, it is almost surely a bot, so the maximum score is not limited on it's influence on the average.

Most bots don’t have a profile picture, so the value of 1 is used if there's no profile picture.

<!-- There are many kinds of bots, sometimes they work alone and just try to follow a lot of
people to get a lot of followers in return and be more influent. Sometimes, the bots are
automatically followed by all the others bots in the same network. A normal human user usually has
a number of followers close to the number of friends. The more the ratio is far from 1, the
more the account is considerated a bot. -->


Test / Examples:

```
Profile Our result Botometer user index
result
```
```
Reality
```
```
@sunneversets100 68% 61% Bot
@Betelgeuse_3 42% 47% Bot
@infinite_scream 41% 44% Bot
@tinycarebot 45% 35% Bot
@EarthquakesSF 28% 35% Bot
@KookyScrit 18% 19% Bot
@factbot1 38% 38% Bot
@IvanDuque 0% 48% Human
@leorugeles 23% 16% N/A
@roiberhol 39% 56% N/A
@jocamacho10 21% 32% N/A
@LaGallo92 15% 15% N/A
@lolitotani 25% 19% N/A
@Ricardo57517052 60% 58% N/A
@AnavortizV 41% 56% N/A
@tavo1283 44% 21% N/A
@Andresf24091961 60% 56% N/A
@seperbupe 32% 52% N/A
@Jguarin1014 28% 29% N/A
@OmarLop18383024 62% 59% N/A
```
Most of Bot tested are known bot from a official page, their profile are, usually, completed by an human.

Possibilities for improvement:

- Improve the average calculation by including a coefficient to each subindex. For this, it's
required to determine which score carries the biggest weight on the desired calculation.
- Using a external API to find the profile picture of an user on the Internet. It can be a picture of a
public place (for example, the Eiffel Tower), from an image database (for example, Shutterstock), or
from another existing profile on a social network.
- Using a external API for image recognition. For example: if the profile picture depics a woman, but the account has a
male name/screen name, it may be a bot. It is common for bots that randomly generate everything to be like this.
- More user information to analyze.
- Improving the calculation of each subindex.
