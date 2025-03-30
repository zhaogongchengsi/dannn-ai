import type { DnExtension } from '@/base/extension'
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

  sidebar.value = window.dnapp.getExtensions().map((ext) => {
    return {
      title: ext.config.name,
      id: ext.id,
      icon: ext.config.icon,
    }
  })

  window.dnapp.on('app:load-extension', (data: DnExtension) => {
    console.log('load extension', data)
    const ext = data
    sidebar.value = [
      ...sidebar.value,
      {
        title: ext.config.name,
        id: ext.id,
        icon: ext.config.icon,
      },
    ]
  })

  return {
    sidebar,
  }
})
