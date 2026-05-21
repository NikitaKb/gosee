import prisma from '../../utils/prisma'
import { toWalkSummary } from '../../utils/walk-map'
import { walkSummariesWithFavoriteFlags } from '../../utils/profile-walks'
import { getSessionUser } from '../../utils/session-user'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')?.trim() ?? ''
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан пользователь' })
  }

  const session = await getSessionUser(event)

  const row = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nickname: true,
      avatar: true,
      profileDescription: true,
      city: true,
      createdAt: true,
      followersCount: true,
      walksCount: true,
      rating: true,
    },
  })

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })
  }

  const walksRaw = await prisma.walk.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  })

  const isSelf = session?.id === id

  let walks
  if (isSelf && session) {
    walks = await walkSummariesWithFavoriteFlags(session.id, walksRaw)
  }
  else {
    walks = walksRaw.map(w => toWalkSummary(w))
  }

  const favoritesCount
    = isSelf && session
      ? await prisma.favorite.count({ where: { userId: session.id } })
      : 0

  let isFollowing = false
  if (session && !isSelf) {
    const f = await prisma.follow.findFirst({
      where: { followerId: session.id, followingId: id },
      select: { id: true },
    })
    isFollowing = !!f
  }

  const profile = {
    id: row.id,
    email: '',
    name: row.name,
    nickname: row.nickname,
    avatar: row.avatar,
    profileDescription: row.profileDescription,
    city: row.city,
    createdAt: row.createdAt.toISOString(),
    followersCount: row.followersCount,
    walksCount: row.walksCount,
    rating: row.rating,
    favoritesCount,
    walks,
  }

  return {
    profile,
    isFollowing,
    isSelf,
  }
})
