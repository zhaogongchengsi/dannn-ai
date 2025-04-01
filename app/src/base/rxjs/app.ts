import { ReplaySubject } from 'rxjs'
import { loadLocalExtensions } from './extensions'

// 定义每个状态的 ReplaySubject，确保每个状态至少触发一次
export const appMount$ = new ReplaySubject<boolean>(1)
export const appReady$ = new ReplaySubject<boolean>(1)

export function appMount() {
  appMount$.next(true)
}

export function onAppReady(func: () => void) {
  return appReady$.subscribe(func)
}

onAppReady(() => {
  console.log('App is ready')
  loadLocalExtensions()
})
