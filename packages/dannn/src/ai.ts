import { AIConfig, ChannelMessage } from "@dannn/schemas";
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

	onQuestion(fn: (message: ChannelMessage) => void){
		this.selfWorker.on('question', fn)
		this.selfWorker.emitEventToWindow('ai-online', this.id)
		return () => this.selfWorker.off('question', fn)
	}
}