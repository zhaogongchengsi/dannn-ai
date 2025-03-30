import type { AppRx } from './type'
import { inject } from 'vue'
import { APP_PROVIDE_RX_KEY } from './constant'

export function useAppRx() {
  const rx = inject<AppRx>(APP_PROVIDE_RX_KEY)
  if (!rx) {
    throw new Error('useAppRx must be used within a Vue app that provides it')
  }
  return rx
}
