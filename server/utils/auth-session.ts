import { deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'
import { SignJWT, jwtVerify } from 'jose'

export const AUTH_COOKIE = 'gosee_token'

function getSecretBytes(event: H3Event): Uint8Array {
  const config = useRuntimeConfig(event)
  const s = String(config.authSecret ?? '')
  if (s.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Задайте NUXT_AUTH_SECRET не короче 32 символов',
    })
  }
  return new TextEncoder().encode(s)
}

export async function signSessionToken(
  userId: string,
  event: H3Event,
  remember: boolean,
): Promise<string> {
  const secret = getSecretBytes(event)
  const exp = remember ? '30d' : '7d'
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret)
}

export async function verifySessionToken(
  token: string,
  event: H3Event,
): Promise<string | null> {
  try {
    const secret = getSecretBytes(event)
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    const sub = payload.sub
    return typeof sub === 'string' ? sub : null
  }
  catch {
    return null
  }
}

export function writeSessionCookie(
  event: H3Event,
  token: string,
  remember: boolean,
): void {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, AUTH_COOKIE, { path: '/' })
}

export function readSessionToken(event: H3Event): string | undefined {
  return getCookie(event, AUTH_COOKIE)
}
