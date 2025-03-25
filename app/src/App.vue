<script setup lang='ts'>
import ModeToggle from './components/mode-toggle.vue'
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'
import SidebarTrigger from './components/ui/sidebar/SidebarTrigger.vue'
import { useConfig } from './composables/config'
import { useExtension } from './composables/extension'
import AppSidebar from './views/AppSidebar.vue'

useConfig().init()
useExtension().init()
</script>

<template>
  <div class="w-screen h-screen">
    <SidebarProvider>
      <AppSidebar />
      <ModeToggle />
      <SidebarTrigger />
    </SidebarProvider>
  </div>
</template>
