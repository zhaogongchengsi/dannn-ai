import type { Plugin } from 'vue'
import type { AppRx } from './type'
import { combineLatest } from 'rxjs'
import { appMount, appMount$, appReady$, onAppReady } from './app'
import { APP_PROVIDE_RX_KEY } from './constant'
import { onSidebarReady, sidebarReady, sidebarReady$, sidebarStore$ } from './ui/sidebar'

export function createRx(): Plugin {
  combineLatest([appMount$, sidebarReady$]).subscribe(() => {
    appReady$.next(true)
  })

  const $rx = {
    appMount$,
    appReady$,
    sidebarReady$,
    sidebarStore$,
    appMount,
    sidebarReady,
    onAppReady,
    onSidebarReady,
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
