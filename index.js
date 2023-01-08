import inquirer from 'inquirer';
import chalk from 'chalk';
import generator from 'generate-password';
import * as fs from 'fs';

var envPath = './.env';

try {
    console.log(chalk.magentaBright("Configure Directus with MySQL, Adminer, and a GraphQL playground"));
    console.log(chalk.dim("---------------------------------------------\n"));
    if (fs.existsSync(envPath)) {
        
        console.log(chalk.green("All set! Looks like we're already configured."));
        console.log("You can always edit the variables that we've just set in the .env file manually. You can now proceed with running docker compose.\n\n");
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
                default: generator.generate({length: 14, numbers: true, symbols:false}),
                validate: (password) => {
                    if(password === null || password === false || password == '' || password.length < 8) {
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
                default: generator.generate({length: 14, numbers: true, symbols:false}),
            },
            {
                name: 'MYSQL_DB',
                message: "Give your database a name:",
                default: 'directus'
            },
            {
                name: 'MYSQL_ROOT_PASS',
                message: "Root password:",
                default: generator.generate({length: 14, numbers: true, symbols:false})
            }
        ]).then(answers => {
            console.log(chalk.magentaBright("\nWriting to environment file:\n"));
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
            console.log("You can always edit the variables that we've just set in the .env file manually. You can now proceed with running docker compose.\n\n");
        })
    }
} catch (err) {
    console.error(err)
}