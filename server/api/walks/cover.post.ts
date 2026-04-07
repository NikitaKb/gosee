import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readMultipartFormData } from 'h3'
import { requireSessionUser } from '../../utils/session-user'

const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Файл не получен' })
  }
  const ext = ALLOWED_TYPES.get(file.type ?? '')
  if (!ext) {
    throw createError({ statusCode: 400, statusMessage: 'Допустимы JPEG, PNG или WebP' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Файл не больше 4 МБ' })
  }

  const dir = join(process.cwd(), 'public', 'uploads', 'walks')
  await mkdir(dir, { recursive: true })
  const filename = `${user.id}-${Date.now()}.${ext}`
  await writeFile(join(dir, filename), file.data)

  return { imageUrl: `/uploads/walks/${filename}` }
})
