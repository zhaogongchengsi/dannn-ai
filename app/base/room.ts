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
const roomCreated$ = new Subject<Omit<RoomData, 'participant'>>()

client.socket.on(RoomEvent.create, (room: Omit<RoomData, 'participant'>) => {
  roomCreated$.next(room)
})

export async function createRoom(opt: CreateRoomOptions): Promise<Omit<RoomData, 'participant'>> {
  const newRooms = await client.trpc.room.createRoom.mutate(opt)
  client.socket.emit(RoomEvent.create, newRooms)
  return newRooms
}

export async function getAllRooms(): Promise<RoomData[]> {
  const rooms = await client.trpc.room.getAllRooms.query()
  return rooms
}

export async function setAiToRoom(roomId: number, aiId: number): Promise<{
  roomId: number | null
  aiId: number | null
}> {
  return await client.trpc.room.addAiToRoom.mutate({ roomId, aiId })
}

export function onRoomCreated(callback: (room: Omit<RoomData, 'participant'>) => void) {
  const subscription = roomCreated$.subscribe(callback)
  return () => subscription.unsubscribe()
}
