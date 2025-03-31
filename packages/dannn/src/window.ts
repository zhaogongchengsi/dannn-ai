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

export interface SidebarModules {
	getAllSidebars: () => Promise<Sidebar[]>
	getSidebar: (id: string) => Promise<Sidebar | undefined>
	createSidebar: (sidebar: Sidebar) => Promise<Sidebar>
}

export class Window extends BaseWorker<WindowEvent> implements SidebarModules {
	async getAllSidebars() {
		return await this.invoke<Sidebar[]>('getAllSidebars')
	}

	async getSidebar(id: string) {
		return await this.invoke<Sidebar | undefined>('getSidebar', id)
	}

	async createSidebar(sidebar: Sidebar) {
		return await this.invoke<Sidebar>('createSidebar', sidebar)
	}

	onSidebarReady(callback: (data: Sidebar[]) => void) {
		this.on('sidebar-ready', callback)
	}
}
