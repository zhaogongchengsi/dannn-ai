import type { Sidebar } from '@/base/types/sidebar'
import { bufferWhen, ReplaySubject, Subject } from 'rxjs'

export const sidebarReady$ = new ReplaySubject<boolean>(1)
export const sidebarSubject = new Subject<Sidebar>()
export const sidebarStore$ = sidebarSubject
  .pipe(bufferWhen(() => sidebarReady$))

export function sidebarReady() {
  sidebarReady$.next(true)
}

export function sidebarDestroy() {
  sidebarSubject.unsubscribe()
  sidebarReady$.unsubscribe()
}

export function onSidebarReady(func: () => void) {
  return sidebarReady$.subscribe(func)
}
