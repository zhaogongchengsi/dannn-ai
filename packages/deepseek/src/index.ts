import { defineExtension } from '../../dannn/src/define';

const { activate, deactivate } = defineExtension((ctx) => {
	console.log('DeepSeek extension activated');
})

export { activate, deactivate }
