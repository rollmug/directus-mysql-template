import chalk from 'chalk';
import ora from 'ora';
import waitOn from 'wait-on';
import { spawn } from 'node:child_process';
import logUpdate from 'log-update';
import open from 'open';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import jq from 'node-jq';
dotenv.config();

function outputDone() {
    if (process.env.DIRECTUS_DOMAIN === 'localhost') {
        var appURL = 'http://localhost';
    } else {
        var appURL = process.env.DIRECTUS_DOMAIN;
    }

    console.log(chalk.green("\nAll services should be ready. You can access them at the following URLs:\n"));
    console.log(`Directus CMS: ${chalk.cyan(process.env.PUBLIC_URL)}`);
    console.log(`Adminer: ${chalk.cyan(appURL + ":8080")}`);
    console.log(`GraphiQL Playground: ${chalk.cyan(appURL + ":4000/graphql")}`);

    console.log(`\n${chalk.redBright("Note: learn how to avoid CORS errors in the GraphiQL Playground when running on localhost:")}`);
    console.log(`https://github.com/rollmug/directus-mysql-template#cors-problems-on-localhost`)

    console.log(`\n${chalk.green("When you're finished, you can stop all running containers with:")}\n`);
    console.log(`npm run stop\n`);
    console.log(`${chalk.green("You can start them all back up again with:")}`);
    console.log(`npm run launch\n`);
}

export default function launchServices() {
    const launch = spawn('docker-compose', ['up', '-d', 'mysql']);

    const opts = {
        resources: [
            'tcp:127.0.0.1:3306'
        ],
        delay: 1000,
        interval: 100,
        timeout: 30000,
        tcpTimeout: 30000
    }

    launch.stderr.on('data', (data) => {
        logUpdate(`${data}`);
    });

    launch.on('close', code => {
        logUpdate.done();
        console.log(`Docker has launched MySQL service (status = ${code}).`);

        const loader = ora('Waiting for MySQL to be ready').start();

        waitOn(opts, (err) => {
            if (err) console.log(err);
            // once here, all resources are available
            loader.stop();
            console.log('MySQL ready.');

            logUpdate("Building and launching containers:\n");
            logUpdate.done();

            const launch2 = spawn('docker-compose', ['up', '-d']);

            launch2.stderr.on('data', (data) => {
                logUpdate(`${data}`);
            });

            launch2.on('close', code => {
                logUpdate('Done.');
                logUpdate.done();

                const pingOpts = {
                    resources: [
                        `${process.env.PUBLIC_URL}`
                    ],
                    delay: 1000,
                    interval: 300,
                    timeout: 40000,
                    tcpTimeout: 40000
                }

                const loader2 = ora('Waiting for Directus to be ready').start();

                waitOn(pingOpts).then(() => {
                    loader2.stop();
                    logUpdate('Directus ready.');
                    logUpdate.done();
                    outputDone();

                    inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'open_now',
                            message: "Open services in browser now?"
                        }
                    ]).then(answers => {
                        if (answers.open_now === true) {
                            open(process.env.PUBLIC_URL);
                            open(`${appURL}:8080`);
                            open(`${appURL}:4000/graphql`);
                        } else {
                            process.exit(1);
                        }
                    });
                }).catch((err) => {
                    loader2.stop();
                    //if we're here, it's because directus is taking too long to respond. 
                    //It may be that it's running, so let's be sure.
                    logUpdate('Directus taking a long time to respond...');

                    const check = spawn('docker-compose', ['ps', '--format', 'json']);
                    var json = null;

                    check.stdout.on('data', (data) => {
                        const q = 'map(select(.Name == "directus")) | .[0] | {Name: .Name, Service: .Service, State: .State}';
                        jq.run(q, data.toString(), { input: 'string' })
                            .then((data) => {
                                json = JSON.parse(data);

                                if(json.State == 'running') {
                                    logUpdate(`${chalk.yellowBright("Directus appears to be running, but took a while to respond.")}`);
                                    console.log(`Just run ${chalk.greenBright("npm run launch")} to verify, and you should be good to go.`);
                                    logUpdate.done();
                                } else {
                                    logUpdate.done();
                                    console.log(`${chalk.redBright("Directus taking too long to respond. You may need to manually start it.")}`);
                                    console.log(`Just run ${chalk.greenBright("npm run launch")} and you should be good to go.`);
                                }
                            });
                    });

                    check.on('close', (code) => {
                        if (code !== 0) {
                            console.log(`${chalk.redBright("Directus taking too long to respond. You may need to manually start it.")}`);
                            console.log(`Just run ${chalk.greenBright("npm run launch")} and you should be good to go.`);
                        }
                    });
                });
            });
        });
    });
}