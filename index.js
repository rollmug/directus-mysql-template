import inquirer from 'inquirer';
import chalk from 'chalk';
import generator from 'generate-password';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
import waitOn from 'wait-on';
import { spawn } from 'node:child_process'

var envPath = './.env';

var opts = {
    resources: [
        'tcp:127.0.0.1:3306'
    ],
    delay: 1000,
    interval: 100,
    timeout: 30000,
    tcpTimeout: 30000
}

function loadingAnimation(
    text = "",
    chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
    delay = 100
) {
    let x = 0;

    return setInterval(function () {
        process.stdout.write("\r" + chars[x++] + " " + text);
        x = x % chars.length;
    }, delay);
}

function launchServices() {
    const launch = spawn('docker', ['compose', 'up', 'mysql', '-d']);

    launch.on('close', code => {
        console.log(`Docker has launched MySQL service (status = ${code}).`);

        let loader = loadingAnimation("Waiting for MySQL to be ready...");

        waitOn(opts, (err) => {
            if (err) console.log(err);
            // once here, all resources are available

            const sleeper = spawn('sleep', [5]);
            sleeper.on('close', code => {
                setTimeout(() => clearInterval(loader), 0);
                console.log('MySQL ready.');

                const launch = spawn('docker', ['compose', 'up', '-d']);
                launch.on('close', code => {
                    console.log(chalk.green("\nAll services should be ready. You can access them at the following URLs:\n"));

                    console.log(`Directus CMS: ${chalk.cyan("http://localhost:8055")}`);
                    console.log(`Adminer: ${chalk.cyan("http://localhost:8080")}`);
                    console.log(`GraphiQL Playground: ${chalk.cyan("http://localhost:4000/graphql")}`);

                    console.log(`\n${chalk.redBright("Note: learn how to avoid CORS errors in the GraphiQL Playground when running on localhost:")}`);
                    console.log(`https://github.com/rollmug/directus-mysql-template#cors-problems-on-localhost`)

                    console.log(`\n${chalk.green("Done!")}\n`);
                });
            });

        });
    });
}

try {
    console.log(chalk.magentaBright("Configure Directus with MySQL, Adminer, and a GraphQL playground"));
    console.log(chalk.dim("---------------------------------------------\n"));
    if (fs.existsSync(envPath)) {
        console.log(chalk.green("All set! Looks like we're already configured."));
        console.log("You can always edit the variables that we've just set in the .env file manually. Automatically running docker compose:\n\n");
        launchServices();
    } else {
        //let's do the configuring!
        console.log("Follow the prompts to configure Directus and MySQL.\n");

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
                        //console.log("\nNext, we need to set up the MySQL credentials.");
                        return true;
                    }
                }
            },
            {
                name: 'MYSQL_USER',
                message: "Specify a user name for your MySQL database:",
                default: 'admin',
                validate: () => {
                    //console.log("\nGreat. Now, set a password for the database.");
                    return true;
                }
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
            console.log("You can always edit the variables that we've just set in the .env file manually. Automatically running docker compose:\n\n");

            launchServices();
        })
    }
} catch (err) {
    console.error(err)
}