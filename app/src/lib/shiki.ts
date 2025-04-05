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
export async function initMarkdownIt(theme: 'vitesse-dark' | 'vitesse-light' = 'vitesse-dark') {
  const highlighter = await highlighterPromise
  const m = md.use(fromHighlighter(highlighter as HighlighterGeneric<any, any>, {
    theme,
  }))
  init = true
  return m
}

export function markdownToHtml(markdown: string) {
  if (!init) {
    throw new Error('MarkdownIt not initialized, please call initMarkdownIt first')
  }
  return md.render(markdown)
}
