import { AIConfig } from "@dannn/schemas";
import { SelfWorker } from "./worker";


export class AI {
	id: string;
	selfWorker: SelfWorker;
	config: AIConfig;
	constructor(id: string,selfWorker: SelfWorker, config: AIConfig) {
		this.id = id;
		this.selfWorker = selfWorker;
		this.config = config;
	}
}