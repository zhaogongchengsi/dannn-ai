import type { Sidebar } from '@/base/types/_sidebar'
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

  // rx.onSidebarReady((...data: Sidebar[]) => {
  //   sidebar.value = unionBy(sidebar.value, data, 'id')
  // })

  return {
    sidebar,
    addSidebar,
    getSidebar
  }
})
