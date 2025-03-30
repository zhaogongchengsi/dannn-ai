import { BaseWorker } from "./worker";


export class Logger extends BaseWorker<any> {
	constructor() {
		super();
	}

	log(... messages : string[]) {
		this.invoke('log', 'log', ...messages)
	}

	info(... messages : string[]) {
		this.invoke('log', 'info', ...messages)
	}

	warn(... messages : string[]) {
		this.invoke('log', 'warn', ...messages)
	}

	error(... messages : string[]) {
		this.invoke('log', 'error', ...messages)
	}

}