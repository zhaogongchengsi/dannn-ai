<script setup lang='ts'>
import ChatFooterBody from '@/views/chat-footer-body.vue'
import ChatFooterHeader from '@/views/chat-footer-header.vue'
import ChatPageContent from '@/views/chat-page-content.vue'
</script>

<template>
  <div class="flex flex-col w-full border-t" style="height: calc(100vh - var(--app-header-height))">
    <div
      style="height: calc(100vh - var(--app-header-height) - var(--app-chat-footer-height) - 2px)"
      class="overflow-y-auto"
    >
      <ChatPageContent />
    </div>
    <div class="bg-[hsl(var(--background))]" style="height: var(--app-chat-footer-height);">
      <ChatFooterHeader />
      <ChatFooterBody />
    </div>
  </div>
</template>
