## Docker with Directus / MySQL / Adminer / GraphQL

This package contains everything you need to get up and running with Directus CMS with a MySQL backend, plus an interactive GraphQL playground to help you develop your API queries.

**Requirements:** you need [Docker](https://www.docker.com) and [Node](https://nodejs.org) installed on your machine:

- [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)  
- [Install Node](https://nodejs.org/en/download/)

### Quick Install:

**The easiest way to get up and running is to open a terminal session and run:**

```bash
npx create-directus-docker@latest <my-project>
```

Then, just follow the on-screen prompts.

### Manual Install

As an alternative, you can install this package by following these steps. Once you've installed Node and Docker, and have Docker Desktop running on your machine:

1. Open a terminal session:  
    **Mac:** Go to /Applications/Utilities then double-click Terminal.  
    **Windows:** Click 'Start' taskbar button, Select 'All apps', scroll down and select 'Terminal'
2. CD into the parent directory where you'd like to install this, ie `cd '~/Documents/My-Folder'`.
3. From there, run:  
    `git clone https://github.com/rollmug/directus-mysql-template.git`  
    OR, if you don't have git installed, [manually download it here](https://github.com/rollmug/directus-mysql-template/archive/refs/heads/main.zip) and unzip it.
4. Navigate into the folder you just downloaded, ie `cd 'directus-mysql-template'`

**Configure your Directus/MySQL setup:**

1. Within the directus-mysql-template directory, run `npm install`
2. Lastly, run `npm start`. The wizard will walk you through the config, and automatically launch all containers for you.

*Note that you'll only have to do these two steps the first time you run this.*

### Starting/stopping with Docker Compose

To **stop** your running containers, simply run `docker compose down` in your terminal from within the project directory. All containers will be stopped.

To **restart** your stopped containers, you can let the helper app do it for you:

`npm start`

Or you can follow this sequence:

`docker compose up mysql -d`

Then wait 10-20 seconds (for MySQL to boot), then type:

`docker compose up -d`

**Boom!** You're done. Now you can access the URLS from here:

Directus CMS: http://localhost:8055  
GraphQL Playground: http://localhost:4000/graphql  
Adminer (for MySQL): http://localhost:8080

**Check on running containers:**

Simply run `docker compose ps` to see the status of running containers. Or, run `docker compose ps -a` to see all containers, running or not.

## CORS problems on localhost

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