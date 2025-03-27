<script setup lang='ts'>
import { Expand, Minimize, Minus, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const isMaximized = ref(false)
const isMinimized = ref(false)

onMounted(async () => {
  const _isMaximized = await window.dannn.window.isMaximized()
  isMaximized.value = _isMaximized
  isMinimized.value = !_isMaximized

  console.log(`name = ${window.dannn.window.name}`)

  window.dannn.ipc.on(`${window.dannn.window.name}.maximized`, () => {
    isMaximized.value = true
    isMinimized.value = false
  })
  window.dannn.ipc.on(`${window.dannn.window.name}.unmaximized`, () => {
    isMaximized.value = false
    isMinimized.value = true
  })
})

function onMinimize() {
  window.dannn.window.minimize()
}

function onMaximize() {
  window.dannn.window.maximize()
}

function onUnmaximize() {
  window.dannn.window.unmaximize()
}
</script>

<template>
  <div class="h-full flex items-center space-x-1 ml-auto">
    <button class="flex items-center justify-center size-[--app-header-height] hover:bg-zinc-200" @click="onMinimize">
      <Minus :size="24" />
    </button>
    <button v-if="isMaximized" class="flex items-center justify-center size-[--app-header-height] hover:bg-zinc-100" @click="onUnmaximize">
      <Minimize :size="18" />
    </button>
    <button v-if="isMinimized" class="flex items-center justify-center size-[--app-header-height] hover:bg-zinc-100" @click="onMaximize">
      <Expand :size="18" />
    </button>
    <button class="flex items-center justify-center size-[--app-header-height] hover:bg-red-500">
      <X :size="24" />
    </button>
  </div>
</template>
