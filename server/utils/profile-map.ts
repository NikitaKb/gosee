import type { User } from '@prisma/client'
import type { UserProfile } from '../../app/types/profile'

function favoritesCountFromJson(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length
  }
  return 0
}

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    avatar: user.avatar,
    profileDescription: user.profileDescription,
    city: user.city,
    createdAt: user.createdAt.toISOString(),
    followersCount: user.followersCount,
    walksCount: user.walksCount,
    rating: user.rating,
    favoritesCount: favoritesCountFromJson(user.favorites),
  }
}
