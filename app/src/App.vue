<script setup lang='ts'>
import { useConfig } from './composables/config'
import { useExtension } from './composables/extension'

useConfig().init()
useExtension().init()
</script>

<template>
  <div class="w-screen h-screen">
    app
  </div>
</template>
