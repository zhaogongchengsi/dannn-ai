import { AIConfig, ChannelMessage } from "@dannn/schemas";
import { SelfWorker } from "./worker";


interface QuestionEvent {
	message: ChannelMessage
	answer: (message: string) => void
}

export class AI {
	id: string;
	selfWorker: SelfWorker;
	config: AIConfig;
	constructor(id: string, selfWorker: SelfWorker, config: AIConfig) {
		this.id = id;
		this.selfWorker = selfWorker;
		this.config = config;
	}

	onQuestion(fn: (e: QuestionEvent) => void) {
		const handle = (message: ChannelMessage) => {
			const answer = (message: string) => {
				const answerMessage: ChannelMessage = {
					content: message,
					aiReplier: [this.id]
				}
				this.selfWorker.emitEventToWindow('ai-answer', answerMessage)
			}
			fn({
				message,
				answer
			})
		}
		this.selfWorker.on('question', handle)
		this.selfWorker.emitEventToWindow('ai-online', this.id)
		return () => this.selfWorker.off('question', handle)
	}
}