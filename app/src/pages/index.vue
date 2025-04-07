<script setup lang='ts'>
import { useChatStore } from '@/stores/chat'
import { onMounted } from 'vue'

const chatStore = useChatStore()

onMounted(() => {
  chatStore.setCurrentChatID(null)
})
</script>

<template>
  <div class="w-full h-full flex justify-center">
    <span class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-10">
      请选择聊天
    </span>
  </div>
</template>
