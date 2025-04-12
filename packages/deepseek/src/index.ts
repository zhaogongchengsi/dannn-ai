import { defineExtension } from 'base/index'
import icon from './icon.svg'

defineExtension(async (ctx) => {
	const key = process.env['DEEPSEEK_API_KEY']

	console.log('DeepSeek extension activated key: ' + key)

	const ai = await ctx.ai.registerAI({
		name: 'deepseek-chat',
		title: "DeepSeek Chat",
		description: 'DeepSeek Chat AI',
		avatar: icon,	
		type: 'chat',
		version: '0.0.1',
		createdBy: 'local',
	})

	console.log(ai)

	console.log('DeepSeek extension activated AI: ' + ai)
})
