import type { PluginMetadata } from '@/lib/rxjs/plugin'
import type { Extension } from '@/lib/schemas/extension'
import { dannnPlugin } from '@/lib/rxjs/plugin'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExtension = defineStore('dannn-extension', () => {
  // 状态
  const plugins = ref<PluginMetadata[]>([])

  // 方法
  const registerPlugin = async (config: Extension, uri: string) => {
    const id = await dannnPlugin.register(config, uri)
    const newPlugin = dannnPlugin.getPlugin(id)!
    plugins.value = [...plugins.value, newPlugin.metadata]
    return id
  }

  plugins.value = dannnPlugin.getPlugins().map(plugin => plugin.metadata)

  // 监听全局事件
  dannnPlugin.getPluginEvents()?.subscribe((event) => {
    event
    if (event.type === 'registered') {
      plugins.value = [...plugins.value, event.plugin]
    }
  })

  function findExtension(id: string) {
    return plugins.value.find(plugin => plugin.id === id)
  }

  return {
    plugins,
    registerPlugin,
    findExtension,
  }
})
