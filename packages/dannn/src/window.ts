import { BaseWorker } from './worker'; 
import { Sidebar, SidebarModules } from '@dannn/types'

export type WindowEvent = {
	'sidebar-ready': any[]
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
