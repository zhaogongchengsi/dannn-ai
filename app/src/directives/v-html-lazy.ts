// directives/v-html-lazy.ts

import type { Directive } from 'vue'

interface RenderCacheItem {
  id: string
  element: HTMLElement
  height: number
  placeholder: HTMLDivElement
  observer: IntersectionObserver
}

const renderPool = new Map<string, RenderCacheItem>()

export const vHtmlLazy: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const id = binding.arg!
    const html = binding.value
    const width = el.clientWidth || 500

    const { height, container, placeholder } = render(id, html, width, 'v-html-lazy')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('元素进入视口', entry.target)
            const item = renderPool.get(id)
            if (item) {
              el.replaceChildren(...container.children)
            }
          }
          else {
            console.log('元素离开视口')
            container.replaceChildren(...el.children)
            el.replaceChildren(placeholder)
          }
        })
      },
      {
        root: null, // 默认为视口
        threshold: 0.1, // 10% 可见时就算进入视口
        rootMargin: '100px',
      },
    )

    observer.observe(el)

    renderPool.set(id, {
      id,
      element: container,
      height,
      observer,
      placeholder,
    })
  },
  unmounted(el, binding) {
    console.log('unmounted', binding.arg)
    const id = binding.arg!
    const item = renderPool.get(id)
    if (item) {
      item.observer.disconnect()
      document.body.removeChild(item.element)
      renderPool.delete(id)
    }
  },
}

function render(id: string, html: string, width = 500, className = '') {
  const container = document.createElement('div')
  container.id = `__offscreen-${id}`
  container.className = className
  container.innerHTML = html
  container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: ${width}px;
      visibility: hidden;
      pointer-events: none;
      z-index: -1;
    `

  document.body.appendChild(container)

  const height = container.offsetHeight

  document.body.removeChild(container)

  const placeholder = document.createElement('div')

  placeholder.style.height = `${height}px`

  return {
    container,
    height,
    placeholder,
  }
}
