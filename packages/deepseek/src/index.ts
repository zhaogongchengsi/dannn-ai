import { defineExtension } from '@dannn/core';

defineExtension(({ logger, window }) => {
	logger.log('DeepSeek extension activated');

	window.onSidebarReady(async () => {
		const ok = await window.appendSidebar({
			id: 'deepseek-chat',
			title: 'DeepSeek Chat',
			type: 'chat',
		})
		console.log('Append sidebar:', ok);
	})

	window.onQuestion((question) => {
		console.log('Received question:', question);
		window.replyQuestion(question.id, question.message + 'This is a reply to your question.');
	})
})

