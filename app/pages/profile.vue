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
      v-else-if="profile"
      :profile="profile"
      @updated="onProfileUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/profile'

const profile = ref<UserProfile | null>(null)
const pending = ref(true)
const fetchError = ref('')

function onProfileUpdated(next: UserProfile) {
  profile.value = next
}

const fetchProfile = import.meta.server ? useRequestFetch() : $fetch

try {
  const res = await fetchProfile<{ profile: UserProfile }>('/api/profile/me', {
    credentials: 'include',
  })
  profile.value = res.profile
}
catch (e: unknown) {
  const err = e as { statusCode?: number; status?: number; statusMessage?: string }
  const code = err.statusCode ?? err.status
  if (code === 401) {
    await navigateTo('/login')
  }
  else {
    fetchError.value
      = err.statusMessage ?? 'Не удалось загрузить профиль'
  }
}
finally {
  pending.value = false
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
