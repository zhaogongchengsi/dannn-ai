<script setup lang='ts'>
import { useChatStore } from '@/stores/chat'
import ChatFooterBody from '@/views/chat-footer-body.vue'
import ChatFooterHeader from '@/views/chat-footer-header.vue'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const chatStore = useChatStore()

watchEffect(() => {
  const chatId = route.query.chatId as string
  if (chatId) {
    chatStore.setCurrentChatID(chatId)
  }
})
</script>

<template>
  <div class="flex flex-col w-full" style="height: calc(100vh - var(--app-header-height))">
    <div style="height: calc(100vh - var(--app-header-height) - var(--app-chat-footer-height) - 2px)" class="overflow-y-auto">
      {{ route.query }}
    </div>
    <div class="bg-[hsl(var(--background))]" style="height: var(--app-chat-footer-height);">
      <ChatFooterHeader />
      <ChatFooterBody />
    </div>
  </div>
</template>
