<template>
  <div class="community-page">
    <header class="community-page__intro">
      <h1 class="community-page__title">
        Сообщество
      </h1>
      <p class="community-page__lead">
        Маршруты, созданные пользователями GoSee
      </p>
    </header>

    <section
      class="community-page__filters"
      aria-label="Поиск и фильтры"
    >
      <div class="community-page__field">
        <label
          class="community-page__label"
          for="community-city"
        >Город</label>
        <input
          id="community-city"
          v-model="cityInput"
          type="search"
          class="community-page__input"
          placeholder="Название города…"
          autocomplete="address-level2"
          enterkeyhint="search"
          @keydown.enter.prevent="applyCitySearchNow"
        >
      </div>
      <div class="community-page__field">
        <label
          class="community-page__label"
          for="community-pace"
        >Темп</label>
        <select
          id="community-pace"
          v-model="pace"
          class="community-page__select"
        >
          <option value="">
            Любой
          </option>
          <option
            v-for="p in paceOptions"
            :key="p"
            :value="p"
          >
            {{ p }}
          </option>
        </select>
      </div>
      <div class="community-page__field">
        <label
          class="community-page__label"
          for="community-mode"
        >Тип</label>
        <select
          id="community-mode"
          v-model="travelModeId"
          class="community-page__select"
        >
          <option value="">
            Все
          </option>
          <option value="walk">
            Прогулка
          </option>
          <option value="bike">
            Велосипед
          </option>
        </select>
      </div>
    </section>

    <p
      v-if="loadError"
      class="community-page__error"
      role="alert"
    >
      {{ loadError }}
    </p>

    <div
      v-if="pending"
      class="community-page__state"
    >
      Загрузка маршрутов…
    </div>
    <div
      v-else-if="!walks.length"
      class="community-page__state"
    >
      Нет маршрутов по заданным условиям. Измените город или фильтры.
    </div>
    <div
      v-else
      class="community-page__list"
      role="list"
    >
      <WalkPreviewCard
        v-for="w in walks"
        :key="w.id"
        variant="walk"
        :walk="w"
        community-mode
        :favorited="w.favorited === true"
        :favorite-disabled="pendingFavoriteId === w.id"
        :rating-disabled="pendingRatingId === w.id"
        role="listitem"
        @toggle-favorite="onToggleFavorite"
        @set-rating="onSetRating"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WalkSummary } from '~/types/walk'

useHead({
  title: 'Сообщество — GoSee',
})

const { user, fetchUser } = useAuth()

const cityInput = ref('')
const debouncedCity = ref('')
let cityDebounceTimer: ReturnType<typeof setTimeout> | undefined

function scheduleCityDebounce() {
  if (cityDebounceTimer) {
    clearTimeout(cityDebounceTimer)
  }
  cityDebounceTimer = setTimeout(() => {
    debouncedCity.value = cityInput.value.trim()
  }, 400)
}

/** Явный getter — надёжно отслеживает ввод; иначе watch(ref) в ряде случаев не срабатывает как ожидается. */
watch(() => cityInput.value, () => {
  scheduleCityDebounce()
})

/** Сразу применить строку поиска (Enter), без ожидания debounce. */
function applyCitySearchNow() {
  if (cityDebounceTimer) {
    clearTimeout(cityDebounceTimer)
  }
  debouncedCity.value = cityInput.value.trim()
}

onUnmounted(() => {
  if (cityDebounceTimer) {
    clearTimeout(cityDebounceTimer)
  }
})

const pace = ref('')
const travelModeId = ref<'' | 'walk' | 'bike'>('')
const walks = ref<WalkSummary[]>([])
const paceOptions = ref<string[]>([])
const pending = ref(true)
const loadError = ref('')
const pendingFavoriteId = ref<string | null>(null)
const pendingRatingId = ref<string | null>(null)

