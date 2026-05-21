import prisma from '../utils/prisma'
import { requireSessionUser } from '../utils/session-user'

function isUniqueViolation(e: unknown): boolean {
  return typeof e === 'object'
    && e !== null
    && 'code' in e
    && (e as { code?: string }).code === 'P2002'
}

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const body = await readBody<{ walkId?: string }>(event)
  const walkId = body.walkId?.trim() ?? ''
  if (!walkId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан маршрут' })
  }

  const walk = await prisma.walk.findUnique({ where: { id: walkId } })
  if (!walk) {
    throw createError({ statusCode: 404, statusMessage: 'Маршрут не найден' })
  }

  try {
    await prisma.favorite.create({
      data: { userId: user.id, walkId },
    })
  }
  catch (e: unknown) {
    if (isUniqueViolation(e)) {
      throw createError({ statusCode: 409, statusMessage: 'Уже в избранном' })
    }
    throw e
  }

  return { ok: true }
})
