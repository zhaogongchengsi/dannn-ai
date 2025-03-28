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
      <header>
        <h1>{{ extensionMeta.name }}</h1>
        <span>{{ extensionMeta.version }}</span>
        <p>{{ extensionMeta.description }}</p>
      </header>
      <div class="p-2" v-html="readme" />
    </article>
    <div v-else>
      <p>Extension not found</p>
    </div>
  </div>
</template>
