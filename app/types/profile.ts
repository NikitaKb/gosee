/** Данные профиля с сервера `/api/profile/me`. */
export type UserProfile = {
  id: string
  email: string
  name: string
  nickname: string | null
  avatar: string | null
  profileDescription: string | null
  city: string | null
  createdAt: string
  followersCount: number
  walksCount: number
  rating: number
  favoritesCount: number
}
