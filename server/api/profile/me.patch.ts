import prisma from '../../utils/prisma'
import { requireSessionUser } from '../../utils/session-user'
import { toUserProfile } from '../../utils/profile-map'

const MAX_BIO = 2000
const MAX_AVATAR_URL = 2048
const MAX_CITY = 120

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const body = await readBody<{
    profileDescription?: string | null
    avatar?: string | null
    city?: string | null
  }>(event)

  const data: {
    profileDescription?: string | null
    avatar?: string | null
    city?: string | null
  } = {}

  if ('profileDescription' in body) {
    const raw = body.profileDescription
    if (raw === null || raw === undefined) {
      data.profileDescription = null
    }
    else {
      const t = String(raw).trim()
      if (t.length > MAX_BIO) {
        throw createError({
          statusCode: 400,
          statusMessage: `Описание не длиннее ${MAX_BIO} символов`,
        })
      }
      data.profileDescription = t.length ? t : null
    }
  }

  if ('avatar' in body) {
    const raw = body.avatar
    if (raw === null || raw === undefined || raw === '') {
      data.avatar = null
    }
    else {
      const t = String(raw).trim()
      if (t.length > MAX_AVATAR_URL) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Слишком длинная ссылка на аватар',
        })
      }
      if (t.startsWith('javascript:') || t.startsWith('data:')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Недопустимый URL аватара',
        })
      }
      data.avatar = t
    }
  }

  if ('city' in body) {
    const raw = body.city
    if (raw === null || raw === undefined || raw === '') {
      data.city = null
    }
    else {
      const t = String(raw).trim()
      if (t.length > MAX_CITY) {
        throw createError({
          statusCode: 400,
          statusMessage: `Город не длиннее ${MAX_CITY} символов`,
        })
      }
      data.city = t.length ? t : null
    }
  }

  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Нет полей для обновления',
    })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  })

  return { profile: toUserProfile(updated) }
})
