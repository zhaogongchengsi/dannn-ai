import type { Observable, Subscription } from 'rxjs'
import type { ReplaySubject } from 'rxjs/internal/ReplaySubject'
import type { Sidebar } from '../types/sidebar'

export interface AppRx {
  appMount$: ReplaySubject<boolean>
  appReady$: ReplaySubject<boolean>
  sidebarReady$: ReplaySubject<boolean>
  sidebarStore$: Observable<Sidebar[]>
  appMount: () => void
  sidebarReady: () => void
  onAppReady: (func: () => void) => Subscription
  onSidebarReady: (func: (...data: Sidebar[]) => void) => Subscription
}
