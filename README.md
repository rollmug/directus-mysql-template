### Docker with Directus / MySQL / Adminer / GraphQL

This package contains everything you need to get up and running with Directus CMS, with a MySQL backend, plus an interactive GraphQL playground to help you develop your API queries.

Before you do anything else, you need [Docker](https://www.docker.com) and [Node](https://nodejs.org) installed on your machine:

[Install Docker Desktop](https://www.docker.com/products/docker-desktop/)  
[Install Node](https://nodejs.org/en/download/)

Once you've done that, you can install this package on your machine by either:

1. Run `npm install dkobrenski/directus-mysql-template`
2. Or, run `git clone https://github.com/rollmug/directus-mysql-template.git` and then cd into it, and run `npm install`

From there, you can configure your app like this:

1. CD into the package directory, and run `npm start`. The wizard will walk you through the config.

### Running Docker Compose

In the directory with the docker-compose.yml file, open terminal and type:

`docker compose up mysql -d`

Wait 20-30 seconds, then type:

`docker compose up -d`

Access URLS from here:

Directus: http://localhost:8055  
GraphQL Playground: http://localhost:4000/graphql  
Adminer (for MySQL): http://localhost:8080

### CORS problems on localhost

**Safari:**

1. Enable the developer menu by opening up Settings, Advanced, check "Show Develop bar in menu"
2. Click the Develop menu and check "Disable Cross-Origin Restrictions"

**Chrome**

Temporarily Disable CORS in Chrome (MacOS):

1. Quit Chrome
2. Open terminal session and run:

`open -n -a "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security`

Windows:

1. Right click on desktop, add new shortcut
2. Add the target as "[PATH_TO_CHROME]\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp
3. Click OK

**Firefox:**

For Firefox you can simply install [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) addon.

### Examples of getting an auth token for API:

curl -X POST localhost:8055/auth/login -H 'Content-Type: application/json' -d '{"email":"you@email.com","password":"your-password"}'

curl -X POST localhost:8055/auth/refresh -H 'Content-Type: application/json' -d '{"refresh_token": "W5L70MBXKElx5ZVZwxmQVG8qdVjukiRVIwD5FYG7tCPyyuCM_I3IyCsYnFhMUrRi", "mode": "json"}'

{"data":{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZiNzQ0M2I5LWRiNDgtNGQyZS05MmIwLTc5YTY0OThiZDYyYSIsInJvbGUiOiI5NTA2ZGYzZC01YjQwLTQ4MGMtYTA0NS0xOTU4NTY1MDUyYmYiLCJhcHBfYWNjZXNzIjoxLCJhZG1pbl9hY2Nlc3MiOjEsImlhdCI6MTY3MzAyOTQ0NiwiZXhwIjoxNjczMDMwMzQ2LCJpc3MiOiJkaXJlY3R1cyJ9.f3FzqHrm7IBNIt8NHv_QBI-d8kK82KvIMzm4d2QgSwY","expires":900000,"refresh_token":"W5L70MBXKElx5ZVZwxmQVG8qdVjukiRVIwD5FYG7tCPyyuCM_I3IyCsYnFhMUrRi"}}