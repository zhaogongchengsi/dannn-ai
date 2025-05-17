<script setup lang='ts'>
import { Minus } from 'lucide-vue-next'
import Button from '../ui/button/Button.vue'

function onMinimize() {
  window.dannn.window.minimize()
}
</script>

<template>
  <Button variant="ghost" size="icon" class="size-7 flex justify-center items-center" @click="onMinimize">
    <Minus :size="24" />
  </Button>
</template>
