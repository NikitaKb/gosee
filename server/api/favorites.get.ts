import prisma from '../utils/prisma'
import { requireSessionUser } from '../utils/session-user'
import { toWalkSummary } from '../utils/walk-map'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const rows = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { walk: true },
  })

  const walks = rows.map(r => toWalkSummary(r.walk)).map(w => ({ ...w, favorited: true }))

  return { walks }
})
