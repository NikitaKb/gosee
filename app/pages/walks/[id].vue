<template>
  <div class="walk-page">
    <div
      v-if="pending"
      class="walk-page__state"
    >
      Загрузка прогулки...
    </div>
    <div
      v-else-if="errorText"
      class="walk-page__state walk-page__state--err"
    >
      {{ errorText }}
    </div>
    <article
      v-else-if="walk"
      class="walk-hero-card"
      :class="{ 'walk-hero-card--has-panorama': hasPanorama }"
    >
      <div class="walk-hero-card__grid">
        <div class="walk-hero-card__left">
          <h1 class="walk-hero-card__title">
            {{ walk.title }}
          </h1>

          <div class="walk-hero-card__cover-wrap">
            <img
              v-if="walk.coverImage"
              :src="walk.coverImage"
              alt=""
              class="walk-hero-card__cover"
              width="400"
              height="300"
              loading="lazy"
            >
            <div
              v-else
              class="walk-hero-card__cover walk-hero-card__cover--placeholder"
              aria-hidden="true"
            >
              Нет фото
            </div>
          </div>

          <dl class="walk-hero-card__facts">
            <div>
              <dt>Название</dt>
              <dd>{{ walk.title }}</dd>
            </div>
            <div>
              <dt>Описание</dt>
              <dd>{{ walk.description || 'Описание не указано' }}</dd>
            </div>
            <div>
              <dt>Тип прогулки</dt>
              <dd class="walk-hero-card__mode-fact">
                <img
                  :src="modeIcon"
                  alt=""
                  class="walk-hero-card__fact-icon"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                {{ modeLabel }}
              </dd>
            </div>
            <div>
              <dt>Общая дистанция</dt>
              <dd>{{ walk.distanceKm.toFixed(1) }} км</dd>
            </div>
            <div>
              <dt>Примерное время в пути</dt>
              <dd>{{ durationLabel }}</dd>
            </div>
            <div v-if="walk.timeStart || walk.timeEnd">
              <dt>Время прогулки</dt>
              <dd>{{ walk.timeStart || '--:--' }} - {{ walk.timeEnd || '--:--' }}</dd>
            </div>
            <div>
              <dt>Начало</dt>
              <dd>{{ startAddress }}</dd>
            </div>
            <div>
              <dt>Конец</dt>
              <dd>{{ endAddress }}</dd>
            </div>
          </dl>

          <p class="walk-hero-card__author">
            Автор:
            <NuxtLink
              :to="`/users/${walk.creator.id}`"
              class="walk-hero-card__author-link"
            >
              <span class="walk-hero-card__author-name">{{ walk.creator.name }}</span>
              <span v-if="walk.creator.nickname">(@{{ walk.creator.nickname }})</span>
            </NuxtLink>
          </p>

          <div class="walk-hero-card__actions">
            <button
              type="button"
              class="walk-hero-card__fav"
              :class="{ 'walk-hero-card__fav--on': walk.favorited }"
              :disabled="favoritePending"
              :aria-label="walk.favorited ? 'В избранном' : 'В избранное'"
              @click="toggleFavorite"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <div
              class="walk-hero-card__rating"
              role="group"
              aria-label="Оценка маршрута"
            >
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="walk-hero-card__star"
                :class="{ 'walk-hero-card__star--active': (walk.myRating ?? 0) >= n }"
                :disabled="ratingPending || user?.id === walk.creator.id"
                :aria-pressed="(walk.myRating ?? 0) >= n"
                :aria-label="`Оценить на ${n}`"
                @click="setRating(n)"
              >
                ★
              </button>
            </div>
          </div>
        </div>

        <div class="walk-hero-card__right">
          <p class="walk-hero-card__panorama-label">
            Панорама маршрута
          </p>
          <client-only>
            <WalkPanoramaBlock
              v-if="walk.path.length >= 2"
              :path="walk.path"
            />
            <div
              v-else
              class="walk-hero-card__panorama-empty"
            >
              Недостаточно точек для превью панорамы.
            </div>
            <template #fallback>
              <div class="walk-hero-card__panorama-empty">
                Загрузка панорамы...
              </div>
            </template>
          </client-only>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { WalkDetails } from '~/types/walk'
import WalkPanoramaBlock from '~/components/walk/WalkPanoramaBlock.vue'
import iconBicycle from '~/assets/images/icons/bicycle.svg'
import iconCar from '~/assets/images/icons/car.svg'
import iconRoller from '~/assets/images/icons/roller.svg'
import iconWalking from '~/assets/images/icons/walking.svg'

const route = useRoute()
const { user, fetchUser } = useAuth()
const favoritePending = ref(false)
const ratingPending = ref(false)

