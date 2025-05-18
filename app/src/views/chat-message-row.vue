<script setup lang='ts'>
import type { InfoMessage } from 'common/types'
import Avatar from '@/components/avatar/avatar.vue'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { markdownToHtml } from '@/lib/shiki'
import { useDateFormat } from '@vueuse/core'
import { CheckCheck, Loader } from 'lucide-vue-next'
import { computed } from 'vue'

defineOptions({
  name: 'ChatMessageRow',
})

const props = defineProps<{ message: InfoMessage, index: number }>()
const emit = defineEmits<{
  (e: 'updateInContext', roomId: number, id: string, value: boolean): void
}>()
const formatted = useDateFormat(new Date(props.message.createdAt), 'YYYY-MM-DD HH:mm (ddd)')

const aiStore = useAIStore()
const config = useConfig()

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

const isAIThinkingMessage = computed(() => {
  return (props.message as any)?.type === 'thinking'
})

// 是否是用户发送的消息
const isUserSender = computed(() => {
  return props.message.senderType === 'human'
})

const isAiSender = computed(() => {
  return props.message.senderType === 'ai'
})

const inContext = computed(() => {
  return props.message.isInContext === 1
})

const content = computed(() => {
  const message = props.message
  return markdownToHtml(message.content, config.mode.value === 'dark' ? 'vitesse-dark' : 'vitesse-light')
})

function updateInContext(value: boolean) {
  if (isAIThinkingMessage.value) {
    return
  }
  emit('updateInContext', props.message.roomId, props.message.id, value)
}
</script>

<template>
  <div class="w-full py-3 px-2" :class="{ 'flex gap-3': isAiSender }">
    <div v-if="isAiSender" class="shrink-0">
      <Avatar class="size-8" :src="aiAvatar" />
    </div>
    <ContextMenu as-child>
      <div class="w-3/5 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm" :class="{ 'ml-auto': isUserSender }">
        <ContextMenuTrigger as-child>
          <div>
            <div class="flex mb-3" :class="{ 'flex-row-reverse': isUserSender }">
              <div v-if="isAIThinkingMessage">
                <Loader :size="24" class="animate-spin" />
              </div>
              <div v-else class="prose dark:prose-invert max-w-[90%]" v-html="content" />
            </div>
            <div class="flex justify-between items-center" :class="{ 'flex-row-reverse': isUserSender }">
              <p>
                <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ isUserSender ? '我' : 'AI' }}</span>
                <span class="text-sm text-zinc-500 dark:text-zinc-400 mx-2">{{ formatted }}</span>
              </p>
              <CheckCheck v-if="inContext" class="text-zinc-500" :size="20" />
            </div>
          </div>
        </ContextMenuTrigger>
      </div>
      <ContextMenuContent>
        <ContextMenuCheckboxItem :model-value="message.isInContext === 1" @update:model-value="updateInContext">
          添加到上下文
        </ContextMenuCheckboxItem>
        <ContextMenuItem>Copy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
</template>
