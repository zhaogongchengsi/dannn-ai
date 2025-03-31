import type { Plugin } from 'vue'
import type { AppRx } from './type'
import { combineLatest } from 'rxjs'
import { appMount, appMount$, appReady$, onAppReady } from './app'
import { APP_PROVIDE_RX_KEY } from './constant'
import { extensionWorkerSubject, getExtensionWorker, getExtensionWorkers } from './extensions'
import { onSidebarReady, sidebarReady, sidebarReady$, sidebarStore$ } from './ui/sidebar'
import { onToasterReady, toasterReady$ } from './ui/toaster'

export function createRx(): Plugin {
  combineLatest([appMount$, sidebarReady$, toasterReady$]).subscribe(() => {
    appReady$.next(true)
  })

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
    onAppReady,
    onSidebarReady,
    onToasterReady,
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
