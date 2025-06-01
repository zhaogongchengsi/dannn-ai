<script setup lang='ts'>
import { Bot, Plus } from 'lucide-vue-next'
import { ref } from 'vue'
import Editor from '@/components/editor/editor.vue'
import { Button } from '@/components/ui/button'

const value = ref('')
const chatStore = useChatStore()

function onSend() {
  const message = value.value.trim()
  if (message.length === 0) {
    return
  }

  if (!chatStore.currentChat) {
    console.error('请先选择一个聊天')
    return
  }

  chatStore.sendQuestionToChat(message)
    .finally(() => {
      // 清空输入框
      value.value = ''
    })
}

function onCtrlWithEnter(event: MouseEvent | KeyboardEvent) {
  if (
    event instanceof KeyboardEvent
    && event.ctrlKey
    && event.key === 'Enter'
  ) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    onSend()
  }
}
</script>

<template>
  <div class="p-2 flex flex-col gap-2" style="height: calc(var(--app-chat-footer-height) - var(--app-chat-footer-header-height));">
    <div class="w-full flex-1" style="max-height: 136px">
      <div class="border rounded-md border-muted bg-muted/50 p-2 h-full overflow-auto custom-scrollbar" @keydown.capture="onCtrlWithEnter">
        <Editor v-model:text="value" />
      </div>
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
