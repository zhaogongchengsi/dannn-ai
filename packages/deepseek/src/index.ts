import { defineExtension } from 'base/index'
import OpenAI from 'openai';
import icon from './icon.svg'

defineExtension(async (ctx) => {
	const key = process.env['DEEPSEEK_API_KEY']

	console.log('DeepSeek extension activated key: ' + key)

	if (!key) {
		console.error('DeepSeek API key is not set.')
		return
	}

	const client = new OpenAI({
		apiKey: key,
		baseURL: 'https://api.deepseek.com',
	});

	const ai = await ctx.ai.register({
		name: 'deepseek-chat',
		title: "DeepSeek Chat",
		description: 'DeepSeek Chat AI',
		avatar: icon,
		type: 'chat',
		version: '0.0.1',
		createdBy: 'local',
	})

	ai.onQuestion(async (event) => {
		event.thinking()

		console.log(event.contextMessage)

		setTimeout(() => {
			event.endThink()
		}, 3000)
		
		// const completion = await client.chat.completions.create({
		// 	messages: [
		// 		...event.contextMessage,
		// 		{ role: "user", content: event.content }
		// 	],
		// 	model: "deepseek-chat",
		// 	stream: true,
		// })

		// event.sendOpenAIStream(completion)
	})
})
