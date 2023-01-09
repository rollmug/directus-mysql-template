#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import generator from 'generate-password';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

import checkRequirements from './check-requirements.js';
import launchServices from './launch-services.js';

const rootPath = path.resolve();
const envPath = './.env';

try {
    console.log(chalk.magentaBright("Configure Directus with MySQL, Adminer, and a GraphQL playground"));
    console.log(chalk.dim("---------------------------------------------\n"));

    checkRequirements();

    if (fs.existsSync(envPath) && process.env.ADMIN_EMAIL !== null && process.env.ADMIN_PASSWORD !== null) {
        console.log(chalk.green("Looks like we're already configured, so let's get things up and running."));
        console.log("ps - you can always edit the variables that we've just set in the .env file manually.\n\nAutomatically running docker compose:\n");
        launchServices();
    } else {
        //let's do the configuring!
        console.log("Follow the prompts to configure Directus and MySQL.\n");

        console.log(rootPath);

        inquirer.prompt([
            {
                name: 'ADMIN_EMAIL',
                message: "Type your email then hit return:",
                validate: (email) => {
                    let valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)

                    if (valid) {
                        return true;
                    } else {
                        console.log(chalk.red("\nPlease enter a valid email."))
                        return false;
                    }
                }
            },
            {
                name: 'ADMIN_PASSWORD',
                message: 'Type a password to login with, or hit return to use suggested:',
                default: generator.generate({ length: 14, numbers: true, symbols: false }),
                validate: (password) => {
                    if (password === null || password === false || password == '' || password.length < 8) {
                        console.log(chalk.red("\nPassword cannot be empty, and must have at least 8 characters."))
                    } else {
                        return true;
                    }
                }
            },
            {
                name: 'MYSQL_USER',
                message: "Specify a user name for your MySQL database:",
                default: 'admin'
            },
            {
                name: 'MYSQL_PASS',
                message: "MySQL Password:",
                default: generator.generate({ length: 14, numbers: true, symbols: false }),
            },
            {
                name: 'MYSQL_DB',
                message: "Give your database a name:",
                default: 'directus'
            },
            {
                name: 'MYSQL_ROOT_PASS',
                message: "Root password:",
                default: generator.generate({ length: 14, numbers: true, symbols: false })
            }
        ]).then(answers => {
            console.log(chalk.magentaBright("\nWriting to environment file. Be sure to take note of your credentials below, you'll need them shortly!\n"));
            console.log(answers);

            var writeStream = fs.createWriteStream(envPath);
            writeStream.write("# Environment variables\n\n# Email and password to login to Directus:\n");
            writeStream.write(`ADMIN_EMAIL="${answers.ADMIN_EMAIL}"`);
            writeStream.write("\n");
            writeStream.write(`ADMIN_PASSWORD="${answers.ADMIN_PASSWORD}"`);
            writeStream.write("\n");

            writeStream.write("\n");
            writeStream.write("# Define the mysql user name and password:\n");

            writeStream.write(`MYSQL_USER="${answers.MYSQL_USER}"`);
            writeStream.write("\n");
            writeStream.write(`MYSQL_PASS="${answers.MYSQL_PASS}"`);
            writeStream.write("\n");

            writeStream.write("\n");
            writeStream.write("# Give your database a name:\n");
            writeStream.write(`MYSQL_DB="${answers.MYSQL_DB}"`);
            writeStream.write("\n");

            writeStream.write("\n");
            writeStream.write("# Set a root password for MySQL to something secure:\n");
            writeStream.write(`MYSQL_ROOT_PASS="${answers.MYSQL_ROOT_PASS}"`);
            writeStream.write("\n\n");

            writeStream.write("# Set the domain for directus to use:\n");
            writeStream.write("# eg, https://mydomain.com\n");
            writeStream.write("# in local dev environments, just leave it set to localhost:port\n");
            writeStream.write("PUBLIC_URL=\"http://localhost:8055\"\n");
            writeStream.write("API_ENDPOINT=\"http://localhost:8055/graphql\"");

            writeStream.end();

            console.log(chalk.greenBright("\nAll set!"));
            console.log("You can always edit the variables that we've just set in the .env file manually.\n");
            console.log(`${chalk.greenBright("To launch all services, just run 'npm start' again.")}\n`);
        })
    }
} catch (err) {
    console.error(err)
}