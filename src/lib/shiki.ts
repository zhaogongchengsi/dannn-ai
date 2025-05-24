import type { HighlighterCore, HighlighterGeneric } from 'shiki/core'
import { fromHighlighter } from '@shikijs/markdown-it/core'
import MarkdownIt from 'markdown-it'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export const highlighterPromise = createHighlighterCore({
  themes: [
    import('@shikijs/themes/vitesse-dark'),
    import('@shikijs/themes/vitesse-light'),
  ],
  langs: [
    import('@shikijs/langs/typescript'),
    import('@shikijs/langs/javascript'),
    import('@shikijs/langs/vue'),
    import('@shikijs/langs/json'),
    import('@shikijs/langs/html'),
    import('@shikijs/langs/markdown'),
    import('@shikijs/langs/sh'),
    import('@shikijs/langs/python'),
    import('@shikijs/langs/java'),
    import('@shikijs/langs/go'),
    import('@shikijs/langs/rust'),
    import('@shikijs/langs/cpp'),
    import('@shikijs/langs/csharp'),
    import('@shikijs/langs/ruby'),
    import('@shikijs/langs/php'),
    import('@shikijs/langs/sql'),
    import('@shikijs/langs/css'),
    import('@shikijs/langs/shell'),
  ],
  engine: createJavaScriptRegexEngine(),
})

const md = MarkdownIt()

export async function highlighterMarkdown(code: string, theme: 'vitesse-dark' | 'vitesse-light' = 'vitesse-dark') {
  const highlighter = await highlighterPromise
  return highlighter.codeToHtml(code, {
    lang: 'markdown',
    theme,
  })
}

let init = false
let highlighter: HighlighterCore | null = null
export async function initMarkdownIt() {
  if (init) {
    return
  }
  highlighter = await highlighterPromise
  init = true
}

export function markdownToHtml(markdown: string, theme: 'vitesse-dark' | 'vitesse-light' = 'vitesse-dark') {
  if (!init) {
    throw new Error('MarkdownIt not initialized, please call initMarkdownIt first')
  }
  const m = md.use(fromHighlighter(highlighter as HighlighterGeneric<any, any>, {
    theme,
  }))
  return m.render(markdown)
}
