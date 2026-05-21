import prisma from '../utils/prisma'
import { getSessionUser } from '../utils/session-user'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const walkId = typeof q.walkId === 'string' ? q.walkId.trim() : ''
  if (!walkId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан маршрут' })
  }

  const walk = await prisma.walk.findUnique({ where: { id: walkId }, select: { id: true } })
  if (!walk) {
    throw createError({ statusCode: 404, statusMessage: 'Маршрут не найден' })
  }

  const session = await getSessionUser(event)

  const [agg, mine] = await Promise.all([
    prisma.rating.aggregate({
      where: { walkId },
      _avg: { value: true },
      _count: { _all: true },
    }),
    session
      ? prisma.rating.findUnique({
          where: {
            userId_walkId: { userId: session.id, walkId },
          },
          select: { value: true },
        })
      : Promise.resolve(null),
  ])

  return {
    average: agg._avg.value ?? null,
    count: agg._count._all,
    myRating: mine?.value ?? null,
  }
})
