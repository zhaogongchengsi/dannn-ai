<script setup lang='ts'>
import { useAI } from '@/composables/ai';
import { useExtension } from '@/composables/extension';
import { AI } from '@/lib/ai';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute<'/chat/[name]'>()

const extension = useExtension()
const ai = useAI()
const error = ref<Error | null>(null)

const aiAction = computed(() => {
   if (ai.hasAI(route.params.name)) {
      return ai.getAI(route.params.name)
   } else {
      if (!route.query.extension) {
         error.value = new Error(`extension not found`)
         return
      }

      const extensionConfig = extension.findExtension(route.query.extension as string)

      if (!extensionConfig) {
         error.value = new Error(`extension not found`)
         return
      }

      const config = extensionConfig.aiCollection?.find(ai => ai.name === route.params.name)

      if (!config) {
         error.value = new Error(`ai not found`)
         return
      }

      try {

         ai.createAI(new AI(config))
         
         return ai.getAI(route.params.name)
      } catch (err: any) {
         error.value = err
      }
   }
})
</script>

<template>
   <div class="size-full overflow-auto">
      <div v-if="error" class="p-2 text-red-600"><pre><code>{{ error.message }}</code></pre></div>
      {{ aiAction?.name }}
   </div>
</template>