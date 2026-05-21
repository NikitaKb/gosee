import prisma from '../utils/prisma'
import { recomputeUserAggregateRating } from '../utils/creator-rating'
import { requireSessionUser } from '../utils/session-user'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const body = await readBody<{ walkId?: string; value?: number }>(event)
  const walkId = body.walkId?.trim() ?? ''
  const value = Math.round(Number(body.value ?? 0))

  if (!walkId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан маршрут' })
  }
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Оценка от 1 до 5' })
  }

  const walk = await prisma.walk.findUnique({ where: { id: walkId } })
  if (!walk) {
    throw createError({ statusCode: 404, statusMessage: 'Маршрут не найден' })
  }
  if (walk.userId === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Нельзя оценить свой маршрут' })
  }

  await prisma.rating.upsert({
    where: {
      userId_walkId: { userId: user.id, walkId },
    },
    create: {
      userId: user.id,
      walkId,
      value,
    },
    update: { value },
  })

  await recomputeUserAggregateRating(walk.userId)

  return { ok: true }
})
