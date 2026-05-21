<template>
  <div class="profile-page">
    <div
      v-if="pending"
      class="profile-page__state"
    >
      Загрузка профиля…
    </div>
    <div
      v-else-if="fetchError"
      class="profile-page__state profile-page__state--err"
    >
      {{ fetchError }}
    </div>
    <ProfileUser
      v-else-if="payload?.profile"
      mode="public"
      :profile="payload.profile"
      :favorite-walks="[]"
      :is-following="payload.isFollowing"
      :follow-disabled="followLoading"
      @follow-toggle="onFollowToggle"
    />
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/profile'

const route = useRoute()
const { user, fetchUser } = useAuth()

const payload = ref<{
  profile: UserProfile
  isFollowing: boolean
  isSelf: boolean
} | null>(null)
const pending = ref(true)
const fetchError = ref('')
const followLoading = ref(false)

type UserPayload = {
  profile: UserProfile
  isFollowing: boolean
  isSelf: boolean
}

function fetchUserPayload(id: string) {
  const url = `/api/users/${encodeURIComponent(id)}`
  return import.meta.server
    ? useRequestFetch()<UserPayload>(url, { credentials: 'include' })
    : $fetch<UserPayload>(url, { credentials: 'include' })
}

async function load() {
  pending.value = true
  fetchError.value = ''
  const id = String(route.params.id ?? '')
  try {
    const res = await fetchUserPayload(id)
    if (res.isSelf) {
      await navigateTo('/profile')
      return
    }
    payload.value = res
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number; statusMessage?: string }
    const code = err.statusCode ?? err.status
    if (code === 404) {
      fetchError.value = 'Пользователь не найден'
    }
    else {
      fetchError.value = err.statusMessage ?? 'Не удалось загрузить профиль'
    }
    payload.value = null
  }
  finally {
    pending.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    load()
  },
  { immediate: true },
)

onMounted(() => {
  fetchUser()
})

useHead(() => ({
  title: payload.value?.profile
    ? `${payload.value.profile.name} — GoSee`
    : 'Профиль — GoSee',
}))

async function onFollowToggle() {
  const p = payload.value
  if (!p) {
    return
  }
  const targetId = p.profile.id
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  followLoading.value = true
  try {
    if (p.isFollowing) {
      await $fetch('/api/follow', {
        method: 'DELETE',
        query: { userId: targetId },
        credentials: 'include',
      })
    }
    else {
      await $fetch('/api/follow', {
        method: 'POST',
        body: { userId: targetId },
        credentials: 'include',
      })
    }
    const res = await fetchUserPayload(targetId)
    if (!res.isSelf) {
      payload.value = res
    }
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number }
    const code = err.statusCode ?? err.status
    if (code === 401) {
      await navigateTo('/login')
    }
  }
  finally {
    followLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  box-sizing: border-box;
  max-width: 954px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
  min-height: 60vh;
  background: #f5f7fa;
}

.profile-page__state {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 1rem;
  color: #555;
}

.profile-page__state--err {
  color: #b00020;
}
</style>
