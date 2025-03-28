<script setup lang='ts'>
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue'
import WindowMenus from '@/components/window-menus.vue'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'
import { useConfig } from './composables/config'
import { useExtension } from './composables/extension'
import AppSidebar from './views/AppSidebar.vue'

const isOpen = useStorage('app-sidebar', false)
const isMobile = ref(false)

useConfig().init()
useExtension().init()

const mainContentWidth = computed(() => {
  if (isMobile.value) {
    return '100vw'
  }
  return isOpen.value ? 'calc(100vw - var(--sidebar-width))' : 'calc(100vw - var(--sidebar-width-icon))'
})

const isWindow = computed(() => window.dannn.is.win)
</script>

<template>
  <div class="w-screen h-screen">
    <SidebarProvider v-model:open="isOpen" v-model:is-mobile="isMobile">
      <AppSidebar />
      <main class="main-content ml-auto duration-200" :style="{ width: mainContentWidth }">
        <header class="flex items-center border-b" style="height: var(--app-header-height)">
          <div class="px-2 py-1 ">
            <SidebarTrigger />
          </div>

          <WindowMenus v-if="isWindow" />
        </header>
        <section class="w-full overflow-auto ml-auto" style="height: calc(100vh - var(--app-header-height));">
          <router-view />
        </section>
      </main>
    </SidebarProvider>
  </div>
</template>
