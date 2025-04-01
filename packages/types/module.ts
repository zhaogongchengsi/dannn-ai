import { Sidebar } from "./sidebar"

export interface SidebarModules {
	getAllSidebars: () => Promise<Sidebar[]>
	getSidebar: (id: string) => Promise<Sidebar | undefined>
	createSidebar: (sidebar: Sidebar) => Promise<Sidebar>
}

export type ExtensionNeedModule = SidebarModules