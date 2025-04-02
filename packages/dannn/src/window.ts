import { BaseWorker } from './worker'; 
import { Sidebar, SidebarModules, SidebarNode } from '@dannn/types'

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

	async appendSidebar(sidebar: SidebarNode) {
		if (!sidebar.id) {
			throw new Error('Sidebar id is required')
		}
		const idPattern = /^[a-zA-Z0-9_-]+$/;
		if (!idPattern.test(sidebar.id)) {
			throw new Error('Sidebar id contains invalid characters. Only alphanumeric characters, underscores, and hyphens are allowed.');
		}

		return await this.invoke<boolean>('appendSidebar', sidebar)
	}

	onSidebarReady(callback: (data: Sidebar[]) => void) {
		this.on('sidebar-ready', callback)
	}
}
