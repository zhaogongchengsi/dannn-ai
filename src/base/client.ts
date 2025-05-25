/* eslint-disable node/prefer-global/process */
import type { TRPCClient, TRPCLink } from '@trpc/client'
import type { AppRouter } from '../node/server/router'
import { createTRPCClient } from '@trpc/client'
import { isWindows } from 'std-env'
import { AnyRouter } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { Bridge } from '~/common/bridge'

/**
 * 基础客户端单例类，负责管理trpc和socket连接
 */
export class Client {
  private _trpc!: TRPCClient<AppRouter>
  bridge: Bridge
  constructor(bridge: Bridge) {
    this.bridge = bridge
    const trpc = createTRPCClient<AppRouter>({
      links: [
        ipcLink(bridge)
      ],
    })
    this._trpc = trpc
  }

  emit(event: string, ...args: any[]) {
    this.bridge.emit(event, ...args)
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.bridge.on(event, callback)
  }

  get trpc(): TRPCClient<AppRouter> {
    return this._trpc
  }
}

function ipcLink(bridge: Bridge): TRPCLink<AnyRouter> {
  return () => {
    return ({ op }) => {
      return observable((observer) => {
        const id = bridge.randomAlphaString(10)
        bridge.invoke<any>('trpc:response', {
          id,
          type: op.type,
          path: op.path,
          input: op.input,
        })
        .then((data) => {
          if (data.error) {
            observer.error(data.error)
          } else {
            observer.next(data.result)
            observer.complete()
          }
        })
        return () => {
          // 清理逻辑（可选）
        }
      })
    }
  }
}