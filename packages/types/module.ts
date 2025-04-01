import { Sidebar, SidebarNode } from "./sidebar"

export interface SidebarModules {
	getAllSidebars: () => Promise<Sidebar[]>
	getSidebar: (id: string) => Promise<Sidebar | undefined>
	createSidebar: (sidebar: Sidebar) => Promise<Sidebar>
	appendSidebar: (sidebar: SidebarNode) => Promise<boolean>	
}

export type ExtensionNeedModule = SidebarModules