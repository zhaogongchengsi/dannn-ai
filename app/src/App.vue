<script setup lang='ts'>
import { PATTERN_BACKGROUND_DIRECTION, PATTERN_BACKGROUND_SPEED, PATTERN_BACKGROUND_VARIANT } from '@/components/ui/pattern-background'
import PatternBackground from '@/components/ui/pattern-background/PatternBackground.vue'
import WindowTopbar from '@/components/window-topbar.vue'

useConfig()
useChatStore()
useMessagesStore()
</script>

<template>
  <div class="w-screen h-screen">
    <WindowTopbar />
    <div style="height: calc(100vh - var(--app-header-height))" class="overflow-hidden">
      <router-view />
    </div>
  </div>
  <!-- <PatternBackground
    :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
    :variant="PATTERN_BACKGROUND_VARIANT.Dot" class="w-screen h-screen"
    :speed="PATTERN_BACKGROUND_SPEED.Slow"
  >

  </PatternBackground> -->
</template>
