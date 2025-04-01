export interface Sidebar {
  id: string
  title: string
  name?: string
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
  icon?: string
  type?: 'chat'
}

