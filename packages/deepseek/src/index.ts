import { defineExtension } from '@dannn/core';

defineExtension(async ({ window, registerAI }) => {
	console.log('DeepSeek extension activated');

	registerAI({
		name: 'DeepSeek',
		description: 'DeepSeek is a powerful AI tool that helps you find information quickly and efficiently.',
		icon: 'https://www.deepseek.com/favicon.ico',
		permissions: {
			env: ['DEEPSEEK_API_KEY'],
		},
	}).then((ai) => {
		console.log('AI registered:', ai);
	}).catch((error) => {
		console.error('Error registering AI:', error);
	})
})

