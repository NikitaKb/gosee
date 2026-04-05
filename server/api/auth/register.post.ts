import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/password'
import { signSessionToken, writeSessionCookie } from '../../utils/auth-session'
import { toPublicUser } from '../../utils/auth-user'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string
    nickname?: string
    email?: string
    password?: string
    passwordConfirm?: string
  }>(event)

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim().toLowerCase() ?? ''
  const nicknameRaw = body.nickname?.trim()
  const nickname = nicknameRaw ? nicknameRaw.toLowerCase() : null
  const password = body.password ?? ''
  const passwordConfirm = body.passwordConfirm ?? ''

  if (!name.length) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите имя' })
  }
  if (!email.length || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите корректный e-mail' })
  }
  if (nickname !== null) {
    if (nickname.length < 2 || nickname.length > 32) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Никнейм: от 2 до 32 символов',
      })
    }
  }
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Пароль не короче 8 символов',
    })
  }
  if (password.length > 72) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Пароль не длиннее 72 символов (ограничение bcrypt)',
    })
  }
  if (password !== passwordConfirm) {
    throw createError({ statusCode: 400, statusMessage: 'Пароли не совпадают' })
  }

  const passwordHash = hashPassword(password)

  let user
  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        nickname,
      },
    })
  }
  catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Такой e-mail или никнейм уже заняты',
      })
    }
    throw e
  }

  const token = await signSessionToken(user.id, event, false)
  writeSessionCookie(event, token, false)

  return { user: toPublicUser(user) }
})
