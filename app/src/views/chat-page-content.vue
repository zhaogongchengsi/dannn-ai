<script setup lang='ts'>
import { useChatStore } from '@/stores/chat'
import { useElementSize, watchOnce } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { VirtList } from 'vue-virt-list'
import ChatMessageRow from './chat-message-row.vue'

const el = useTemplateRef('el')
const virtEl = useTemplateRef('virtEl')
const chatStore = useChatStore()
const { height } = useElementSize(el)

watchOnce(() => virtEl.value, () => {
  virtEl.value?.scrollToBottom()
})
</script>

<template>
  <div ref="el" class="h-full w-full">
    <!-- <div v-if="!chatStore.currentChat">
    <div class="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
      <span>请选择一个聊天</span>
    </div>
  </div>
  <div v-if="!chatStore.currentChat || !chatStore.currentChat.messages || chatStore.currentChat.messages.length === 0"
    class="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
    <span>暂无消息</span>
  </div> -->
    <VirtList ref="virtEl" item-key="id" :list="[]" :style="{ height: `${height}px` }" :min-size="20">
      <template #default="{ itemData, index }">
        <ChatMessageRow :message="itemData" :index="index" />
      </template>
    </VirtList>
  </div>
</template>
