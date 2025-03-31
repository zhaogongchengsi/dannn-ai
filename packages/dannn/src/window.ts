import { BaseWorker } from './worker';

export type WindowEvent = {
	'sidebar-ready': any[]
}

export interface Sidebar {
	id: string
	title: string
	name?: string
	link?: string
	icon?: string
	tooltip?: string
	children?: SidebarNode[]
	fromExtended?: boolean
	isRoot?: boolean
}

export interface SidebarNode {
	id: string
	tooltip?: string
	title: string
	link?: string
	icon?: string
}

export class Window extends BaseWorker<WindowEvent> {
	async getAllSidebars() {
		return await this.invoke('getAllSidebar')
	}

	onSidebarReady(callback: (data: Sidebar[]) => void) {
		this.on('sidebar-ready', callback)
	}
}
