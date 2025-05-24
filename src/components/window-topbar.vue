<script setup lang='ts'>
import { Expand, Minimize, Minus, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import Setting from './setting.vue'

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

function onQuit() {
  window.dannn.window.quit()
}

const isMac = window.dannn.is.mac
</script>

<template>
  <div class="w-full flex items-center h-[--app-header-height] dragging justify-end">
    <div class="ml-auto pr-1 flex items-center h-full gap-3">
      <Setting />
      <template v-if="!isMac">
        <Button variant="ghost" size="icon" class="size-7" @click="onMinimize">
          <Minus :size="24" />
        </Button>
        <Button v-if="isMaximized" variant="ghost" size="icon" class="size-7" @click="onUnmaximize">
          <Minimize :size="16" />
        </Button>
        <Button v-if="isMinimized" variant="ghost" size="icon" class="size-7" @click="onMaximize">
          <Expand :size="16" />
        </Button>
        <Button variant="ghost" size="icon" class="size-7" @click="onQuit">
          <X :size="26" />
        </Button>
      </template>
    </div>
  </div>
</template>
