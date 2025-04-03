<script setup lang='ts'>
import { Toaster } from '@/components/ui/sonner'
import WindowMenus from '@/components/window-menus.vue'
import { computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useAppRx } from './base/rxjs/hook'
import { useConfig } from './composables/config'

const config = useConfig()
const rx = useAppRx()

config.init()

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})

onMounted(() => rx.toasterReady())

rx.onToasterReady((config) => {
  if (!config.content.trim()) {
    return
  }

  // TODO: add a type for config
  toast(config.content)
})
</script>

<template>
  <div class="w-screen h-screen">
    <section class="w-full h-screen relative">
      <WindowMenus />
      <main class="w-full overflow-auto" :style="{ height: 'calc(100vh - var(--app-header-height))' }">
        <router-view />
      </main>
    </section>
    <Toaster :theme="toasterTheme" />
  </div>
</template>
