**Key Network Profile:**

Dados coletados:
Data to collect:
A timeline sample of the user's tweets, from this sample the following is collected:
  -The text of every tweet from the sample timeline
  -The language of every tweet from the sample timeline
  -The sample length

Obs: sentiment analysis is limited to the first 100 tweets of the sample.

Data preparation:
For each tweet on the timeline, the tweet language returned by Twitter is sought.
If the analysis request comes from an API request to the pegabots api, the origin domain is used to discover which language should be used as a default. If no language is found, the default "pt" is used.
The text of each tweet is then analysed with the npm module ["multilang-sentiment"](https://www.npmjs.com/package/multilang-sentiment) to get a score for each text.

To score a text, this module uses a list of words, each word has a score representing it's sentiment. This list is based on the ["AFINN"](http://www2.imm.dtu.dk/pubdb/pubs/6010-full.html) standard, also used in others modules.
Good words (love, like) are worth more points, negative words (hatred, dislike) are worth less points and neutral words (you, of, one) aren't worth anything, that is, they are worth zero. The points go from -5 to 5. For each text analysed, this module calculates the average of points per word.


Subindexes list:

- The quantity of all the sentiment analyses with neutral results (0) 
- The Number os tweets used.

Sentiment calculation:

Of these scores are counted how many analyzed tweets return a "neutral" score, that is, 0. Then, how many neutral scores are averaged by the total number of tweets analyzed.
In this way, both positive and negative messages are filtered. Tweets with non-neutral messages are not ignored, they serve to lower the neutrality score.
The less neutral a user's Twitter speech is, the higher the sentiment score and the more likely that user is to be a robot.
