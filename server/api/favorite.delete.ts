import prisma from '../utils/prisma'
import { requireSessionUser } from '../utils/session-user'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const q = getQuery(event)
  const walkId = typeof q.walkId === 'string' ? q.walkId.trim() : ''
  if (!walkId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан маршрут' })
  }

  await prisma.favorite.deleteMany({
    where: { userId: user.id, walkId },
  })

  return { ok: true }
})
