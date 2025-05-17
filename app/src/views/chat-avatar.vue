<script setup lang='ts'>
import type { RoomData } from 'common/types'
import defaultAvatar from '@/assets/default-avatar.png'
import AvatarGroup from '@/components/avatar/avatar-group.vue'

const props = defineProps<{
  chat?: RoomData
}>()

const src = computed(() => {
  if (!props.chat || !props.chat.participant || props.chat.participant.length === 0) {
    return [defaultAvatar]
  }
  return props.chat.participant.map(a => a.avatar!).filter(Boolean)
})
</script>

<template>
  <div>
    <AvatarGroup :src="src" />
  </div>
</template>
