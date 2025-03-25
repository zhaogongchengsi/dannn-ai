<script setup lang='ts'>
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'

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
    </SidebarProvider>
  </div>
</template>
