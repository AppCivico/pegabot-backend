Pegabot uses a caching system to avoid remaking analyses on the same user.
This caching system uses a PostgreSQL database.

For each analysis we save 3 things on the database:

1. The Twitter API response for the requested user
2. The result of our analysis
3. Complemental data from the analysis, such as values that were used to reach the results

Then, if any new requests for an user we have saved in the database comes, we simply load up the data from said user's most recent analysis and avoid making a new request to the Twitter API and re-calculating the user's score.

It's important to remember that the caching system has a limited time range. By default, it's 10 days. After that, any new request that comes for a user we already have saved will be redone and, for the next 10 days, this new analysis will be the user's cache.

This time range can be manipulated on the API request by passing a `cache_duration` parameter. `cache_duration` must be atring with a number and a valid time period (days|hours|minutes|seconds) separated by an underline. Example: 10_minutes or 2_days.

