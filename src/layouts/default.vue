<script setup lang="ts">
import Setting from '@/components/setting.vue'
import WindowCloseButton from '@/components/window/close-button.vue'
import WindowMinusButton from '@/components/window/minus-button.vue'
import WindowZoomButton from '@/components/window/zoom-button.vue'
import { isMacOS } from '@/composables/platform'
</script>

<template>
  <main class="h-screen w-screen">
    <div
      :style="{ paddingLeft: !isMacOS ? '0' : 'var(--app-header-padding-left)' }"

      class="h-[--app-header-height] flex justify-between items-center border-b dragging"
    >
      <div class="ml-auto flex items-center h-full px-4 gap-4">
        <Setting />
        <WindowMinusButton v-if="!isMacOS" />
        <WindowZoomButton v-if="!isMacOS" />
        <WindowCloseButton v-if="!isMacOS" />
      </div>
    </div>
    <section class="h-[calc(100vh - var(--app-header-height))] overflow-auto">
      <RouterView />
    </section>
  </main>
</template>
