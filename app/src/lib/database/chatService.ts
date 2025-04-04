import { database } from './database' // Adjust the import path based on your project structure

export async function findAllChats() {
  return await database.aiChats.toArray()
}
