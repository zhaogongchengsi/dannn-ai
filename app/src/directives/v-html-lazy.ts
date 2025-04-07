// directives/v-html-lazy.ts

import type { Directive } from 'vue'
import { useHtmlRenderPool } from '@/composables/useHtmlRenderPool'

const pool = useHtmlRenderPool()

export const vHtmlLazy: Directive<HTMLElement, {
  id: string
  html: string
  width?: number
  className?: string
  rootMargin?: string
}> = {
  mounted(el, binding) {
    const { id, html, width = 500, className = '', rootMargin = '200px' } = binding.value
    pool.render(id, html, width, className)

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        pool.move(id, el)
        observer.disconnect()
      }
    }, {
      rootMargin,
    })

    observer.observe(el)
  },
  unmounted(el, binding) {
    const id = binding.value.id
    pool.destroy(id)
  },
}