async function loadRoutes(silent = false) {
  if (!silent) {
    pending.value = true
    loadError.value = ''
  }
  try {
    const query: Record<string, string> = {}
    if (debouncedCity.value) {
      query.city = debouncedCity.value
    }
    if (pace.value) {
      query.pace = pace.value
    }
    if (travelModeId.value) {
      query.travelModeId = travelModeId.value
    }
    const res = await $fetch<{ walks: WalkSummary[]; paceOptions: string[] }>('/api/routes', {
      query,
      credentials: 'include',
    })
    walks.value = res.walks
    paceOptions.value = res.paceOptions
    loadError.value = ''
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    if (!silent) {
      loadError.value = err.data?.statusMessage ?? err.statusMessage ?? 'Не удалось загрузить маршруты'
      walks.value = []
    }
  }
  finally {
    if (!silent) {
      pending.value = false
    }
  }
}

watch(
  [debouncedCity, pace, travelModeId],
  () => {
    void loadRoutes()
  },
  { immediate: true },
)

onMounted(() => {
  fetchUser()
})

async function onSetRating(walkId: string, value: number) {
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  pendingRatingId.value = walkId
  try {
    await $fetch('/api/rating', {
      method: 'POST',
      body: { walkId, value },
      credentials: 'include',
    })
    await loadRoutes(true)
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number }
    const code = err.statusCode ?? err.status
    if (code === 401) {
      await navigateTo('/login')
    }
  }
  finally {
    pendingRatingId.value = null
  }
}

async function onToggleFavorite(walkId: string) {
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  const idx = walks.value.findIndex(x => x.id === walkId)
  if (idx < 0) {
    return
  }
  const cur = walks.value[idx]!
  const nextFav = !cur.favorited
  pendingFavoriteId.value = walkId
  try {
    if (nextFav) {
      await $fetch('/api/favorite', {
        method: 'POST',
        body: { walkId },
        credentials: 'include',
      })
    }
    else {
      await $fetch('/api/favorite', {
        method: 'DELETE',
        query: { walkId },
        credentials: 'include',
      })
    }
    walks.value[idx] = { ...cur, favorited: nextFav }
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number; data?: { statusMessage?: string } }
    const code = err.statusCode ?? err.status
    if (code === 401) {
      await navigateTo('/login')
    }
    else if (code === 409 && nextFav) {
      walks.value[idx] = { ...cur, favorited: true }
    }
  }
  finally {
    pendingFavoriteId.value = null
  }
}
</script>

<style scoped>
.community-page {
  box-sizing: border-box;
  max-width: 954px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
  min-height: 60vh;
  background: #f5f7fa;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1a1a1a;
}

.community-page__intro {
  margin-bottom: 1.25rem;
}

.community-page__title {
  margin: 0 0 0.35rem;
  font-size: clamp(1.45rem, 3.5vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.community-page__lead {
  margin: 0;
  font-size: 0.95rem;
  color: #8e8e8e;
  line-height: 1.45;
}

.community-page__filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem 1.25rem;
  padding: 1.15rem 1.1rem;
  margin-bottom: 1.25rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e8ecf2;
  box-shadow: 0 4px 20px rgba(15, 30, 60, 0.05);
}

.community-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.community-page__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #444;
}

.community-page__input,
.community-page__select {
  box-sizing: border-box;
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  border: 1px solid #e0e6ef;
  background: #fff;
  font: inherit;
  font-size: 0.9375rem;
  color: #1a1a1a;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.community-page__input:focus,
.community-page__select:focus {
  border-color: #2b65ff;
  box-shadow: 0 0 0 3px rgba(43, 101, 255, 0.15);
}

.community-page__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6578' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

.community-page__error {
  margin: 0 0 1rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: #fff1f1;
  border: 1px solid #f2c2c2;
  color: #9b2424;
  font-size: 0.9rem;
}

.community-page__state {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.95rem;
  color: #666;
}

.community-page__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
