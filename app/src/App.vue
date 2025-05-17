<script setup lang='ts'>
useConfig()
useChatStore()
useMessagesStore()
</script>

<template>
  <div class="w-screen h-screen">
    <router-view />
  </div>
</template>
