<script setup lang='ts'>
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import Avatar from './avatar.vue'

const props = defineProps<{
  src: string[]
  class?: HTMLAttributes['class']
  avatarClass?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn(props.class)" class="flex gap-2 size-12 rounded-full bg-muted group-data-[state=collapsed]:size-full">
    <Avatar v-for="item of props.src" :key="item" class="size-full" :class="avatarClass" :src="item" />
  </div>
</template>
