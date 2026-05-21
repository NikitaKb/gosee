import prisma from '../utils/prisma'
import { requireSessionUser } from '../utils/session-user'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const q = getQuery(event)
  const followingId = typeof q.userId === 'string' ? q.userId.trim() : ''
  if (!followingId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан пользователь' })
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const res = await tx.follow.deleteMany({
      where: { followerId: user.id, followingId },
    })
    if (res.count > 0) {
      await tx.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      })
    }
    return res.count
  })

  if (deleted === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Подписка не найдена' })
  }

  return { ok: true }
})
