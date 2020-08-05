**Key Sentiment Profile:**

Data to collect:
The text of every tweet in the timeline sample
The language of every tweet in the timeline sample
Sample size

Obs: We limit the size of the timeline sample at 100 tweets because of request timeout issues.

Preparation of data:
For each tweet in the timeline sample, we try to find the language of the tweet by checking the "lang" key. 
Is no language is found, we use the default, "pt".
If the analysis request comes from an api request, we check the domain name of the origin to find out which language should be the default. 
Check out the getDefaultLanguage function on "library.js".

List of subindex:

- Sum of every sentiment analysis
- Number of tweets used

Sentiment Calculation:

Having a language and the text, we use the npm module ["multilang-sentiment"](https://www.npmjs.com/package/multilang-sentiment) to get a score for each text. 
The sentiment score is the average of these scores.

