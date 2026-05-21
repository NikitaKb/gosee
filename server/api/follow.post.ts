import prisma from '../utils/prisma'
import { requireSessionUser } from '../utils/session-user'

function isUniqueViolation(e: unknown): boolean {
  return typeof e === 'object'
    && e !== null
    && 'code' in e
    && (e as { code?: string }).code === 'P2002'
}

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const body = await readBody<{ userId?: string }>(event)
  const followingId = body.userId?.trim() ?? ''
  if (!followingId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан пользователь' })
  }
  if (followingId === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Нельзя подписаться на себя' })
  }

  const target = await prisma.user.findUnique({ where: { id: followingId }, select: { id: true } })
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })
  }

  try {
    await prisma.$transaction([
      prisma.follow.create({
        data: { followerId: user.id, followingId },
      }),
      prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } },
      }),
    ])
  }
  catch (e: unknown) {
    if (isUniqueViolation(e)) {
      throw createError({ statusCode: 409, statusMessage: 'Вы уже подписаны' })
    }
    throw e
  }

  return { ok: true }
})
