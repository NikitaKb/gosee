import type { Walk } from '@prisma/client'
import type { WalkSummary } from '../../app/types/walk'
import prisma from './prisma'
import { toWalkSummary } from './walk-map'

/** Сводки маршрутов пользователя с флагом «в избранном» (для карточек в профиле). */
export async function walkSummariesWithFavoriteFlags(
  userId: string,
  walks: Walk[],
): Promise<WalkSummary[]> {
  if (walks.length === 0) {
    return []
  }
  const walkIds = walks.map(w => w.id)
  const favRows = await prisma.favorite.findMany({
    where: { userId, walkId: { in: walkIds } },
    select: { walkId: true },
  })
  const favSet = new Set(favRows.map(f => f.walkId))
  return walks.map(w => ({
    ...toWalkSummary(w),
    favorited: favSet.has(w.id),
  }))
}
