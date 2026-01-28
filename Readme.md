Newsly server

Authentication (/api/auth)

POST /register: Creates a user. Requires username and password.
POST /login: Logs in a user. Requires username and password, returns a JWT.
User Preferences (/api/preferences)

PUT /: Updates user preferences. Requires x-auth-token header and a preferences array in the body.
Articles (/api/articles)

GET /fetch-articles: Fetches and saves new articles based on all users' preferences.
Generate