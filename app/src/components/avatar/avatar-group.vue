<script setup lang='ts'>
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import Avatar from './avatar.vue'

const props = defineProps<{
  src: string[]
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn(props.class)" class="flex gap-2 size-12 p-1 rounded-full bg-muted">
    <Avatar v-for="item of props.src" :key="item" class="size-full" :src="item" />
  </div>
</template>
