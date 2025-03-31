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

  // rx.onSidebarReady((...data: Sidebar[]) => {
  //   sidebar.value = unionBy(sidebar.value, data, 'id')
  // })

  return {
    sidebar,
    addSidebar,
  }
})
