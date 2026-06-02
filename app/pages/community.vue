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
      class="community-page__list community-page__skeleton-list"
      aria-label="Загрузка маршрутов"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="community-page__skeleton"
      >
        <span class="community-page__skeleton-image" />
        <span class="community-page__skeleton-content">
          <span class="community-page__skeleton-line community-page__skeleton-line--title" />
          <span class="community-page__skeleton-line community-page__skeleton-line--short" />
          <span class="community-page__skeleton-line community-page__skeleton-line--rating" />
          <span class="community-page__skeleton-line" />
          <span class="community-page__skeleton-line community-page__skeleton-line--medium" />
        </span>
      </div>
    </div>
    <div
      v-else-if="!walks.length"
      class="community-page__empty"
    >
      <img
        :src="goseeAnimIcon"
        alt=""
        class="community-page__empty-goose"
        width="84"
        height="90"
      >
      <h2 class="community-page__empty-title">
        Маршруты не найдены
      </h2>
      <p class="community-page__empty-text">
        Измените город или выберите другие фильтры.
      </p>
    </div>
    <div
      v-else
      class="community-page__list"
      role="list"
    >
      <div
        v-for="(w, index) in walks"
        :key="w.id"
        :ref="setRevealElement"
        class="community-page__item"
        :style="{ '--reveal-delay': `${Math.min(index, 5) * 70}ms` }"
        role="listitem"
      >
        <WalkPreviewCard
          variant="walk"
          :walk="w"
          community-mode
          :favorited="w.favorited === true"
          :favorite-disabled="pendingFavoriteId === w.id"
          :rating-disabled="pendingRatingId === w.id"
          @toggle-favorite="onToggleFavorite"
          @set-rating="onSetRating"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WalkSummary } from '~/types/walk'
import goseeAnimIcon from '~/assets/images/icons/goseeanim.svg'

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
const revealElements = new Set<HTMLElement>()
let revealObserver: IntersectionObserver | undefined
let revealReady = false
let revealFallbackTimer: ReturnType<typeof setTimeout> | undefined

function setRevealElement(element: Element | null) {
  if (!(element instanceof HTMLElement)) {
    return
  }
  revealElements.add(element)
  if (revealReady) {
    revealObserver?.observe(element)
  }
}

function setupRevealObserver() {
  if (!revealReady) {
    return
  }
  revealObserver?.disconnect()
  if (!import.meta.client || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('community-page__item--visible'))
    return
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }
        entry.target.classList.add('community-page__item--visible')
        revealObserver?.unobserve(entry.target)
      })
    },
    { threshold: 0.12 },
  )
  revealElements.forEach(element => revealObserver?.observe(element))
}

function startReveal() {
  if (revealFallbackTimer) {
    clearTimeout(revealFallbackTimer)
    revealFallbackTimer = undefined
  }
  revealReady = true
  setupRevealObserver()
}

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

watch(walks, async () => {
  revealObserver?.disconnect()
  revealElements.clear()
  await nextTick()
  setupRevealObserver()
})

onMounted(() => {
  fetchUser()
  window.addEventListener('gosee:page-transition-finished', startReveal, { once: true })
  revealFallbackTimer = setTimeout(startReveal, 1100)
})

onUnmounted(() => {
  revealObserver?.disconnect()
  if (revealFallbackTimer) {
    clearTimeout(revealFallbackTimer)
  }
  window.removeEventListener('gosee:page-transition-finished', startReveal)
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
  padding: 2.4rem 1rem 4rem;
  min-height: 60vh;
  background: #f7f9fc;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1a1a1a;
}

.community-page__intro {
  margin-bottom: 1.65rem;
}

.community-page__title {
  margin: 0 0 0.45rem;
  color: #172033;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 750;
  letter-spacing: -0.045em;
}

.community-page__lead {
  margin: 0;
  font-size: 1rem;
  color: #64748b;
  line-height: 1.55;
}

.community-page__filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem 1.25rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(218, 227, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14px 34px rgba(31, 65, 115, 0.08);
  backdrop-filter: blur(16px);
}

.community-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.community-page__label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #334155;
}

