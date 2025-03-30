<script setup lang='ts'>
import { Toaster } from '@/components/ui/sonner'
import WindowMenus from '@/components/window-menus.vue'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'
import { useConfig } from './composables/config'
import AppSidebar from './views/AppSidebar.vue'

const isOpen = useStorage('app-sidebar', false)
const isMobile = ref(false)

const config = useConfig()

config.init()

const mainContentWidth = computed(() => {
  if (isMobile.value) {
    return '100vw'
  }
  return isOpen.value ? 'calc(100vw - var(--sidebar-width))' : 'calc(100vw - var(--sidebar-width-icon))'
})

const isWindow = computed(() => window.dannn.is.win)

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <div class="w-screen h-screen">
    <SidebarProvider v-model:open="isOpen" v-model:is-mobile="isMobile" class="h-screen w-screen">
      <AppSidebar />
      <section class="overflow-auto ml-auto h-screen" :style="{ width: mainContentWidth }">
        <WindowMenus v-if="isWindow" />
        <router-view />
      </section>
    </SidebarProvider>
    <Toaster :theme="toasterTheme" />
  </div>
</template>
