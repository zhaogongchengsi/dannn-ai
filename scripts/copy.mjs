import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const copyFile = async (source, destination) => {
	const pipelineAsync = promisify(pipeline);

	try {
		// Ensure the destination directory exists
		const destDir = path.dirname(destination);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}

		// Copy the file
		await pipelineAsync(
			fs.createReadStream(source),
			fs.createWriteStream(destination)
		);

		console.log(`File copied from ${source} to ${destination}`);
	} catch (error) {
		console.error(`Error copying file: ${error.message}`);
	}
};
const args = process.argv.slice(2);

if (args.length < 2) {
	console.error('Usage: node copy.mjs <source> <destination>');
	process.exit(1);
}

const [sourceArg, destinationArg] = args;
const currentDir = process.cwd();
const source = path.resolve(currentDir, sourceArg);
const destination = path.resolve(currentDir, destinationArg);

copyFile(source, destination);