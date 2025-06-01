<script setup lang='ts'>
import { debounceFilter, useElementSize, watchOnce } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { VirtList } from 'vue-virt-list'
import { useChatStore } from '@/stores/chat'
import ChatMessageRow from './chat-message-row.vue'

const el = useTemplateRef('el')
const virtEl = useTemplateRef('virtEl')
const chatStore = useChatStore()
const messageStore = useMessagesStore()
const { height } = useElementSize(el)
const shouldAutoScroll = ref(true)

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

watchWithFilter(
  () => chatStore.currentChatMessage,
  () => {
    virtEl.value?.forceUpdate()
    if (shouldAutoScroll.value) {
      virtEl.value?.scrollToBottom()
    }
  },
  {
    eventFilter: debounceFilter(70),
  },
)

function onVirtListScroll(e: Event) {
  const target = e.target as HTMLElement
  // 判断是否在底部（允许 2px 误差）
  shouldAutoScroll.value = target.scrollHeight - target.scrollTop - target.clientHeight < 2
}
</script>

<template>
  <div ref="el" class="h-full w-full">
    <VirtList ref="virtEl" class="custom-scrollbar" item-key="id" :list="chatStore.currentChatMessage" :style="{ height: `${height}px` }" :min-size="20" @scroll="onVirtListScroll">
      <template #default="{ itemData, index }">
        <ChatMessageRow :message="itemData" :index="index" @update-in-context="updateMessageInContext" />
      </template>
    </VirtList>
  </div>
</template>
