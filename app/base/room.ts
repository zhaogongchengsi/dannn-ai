import type { RoomData } from '../common/types'
import { Subject } from 'rxjs'
import { RoomEvent } from '../common/event'
import { BaseClient } from './client'

export interface CreateRoomOptions {
  title: string
  description?: string
  avatar?: string
}

class Room {
  private client = BaseClient.getInstance()
  private roomCreated$ = new Subject<RoomData[]>()

  constructor() {
    this.client.socket.on(RoomEvent.create, (rooms: RoomData[]) => {
      this.roomCreated$.next(rooms)
    })
  }

  async createRoom(opt: CreateRoomOptions): Promise<RoomData[]> {
    const newRooms = await this.client.trpc.room.createRoom.mutate(opt)
    this.client.socket.emit(RoomEvent.create, newRooms)
    return newRooms
  }

  ping() {
    this.client.socket.emit('ping')
  }

  onRoomCreated(callback: (rooms: RoomData[]) => void) {
    return this.roomCreated$.subscribe(callback)
  }
}

export const room = new Room()
