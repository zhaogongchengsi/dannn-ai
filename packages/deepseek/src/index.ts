import { defineExtension } from '../../dannn/src/define';

defineExtension(({ logger, window }) => {
	logger.log('DeepSeek extension activated');

	window.onSidebarReady(async (data) => {
		console.log('Sidebar ready:', data);

		const list = await window.getAllSidebars()	

		console.log('All sidebars:', list);
	})
})

