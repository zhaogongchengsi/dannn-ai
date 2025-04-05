import type { AIMessage } from '@/lib/database/models'
import type { AnswerMessage, QuestionMessage } from '@dannn/schemas'
import { onFormWorkerChannel, sendToWorkerChannel } from '@/base/rxjs/channel'
import { createQuestionMessage } from '@/lib/database/messageService'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMessageStore = defineStore('dannn-message', () => {
  const messagesList = reactive<AIMessage[]>([])

  async function question(question: string, chatId: string, aiReplier: string[]) {
    const message = await createQuestionMessage(question, chatId)
    messagesList.push(message)
    const aiMessage: QuestionMessage = {
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      aiReplier,
    }
    sendToWorkerChannel(aiMessage)
  }

  onFormWorkerChannel((message: AnswerMessage) => {

  })

  return {
    messagesList,
    question,
  }
})