.community-page__input,
.community-page__select {
  box-sizing: border-box;
  width: 100%;
  min-height: 48px;
  padding: 0.7rem 0.9rem;
  border: 1px solid #dde5f0;
  border-radius: 14px;
  background: rgba(248, 250, 253, 0.92);
  font: inherit;
  font-size: 0.9375rem;
  color: #1a1a1a;
  outline: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.community-page__input:focus,
.community-page__select:focus {
  background: #fff;
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

.community-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 32rem;
  margin: 1.5rem auto 0;
  padding: 2.2rem 1.25rem;
  border: 1px solid #e3e9f2;
  border-radius: 22px;
  background: #fff;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.community-page__empty-goose {
  display: block;
  width: 84px;
  height: 90px;
  margin-bottom: 0.8rem;
  animation: empty-goose-step 0.8s ease-in-out infinite alternate;
}

.community-page__empty-title {
  margin: 0 0 0.45rem;
  color: #172033;
  font-size: 1.2rem;
}

.community-page__empty-text {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
}

.community-page__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.2rem;
}

.community-page__item {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.48s ease,
    transform 0.48s ease;
  transition-delay: var(--reveal-delay, 0ms);
}

.community-page__item--visible {
  opacity: 1;
  transform: translateY(0);
}

.community-page__skeleton {
  display: flex;
  gap: 1.15rem;
  min-height: 238px;
  padding: 1rem;
  border: 1px solid #e3e9f2;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.community-page__skeleton-image,
.community-page__skeleton-line {
  display: block;
  overflow: hidden;
  background: #edf1f6;
}

.community-page__skeleton-image::after,
.community-page__skeleton-line::after {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  content: '';
  animation: skeleton-shimmer 1.35s ease-in-out infinite;
  transform: translateX(-100%);
}

.community-page__skeleton-image {
  flex: 0 0 230px;
  border-radius: 16px;
}

.community-page__skeleton-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.7rem;
  padding-top: 0.2rem;
}

.community-page__skeleton-line {
  width: 100%;
  height: 0.85rem;
  border-radius: 999px;
}

.community-page__skeleton-line--title {
  width: 62%;
  height: 1.25rem;
}

.community-page__skeleton-line--short {
  width: 44%;
}

.community-page__skeleton-line--rating {
  height: 2.7rem;
  margin: 0.2rem 0;
  border-radius: 13px;
}

.community-page__skeleton-line--medium {
  width: 76%;
}

@keyframes skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

@keyframes empty-goose-step {
  to {
    transform: translateY(-7px) rotate(-2deg);
  }
}

@media (min-width: 860px) {
  .community-page {
    max-width: 1180px;
  }

  .community-page__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .community-page__list :deep(.walk-card) {
    align-content: start;
    height: 100%;
    box-sizing: border-box;
    padding: 1rem;
    border-color: rgba(218, 227, 240, 0.88);
    border-radius: 22px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
  }

  .community-page__list :deep(.walk-card:hover) {
    border-color: rgba(148, 163, 184, 0.55);
    box-shadow: 0 20px 42px rgba(15, 23, 42, 0.12);
    transform: translateY(-5px);
  }

  .community-page__list :deep(.walk-card__visual) {
    max-width: 230px;
  }

  .community-page__list :deep(.walk-card__carousel),
  .community-page__list :deep(.walk-card__img) {
    height: 100%;
  }

  .community-page__list :deep(.walk-card__carousel) {
    border-radius: 16px;
  }

  .community-page__list :deep(.walk-card__img) {
    aspect-ratio: auto;
  }

  .community-page__list :deep(.walk-card__rating-block) {
    border-color: #e7edf6;
    border-radius: 13px;
    background: #f7f9fc;
  }
}

@media (max-width: 640px) {
  .community-page__skeleton {
    flex-direction: column;
  }

  .community-page__skeleton-image {
    flex-basis: auto;
    aspect-ratio: 16 / 10;
  }
}

@media (prefers-reduced-motion: reduce) {
  .community-page__item {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .community-page__empty-goose,
  .community-page__skeleton-image::after,
  .community-page__skeleton-line::after {
    animation: none;
  }
}
</style>
