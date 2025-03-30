<script setup lang='ts'>
import Button from '@/components/ui/button/Button.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { debounce } from 'lodash'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute<'/chat/[name]'>()
const error = ref<Error | null>(null)
const loading = ref(false)
const messageValue = ref<string>('')
const resultValue = ref<string>('')
const waitAnswer = ref(false)

async function send() {
  const message = messageValue.value.trim()
  if (!message)
    return

  console.log('message', message)

  toast(`正在发送消息...${message}`, {
    description: '请稍等片刻',
  })
  messageValue.value = ''
}

const onSend = debounce(send, 500)
</script>

<template>
  <div class="size-full overflow-auto">
    <div v-if="error && !loading" class="p-2 text-red-600">
      <pre><code>{{ error.message }}</code></pre>
    </div>
    <div v-else class="w-full flex flex-col h-full">
      <div class="flex-1 overflow-auto">
        {{ route.params.name }} / {{ route.query.extension }}
      </div>
      <div class="p-2 border-t">
        <Textarea v-model="messageValue" :disabled="waitAnswer" placeholder="有什么可以帮您..." />
        <div class="w-full flex justify-end mt-2 gap-3">
          <Button :loading="waitAnswer" :disabled="waitAnswer" @click="onSend">
            发送
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
