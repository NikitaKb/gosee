import prisma from '../../utils/prisma'
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

  return { walk: toWalkDetails(walk) }
})
