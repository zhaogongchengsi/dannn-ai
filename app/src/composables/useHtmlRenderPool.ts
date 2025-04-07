// composables/useHtmlRenderPool.ts

interface RenderCacheItem {
  id: string
  element: HTMLElement
  height: number
}

const renderPool = new Map<string, RenderCacheItem>()

// 封装 moveElementBefore 方法
function moveElementBefore(node: Node, referenceNode: Node) {
  if (typeof (node as any).moveBefore === 'function') {
    (node as any).moveBefore(referenceNode) // 使用 moveBefore
  }
  else {
    referenceNode.parentNode?.insertBefore(node, referenceNode) // 否则使用 insertBefore
  }
}

export function useHtmlRenderPool() {
  function render(id: string, html: string, width = 500, className = ''): RenderCacheItem {
    if (renderPool.has(id))
      return renderPool.get(id)!

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
    const item: RenderCacheItem = { id, element: container, height }
    renderPool.set(id, item)

    return item
  }

  function move(id: string, target: HTMLElement): boolean {
    const item = renderPool.get(id)
    if (!item)
      return false
    moveElementBefore(item.element, target)
    return true
  }

  function get(id: string): RenderCacheItem | undefined {
    return renderPool.get(id)
  }

  function destroy(id: string) {
    const item = renderPool.get(id)
    if (item) {
      item.element.remove()
      renderPool.delete(id)
    }
  }

  function clear() {
    renderPool.forEach(item => item.element.remove())
    renderPool.clear()
  }

  return { render, move, get, destroy, clear }
}
