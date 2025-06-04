<script setup lang='ts'>
import defaultAvatar from '@/assets/default-avatar.png'
import Avatar from '@/components/avatar/avatar.vue'
import ChatPageTitle from './chat-page-title.vue'

const chatStore = useChatStore()
</script>

<template>
  <div style="height: var(--app-chat-header-height);" class="w-full bg-[hsl(var(--background))] flex items-center border-b">
    <ChatPageTitle />
    <div v-if="chatStore.currentChat" class="w-max-200 overflow-x-auto">
      <ul class="flex items-center gap-2 overflow-x-auto px-4">
        <li v-for="ai of chatStore.currentChat.thinkingAI" :key="ai.id">
          <Avatar class="size-6" :src="ai.avatar || defaultAvatar" />
        </li>
      </ul>
    </div>
  </div>
</template>
