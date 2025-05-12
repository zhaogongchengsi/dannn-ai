<script setup lang='ts'>
import WindowTopbar from '@/components/window-topbar.vue'

useConfig()
useChatStore()
useMessagesStore()
</script>

<template>
  <div class="w-screen h-screen">
    <WindowTopbar />
    <div style="height: calc(100vh - var(--app-header-height))" class="overflow-hidden">
      <router-view />
    </div>
  </div>
</template>
