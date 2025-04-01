import type { Sidebar, Toaster } from '@dannn/types'
import type { Observable, Subject, Subscription } from 'rxjs'
import type { ReplaySubject } from 'rxjs/internal/ReplaySubject'
import type { ExtensionWorker } from '../worker/worker'

export interface AppRx {
  appMount$: ReplaySubject<boolean>
  appReady$: ReplaySubject<boolean>
  sidebarReady$: ReplaySubject<boolean>
  sidebarStore$: Observable<Sidebar[]>
  extensionWorkerSubject: Subject<ExtensionWorker>
  getExtensionWorker: (id: string) => ExtensionWorker | undefined
  getExtensionWorkers: () => ExtensionWorker[]
  sidebarDestroy: () => void
  appMount: () => void
  sidebarReady: () => void
  onAppReady: (func: () => void) => Subscription
  onSidebarReady: (func: (...data: Sidebar[]) => void) => Subscription
  onToasterReady: (func: (data: Toaster) => void) => Subscription
  toasterReady: () => void
  extensionDestroy: () => void
  onExtensionLoaded: (callback: (worker: ExtensionWorker) => void) => Subscription
}
