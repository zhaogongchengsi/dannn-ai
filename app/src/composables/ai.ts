import { AI_PROVIDE_KEY, AIPluginProvide } from "@/plugin/ai"
import { inject } from "vue"


export function useAI() {
  const ai = inject<AIPluginProvide>(AI_PROVIDE_KEY)
  if (!ai) {
	throw new Error('AI plugin not found')
  }
  return ai
}
