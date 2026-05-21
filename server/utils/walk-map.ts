import type { Walk, User } from '@prisma/client'
import type { WalkDetails, WalkSummary } from '../../app/types/walk'

type LatLng = { lat: number; lng: number; label?: string | null }

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
      const label = (item as { label?: unknown }).label
      const point: LatLng = {
        lat,
        lng,
      }
      if (typeof label === 'string' && label.trim()) {
        point.label = label.trim()
      }
      return point
    })
    .filter((v): v is LatLng => v !== null)
}

export function toWalkSummary(walk: Walk): WalkSummary {
  const path = toLatLngList(walk.path)
  return {
    id: walk.id,
    userId: walk.userId,
    title: walk.title,
    city: walk.city,
    description: walk.description,
    theme: walk.theme,
    pace: walk.pace,
    travelModeId: walk.travelModeId,
    timeStart: walk.timeStart,
    timeEnd: walk.timeEnd,
    distanceKm: walk.distanceKm,
    durationMinutes: walk.durationMinutes,
    coverImage: walk.coverImage,
    pointsCount: path.length,
    createdAt: walk.createdAt.toISOString(),
  }
}

export function toWalkDetails(walk: Walk & { user: User }): WalkDetails {
  return {
    ...toWalkSummary(walk),
    path: toLatLngList(walk.path),
    waypoints: toLatLngList(walk.waypoints),
    creator: {
      id: walk.user.id,
      name: walk.user.name,
      nickname: walk.user.nickname,
      avatar: walk.user.avatar,
    },
  }
}
