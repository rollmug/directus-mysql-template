## Docker with Directus / MySQL / Adminer / GraphQL

This package contains everything you need to get up and running with Directus CMS with a MySQL backend, plus an interactive GraphQL playground to help you develop your API queries.

Before you do anything else, you need [Docker](https://www.docker.com) and [Node](https://nodejs.org) installed on your machine:

- [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)  
- [Install Node](https://nodejs.org/en/download/)

Once you've done that, you can install and configure this package by following these steps:

1. CD into the parent directory where you'd like to install this, ie `cd ~/Documents/My-Folder`.
2. From there, run `git clone https://github.com/rollmug/directus-mysql-template.git`, OR, if you don't have git installed, [manually download it here](https://github.com/rollmug/directus-mysql-template/archive/refs/heads/main.zip) and unzip it.
3. Navigate into the folder you just downloaded: `cd directus-mysql-template`

### To configure your Directus/MySQL setup:

1. Within the directus-mysql-template directory, run `npm install`
2. Lastly, run `npm start`. The wizard will walk you through the config.

*Note that you'll only have to do these two steps the first time you run this.*

### Running Docker Compose

Now that you've configured your install, you can run the following commands from within the same directory:

`docker compose up mysql -d`

Wait 20-30 seconds (for MySQL to boot), then type:

`docker compose up -d`

You can access the URLS from here:

Directus CMS: http://localhost:8055  
GraphQL Playground: http://localhost:4000/graphql  
Adminer (for MySQL): http://localhost:8080

### CORS problems on localhost

When using the GraphiQL playground on localhost, you'll run into some browser problems related to CORS. Here's how to get around it:

**Safari:**

1. Enable the developer menu by opening up Settings > Advanced, then check "Show Develop bar in menu"
2. Click the Develop menu and check "Disable Cross-Origin Restrictions"

**Chrome**

Temporarily Disable CORS in Chrome (MacOS):

1. Quit Chrome
2. Open terminal and run:

`open -n -a "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security`

**Windows:**

1. Right click on desktop, add new shortcut
2. Add the target as "[PATH_TO_CHROME]\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp
3. Click OK

**Firefox:**

For Firefox you can simply install [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) addon.

### Examples of getting an auth token for API:

curl -X POST localhost:8055/auth/login -H 'Content-Type: application/json' -d '{"email":"you@email.com","password":"your-password"}'

curl -X POST localhost:8055/auth/refresh -H 'Content-Type: application/json' -d '{"refresh_token": "W5L70MBXKElx5ZVZwxmQVG8qdVjukiRVIwD5FYG7tCPyyuCM_I3IyCsYnFhMUrRi", "mode": "json"}'