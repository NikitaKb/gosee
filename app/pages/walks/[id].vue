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

          <div class="walk-hero-card__stats">
            <span class="walk-hero-card__stat">
              <svg
                class="walk-hero-card__stat-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="4"
                  r="2"
                />
                <path d="M10 22V12M14 22V12" />
                <path d="M8 12h8l-1 6H9l-1-6z" />
              </svg>
              {{ modeLabel }}
            </span>
            <span class="walk-hero-card__stat">
              <svg
                class="walk-hero-card__stat-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path d="M12 6v6l4 2" />
              </svg>
              {{ durationLabel }}
            </span>
            <span class="walk-hero-card__stat">
              <svg
                class="walk-hero-card__stat-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                />
              </svg>
              {{ walk.city }}
            </span>
          </div>

          <p
            v-if="walk.description"
            class="walk-hero-card__lead"
          >
            {{ walk.description }}
          </p>
          <p
            v-else-if="walk.theme"
            class="walk-hero-card__lead"
          >
            Тематика: {{ walk.theme }}
          </p>

          <dl class="walk-hero-card__facts">
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
          </dl>

          <p class="walk-hero-card__author">
            Автор:
            <span class="walk-hero-card__author-name">{{ walk.creator.name }}</span>
            <span v-if="walk.creator.nickname">(@{{ walk.creator.nickname }})</span>
          </p>

          <div class="walk-hero-card__actions">
            <NuxtLink
              to="/planning"
              class="walk-hero-card__cta"
            >
              Начать путешествие
            </NuxtLink>
            <button
              type="button"
              class="walk-hero-card__fav"
              disabled
              aria-label="Добавить в избранное (скоро)"
              title="Скоро"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <NuxtLink
            to="/profile"
            class="walk-hero-card__back"
          >
            Мой профиль
          </NuxtLink>
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
                Загрузка панорамы…
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

const route = useRoute()

const walkKey = `walk-${String(route.params.id ?? '')}`
const { data, pending, error } = await useAsyncData(walkKey, () =>
  $fetch<{ walk: WalkDetails }>(`/api/walks/${String(route.params.id ?? '')}`, {
    credentials: 'include',
  }),
)

const walk = computed(() => data.value?.walk ?? null)

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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 1.5rem 2rem;
  align-items: start;
}

.walk-hero-card__title {
  margin: 0 0 1rem;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.walk-hero-card__cover-wrap {
  margin-bottom: 0.85rem;
}

.walk-hero-card__cover {
  display: block;
  width: 100%;
  max-width: 400px;
  height: auto;
  aspect-ratio: 4 / 3;
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

.walk-hero-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.2rem;
  margin-bottom: 0.85rem;
  font-size: 0.875rem;
  color: #5a6578;
}

.walk-hero-card__stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.walk-hero-card__stat-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #2b65ff;
}

.walk-hero-card__lead {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #8e8e8e;
  max-width: 52ch;
}

.walk-hero-card__facts {
  margin: 0 0 1rem;
  display: grid;
  gap: 0.65rem;
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
}

.walk-hero-card__author {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #667085;
}

.walk-hero-card__author-name {
  font-weight: 600;
  color: #384152;
}

.walk-hero-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}

.walk-hero-card__cta {
  flex: 1;
  min-width: 200px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.25rem;
  border-radius: 14px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;
}

.walk-hero-card__cta:hover {
  background: #1f52d8;
}

.walk-hero-card__fav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: #e8f0ff;
  color: #2b65ff;
  cursor: not-allowed;
  opacity: 0.65;
}

.walk-hero-card__back {
  font-size: 0.86rem;
  font-weight: 600;
  color: #2b65ff;
  text-decoration: none;
}

.walk-hero-card__back:hover {
  text-decoration: underline;
}

.walk-hero-card__right {
  min-width: 0;
}

.walk-hero-card__panorama-label {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #667085;
}

.walk-hero-card__panorama-empty {
  min-height: 320px;
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
  .walk-hero-card__grid {
    grid-template-columns: 1fr;
  }

  .walk-hero-card__cover {
    max-width: none;
  }
}
</style>
