<script setup lang='ts'>
import type { InfoChat } from '@/node/database/service/room'
import defaultAvatar from '@/assets/default-avatar.png'
import AvatarGroup from '@/components/avatar/avatar-group.vue'

const props = defineProps<{
  chat?: InfoChat
}>()

const src = computed(() => {
  if (!props.chat || !props.chat.participant || props.chat.participant.length === 0) {
    return [defaultAvatar]
  }
  return props.chat.participant.map(a => a.avatar!).filter(Boolean)
})
</script>

<template>
  <AvatarGroup :src="src" avatar-class="max-w-12" />
</template>
