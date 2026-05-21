import type { Prisma } from '@prisma/client'
import prisma from '../utils/prisma'
import { getSessionUser } from '../utils/session-user'
import { toWalkSummary } from '../utils/walk-map'

function authorDisplayName(u: { name: string; nickname: string | null }): string {
  const n = u.nickname?.trim()
  return n || u.name
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const cityRaw = typeof q.city === 'string' ? q.city.trim() : ''
  const pace = typeof q.pace === 'string' ? q.pace.trim() : ''
  const travelModeId = typeof q.travelModeId === 'string' ? q.travelModeId.trim() : ''

  const where: Prisma.WalkWhereInput = {}
  if (pace.length) {
    where.pace = pace
  }
  if (travelModeId === 'walk' || travelModeId === 'bike') {
    where.travelModeId = travelModeId
  }

  const [rowsFromDb, paceGroups] = await Promise.all([
    prisma.walk.findMany({
      where,
      include: {
        user: { select: { name: true, nickname: true } },
      },
    }),
    prisma.walk.groupBy({
      by: ['pace'],
      where: {
        pace: { not: null },
      },
    }),
  ])

  /** SQLite: Prisma `contains` для кириллицы не гарантирует поиск без учёта регистра — фильтруем в памяти. */
  let rows = rowsFromDb
  if (cityRaw.length) {
    const needle = cityRaw.toLowerCase()
    rows = rowsFromDb.filter(r => r.city.toLowerCase().includes(needle))
  }

  const ids = rows.map(r => r.id)
  const groupAggs
    = ids.length === 0
      ? []
      : await prisma.rating.groupBy({
          by: ['walkId'],
          where: { walkId: { in: ids } },
          _avg: { value: true },
          _count: { _all: true },
        })

  const aggByWalk = new Map(
    groupAggs.map(g => [
      g.walkId,
      { avg: g._avg.value ?? 0, count: g._count._all },
    ]),
  )

  const sorted = [...rows].sort((a, b) => {
    const av = aggByWalk.get(a.id)?.avg ?? 0
    const bv = aggByWalk.get(b.id)?.avg ?? 0
    if (Math.abs(bv - av) > 1e-9) {
      return bv - av
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const limited = sorted.slice(0, 200)
  const limitedIds = limited.map(r => r.id)

  const sessionUser = await getSessionUser(event)

  let favoritedIds = new Set<string>()
  let myRatings = new Map<string, number>()
  if (sessionUser && limitedIds.length) {
    const [favs, ratings] = await Promise.all([
      prisma.favorite.findMany({
        where: {
          userId: sessionUser.id,
          walkId: { in: limitedIds },
        },
        select: { walkId: true },
      }),
      prisma.rating.findMany({
        where: {
          userId: sessionUser.id,
          walkId: { in: limitedIds },
        },
        select: { walkId: true, value: true },
      }),
    ])
    favoritedIds = new Set(favs.map(f => f.walkId))
    myRatings = new Map(ratings.map(r => [r.walkId, r.value]))
  }

  const walks = limited.map((w) => {
    const base = toWalkSummary(w)
    const a = aggByWalk.get(w.id)
    const avg = a?.avg ?? null
    const count = a?.count ?? 0
    const authorDisplayNameVal = authorDisplayName(w.user)
    const out = {
      ...base,
      authorDisplayName: authorDisplayNameVal,
      avgRating: count > 0 ? avg : null,
      ratingsCount: count,
      myRating: sessionUser ? (myRatings.get(w.id) ?? null) : undefined,
    }
    if (!sessionUser) {
      return out
    }
    return { ...out, favorited: favoritedIds.has(w.id) }
  })

  const paceOptions = paceGroups
    .map(g => g.pace)
    .filter((p): p is string => p != null && String(p).length > 0)
    .sort((a, b) => a.localeCompare(b, 'ru'))

  return { walks, paceOptions }
})
