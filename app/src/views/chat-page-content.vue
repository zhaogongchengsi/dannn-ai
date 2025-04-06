<script setup lang='ts'>
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/stores/chat'
import { useElementSize } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import ChatMessageRow from './chat-message-row.vue'

const el = useTemplateRef('el')
const chatStore = useChatStore()
const { height } = useElementSize(el)
</script>

<template>
  <div ref="el" class="h-full w-full">
    <div v-if="!chatStore.currentChat">
      <div class="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
        <span>请选择一个聊天</span>
      </div>
    </div>
    <div
      v-if="chatStore.currentChat?.messages.length === 0"
      class="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400"
    >
      <span>暂无消息</span>
    </div>
    <ScrollArea :style="{ height: `${height}px` }" class="overflow-hidden">
      <ul>
        <li v-for="(item, index) in chatStore.currentChat?.messages" :key="index">
          <ChatMessageRow :message="item" :index="index" />
        </li>
      </ul>
    </ScrollArea>
  </div>
</template>
