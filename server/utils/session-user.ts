import { createError, type H3Event } from 'h3'
import prisma from './prisma'
import {
  clearSessionCookie,
  readSessionToken,
  verifySessionToken,
} from './auth-session'
import type { User } from '@prisma/client'

export async function getSessionUser(event: H3Event): Promise<User | null> {
  const token = readSessionToken(event)
  if (!token) {
    return null
  }
  const userId = await verifySessionToken(token, event)
  if (!userId) {
    clearSessionCookie(event)
    return null
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    clearSessionCookie(event)
    return null
  }
  return user
}

export async function requireSessionUser(event: H3Event): Promise<User> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Требуется вход' })
  }
  return user
}
