export const tableSchemasV1 = {
  aiModels: 'id, name, type, createdAt',
  aiSessions: 'id, name, createdAt, lastMessageAt',
  aiMessages: 'id, sessionId, senderId, timestamp',
}
