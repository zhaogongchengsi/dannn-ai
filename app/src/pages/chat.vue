<script setup lang='ts'>
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toaster } from '@/components/ui/sonner'
import { useConfig } from '@/composables/config'
import ChatAdd from '@/views/chat-add.vue'
import ChatAvatar from '@/views/chat-avatar.vue'
import ChatHeader from '@/views/chat-header.vue'
import { computed } from 'vue'

const config = useConfig()

const chatStore = useChatStore()
const route = useRoute<'/chat/[id]/'>()

watchEffect(() => {
  const id = route.params.id
  if (!id) {
    chatStore.setCurrentChatID(0)
    return
  }

  chatStore.setCurrentChatID(Number(id))
})

useMessagesStore()

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <div class="flex h-screen">
    <div class="w-64 border-r">
      <div class="flex items-center gap-2 justify-end h-14 px-2 border-b">
        <ChatAdd />
      </div>
      <ul class="py-3">
        <li v-for="chat in chatStore.rooms" :key="chat.id" class="w-full">
          <RouterLink
            :to="`/chat/${chat.id}/`"
            class="flex p-1 items-center gap-2 size-full"
            active-class="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <ChatAvatar :chat="chat" />
            <span>{{ chat.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <section class="flex-1 h-screen relative">
      <ChatHeader />
      <ScrollArea class="w-full overflow-auto" :style="{ height: 'calc(100vh - var(--app-chat-header-height))' }">
        <router-view />
      </ScrollArea>
    </section>
  </div>
  <Toaster :theme="toasterTheme" />
</template>
