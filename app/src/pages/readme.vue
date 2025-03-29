<script setup lang='ts'>
import type { DnExtension } from '@/base/extension'
import Button from '@/components/ui/button/Button.vue'
import { Toggle } from '@/components/ui/toggle'
import { useConfig } from '@/composables/config'
import { useExtension } from '@/composables/extension'
import { markdownToHtml } from '@/lib/shiki'
import { computedAsync } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const config = useConfig()

const id = route.query.id as string
const extension = useExtension()
const currenPlugin = ref<DnExtension>()

const metadata = computed(() => {
  const id = route.query.id as string
  const extensions = extension.extensions
  if (!id) {
    return
  }

  const plugin = extensions.find(item => item.id === id)
  if (!plugin) {
    return
  }

  return {
    ...plugin.config,
    readme: plugin.readme,
    permission: plugin.config.permission,
  }
})

const theme = computed(() => config.mode.value === 'dark' ? 'vitesse-dark' : 'vitesse-light')

const readme = computedAsync(async () => {
  if (!metadata.value || !metadata.value.readme) {
    return ''
  }
  const html = await markdownToHtml(metadata.value.readme, theme.value)
    .catch((err) => {
      console.error(err)
      return `Failed to load readme for ${id} ${err.message}`
    })

  return html
}, '')
</script>

<template>
  <div>
    <article v-if="metadata">
      <header class="p-4 flex items-center gap-3 sticky top-0 bg-[hsl(var(--background))] z-10">
        <div>
          <img v-if="metadata.icon" :src="metadata.icon" alt="logo" class="size-[100px]">
          <img v-else src="/logo.png" alt="logo" class="size-[100px]">
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold">
            {{ metadata.name }}
          </h1>
          <p class="text-sm text-zinc-500 space-x-2">
            <span v-if="metadata.author">{{ metadata.author }}</span>
            <span v-if="metadata.version">{{ metadata.version }}</span>
            <span v-if="metadata.license">{{ metadata.license }}</span>
          </p>
          <p v-if="metadata.description" class="text-sm">
            {{ metadata.description }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Toggle>禁用</Toggle>
          <Button>
            卸载
          </Button>
        </div>
      </header>
      <div class="flex">
        <div class="p-4">
          <div class="prose dark:prose-invert w-full" v-html="readme" />
        </div>
        <div class="flex-1 border-l">
          <div v-if="metadata.permission" class="p-4">
            <h2 class="text-lg font-bold">
              环境变量权限
            </h2>
            <p class="text-sm text-zinc-500">
              插件需要以下权限才能正常工作
            </p>
            <ul v-if="metadata.permission.env" class="list-disc pl-4">
              <li v-for="(env, index) in metadata.permission.env" :key="index">
                {{ env }}
              </li>
            </ul>
            <p class="text-sm text-zinc-500">
              如果您不想授予这些权限，请卸载插件
            </p>
          </div>
        </div>
      </div>
    </article>
    <div v-else>
      <div class="flex items-center justify-center h-screen">
        <div class="text-2xl text-zinc-500">
          <p>没有找到该插件 ({{ id }})</p>
          <p>请检查插件是否已安装</p>
          <RouterLink to="/" class="text-blue-500 hover:underline">
            返回首页
          </RouterLink>
          <p>或者在插件市场中搜索</p>
        </div>
      </div>
    </div>
  </div>
</template>
