import type { User } from '@prisma/client'

export type PublicUser = {
  id: string
  email: string
  name: string
  nickname: string | null
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
  }
}
