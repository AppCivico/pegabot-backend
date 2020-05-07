**Key Temporal Profile:**

Data to collect:
The date of all tweets posted in the timeline sample
Age of the profile

Data Preparation:
Put all date of posted tweet in an array

List of subindex:

- Delay between two tweets
- Ratio tweets by day

Probability Calculation:

- Subtract date of a created tweet from the date of the previous tweet. 
Put this diff in an array if it is not already present.
- Divide the number of total tweets by the number of days since the profile was created and multiply it
by 0.025 to reduces it's impact on the final score.

Then, to get the temporal score, we add 2 to the length of the diff array and divide the result by the
size of the sample. The result is removed from 1. Finally the tweets ratio score is added to get the
final score.

Score = (1 - (Size of the diff array + 2) / Number of dates) + Ratio tweets by day * 0.025

More explanations:
A bot can be scheduled to send a tweet every X seconds, minutes or hours. This index is here to account for that.
In case of the tweets do not looks so scheduled, we also get the ratio of tweets by day since the
profile creation, a number too high is suspicious.



