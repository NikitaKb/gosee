import prisma from '../../utils/prisma'
import { requireSessionUser } from '../../utils/session-user'
import { toWalkDetails } from '../../utils/walk-map'

type LatLng = { lat: number; lng: number }

function toLatLngList(value: unknown): LatLng[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const lat = Number((item as { lat?: unknown }).lat)
      const lng = Number((item as { lng?: unknown }).lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null
      }
      return { lat, lng }
    })
    .filter((v): v is LatLng => v !== null)
}

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const body = await readBody<{
    title?: string
    city?: string
    description?: string | null
    theme?: string | null
    pace?: string | null
    travelModeId?: string
    timeStart?: string | null
    timeEnd?: string | null
    distanceKm?: number
    durationMinutes?: number
    coverImage?: string | null
    waypoints?: unknown
    path?: unknown
  }>(event)

  const title = body.title?.trim() ?? ''
  const city = body.city?.trim() ?? ''
  const travelModeId = body.travelModeId?.trim() ?? ''
  const description = body.description?.trim() || null
  const theme = body.theme?.trim() || null
  const pace = body.pace?.trim() || null
  const timeStart = body.timeStart?.trim() || null
  const timeEnd = body.timeEnd?.trim() || null
  const distanceKm = Number(body.distanceKm ?? 0)
  const durationMinutes = Math.round(Number(body.durationMinutes ?? 0))
  const coverImageRaw = body.coverImage?.trim() || null
  const coverImage
    = coverImageRaw && coverImageRaw.startsWith('/uploads/walks/')
      ? coverImageRaw
      : null
  const waypoints = toLatLngList(body.waypoints)
  const path = toLatLngList(body.path)

  if (!title || title.length > 140) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите название (до 140 символов)' })
  }
  if (!city || city.length > 120) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите город (до 120 символов)' })
  }
  if (!travelModeId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан тип прогулки' })
  }
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректная длина маршрута' })
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректная длительность маршрута' })
  }
  if (waypoints.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Нужно минимум 2 точки маршрута' })
  }

  const created = await prisma.$transaction(async (tx) => {
    const walk = await tx.walk.create({
      data: {
        userId: user.id,
        title,
        city,
        description,
        theme,
        pace,
        travelModeId,
        timeStart,
        timeEnd,
        distanceKm,
        durationMinutes,
        coverImage,
        waypoints,
        path,
      },
      include: { user: true },
    })
    await tx.user.update({
      where: { id: user.id },
      data: { walksCount: { increment: 1 } },
    })
    return walk
  })

  return { walk: toWalkDetails(created) }
})
