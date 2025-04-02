<script setup lang='ts'>
import { Toaster } from '@/components/ui/sonner'
import WindowMenus from '@/components/window-menus.vue'
import { useStorage } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useAppRx } from './base/rxjs/hook'
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'
import { useConfig } from './composables/config'
import AppSidebar from './views/AppSidebar.vue'

const isOpen = useStorage('app-sidebar', false)
const isMobile = ref(false)

const config = useConfig()
const rx = useAppRx()

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

onMounted(() => rx.toasterReady())

rx.onToasterReady((config) => {
  if (!config.content.trim()) {
    return
  }

  // TODO: add a type for config
  toast(config.content)
})
</script>

<template>
  <div class="w-screen h-screen">
    <SidebarProvider v-model:open="isOpen" v-model:is-mobile="isMobile" class="h-screen w-screen">
      <AppSidebar />
      <section class="ml-auto h-screen relative" :style="{ width: mainContentWidth }">
        <WindowMenus v-if="isWindow" class="w-full p-1" />
        <main class="w-full overflow-auto" :style="{ height: isWindow ? 'calc(100vh - 36px)' : '100vh' }">
          <router-view />
        </main>
      </section>
    </SidebarProvider>
    <Toaster :theme="toasterTheme" />
  </div>
</template>
