import { clearSessionCookie } from '../../utils/auth-session'

export default defineEventHandler((event) => {
  clearSessionCookie(event)
  return { ok: true }
})
