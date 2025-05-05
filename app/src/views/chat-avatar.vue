<script setup lang='ts'>
const props = defineProps<{
  src: string
  alt?: string
}>()

const isSvgHtml = computed(() => {
  return props.src.startsWith('<svg')
})

const isUri = computed(() => {
  return ['file:', 'http:', 'https:'].some(item => props.src.startsWith(item))
})
</script>

<template>
  <div>
    <img v-if="isUri && !isSvgHtml" :src="src" :alt="alt" class="w-8 h-8 rounded-full">
    <div v-else class="w-8 h-8 rounded-full" v-html="src" />
  </div>
</template>
