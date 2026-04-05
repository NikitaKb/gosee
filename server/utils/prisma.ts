import { isAbsolute, resolve } from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'

function sqliteFilePath(): string {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    return resolve(process.cwd(), 'dev.db')
  }
  if (raw.startsWith('file:')) {
    const pathPart = raw.slice('file:'.length).replace(/^\/+/, '')
    return isAbsolute(pathPart) ? pathPart : resolve(process.cwd(), pathPart)
  }
  return raw
}

const globalForPrisma = globalThis as typeof globalThis & {
  __prismaClient?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath() })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient
  = globalForPrisma.__prismaClient ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prismaClient = prisma
}

export default prisma
