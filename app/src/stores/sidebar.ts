import type { DnExtension } from '@/base/extension'
import type { Sidebar } from '@/base/types/sidebar'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('dannn-sidebar', () => {
  const sidebar = ref<Sidebar[]>([])

  function addSidebar(data: Sidebar) {
    const oldSidebar = sidebar.value.filter(item => item.id === data.id)
    sidebar.value = [
      ...oldSidebar,
      data,
    ]
  }

  sidebar.value = window.dnapp.getExtensions().map((ext) => {
    return {
      title: ext.config.name,
      id: ext.id,
      icon: ext.config.icon,
    }
  })

  window.dnapp.on('app:load-extension', (data: DnExtension) => {
    const ext = data
    addSidebar({
      title: ext.config.name,
      id: ext.id,
      icon: ext.config.icon,
    })
  })

  window.dnapp.on('app:create-sidebar', (data: Sidebar) => addSidebar(data))

  return {
    sidebar,
    addSidebar,
  }
})
