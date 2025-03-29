import type { PluginMetadata } from '@/lib/plugin'
import type { Extension } from '@/lib/schemas/extension'
import { dannnPlugin } from '@/lib/plugin'
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

  dannnPlugin.on('registered', (plugin) => {
	plugins.value = [...plugins.value, plugin]
  })

  dannnPlugin.on('unregistered', (pluginId) => {
	plugins.value = plugins.value.filter(plugin => plugin.id !== pluginId)
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
