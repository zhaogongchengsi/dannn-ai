<script setup lang='ts'>
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  src: string
  alt?: string
  class?: HTMLAttributes['class']
}>()

const isSvgHtml = computed(() => {
  return props.src.startsWith('<svg')
})
</script>

<template>
  <div :class="props.class">
    <div v-if="isSvgHtml" class="w-full h-full rounded-full flex justify-center items-center" v-html="src" />
    <img v-else :src="src" :alt="alt" class="w-full h-full rounded-full object-cover">
  </div>
</template>
