<script setup lang='ts'>
import type { ToastConfig } from './common/schema'
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'
import { toastConfig } from './common/schema'
import { rendererBridge } from './lib/rpc'

const config = useConfig()
useAIStore()
useMessagesStore()
useChatStore()

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})

rendererBridge.register('notification', (message: ToastConfig) => {
  return new Promise((resolve, reject) => {
    const { success, data, error } = toastConfig.safeParse(message)
    if (!success) {
      reject(error)
      return
    }

    try {
      toast[data.type](data.title, {
        description: data.message,
        duration: data.duration,
        ...(message.action
          ? {
              action: {
                label: message.action.label,
                ...(
                  message.action?.onClick
                    ? {
                        onClick: () => {
                          resolve(true)
                        },
                      }
                    : {}
                ),
              },
            }
          : {}),
      })

      if (!message.action || !message.action.onClick) {
        resolve(true)
      }
    }
    catch (err) {
      reject(err)
    }
  })
})

onMounted(() => {
  window.dannn.ipc.send('notification.ready')
})
</script>

<template>
  <div class="w-screen h-screen">
    <router-view />
    <Toaster :theme="toasterTheme" class="pointer-events-auto" />
  </div>
</template>
