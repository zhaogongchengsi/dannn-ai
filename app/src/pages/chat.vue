<script setup lang='ts'>
import ChatFooterBody from '@/views/chat-footer-body.vue'
import ChatFooterHeader from '@/views/chat-footer-header.vue'
import ChatPageContent from '@/views/chat-page-content.vue'

const chatStore = useChatStore()
const router = useRoute()

watchEffect(() => {
  const id = router.query.chatId
  if (!id) {
    return
  }

  chatStore.setCurrentChatID(Number(id))
})
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
