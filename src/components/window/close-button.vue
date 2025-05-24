<script setup lang='ts'>
import { X } from 'lucide-vue-next'
import Button from '../ui/button/Button.vue'

function onQuit() {
  window.dannn.window.quit()
}
</script>

<template>
  <Button variant="ghost" size="icon" class="size-7 flex justify-center items-center hover:text-red-600 no-dragging-button" @click="onQuit">
    <X :size="24" />
  </Button>
</template>
