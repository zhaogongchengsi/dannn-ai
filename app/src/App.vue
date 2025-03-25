<script setup lang='ts'>
import ModeToggle from './components/mode-toggle.vue'
import { useConfig } from './composables/config'
import { useExtension } from './composables/extension'

useConfig().init()
useExtension().init()
</script>

<template>
  <div class="w-screen h-screen">
    <ModeToggle />
  </div>
</template>
