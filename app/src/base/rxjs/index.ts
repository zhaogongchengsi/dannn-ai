import type { Plugin } from 'vue'
import type { AppRx } from './type'
import { combineLatest } from 'rxjs'
import { appMount, appMount$, appReady$, onAppReady } from './app'
import { APP_PROVIDE_RX_KEY } from './constant'
import { extensionDestroy, extensionWorkerSubject, getExtensionWorker, getExtensionWorkers, onExtensionLoaded } from './extensions'
import { onSidebarReady, sidebarDestroy, sidebarReady, sidebarReady$, sidebarStore$ } from './ui/sidebar'
import { onToasterReady, toasterReady, toasterReady$ } from './ui/toaster'

combineLatest([appMount$, sidebarReady$, toasterReady$]).subscribe(() => {
  appReady$.next(true)
})

export function createRx(): Plugin {
  const $rx = {
    appMount$,
    appReady$,
    sidebarReady$,
    sidebarStore$,
    extensionWorkerSubject,
    getExtensionWorker,
    getExtensionWorkers,
    appMount,
    sidebarReady,
    sidebarDestroy,
    onAppReady,
    onSidebarReady,
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
