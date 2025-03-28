<script setup lang='ts'>
import { useConfig } from '@/composables/config'
import { useExtension } from '@/composables/extension'
import { markdownToHtml } from '@/lib/shiki'
import { computedAsync } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const extension = useExtension()
const config = useConfig()

const name = route.query.name as string

const extensionMeta = computed(() => extension.findExtension(name))

const readme = computedAsync(async () => {
  if (!extensionMeta.value || !extensionMeta.value.readme) {
    return ''
  }

  const html = await markdownToHtml(extensionMeta.value.readme, config.mode.value === 'dark' ? 'vitesse-dark' : 'vitesse-light')
    .catch((err) => {
      console.error(err)
      return `Failed to load readme for ${name} ${err.message}`
    })

  return html
}, '')
</script>

<template>
  <div>
    <article v-if="extensionMeta">
      <header class="p-4 flex items-center">
        <div class="mr-4">
          <img v-if="extensionMeta.icon" :src="extensionMeta.icon" alt="logo" class="w-16 h-16">
          <img v-else src="/logo.png" alt="logo" class="w-16 h-16">
        </div>
        <div>
          <h1 class="text-xl font-bold">
            {{ extensionMeta.name }}
          </h1>
          <p class="text-sm text-zinc-500 space-x-2">
            <span v-if="extensionMeta.author">{{ extensionMeta.author }}</span>
            <span v-if="extensionMeta.version">{{ extensionMeta.version }}</span>
            <span v-if="extensionMeta.license">{{ extensionMeta.license }}</span>
          </p>
          <p v-if="extensionMeta.description" class="text-sm">
            {{ extensionMeta.description }}
          </p>
        </div>
      </header>
      <div class="p-4">
        <div class="prose" v-html="readme" />
      </div>
    </article>
    <div v-else>
      <p>Extension not found</p>
    </div>
  </div>
</template>
