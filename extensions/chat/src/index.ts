import { ExtensionContext } from '~/node/main/extension/context'
import avatar from './icon.svg'

export async function activate(context: ExtensionContext) {
  console.log('DeepSeek extension activated')

  const key = process.env['DEEPSEEK_API_KEY']

  if (!key) {
    console.error('DEEPSEEK_API_KEY is not set. Please set it in your environment variables.')
    return
  }

  const openai = await context.registerAI({
    name: 'DeepSeek',
    title: 'DeepSeek AI',
    description: 'DeepSeek AI model for advanced question answering and conversation.',
    models: 'deepseek-chat',
    avatar: avatar,
    version: '0.0.1',
  }, {
    baseURL: 'https://api.deepseek.com',
    apiKey: key,
    timeout: 60000, // 60 seconds
  })

  console.log('DeepSeek AI registered:', openai.id, openai.name)

  context.on('question', (event) => {
    event.thinking(openai.id)
    openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        ...event.context,
        {
          role: 'user',
          content: event.content,
        }
      ],
      stream: true
    }).then((response) => {
      event.endThink(openai.id)
      event.sendOpenAiStream(response, openai.id)
    }).catch((error) => {
      console.error('Error calling DeepSeek AI:', error)
    })
  })
}

export function deactivate() {
  console.log('DeepSeek extension deactivated')
}