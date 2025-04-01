import { defineExtension } from '@dannn/core';
import { type } from './../../../app/auto-imports.d';

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
})

