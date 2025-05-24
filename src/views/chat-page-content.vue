<script setup lang='ts'>
import { useElementSize, watchOnce } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { VirtList } from 'vue-virt-list'
import { useChatStore } from '@/stores/chat'
import ChatMessageRow from './chat-message-row.vue'

const el = useTemplateRef('el')
const virtEl = useTemplateRef('virtEl')
const chatStore = useChatStore()
const messageStore = useMessagesStore()
const { height } = useElementSize(el)

const route = useRoute<'/chat/[id]/'>()

watchOnce(() => virtEl.value, () => {
  virtEl.value?.scrollToBottom()
})

watch(() => route.params.id, () => {
  virtEl.value?.scrollToBottom()
})

async function updateMessageInContext(id: number, messageId: string, value: boolean) {
  if (value) {
    await messageStore.updateMessageContextTrue(id, messageId)
  }
  else {
    await messageStore.updateMessageContextFalse(id, messageId)
  }
}
</script>

<template>
  <div ref="el" class="h-full w-full">
    <VirtList ref="virtEl" class="custom-scrollbar" item-key="id" :list="chatStore.currentChatMessage" :style="{ height: `${height}px` }" :min-size="20">
      <template #default="{ itemData, index }">
        <ChatMessageRow :message="itemData" :index="index" @update-in-context="updateMessageInContext" />
      </template>
    </VirtList>
  </div>
</template>
