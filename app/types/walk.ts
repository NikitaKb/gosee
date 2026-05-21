export type WalkSummary = {
  id: string
  /** Автор маршрута. */
  userId: string
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
  /** Заполняется в списках при авторизованном пользователе. */
  favorited?: boolean
  /** Средняя оценка маршрута (сообщество / детали). */
  avgRating?: number | null
  ratingsCount?: number
  /** Оценка текущего пользователя (1–5). */
  myRating?: number | null
  /** Подпись для ссылки на автора в сообществе. */
  authorDisplayName?: string
}

export type WalkDetails = WalkSummary & {
  path: Array<{ lat: number; lng: number }>
  waypoints: Array<{ lat: number; lng: number; label?: string | null }>
  creator: {
    id: string
    name: string
    nickname: string | null
    avatar: string | null
  }
}
