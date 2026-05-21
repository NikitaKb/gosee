import prisma from '../../utils/prisma'
import { walkSummariesWithFavoriteFlags } from '../../utils/profile-walks'
import { requireSessionUser } from '../../utils/session-user'
import { toUserProfile } from '../../utils/profile-map'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const [walks, favoritesCount] = await Promise.all([
    prisma.walk.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.favorite.count({ where: { userId: user.id } }),
  ])
  const summaries = await walkSummariesWithFavoriteFlags(user.id, walks)
  return { profile: toUserProfile(user, summaries, favoritesCount) }
})
