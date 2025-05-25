import type { InfoMessage, RoomData } from '~/common/types'
import { filter, Subject } from 'rxjs'
import { RoomEvent } from '~/common/event'
import { BaseClient } from '../client'

export interface CreateRoomOptions {
  title: string
  description?: string
  avatar?: string
}

export interface JoinAIToRoom {
  roomId: number | null
  aiId: number | null
}

export interface thinkingPreload {
  roomId: number
  aiId: number
}

const client = BaseClient.getInstance()
const roomCreated$ = new Subject<Omit<RoomData, 'participant'>>()
const thinking$ = new Subject<thinkingPreload>()
const endThink$ = new Subject<thinkingPreload>()
const joinedAI$ = new Subject<JoinAIToRoom>()

client.socket.on(RoomEvent.create, (room: Omit<RoomData, 'participant'>) => {
  roomCreated$.next(room)
})

client.socket.on(RoomEvent.thinking, (preload: thinkingPreload) => {
  thinking$.next(preload)
})

client.socket.on(RoomEvent.endThink, (preload: thinkingPreload) => {
  endThink$.next(preload)
})

client.socket.on(RoomEvent.addAi, (data: JoinAIToRoom) => {
  joinedAI$.next(data)
})

export function onAiThinking(callback: (data: thinkingPreload) => void) {
  const subscription = thinking$.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onAiEndThink(callback: (data: thinkingPreload) => void) {
  const subscription = endThink$.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function thinking(roomId: number, aiId: number) {
  client.socket.emit(RoomEvent.thinking, { roomId, aiId })
}

export function endThink(roomId: number, aiId: number) {
  client.socket.emit(RoomEvent.endThink, { roomId, aiId })
}

export async function createRoom(opt: CreateRoomOptions): Promise<Omit<RoomData, 'participant'>> {
  const newRooms = await client.trpc.room.createRoom.mutate(opt)
  client.socket.emit(RoomEvent.create, newRooms)
  return newRooms
}

export async function getAllRooms(): Promise<RoomData[]> {
  const rooms = await client.trpc.room.getAllRooms.query()
  return rooms
}

export async function getRoomById(id: number): Promise<RoomData | undefined> {
  return await client.trpc.room.getRoomById.query({ roomId: id })
}

export async function setAiToRoom(roomId: number, aiId: number): Promise<JoinAIToRoom> {
  const data = await client.trpc.room.addAiToRoom.mutate({ roomId, aiId })
  client.socket.emit(RoomEvent.addAi, data)
  return data
}

export function onAIJoined(callback: (data: JoinAIToRoom) => void) {
  const subscription = joinedAI$.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onAIJoinedWithRoomId(roomId: number, callback: (r: JoinAIToRoom) => void) {
  const subscription = joinedAI$.pipe(filter(data => data.roomId === roomId)).subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onRoomCreated(callback: (room: Omit<RoomData, 'participant'>) => void) {
  const subscription = roomCreated$.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function getRoomContextMessages(roomId: number): Promise<InfoMessage[]> {
  return client.trpc.room.getRoomContextMessages.query({ roomId })
}

export function updateAIMessageContextFalse(messageId: string): Promise<InfoMessage> {
  return client.trpc.room.updateAIMessageContextFalse.mutate({ messageId })
}

export function updateAIMessageContextTrue(messageId: string): Promise<InfoMessage> {
  return client.trpc.room.updateAIMessageContextTrue.mutate({ messageId })
}
