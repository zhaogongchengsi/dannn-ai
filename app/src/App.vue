<script setup lang='ts'>
import { PATTERN_BACKGROUND_DIRECTION, PATTERN_BACKGROUND_SPEED, PATTERN_BACKGROUND_VARIANT } from '@/components/ui/pattern-background'
import PatternBackground from '@/components/ui/pattern-background/PatternBackground.vue'
import { Toaster } from '@/components/ui/sonner'
import WindowMenus from '@/components/window-menus.vue'
import { computed } from 'vue'
import { useConfig } from './composables/config'

const config = useConfig()

config.init()

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <PatternBackground
    :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
    :variant="PATTERN_BACKGROUND_VARIANT.Dot" class="w-screen h-screen"
    :speed="PATTERN_BACKGROUND_SPEED.Slow"
  >
    <div class="w-screen h-screen">
      <section class="w-full h-screen relative">
        <WindowMenus />
        <main class="w-full overflow-auto" :style="{ height: 'calc(100vh - var(--app-header-height))' }">
          <router-view />
        </main>
      </section>
      <Toaster :theme="toasterTheme" />
    </div>
  </PatternBackground>
</template>
