<script setup lang='ts'>
import { Check, ChevronLeft } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Switch from '@/components/ui/switch/Switch.vue'
import { getAllMetafiles, setEnvValue } from '@/lib/extension'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'

const config = useConfig()

const envFrom = ref<{
  title: string
  name: string
  env: Record<string, string>
}[]>([])


const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})

onMounted(async () => {
  const data = await getAllMetafiles()
  envFrom.value = data.map((item) => {
    return {
      name: item.packageJson.name!,
      title: `${item.packageJson.name!}`,
      env: item.packageJson.permissions?.env ?? {},
    }
  })
})

function onSaveEnv(item: { name: string, key: string, value: string }) {
  console.log('Saving environment variable:', item)
  setEnvValue(item.name, item.key, item.value)
    .then(() => {
      console.log('Environment variable saved successfully')
      toast.success(`环境变量 ${item.key} 保存成功`, {
        description: `值: ${item.value}`,
      })
    })
    .catch((error) => {
      toast.error(`环境变量 ${item.key} 保存失败`, {
        description: `错误: ${error.message}`,
      })
      console.error('Error saving environment variable:', error)
    })
}
</script>

<template>
  <div class="main-container-height">
    <ScrollArea class="main-container-height">
      <div class="w-full container mx-auto py-4">
        <Button variant="outline" size="icon" @click="$router.back()">
          <ChevronLeft class="w-4 h-4" />
        </Button>
      </div>
      <div class="w-full container mx-auto py-8 max-w-3xl">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          设置
        </h3>
        <Separator />
        <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-4">
          通用设置
        </h4>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h5 class="text-gray-900 dark:text-gray-100 text-base">
              开机自启动
            </h5>
            <Label class="text-sm text-gray-500 dark:text-gray-400">
              启动时自动运行应用程序
            </Label>
          </div>
          <Switch id="airplane-mode" />
        </div>
        <Separator />
        <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-4">
          环境变量
        </h4>

        <ul>
          <li v-for="(item, index) in envFrom" :key="index" class="mb-4">
            <h5 class="text-gray-900 dark:text-gray-100 text-base">
              插件名称 - {{ item.title }}
            </h5>
            <div v-for="[key] in Object.entries(item.env)" :key="key" class="flex items-center justify-between my-3">
              <Label class="text-sm text-gray-500 dark:text-gray-400">
                {{ `${item.name}.${key}` }}
              </Label>
              <div class="flex items-center gap-2">
                <Input v-model:model-value="item.env[key]" class="w-lg" />
                <Button variant="outline" size="icon" @click="onSaveEnv({ name: item.name, key, value: item.env[key] })">
                  <Check :size="4" />
                </Button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </ScrollArea>
    <Toaster :theme="toasterTheme" />
  </div>
</template>
