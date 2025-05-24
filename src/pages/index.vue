<script setup lang='ts'>
import ModeToggle from '@/components/mode-toggle.vue'
import WindowCloseButton from '@/components/window/close-button.vue'
import WindowMinusButton from '@/components/window/minus-button.vue'
import WindowZoomButton from '@/components/window/zoom-button.vue'
import { isMacOS } from '@/composables/platform'
import LoginForm from '@/views/logo-from.vue'
</script>

<template>
  <div class="w-screen h-screen bg-muted flex flex-col">
    <div class="flex justify-end items-center h-14 px-2 border-b gap-6 dragging">
      <ModeToggle />
      <WindowMinusButton v-if="!isMacOS" />
      <WindowZoomButton v-if="!isMacOS" />
      <WindowCloseButton v-if="!isMacOS" />
    </div>
    <div class="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
      <div class="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  </div>
</template>
