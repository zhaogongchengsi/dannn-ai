<script setup lang='ts'>
import Setting from '@/components/setting.vue'
import WindowCloseButton from '@/components/window/close-button.vue'
import WindowMinusButton from '@/components/window/minus-button.vue'
import WindowZoomButton from '@/components/window/zoom-button.vue'
import { isMacOS } from '@/composables/platform'
import ChatPageTitle from './chat-page-title.vue'
</script>

<template>
  <div style="height: var(--app-chat-header-height);" class="w-full bg-[hsl(var(--background))] flex items-center border-b">
    <ChatPageTitle />
    <div class="ml-auto flex items-center h-full px-4 gap-4">
      <Setting />
      <WindowMinusButton v-if="!isMacOS" />
      <WindowZoomButton v-if="!isMacOS" />
      <WindowCloseButton v-if="!isMacOS" />
    </div>
  </div>
</template>
