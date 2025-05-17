<script setup lang='ts'>
import { Expand, Minimize } from 'lucide-vue-next'
import Button from '../ui/button/Button.vue'

const isMaximized = ref(false)
const isMinimized = ref(false)

onMounted(async () => {
  const _isMaximized = await window.dannn.window.isMaximized()
  isMaximized.value = _isMaximized
  isMinimized.value = !_isMaximized

  window.dannn.ipc.on(`${window.dannn.window.name}.maximized`, () => {
    isMaximized.value = true
    isMinimized.value = false
  })
  window.dannn.ipc.on(`${window.dannn.window.name}.unmaximized`, () => {
    isMaximized.value = false
    isMinimized.value = true
  })
})

function onMaximize() {
  window.dannn.window.maximize()
}

function onUnmaximize() {
  window.dannn.window.unmaximize()
}
</script>

<template>
  <Button v-if="isMaximized" variant="ghost" size="icon" class="size-7 flex justify-center items-center" @click="onUnmaximize">
    <Minimize :size="16" />
  </Button>
  <Button v-if="isMinimized" variant="ghost" size="icon" class="size-7 flex justify-center items-center" @click="onMaximize">
    <Expand :size="18" />
  </Button>
</template>
