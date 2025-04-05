<script setup lang='ts'>
import { sendToWorkerChannel } from '@/base/rxjs/channel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/stores/chat'
import { Bot, Plus } from 'lucide-vue-next'
import { ref } from 'vue'

const chatStore = useChatStore()
const value = ref('')

function onSend() {
  const message = value.value.trim()
  if (message.length === 0) {
    return
  }

  if (!chatStore.currentChat || !chatStore.currentChat?.participants) {
    console.warn('no current chat')
    return
  }

  chatStore.question(message)
}
</script>

<template>
  <div class="p-2 flex flex-col gap-2" style="height: calc(var(--app-chat-footer-height) - var(--app-chat-footer-header-height));">
    <div class="w-full flex-1">
      <Textarea v-model="value" class="resize-none size-full" />
    </div>
    <div class="flex items-center">
      <div class="flex items-center gap-2 mr-auto">
        <Button variant="ghost" size="icon" class="size-7">
          <Plus :size="16" />
        </Button>
        <Button variant="ghost" size="icon" class="size-7">
          <Bot :size="16" />
        </Button>
      </div>
      <Button @click="onSend">
        发送
      </Button>
    </div>
  </div>
</template>
