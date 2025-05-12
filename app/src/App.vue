<script setup lang='ts'>
import { PATTERN_BACKGROUND_DIRECTION, PATTERN_BACKGROUND_SPEED, PATTERN_BACKGROUND_VARIANT } from '@/components/ui/pattern-background'
import PatternBackground from '@/components/ui/pattern-background/PatternBackground.vue'

useConfig()
useChatStore()
useMessagesStore()
</script>

<template>
  <PatternBackground
    :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
    :variant="PATTERN_BACKGROUND_VARIANT.Dot" class="w-screen h-screen"
    :speed="PATTERN_BACKGROUND_SPEED.Slow"
  >
    <div class="w-screen h-screen">
      <router-view />
    </div>
  </PatternBackground>
</template>
