<script setup lang='ts'>
import { useAI } from '@/composables/ai';
import { useExtension } from '@/composables/extension';
import { AI } from '@/lib/ai';
import { computedAsync } from '@vueuse/core';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Textarea from '@/components/textarea/Textarea.vue';

const route = useRoute<'/chat/[name]'>()
const extension = useExtension()
const ai = useAI()
const error = ref<Error | null>(null)
const loading = ref(false)

function initAi() {
   if (!route.query.extension) {
      throw new Error(`extension name not found`)
   }

   const extensionConfig = extension.findExtension(route.query.extension as string)

   if (!extensionConfig) {
      throw new Error(`extension not found`)
   }

   const config = extensionConfig.aiCollection?.find(ai => ai.name === route.params.name)

   if (!config) {
      throw new Error(`ai not found`)
   }

   ai.createAI(new AI(config))

   return ai.getAI(route.params.name)
}

const aiAction = computedAsync(async () => {
   loading.value = true
   if (ai.hasAI(route.params.name)) {
      return ai.getAI(route.params.name)
   } else {
      await extension.init()
      try {
         return initAi()
      } catch (err: any) {
         error.value = err
      } finally {
         loading.value = false
      }
   }
})
</script>

<template>
   <div class="size-full overflow-auto">
      <div v-if="error && !loading" class="p-2 text-red-600"><pre><code>{{ error.message }}</code></pre></div>
      <div v-else-if="!aiAction && !loading">Ai 初始化失败 试试重启大法</div>
      <div v-else-if="loading">loading...</div>
      <div v-else class="w-full">
         <div>message list</div>
         <div>
            <Textarea />
         </div>
      </div>
   </div>
</template>