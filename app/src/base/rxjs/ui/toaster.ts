import type { Toaster } from '@/base/types/toaster'
import { ReplaySubject, Subject } from 'rxjs'

export const toasterReady$ = new ReplaySubject<boolean>()
export const toasterSubject = new Subject<Toaster>()

export function toasterReady() {
  toasterReady$.next(true)
}

export function onToasterReady(func: (data: Toaster) => void) {
  toasterReady()
  return toasterSubject.subscribe((data: Toaster) => func(data))
}

export function toaster(data: Toaster) {
  toasterSubject.next(data)
}
