import { defineExtension } from '../../dannn/src/define';

defineExtension((ctx) => {
	ctx.logger.log('DeepSeek extension activated');

	ctx.window.onSidebarReady((data) => {
		console.log('Sidebar ready:', data);
	})
})

