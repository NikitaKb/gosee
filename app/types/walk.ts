export type WalkSummary = {
  id: string
  title: string
  city: string
  description: string | null
  theme: string | null
  pace: string | null
  travelModeId: string
  timeStart: string | null
  timeEnd: string | null
  distanceKm: number
  durationMinutes: number
  coverImage: string | null
  pointsCount: number
  createdAt: string
}

export type WalkDetails = WalkSummary & {
  path: Array<{ lat: number; lng: number }>
  waypoints: Array<{ lat: number; lng: number }>
  creator: {
    id: string
    name: string
    nickname: string | null
    avatar: string | null
  }
}
