import chalk from 'chalk';
import { lookpath } from 'lookpath';

export default async function checkRequirements() {
	const nodeVersion = process.versions.node;
	const major = +nodeVersion.split('.')[0];
	const docker = await lookpath('docker');

	if(!docker) {
		console.error(`${chalk.red(`Docker needs to be installed and running`)}.`);
		console.error(`Please install or open Docker on your machine.`);
		console.error(`For installation instructions, visit this page:`);
		console.error(`https://www.docker.com/products/docker-desktop/`);
		process.exit(1);
	}

	if (major < 14) {
		console.error(`You are running ${chalk.red(`Node ${nodeVersion}`)}.`);
		console.error(`Directus requires ${chalk.green(`Node 14`)} and up.`);
		console.error('Please update your Node version and try again.');
		process.exit(1);
	}
};