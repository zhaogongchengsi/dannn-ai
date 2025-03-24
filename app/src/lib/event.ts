type EventMap = Record<string, any>

type EventKey<T extends EventMap> = keyof T
type EventCallback<T> = (payload: T) => void

export class Event<T extends EventMap> {
  private events: Map<EventKey<T>, EventCallback<any>[]> = new Map()

  on<K extends EventKey<T>>(event: K, callback: EventCallback<T[K]>): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  off<K extends EventKey<T>>(event: K, callback: EventCallback<T[K]>): void {
    if (!this.events.has(event)) return
    const callbacks = this.events.get(event)!
    const index = callbacks.indexOf(callback)
    if (index !== -1) {
      callbacks.splice(index, 1)
    }
  }

  emit<K extends EventKey<T>>(event: K, payload: T[K]): void {
    if (!this.events.has(event)) return
    const callbacks = this.events.get(event)!
    callbacks.forEach(callback => callback(payload))
  }
}