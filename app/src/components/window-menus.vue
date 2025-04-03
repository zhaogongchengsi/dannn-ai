<script setup lang='ts'>
import { Button } from '@/components/ui/button'
import { Expand, Minimize, Minus, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import modeToggle from './mode-toggle.vue'

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

function onMinimize() {
  window.dannn.window.minimize()
}

function onMaximize() {
  window.dannn.window.maximize()
}

function onUnmaximize() {
  window.dannn.window.unmaximize()
}

const isMac = window.dannn.is.mac
// bg-[hsl(var(--background))]
</script>

<template>
  <div class="flex items-center h-[--app-header-height]">
    <div v-if="isMac" class="h-full" />
    <div class="ml-auto space-x-1">
      <mode-toggle />
      <template v-if="!isMac">
        <Button variant="ghost" size="icon" class="size-7" @click="onMinimize">
          <Minus :size="24" />
        </Button>
        <Button v-if="isMaximized" variant="ghost" size="icon" class="size-7" @click="onUnmaximize">
          <Minimize :size="16" />
        </Button>
        <Button v-if="isMinimized" variant="ghost" size="icon" class="size-7" @click="onMaximize">
          <Expand :size="18" />
        </Button>
        <Button variant="ghost" size="icon" class="size-7">
          <X :size="24" />
        </Button>
      </template>
    </div>
  </div>
</template>
