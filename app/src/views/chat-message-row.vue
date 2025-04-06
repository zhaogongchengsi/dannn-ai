<script setup lang='ts'>
import type { AIMessage } from '@/lib/database/models'
import { markdownToHtml } from '@/lib/shiki'
import { useDateFormat } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{ message: AIMessage, index: number }>()
const formatted = useDateFormat(new Date(props.message.timestamp), 'YYYY-MM-DD HH:mm (ddd)')

const content = computed(() => {
  const message = props.message
  if (message.toHTML && message.complete) {
    return message.toHTML
  }
  return markdownToHtml(message.content)
})
</script>

<template>
  <div class="w-full py-3 px-2">
    <div class="w-4/5 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm" :class="{ 'ml-auto': message.senderIsUser }">
      <div class="flex" :class="{ 'flex-row-reverse': message.senderIsUser }">
        <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ message.senderIsUser ? '我' : 'AI' }}</span>
        <span class="text-sm text-zinc-500 dark:text-zinc-400 ml-2">{{ formatted }}</span>
      </div>
      <div class="flex mt-3" :class="{ 'flex-row-reverse': message.senderIsUser }">
        <div class="prose dark:prose-invert max-w-[90%]" v-html="content" />
      </div>
    </div>
  </div>
</template>
