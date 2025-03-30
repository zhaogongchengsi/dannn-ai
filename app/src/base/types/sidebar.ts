export interface Sidebar {
  id: string
  title: string
  link?: string
  icon?: string
  tooltip?: string
  children?: SidebarNode[]
}

export interface SidebarNode {
  id: string
  tooltip?: string
  title: string
  link?: string
  icon?: string
}
