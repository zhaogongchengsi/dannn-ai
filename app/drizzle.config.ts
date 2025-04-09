import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './main/database/schema.ts',
  dbCredentials: {
    url: './sqlite.db', // 这里是关键，指定 SQLite 数据库文件路径
  },
})
