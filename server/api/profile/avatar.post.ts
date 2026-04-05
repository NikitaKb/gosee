import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readMultipartFormData } from 'h3'
import prisma from '../../utils/prisma'
import { requireSessionUser } from '../../utils/session-user'
import { toUserProfile } from '../../utils/profile-map'

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Нет данных' })
  }
  const file = parts.find(p => p.name === 'file' && p.data?.length)
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Файл не получен' })
  }
  const mime = file.type ?? ''
  const ext = ALLOWED_TYPES.get(mime)
  if (!ext) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Допустимы изображения JPEG, PNG, WebP или GIF',
    })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Файл не больше 2 МБ',
    })
  }
  const dir = join(process.cwd(), 'public', 'uploads', 'avatars')
  await mkdir(dir, { recursive: true })
  const filename = `${user.id}-${Date.now()}.${ext}`
  const fsPath = join(dir, filename)
  await writeFile(fsPath, file.data)
  const publicUrl = `/uploads/avatars/${filename}`
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatar: publicUrl },
  })
  return { profile: toUserProfile(updated) }
})
