<script setup lang='ts'>
import { computed, ref } from 'vue'
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'
import { useConfig } from './composables/config'
import { useExtension } from './composables/extension'
import AppSidebar from './views/AppSidebar.vue'
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue'
import { useStorage } from '@vueuse/core'

const isOpen = useStorage('app-sidebar',false)
const isMobile = ref(false)

useConfig().init()
useExtension().init()

const mainContentWidth = computed(() => {
  if (isMobile.value) {
    return '100vw'
  }
  return isOpen.value ? 'calc(100vw - var(--sidebar-width))' : 'calc(100vw - var(--sidebar-width-icon))'
})

</script>

<template>
  <div class="w-screen h-screen">
    <SidebarProvider v-model:open="isOpen" v-model:is-mobile="isMobile">
      <AppSidebar />
      <main class="main-content" :style="{ width: mainContentWidth }">
        <header class="px-2 py-1">
          <SidebarTrigger />
        </header>
        <section>
          <router-view />
        </section>
      </main>
    </SidebarProvider>
  </div>
</template>
