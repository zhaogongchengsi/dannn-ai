import { defineExtension } from '@dannn/core';

defineExtension(async ({ window, registerAI }) => {
	console.log('DeepSeek extension activated');

	const apiKey = await window.getEnv('DEEPSEEK_API_KEY');

	console.log('api kay', apiKey)

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

	registerAI({
		name: 'DeepSeek',
		description: 'DeepSeek is a powerful AI tool that helps you find information quickly and efficiently.',
		icon: 'https://www.deepseek.com/favicon.ico',
		version: '0.0.1',
		title: 'DeepSeek AI',
		role: 'Assistant',
		prompt: 'You are a helpful assistant.',
		type: 'text',
		models,
	}).then((ai) => {
		console.log('AI registered:', ai);
	}).catch((error) => {
		console.error('Error registering AI:', error);
	})
})

