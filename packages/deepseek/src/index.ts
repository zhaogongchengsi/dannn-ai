import { defineExtension } from '@dannn/core';

defineExtension(async ({ window, registerAI }) => {
	const apiKey = await window.getEnv('DEEPSEEK_API_KEY');

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

	ai.onQuestion((event) => {
		console.log(event.message)
		event.completeAnswer(`${event.message.content} answer !!!`)
	})
})

