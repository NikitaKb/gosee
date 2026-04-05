import prisma from '../../utils/prisma'
import { verifyPassword } from '../../utils/password'
import { signSessionToken, writeSessionCookie } from '../../utils/auth-session'
import { toPublicUser } from '../../utils/auth-user'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    identity?: string
    password?: string
    remember?: boolean
  }>(event)

  const identity = body.identity?.trim() ?? ''
  const password = body.password ?? ''
  const remember = Boolean(body.remember)

  if (!identity.length || !password.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Введите никнейм или e-mail и пароль',
    })
  }

  const key = identity.toLowerCase()

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: key }, { nickname: key }],
    },
  })

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Неверный логин или пароль',
    })
  }

  const token = await signSessionToken(user.id, event, remember)
  writeSessionCookie(event, token, remember)

  return { user: toPublicUser(user) }
})
