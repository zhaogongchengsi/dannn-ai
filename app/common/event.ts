export enum RoomEvent {
  join = 'room:join',
  leave = 'room:leave',
  create = 'room:create',
  update = 'room:update',
  delete = 'room:delete',
  message = 'room:message',
}

export enum AiEvent {
  create = 'ai:create',
  update = 'ai:update',
  delete = 'ai:delete',
  message = 'ai:message',
  prompt = 'ai:prompt',
  response = 'ai:response',
  error = 'ai:error',
}