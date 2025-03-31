import { BaseWorker } from "./worker";


export class Logger extends BaseWorker<any> {
	constructor() {
		super();
	}

	log(... messages : string[]) {
		console.log(...messages)
	}

	info(... messages : string[]) {
		console.info(...messages)
	}

	warn(... messages : string[]) {
		console.warn(...messages)
	}

	error(... messages : string[]) {
		console.error(...messages)
	}
}