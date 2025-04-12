import type { RoomData } from '../common/types'
import { Subject } from 'rxjs'
import { RoomEvent } from '../common/event'
import { BaseClient } from './client'

export interface CreateRoomOptions {
  title: string
  description?: string
  avatar?: string
}

const client = BaseClient.getInstance()
const roomCreated$ = new Subject<CreateRoomOptions>()

client.socket.on(RoomEvent.create, (room: CreateRoomOptions) => {
  roomCreated$.next(room)
})

export async function createRoom(opt: CreateRoomOptions): Promise<RoomData> {
  const newRooms = await client.trpc.room.createRoom.mutate(opt)
  client.socket.emit(RoomEvent.create, newRooms)
  return newRooms
}

export async function getAllRooms(): Promise<RoomData[]> {
  const rooms = await client.trpc.room.getAllRooms.query()
  return rooms
}

export function onRoomCreated(callback: (room: CreateRoomOptions) => void) {
  const subscription = roomCreated$.subscribe(callback)
  return () => subscription.unsubscribe()
}

