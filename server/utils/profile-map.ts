import type { User } from '@prisma/client'
import type { UserProfile } from '../../app/types/profile'
import type { WalkSummary } from '../../app/types/walk'

function favoritesCountFromJson(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length
  }
  return 0
}

export function toUserProfile(user: User, walks: WalkSummary[] = []): UserProfile {
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
    walksCount: walks.length || user.walksCount,
    rating: user.rating,
    favoritesCount: favoritesCountFromJson(user.favorites),
    walks,
  }
}
