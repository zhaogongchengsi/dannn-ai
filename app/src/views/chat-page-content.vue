<script setup lang='ts'>
import { useChatStore } from '@/stores/chat'
import { useElementSize } from '@vueuse/core'
import { useTemplateRef, watch, watchEffect } from 'vue'
import { VirtList } from 'vue-virt-list'
import ChatMessageRow from './chat-message-row.vue'

const el = useTemplateRef('el')
const virtListRef = useTemplateRef('virtListRef')
const chatStore = useChatStore()
const { height } = useElementSize(el)

watchEffect(() => {
  if (!chatStore.currentChat) {
    return
  }

  console.log(chatStore.currentChat.messages, chatStore.currentChat.messages.length)
})
</script>

<template>
  <div ref="el" class="h-full w-full">
    <div v-if="!chatStore.currentChat" />
    <VirtList v-else ref="virtListRef" :style="{ height: `${height}px` }" :list="chatStore.currentChat?.messages" item-key="id" :min-size="60">
      <template #default="{ itemData, index }">
        <ChatMessageRow :message="itemData" :index="index" />
      </template>
    </VirtList>
  </div>
</template>
