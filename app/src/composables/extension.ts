import { DnApp } from "@/base/app/app";
import { DnExtension } from "@/base/extension";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useExtension = defineStore('dannn-extension', () => {
  const extensions = ref<DnExtension[]>([])

  const app = DnApp.getInstance()

  extensions.value =  app.getExtensions()

  DnApp.getInstance().on('app:load-extension', (extension) => {
    const existingExtension = extensions.value.find((ext) => ext.id === extension.id)
    if (!existingExtension) {
      extensions.value.push(extension)
      return
    } else {
      extensions.value = extensions.value.map((ext) => {
        if (ext.id === extension.id) {
          return extension
        }
        return ext
      })
    }
  })

  return {
    extensions,
  }
})