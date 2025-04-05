import { AIConfig, QuestionMessage, AnswerMessage } from "@dannn/schemas";
import { SelfWorker } from "./worker";


interface QuestionEvent {
	message: QuestionMessage
	completeAnswer: (answerMessageContent: string) => void
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
		const handle = (message: QuestionMessage) => {
			const completeAnswer = (answerMessageContent: string) => {
				const answerMessage: AnswerMessage = {
					content: answerMessageContent,
					aiReplier: this.id,
					chatId: message.chatId,
					type: 'content',
				}
				this.selfWorker.emitEventToWindow('ai-answer', answerMessage)
			}
			fn({
				message,
				completeAnswer
			})
		}
		this.selfWorker.on('question', handle)
		this.selfWorker.emitEventToWindow('ai-online', this.id)
		return () => this.selfWorker.off('question', handle)
	}
}