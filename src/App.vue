<script setup lang='ts'>
useConfig()
useAIStore()
useMessagesStore()
useChatStore()
</script>

<template>
  <div class="w-screen h-screen">
    <router-view />
  </div>
</template>
