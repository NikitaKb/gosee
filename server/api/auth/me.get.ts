import prisma from '../../utils/prisma'
import {
  clearSessionCookie,
  readSessionToken,
  verifySessionToken,
} from '../../utils/auth-session'
import { toPublicUser } from '../../utils/auth-user'

export default defineEventHandler(async (event) => {
  const token = readSessionToken(event)
  if (!token) {
    return { user: null }
  }

  const userId = await verifySessionToken(token, event)
  if (!userId) {
    clearSessionCookie(event)
    return { user: null }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    clearSessionCookie(event)
    return { user: null }
  }

  return { user: toPublicUser(user) }
})
