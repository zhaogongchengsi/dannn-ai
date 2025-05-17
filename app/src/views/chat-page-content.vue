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
    <VirtList ref="virtEl" class="custom-scrollbar" item-key="id" :list="chatStore.currentChatMessage" :style="{ height: `${height}px` }" :min-size="20">
      <template #default="{ itemData, index }">
        <ChatMessageRow :message="itemData" :index="index" />
      </template>
    </VirtList>
  </div>
</template>