const walkKey = `walk-${String(route.params.id ?? '')}`
const { data, pending, error } = await useAsyncData(walkKey, () =>
  $fetch<{ walk: WalkDetails }>(`/api/walks/${String(route.params.id ?? '')}`, {
    credentials: 'include',
  }),
)

const walk = computed(() => data.value?.walk ?? null)
const hasPanorama = computed(() => (walk.value?.path?.length ?? 0) >= 2)

const errorText = computed(() => {
  if (!error.value) {
    return ''
  }
  const e = error.value as { data?: { statusMessage?: string }; statusMessage?: string }
  return e.data?.statusMessage ?? e.statusMessage ?? 'Не удалось загрузить карточку прогулки'
})

const modeLabel = computed(() => {
  switch (walk.value?.travelModeId) {
    case 'walk': return 'Пешая'
    case 'run': return 'Пробежка'
    case 'bike': return 'Велосипед'
    case 'roller': return 'Ролики'
    default: return walk.value?.travelModeId ?? 'Прогулка'
  }
})

const modeIcon = computed(() => {
  switch (walk.value?.travelModeId) {
    case 'bike': return iconBicycle
    case 'car': return iconCar
    case 'roller': return iconRoller
    default: return iconWalking
  }
})

const durationLabel = computed(() => {
  const m = walk.value?.durationMinutes
  if (m == null || m <= 0) {
    return '—'
  }
  if (m < 60) {
    return `${m} мин`
  }
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} ч ${rest} мин` : `${h} ч`
})

function formatPoint(point: { lat: number; lng: number; label?: string | null } | undefined) {
  if (!point) {
    return 'Не указано'
  }
  return point.label?.trim() || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
}

const startAddress = computed(() => formatPoint(walk.value?.waypoints[0]))
const endAddress = computed(() => {
  const points = walk.value?.waypoints ?? []
  return formatPoint(points[points.length - 1])
})

onMounted(() => {
  fetchUser()
})

async function toggleFavorite() {
  const currentWalk = walk.value
  if (!currentWalk || favoritePending.value) {
    return
  }
  if (!user.value) {
    await navigateTo('/login')
    return
  }

  favoritePending.value = true
  const nextFavorited = !currentWalk.favorited
  try {
    if (nextFavorited) {
      await $fetch('/api/favorite', {
        method: 'POST',
        body: { walkId: currentWalk.id },
        credentials: 'include',
      })
    } else {
      await $fetch('/api/favorite', {
        method: 'DELETE',
        query: { walkId: currentWalk.id },
        credentials: 'include',
      })
    }
    currentWalk.favorited = nextFavorited
  } catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number }
    const code = err.statusCode ?? err.status
    if (code === 401) {
      await navigateTo('/login')
    } else if (code === 409 && nextFavorited) {
      currentWalk.favorited = true
    }
  } finally {
    favoritePending.value = false
  }
}

async function setRating(value: number) {
  const currentWalk = walk.value
  if (!currentWalk || ratingPending.value || user.value?.id === currentWalk.creator.id) {
    return
  }
  if (!user.value) {
    await navigateTo('/login')
    return
  }

  ratingPending.value = true
  try {
    await $fetch('/api/rating', {
      method: 'POST',
      body: { walkId: currentWalk.id, value },
      credentials: 'include',
    })
    const rating = await $fetch<{ average: number | null; count: number; myRating: number | null }>('/api/ratings', {
      query: { walkId: currentWalk.id },
      credentials: 'include',
    })
    currentWalk.avgRating = rating.average
    currentWalk.ratingsCount = rating.count
    currentWalk.myRating = rating.myRating
  } catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number }
    const code = err.statusCode ?? err.status
    if (code === 401) {
      await navigateTo('/login')
    }
  } finally {
    ratingPending.value = false
  }
}

watchEffect(() => {
  const w = walk.value
  if (w) {
    useHead({ title: `${w.title} - GoSee` })
  }
})
</script>

<style scoped>
.walk-page {
  box-sizing: border-box;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1a1a1a;
}

.walk-page__state {
  text-align: center;
  color: #666;
  padding: 2rem 0;
}

.walk-page__state--err {
  color: #b00020;
}

.walk-hero-card {
  background: #fff;
  border-radius: 22px;
  border: 1px solid #e8ecf3;
  box-shadow: 0 8px 32px rgba(15, 40, 90, 0.08);
  padding: clamp(1.1rem, 2.5vw, 1.75rem);
}

.walk-hero-card__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.walk-hero-card__left {
  display: grid;
  grid-template-columns: minmax(220px, 400px) minmax(0, 1fr);
  gap: 0.9rem 1.25rem;
  align-items: start;
}

.walk-hero-card__title {
  grid-column: 1 / -1;
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.walk-hero-card__cover-wrap {
  grid-column: 1;
  grid-row: 2 / span 4;
  margin: 0;
  align-self: stretch;
}

.walk-hero-card__cover {
  display: block;
  width: 100%;
  max-width: 400px;
  height: 100%;
  min-height: 280px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e8ecf3;
}

.walk-hero-card__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: linear-gradient(145deg, #e8ecf3, #f4f6fa);
  color: #8a9099;
  font-size: 0.9rem;
  font-weight: 600;
}

.walk-hero-card__stat-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #2b65ff;
}

.walk-hero-card__stat-icon--img,
.walk-hero-card__fact-icon {
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(34%) sepia(87%) saturate(2711%) hue-rotate(219deg) brightness(103%) contrast(101%);
}

.walk-hero-card__lead {
  grid-column: 2;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #8e8e8e;
}

.walk-hero-card__facts {
  grid-column: 2;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.walk-hero-card__facts > div {
  min-width: 0;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  background: #f6f8fc;
  border: 1px solid #e7edf7;
}

.walk-hero-card__facts dt {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: #667085;
}

.walk-hero-card__facts dd {
  margin: 0.15rem 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #384152;
  overflow-wrap: anywhere;
}

.walk-hero-card__mode-fact {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.walk-hero-card__fact-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.walk-hero-card__author {
  grid-column: 2;
  margin: 0;
  font-size: 0.85rem;
  color: #667085;
}

.walk-hero-card__author-link {
  margin-left: 0.25rem;
  text-decoration: none;
}

.walk-hero-card__author-link:hover .walk-hero-card__author-name {
  text-decoration: underline;
}

.walk-hero-card__author-name {
  font-weight: 600;
  color: #2b65ff;
}

.walk-hero-card__actions {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.walk-hero-card__fav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: #e8f0ff;
  color: #2b65ff;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.walk-hero-card__fav:hover {
  background: #d8e4ff;
}

.walk-hero-card__fav--on {
  background: #ffe8ef;
  color: #e91e63;
}

.walk-hero-card__fav--on:hover {
  background: #ffd6e5;
}

.walk-hero-card__fav:disabled {
  opacity: 0.55;
  cursor: wait;
}

.walk-hero-card__rating {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 0 0.55rem;
  border-radius: 14px;
  background: #f6f8fc;
  border: 1px solid #e7edf7;
}

.walk-hero-card__star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #c5ced9;
  font: inherit;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.12s ease,
    transform 0.12s ease;
}

.walk-hero-card__star:hover:not(:disabled) {
  color: #ffb300;
  transform: scale(1.08);
}

.walk-hero-card__star--active {
  color: #ffb300;
}

.walk-hero-card__star:disabled {
  opacity: 0.6;
  cursor: default;
}

.walk-hero-card__right {
  min-width: 0;
  width: 100%;
}

.walk-hero-card__right :deep(.walk-panorama),
.walk-hero-card__right :deep(.street-view),
.walk-hero-card__right :deep(.street-view__canvas) {
  min-height: 460px;
}

.walk-hero-card__panorama-label {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #667085;
}

.walk-hero-card__panorama-empty {
  min-height: 420px;
  border-radius: 16px;
  background: #eef1f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: #667085;
  font-size: 0.9rem;
}

@media (max-width: 920px) {
  .walk-hero-card__left {
    grid-template-columns: 1fr;
  }

  .walk-hero-card__title,
  .walk-hero-card__cover-wrap,
  .walk-hero-card__stats,
  .walk-hero-card__lead,
  .walk-hero-card__facts,
  .walk-hero-card__author,
  .walk-hero-card__actions {
    grid-column: 1;
  }

  .walk-hero-card__cover-wrap {
    grid-row: auto;
  }

  .walk-hero-card__cover {
    max-width: none;
    height: auto;
    min-height: 0;
    aspect-ratio: 16 / 10;
  }

  .walk-hero-card__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .walk-hero-card__right :deep(.walk-panorama),
  .walk-hero-card__right :deep(.street-view),
  .walk-hero-card__right :deep(.street-view__canvas) {
    min-height: 360px;
  }
}

@media (max-width: 640px) {
  .walk-hero-card--has-panorama .walk-hero-card__cover-wrap {
    display: none;
  }

  .walk-hero-card__title {
    margin-bottom: 0.75rem;
  }

  .walk-hero-card__facts {
    grid-template-columns: 1fr;
  }

  .walk-hero-card__panorama-empty {
    min-height: 320px;
  }

  .walk-hero-card__right :deep(.walk-panorama),
  .walk-hero-card__right :deep(.street-view),
  .walk-hero-card__right :deep(.street-view__canvas) {
    min-height: 300px;
  }
}
</style>
