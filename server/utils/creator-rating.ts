import prisma from './prisma'

/** Средний рейтинг по всем оценкам всех маршрутов пользователя — в поле `users.rating`. */
export async function recomputeUserAggregateRating(creatorUserId: string): Promise<void> {
  const agg = await prisma.rating.aggregate({
    where: { walk: { userId: creatorUserId } },
    _avg: { value: true },
  })
  const next = agg._avg.value ?? 0
  await prisma.user.update({
    where: { id: creatorUserId },
    data: { rating: next },
  })
}
