import prisma from '../../utils/prisma'
import { getSessionUser } from '../../utils/session-user'
import { toWalkDetails } from '../../utils/walk-map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан идентификатор прогулки' })
  }

  const walk = await prisma.walk.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!walk) {
    throw createError({ statusCode: 404, statusMessage: 'Прогулка не найдена' })
  }

  const mapped = toWalkDetails(walk)
  const user = await getSessionUser(event)
  const [ratingAgg, favorite, myRating] = await Promise.all([
    prisma.rating.aggregate({
      where: { walkId: walk.id },
      _avg: { value: true },
      _count: { _all: true },
    }),
    user
      ? prisma.favorite.findUnique({
          where: {
            userId_walkId: {
              userId: user.id,
              walkId: walk.id,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    user
      ? prisma.rating.findUnique({
          where: {
            userId_walkId: {
              userId: user.id,
              walkId: walk.id,
            },
          },
          select: { value: true },
        })
      : Promise.resolve(null),
  ])

  mapped.favorited = !!favorite
  mapped.avgRating = ratingAgg._avg.value ?? null
  mapped.ratingsCount = ratingAgg._count._all
  mapped.myRating = myRating?.value ?? null

  return { walk: mapped }
})
