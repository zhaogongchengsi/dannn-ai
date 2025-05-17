<script setup lang='ts'>
import { createEmptyHistoryState, registerHistory } from '@lexical/history'
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import { $getRoot, createEditor } from 'lexical'

const value = defineModel<string>('text')

const id = useId()
const editorWrapper = useTemplateRef('editorWrapper')
const config = {
  namespace: 'dannn-editor',
  nodes: [HeadingNode, QuoteNode],
  theme: {},
  onError: console.error,
}

const editor = createEditor(config)

mergeRegister(
  registerRichText(editor),
  registerHistory(editor, createEmptyHistoryState(), 300),
)

watchEffect(() => {
  if (editorWrapper.value) {
    editor.setRootElement(editorWrapper.value)
  }
})

const removeListener = editor.registerTextContentListener((textContent) => {
  value.value = textContent
})

watch(value, (newVal) => {
  if (editor && typeof newVal === 'string') {
    if (newVal === '') {
      // 清空编辑器内容
      editor.update(() => {
        const root = $getRoot()
        root.clear()
      })
    }
  }
})

onBeforeUnmount(removeListener)
</script>

<template>
  <div :id="id" ref="editorWrapper" contenteditable class="w-full h-full focus:outline-none" />
</template>
