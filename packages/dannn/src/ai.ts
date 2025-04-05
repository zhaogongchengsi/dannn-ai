import { AIConfig, QuestionMessage, AnswerMessage } from "@dannn/schemas";
import { SelfWorker } from "./worker";


interface QuestionEvent {
	message: QuestionMessage
	completeAnswer: (answerMessageContent: string) => void
	streamAnswer: (data: string, complete: boolean) => void
	complete: () => void
}

export class AIStream {
	id: string = crypto.randomUUID();
	aiId: string
	chatId: string
	questionId: string
	sortId: number = 0
	selfWorker: SelfWorker
	_complete: boolean = false
	constructor(
		aiId: string,
		chId: string,
		questionId: string,
		selfWorker: SelfWorker
	) {
		this.aiId = aiId
		this.questionId = questionId
		this.id = chId
		this.chatId = chId
		this.selfWorker = selfWorker
	}

	send(data: string, complete: boolean = false) {
		this.sortId++
		const answerMessage: AnswerMessage = {
			content: data,
			aiReplier: this.aiId,
			chatId: this.chatId,
			type: 'stream',
			sortId: this.sortId,
			questionId: this.questionId,
			createAt: Date.now(),
			complete,
		}
		this._complete = complete
		this.selfWorker.emitEventToWindow('ai-answer', answerMessage)
	}

	complete() {
		const answerMessage: AnswerMessage = {
			content: '',
			aiReplier: this.aiId,
			chatId: this.chatId,
			type: 'stream',
			sortId: this.sortId,
			questionId: this.questionId,
			createAt: Date.now(),
			complete: true,
		}
		this.selfWorker.emitEventToWindow('ai-answer', answerMessage)
	}
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

			const aiStream = new AIStream(
				this.id,
				message.chatId,
				message.id,
				this.selfWorker
			)

			const streamAnswer = (data: string, complete: boolean) => {
				aiStream.send(data, complete)
			}

			try {
				fn({
					message,
					completeAnswer,
					streamAnswer,
					complete: () => {
						aiStream.complete()
					},
				})
			} catch (e) {
				console.error('Error while handling question:', e)
			}
		}
		this.selfWorker.on('question', handle)
		this.selfWorker.emitEventToWindow('ai-online', this.id)
		return () => this.selfWorker.off('question', handle)
	}
}