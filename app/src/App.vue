<script setup lang='ts'>
import SidebarProvider from './components/ui/sidebar/SidebarProvider.vue'
import { useConfig } from './composables/config'
import { useExtension } from './composables/extension'
import AppSidebar from './views/AppSidebar.vue'
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue'

useConfig().init()
useExtension().init()
</script>

<template>
  <div class="w-screen h-screen">
    <SidebarProvider>
      <AppSidebar />
      <main>
        <header>
          <SidebarTrigger />
        </header>
      </main>
    </SidebarProvider>
  </div>
</template>
