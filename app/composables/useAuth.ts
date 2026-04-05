export type AuthUser = {
  id: string
  email: string
  name: string
  nickname: string | null
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  async function fetchUser() {
    try {
      const fetcher = import.meta.server ? useRequestFetch() : $fetch
      const res = await fetcher<{ user: AuthUser | null }>('/api/auth/me')
      user.value = res.user
    }
    catch {
      user.value = null
    }
  }

  async function register(body: {
    name: string
    nickname?: string
    email: string
    password: string
    passwordConfirm: string
  }) {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body,
      credentials: 'include',
    })
    user.value = res.user
  }

  async function login(body: {
    identity: string
    password: string
    remember?: boolean
  }) {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body,
      credentials: 'include',
    })
    user.value = res.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    user.value = null
  }

  const displayName = computed(() => {
    const u = user.value
    if (!u) {
      return ''
    }
    return (u.nickname || u.name).trim()
  })

  return {
    user,
    displayName,
    fetchUser,
    register,
    login,
    logout,
  }
}
