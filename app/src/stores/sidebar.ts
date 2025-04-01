import type { Sidebar, SidebarNode } from '@dannn/types'
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

  function getSidebar(id: string) {
    return sidebar.value.find(item => item.id === id)
  }

  function appendSidebarNode(id: string, node: SidebarNode) {
    const sidebarItem = getSidebar(id)
    if (sidebarItem) {
      const oldChildren = sidebarItem.children || []
      sidebarItem.children = [...oldChildren, node]
    }
  }

  return {
    sidebar,
    addSidebar,
    getSidebar,
    appendSidebarNode,
  }
})
