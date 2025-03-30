import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const useSidebarStore = defineStore('dannn-sidebar', () => {
  const sidebar = ref<Sidebar[]>([])

  return {
    sidebar,
  }
})
