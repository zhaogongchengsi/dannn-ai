import type { Plugin } from 'vue'
import type { AppRx } from './type'
import { combineLatest } from 'rxjs'
import { appMount, appMount$, appReady$, onAppMount, onAppReady } from './app'
import { APP_PROVIDE_RX_KEY } from './constant'
import { activeExtension$, extensionDestroy, extensionWorkerSubject, getExtensionWorker, getExtensionWorkers, loadLocalExtensions, onExtensionLoaded, setActiveExtension } from './extensions'

combineLatest([appMount$, activeExtension$]).subscribe(() => {
  appReady$.next(true)
})

export function createRx(): Plugin {
  const $rx = {
    appMount$,
    appReady$,
    extensionWorkerSubject,
    getExtensionWorker,
    getExtensionWorkers,
    appMount,
    onAppReady,
    extensionDestroy,
    onExtensionLoaded,
  }

  onAppMount(async () => {
    console.log('App mounted')
    await loadLocalExtensions()
  })

  onAppReady(() => {
    console.log('App ready')
    setActiveExtension()
  })

  return {
    install(app) {
      app.config.globalProperties.$rx = $rx
      app.provide(APP_PROVIDE_RX_KEY, $rx)
    },
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $rx: AppRx
  }
}
