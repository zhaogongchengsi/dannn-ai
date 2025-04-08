import { defineExtension } from '@dannn/core';
import OpenAI from 'openai/index';

defineExtension(async ({ window, registerAI }) => {

	console.log('OpenAI', OpenAI)

	const apiKey = await window.getEnv('DEEPSEEK_API_KEY');

	console.log(`apiKey: ${apiKey}`)

	if (!apiKey) {
		console.error('DEEPSEEK_API_KEY is not set.')
		return;
	}

	async function getModels() {
		const response = await fetch('https://api.deepseek.com/models', {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			'method': 'GET',
		})

		const data = await response.json()
		return data.data.map((model: any) => model.id)
	}

	const models = await getModels()

	const ai = await registerAI({
		name: 'DeepSeek',
		description: 'DeepSeek is a powerful AI tool that helps you find information quickly and efficiently.',
		icon: 'https://www.deepseek.com/favicon.ico',
		version: '0.0.1',
		title: 'DeepSeek AI',
		role: 'Assistant',
		prompt: 'You are a helpful assistant.',
		type: 'text',
		models,
	})

	// const client = new OpenAI({
	// 	apiKey: apiKey,
	// 	baseURL: 'https://api.deepseek.com'
	// });

	ai.onQuestion(async (event) => {
		// const completion = await client.chat.completions.create({
		// 	messages: [{ role: 'user', content: event.message.content }],
		// 	model: "deepseek-chat",
		// 	stream: true,
		// });
	
		// for await (const chuck of completion) {
		// 	console.log(chuck);
		// 	chuck.choices.forEach((choice) => {
		// 		if (choice.delta.content) {
		// 			event.streamAnswer(choice.delta.content, false);
		// 		}
		// 	})
		// }

		event.complete();
	})
})

