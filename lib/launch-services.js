import chalk from 'chalk';
import ora from 'ora';
import waitOn from 'wait-on';
import { spawn } from 'node:child_process';
import logUpdate from 'log-update';

export default function launchServices() {
    const launch = spawn('docker', ['compose', 'up', 'mysql', '-d']);

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

            const sleeper = spawn('sleep', [5]);

            sleeper.on('close', code => {
                loader.stop();
                console.log('MySQL ready.');

                logUpdate("Building and launching containers:\n");
                logUpdate.done();

                const launch2 = spawn('docker', ['compose', 'up', '-d']);

                launch2.stderr.on('data', (data) => {
                    logUpdate(`${data}`);
                });

                launch2.on('close', code => {
                    logUpdate('Done.');
                    logUpdate.done();

                    const pingOpts = {
                        resources: [
                            'http://localhost:8055'
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

                        console.log(chalk.green("\nAll services should be ready. You can access them at the following URLs:\n"));

                        console.log(`Directus CMS: ${chalk.cyan("http://localhost:8055")}`);
                        console.log(`Adminer: ${chalk.cyan("http://localhost:8080")}`);
                        console.log(`GraphiQL Playground: ${chalk.cyan("http://localhost:4000/graphql")}`);

                        console.log(`\n${chalk.redBright("Note: learn how to avoid CORS errors in the GraphiQL Playground when running on localhost:")}`);
                        console.log(`https://github.com/rollmug/directus-mysql-template#cors-problems-on-localhost`)

                        console.log(`\n${chalk.green("When you're finished, you can stop all running containers with:")}\n`);
                        console.log(`docker compose down\n`);
                        console.log(`${chalk.green("You can start them all back up again with:")}`);
                        console.log(`npm start\n`);
                    }).catch((err) => {
                        //console.log(err);
                        console.log(`${chalk.redBright("Directus had a hiccup. You may need to manually start it. Just run 'docker compose up' and you should be good to go.")}`)
                    });
                    
                });
            });

        });
    });
}