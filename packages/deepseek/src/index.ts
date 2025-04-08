import { defineExtension } from '@dannn/core';

defineExtension(async ({ window, registerAI }) => {
	const apiKey = await window.getEnv('DEEPSEEK_API_KEY');

	console.log(`apiKey: ${apiKey}`)

	if (!apiKey) {
		throw new Error('DEEPSEEK_API_KEY is not set. Please set it in the environment variables.');
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



	ai.onQuestion(async (event) => {
		let data = JSON.stringify({
			"messages": [
				{
					"content": event.message.content,
					"role": "user"
				}
			],
			"model": "deepseek-chat",
			"frequency_penalty": 0,
			"max_tokens": 2048,
			"presence_penalty": 0,
			"response_format": {
				"type": "text"
			},
			"stop": null,
			"stream": true,
			"stream_options": null,
			"temperature": 1,
			"top_p": 1,
			"tools": null,
			"tool_choice": "none",
			"logprobs": false,
			"top_logprobs": null
		});
		const response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + apiKey,
			},
			body: data,
		})

		const reader = response.body?.getReader();
		const decoder = new TextDecoder('utf-8');

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value, { stream: true });
			console.log('流式输出:', chunk);
			event.completeAnswer(chunk);
		}

		event.complete();
	})
})

