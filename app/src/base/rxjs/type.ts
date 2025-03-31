import type { Observable, Subject, Subscription } from 'rxjs'
import type { ReplaySubject } from 'rxjs/internal/ReplaySubject'
import type { Sidebar } from '../types/sidebar'
import type { Toaster } from '../types/toaster'
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
}
