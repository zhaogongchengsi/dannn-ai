<script setup lang='ts'>
import { useAppRx } from '@/base/rxjs/hook'
import { useChatStore } from '@/stores/chat'
import ChatFooterBody from '@/views/chat-footer-body.vue'
import ChatFooterHeader from '@/views/chat-footer-header.vue'
import { onUnmounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const chatStore = useChatStore()
const rx = useAppRx()

watchEffect(() => {
  const chatId = route.query.chatId as string
  if (chatId) {
    chatStore.setCurrentChatID(chatId)
  }
})

const unsubscribe = rx.onFormWorkerChannel((message) => {
  console.log('chat ', message.content)
})

onUnmounted(() => unsubscribe())
</script>

<template>
  <div class="flex flex-col w-full border-t" style="height: calc(100vh - var(--app-header-height))">
    <div
      style="height: calc(100vh - var(--app-header-height) - var(--app-chat-footer-height) - 2px)"
      class="overflow-y-auto"
    >
      聊天
    </div>
    <div class="bg-[hsl(var(--background))]" style="height: var(--app-chat-footer-height);">
      <ChatFooterHeader />
      <ChatFooterBody />
    </div>
  </div>
</template>
