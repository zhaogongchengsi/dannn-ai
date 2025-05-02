import { defineExtension } from 'base/index'
import icon from './icon.svg'
import { InfoMessage } from 'common/types'

defineExtension(async (ctx) => {
	const key = process.env['DEEPSEEK_API_KEY']

	console.log('DeepSeek extension activated key: ' + key)

	const ai = await ctx.ai.register({
		name: 'deepseek-chat',
		title: "DeepSeek Chat",
		description: 'DeepSeek Chat AI',
		avatar: icon,	
		type: 'chat',
		version: '0.0.1',
		createdBy: 'local',
	})

	ai.onQuestion(async (question: InfoMessage) => {
		console.log('DeepSeek extension activated question: ' + question.content)
	})
})
