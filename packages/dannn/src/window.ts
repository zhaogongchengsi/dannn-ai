import { BaseWorker } from './worker'; 

export type WindowEvent = {
	'sidebar-ready': any[]
	'question': { id: string, message: string }
}

export class Window extends BaseWorker<WindowEvent> {
}
