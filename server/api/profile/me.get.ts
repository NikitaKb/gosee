import { requireSessionUser } from '../../utils/session-user'
import { toUserProfile } from '../../utils/profile-map'

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)
  return { profile: toUserProfile(user) }
})
