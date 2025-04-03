import type { Plugin } from 'vue'
import type { AppRx } from './type'
import { combineLatest } from 'rxjs'
import { appMount, appMount$, appReady$, onAppReady } from './app'
import { APP_PROVIDE_RX_KEY } from './constant'
import { extensionDestroy, extensionWorkerSubject, getExtensionWorker, getExtensionWorkers, onExtensionLoaded } from './extensions'
import { onToasterReady, toasterReady, toasterReady$ } from './ui/toaster'

combineLatest([appMount$, toasterReady$]).subscribe(() => {
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
    onToasterReady,
    toasterReady,
    extensionDestroy,
    onExtensionLoaded,
  }

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
