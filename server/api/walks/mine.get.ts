import prisma from '../../utils/prisma'
import { requireSessionUser } from '../../utils/session-user'
import { toWalkSummary } from '../../utils/walk-map'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const walks = await prisma.walk.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return { walks: walks.map(toWalkSummary) }
})
