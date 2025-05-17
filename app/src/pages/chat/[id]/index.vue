<script setup lang='ts'>
import { PATTERN_BACKGROUND_DIRECTION, PATTERN_BACKGROUND_SPEED, PATTERN_BACKGROUND_VARIANT } from '@/components/ui/pattern-background'
import PatternBackground from '@/components/ui/pattern-background/PatternBackground.vue'
import ChatFooterBody from '@/views/chat-footer-body.vue'
import ChatFooterHeader from '@/views/chat-footer-header.vue'
import ChatPageContent from '@/views/chat-page-content.vue'
</script>

<template>
  <div class="flex flex-col w-full" style="height: calc(100vh - var(--app-chat-header-height))">
    <div
      style="height: calc(100vh - var(--app-chat-header-height) - var(--app-chat-footer-height) - 2px)"
      class="overflow-y-auto"
    >
      <PatternBackground
        :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
        :variant="PATTERN_BACKGROUND_VARIANT.Dot" class="size-full"
        :speed="PATTERN_BACKGROUND_SPEED.Slow"
      >
        <ChatPageContent />
      </PatternBackground>
    </div>
    <div class="bg-[hsl(var(--background))]" style="height: var(--app-chat-footer-height);">
      <ChatFooterHeader />
      <ChatFooterBody />
    </div>
  </div>
</template>
