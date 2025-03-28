<script setup lang='ts'>
import Button from '@/components/ui/button/Button.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { useAI } from '@/composables/ai'
import { useExtension } from '@/composables/extension'
import { AI } from '@/lib/rxjs/aihub'
import { computedAsync } from '@vueuse/core'
import { debounce } from 'lodash'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute<'/chat/[name]'>()
const extension = useExtension()
const ai = useAI()
const error = ref<Error | null>(null)
const loading = ref(false)
const messageValue = ref<string>('')
const resultValue = ref<string>('')
const waitAnswer = ref(false)

function initAi() {
  if (!route.query.extension) {
    throw new Error(`extension name not found`)
  }

  const extensionConfig = extension.findExtension(route.query.extension as string)

  if (!extensionConfig) {
    throw new Error(`extension not found`)
  }

  const config = extensionConfig.aiCollection?.find(ai => ai.name === route.params.name)

  if (!config) {
    throw new Error(`ai not found`)
  }

  ai.createAI(new AI(config))

  return ai.getAI(route.params.name)
}

const aiAction = computedAsync(async () => {
  if (ai.hasAI(route.params.name)) {
    loading.value = false
    return ai.getAI(route.params.name)
  }
  else {
    loading.value = true
    await extension.init()
    try {
      return initAi()
    }
    catch (err: any) {
      error.value = err
    }
    finally {
      loading.value = false
    }
  }
})

async function send() {
  const message = messageValue.value.trim()

  if (!message || !aiAction.value) {
    return
  }

  waitAnswer.value = true
  const response = await aiAction.value.sendTextMessage(message)
    .finally(() => {
      waitAnswer.value = false
    })

  console.log(response)

  if (response) {
    resultValue.value = response
    messageValue.value = ''
  }
}

const onSend = debounce(send, 500)
</script>

<template>
  <div class="size-full overflow-auto">
    <div v-if="error && !loading" class="p-2 text-red-600">
      <pre><code>{{ error.message }}</code></pre>
    </div>
    <div v-else-if="!aiAction && !loading">
      Ai 初始化失败 试试重启大法
    </div>
    <div v-else-if="loading && !aiAction">
      loading...
    </div>
    <div v-else class="w-full flex flex-col h-full">
      <div class="flex-1 px-2">
        <div v-if="waitAnswer" class="p-2 text-center">
          正在思考中...
        </div>
        <pre v-else class="text-sm">{{ resultValue }}</pre>
      </div>
      <div class="p-2 border-t">
        <Textarea v-model="messageValue" :disabled="!aiAction || waitAnswer" placeholder="有什么可以帮您..." />
        <div class="w-full flex justify-end mt-2 gap-3">
          <Button :loading="waitAnswer" :disabled="!aiAction || waitAnswer" @click="onSend">
            发送
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
