export enum RoomEvent {
  join = 'room:join',
  leave = 'room:leave',
  create = 'room:create',
  update = 'room:update',
  delete = 'room:delete',
  message = 'room:message',
  addAi = 'room:addAi',
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

export enum MessageEvent {
  create = 'message:create',
  update = 'message:update',
  delete = 'message:delete',
  reply = 'message:reply',
  reaction = 'message:reaction',
  edit = 'message:edit',
  pin = 'message:pin',
  unpin = 'message:unpin',
  forward = 'message:forward',
  quote = 'message:quote',
  copy = 'message:copy',
  download = 'message:download',
  share = 'message:share',
}

export enum ChannelEvent {
  question = 'question',
  answer = 'answer',
  all = 'all',
}
