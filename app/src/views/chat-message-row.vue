<script setup lang='ts'>
import type { InfoMessage } from 'common/types'
import Avatar from '@/components/avatar/avatar.vue'
import { vHtmlLazy } from '@/directives/v-html-lazy'
import { markdownToHtml } from '@/lib/shiki'
import { useDateFormat } from '@vueuse/core'
import { computed } from 'vue'

defineOptions({
  name: 'ChatMessageRow',
  directives: {
    htmlLazy: vHtmlLazy,
  },
})

const props = defineProps<{ message: InfoMessage, index: number }>()
const formatted = useDateFormat(new Date(props.message.createdAt), 'YYYY-MM-DD HH:mm (ddd)')

const aiStore = useAIStore()

const aiAvatar = computed(() => {
  let avatar = 'https://api.dicebear.com/5.x/initials/svg?seed=AI&backgroundColor=F0F0F0&fontFamily=Arial&fontSize=50&width=100&height=100'
  if (props.message.senderId !== null) {
    const ai = aiStore.findAiById(props.message.senderId)
    if (ai && ai.avatar) {
      avatar = ai.avatar
    }
  }
  return avatar
})

// 是否是用户发送的消息
const isUserSender = computed(() => {
  return props.message.senderType === 'human'
})

const isAiSender = computed(() => {
  return props.message.senderType === 'ai'
})

const content = computed(() => {
  const message = props.message
  return markdownToHtml(message.content)
})
</script>

<template>
  <div class="w-full py-3 px-2" :class="{ 'flex gap-3': isAiSender }">
    <div v-if="isAiSender" class="shrink-0">
      <Avatar class="size-8" :src="aiAvatar" />
    </div>
    <div class="w-3/5 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm" :class="{ 'ml-auto': isUserSender }">
      <div class="flex mb-3" :class="{ 'flex-row-reverse': isUserSender }">
        <div class="prose dark:prose-invert max-w-[90%]" v-html="content" />
      </div>
      <div class="flex" :class="{ 'flex-row-reverse': isUserSender }">
        <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ isUserSender ? '我' : 'AI' }}</span>
        <span class="text-sm text-zinc-500 dark:text-zinc-400 mx-2">{{ formatted }}</span>
      </div>
    </div>
  </div>
</template>
