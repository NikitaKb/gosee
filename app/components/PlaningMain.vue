<template>
  <div class="home-page">
    <section class="home-hero">
      <div class="home-hero__card">
        <h1 class="home-hero__title">
          Планируйте свою прогулку онлайн
        </h1>

        <div class="home-hero__fields">
          <label class="home-hero__field">
            <img
              :src="geoIcon"
              alt=""
              class="home-hero__field-icon"
              width="20"
              height="28"
            >
            <TextField
              v-model="destination"
              placeholder="Куда хотите поехать..."
              embedded
              class="home-hero__field-input"
            />
          </label>
          <label class="home-hero__field">
            <img
              :src="roadIcon"
              alt=""
              class="home-hero__field-icon"
              width="22"
              height="22"
            >
            <TextField
              v-model="travelType"
              placeholder="Тип путешествия"
              embedded
              class="home-hero__field-input"
            />
          </label>
        </div>

        <ButtonBlue
          type="button"
          class="home-hero__submit"
          @click="onSearch"
        >
          <span class="home-hero__submit-inner">
            <img
              :src="searchIcon"
              alt=""
              class="home-hero__submit-icon"
              width="20"
              height="20"
            >
            Найти подходящий маршрут
          </span>
        </ButtonBlue>

        <ul class="home-hero__stats">
          <li
            v-for="row in stats"
            :key="row.id"
            class="home-hero__stat"
          >
            <span class="home-hero__stat-value">{{ row.value }}</span>
            <span class="home-hero__stat-label">{{ row.label }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="home-section home-section--white">
      <div class="home-section__inner">
        <header class="home-section__header">
          <h2 class="home-section__title">
            Популярные направления
          </h2>
          <p class="home-section__lead">
            Исследуйте самые востребованные места для путешествий и прогулок.
          </p>
        </header>

        <div
          v-if="popularDestinations.length"
          class="destination-grid"
        >
          <article
            v-for="place in popularDestinations"
            :key="place.id"
            class="destination-card"
          >
            <div class="destination-card__image-wrap">
              <img
                :src="place.image"
                :alt="place.title"
                class="destination-card__image"
                width="360"
                height="220"
                loading="lazy"
              >
              <span class="destination-card__badge">{{ place.badge }}</span>
            </div>
            <div class="destination-card__body">
              <h3 class="destination-card__title">
                {{ place.title }}
              </h3>
              <div class="destination-card__meta">
                <span>
                  <img
                    :src="geoIcon"
                    alt=""
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                  {{ place.country }}
                </span>
                <span>
                  <img
                    :src="starIcon"
                    alt=""
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                  {{ place.rating }}
                </span>
              </div>
              <NuxtLink
                :to="place.to"
                class="destination-card__link"
              >
                Подробнее
              </NuxtLink>
            </div>
          </article>
        </div>
        <p
          v-else
          class="home-section__empty"
        >
          Пока нет опубликованных маршрутов. Создайте первый маршрут, и он появится здесь.
        </p>
      </div>
    </section>

    <section class="home-section home-section--blue-soft">
      <div class="home-section__inner">
        <header class="home-section__header">
          <h2 class="home-section__title">
            Почему выбирают нас
          </h2>
          <p class="home-section__lead">
            Планируйте прогулку заранее, сохраняйте маршруты и открывайте новые места вместе с GoSee.
          </p>
        </header>

        <div class="benefit-grid">
          <article
            v-for="item in benefits"
            :key="item.id"
            class="benefit-card"
          >
            <span class="benefit-card__icon-wrap">
              <img
                :src="item.icon"
                alt=""
                class="benefit-card__icon"
                width="28"
                height="28"
                aria-hidden="true"
              >
            </span>
            <h3 class="benefit-card__title">
              {{ item.title }}
            </h3>
            <p class="benefit-card__text">
              {{ item.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="home-cta">
      <div class="home-cta__inner">
        <span class="home-cta__icon-wrap">
          <img
            :src="panoramaIcon"
            alt=""
            class="home-cta__icon"
            width="42"
            height="42"
            aria-hidden="true"
          >
        </span>
        <h2 class="home-cta__title">
          Готовы построить маршрут?
        </h2>
        <p class="home-cta__text">
          Выберите точки прогулки, добавьте фото и посмотрите маршрут на карте перед публикацией.
        </p>
        <NuxtLink
          to="/planning"
          class="home-cta__link"
        >
          <img
            :src="mapIcon"
            alt=""
            width="20"
            height="20"
            aria-hidden="true"
          >
          Начать планирование
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { WalkSummary } from '~/types/walk'
import geoIcon from '~/assets/images/icons/geo.svg'
import mapIcon from '~/assets/images/icons/map.svg'
import panoramaIcon from '~/assets/images/icons/panorama.svg'
import roadIcon from '~/assets/images/icons/road.svg'
import searchIcon from '~/assets/images/icons/search.svg'
import shieldIcon from '~/assets/images/icons/shield.svg'
import starIcon from '~/assets/images/icons/star.svg'
import walkingIcon from '~/assets/images/icons/walking.svg'

const destination = ref('')
const travelType = ref('')

const { data: routesData } = await useAsyncData('home-popular-routes', () =>
  $fetch<{ walks: WalkSummary[]; paceOptions: string[] }>('/api/routes', {
    credentials: 'include',
  }),
)

const stats = [
  { id: 'd', value: '500+', label: 'Направлений' },
  { id: 'u', value: '10000+', label: 'Пользователей' },
  { id: 'c', value: '50+', label: 'Городов России' },
  { id: 'r', value: '4.9', label: 'Рейтинг' },
] as const

const popularDestinations = computed(() =>
  (routesData.value?.walks ?? []).slice(0, 3).map(w => ({
    id: w.id,
    title: w.title,
    country: w.city || 'Россия',
    rating: formatRating(w.avgRating),
    badge: formatBadge(w),
    image: w.coverImage || '/uploads/walks/cmnp7pkck0000hokwb6eyi4yn-1775609358539.jpg',
    to: `/walks/${w.id}`,
  })),
)

const benefits = [
  {
    id: 'planning',
    title: 'Умное планирование',
    text: 'Собирайте маршрут из точек на карте и заранее оценивайте путь.',
    icon: mapIcon,
  },
  {
    id: 'tech',
    title: 'Панорамы маршрута',
    text: 'Смотрите путь через панорамы и проверяйте прогулку до выхода.',
    icon: panoramaIcon,
  },
  {
    id: 'privacy',
    title: 'Защита данных',
    text: 'Ваши маршруты и профиль хранятся аккуратно и доступны только там, где нужно.',
    icon: shieldIcon,
  },
  {
    id: 'community',
    title: 'Сообщество туристов',
    text: 'Находите идеи у других пользователей и делитесь своими прогулками.',
    icon: walkingIcon,
  },
] as const

function onSearch() {
  const query: Record<string, string> = {}
  if (destination.value.trim()) {
    query.city = destination.value.trim()
  }
  if (travelType.value.trim()) {
    query.type = travelType.value.trim()
  }
  navigateTo({ path: '/planning', query })
}

function formatRating(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return '—'
  }
  return value.toFixed(1)
}

function formatBadge(walk: WalkSummary) {
  if (walk.theme?.trim()) {
    return walk.theme.trim()
  }
  switch (walk.travelModeId) {
    case 'bike': return 'Велосипед'
    case 'car': return 'Авто'
    case 'roller': return 'Ролики'
    case 'run': return 'Бег'
    default: return 'Пешая'
  }
}
</script>

<style scoped>
.home-page {
  width: 100%;
  background: #fff;
  color: #111827;
}

.home-hero {
  box-sizing: border-box;
  min-height: clamp(560px, 72vh, 720px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem 4rem;
  background:
    radial-gradient(circle at 18% 18%, rgba(210, 237, 255, 0.9), transparent 30%),
    linear-gradient(105deg, #e7f6ff 0%, #f7fbff 48%, #ffffff 100%);
}

.home-hero__card {
  box-sizing: border-box;
  width: min(100%, 1180px);
  padding: clamp(1.35rem, 4vw, 2rem);
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid #eef2f8;
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(20, 85, 170, 0.08);
}

.home-hero__title,
.home-section__title,
.home-cta__title {
  margin: 0;
  color: #1a5fff;
  font-size: clamp(1.35rem, 2.6vw, 1.75rem);
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
}

.home-hero__title {
  margin-bottom: 1.75rem;
}

.home-hero__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.home-hero__field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 58px;
  padding: 0 1rem;
  background: #fff;
  border: 1px solid #dfe5ef;
  border-radius: 8px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.home-hero__field:focus-within {
  border-color: #1a5fff;
  box-shadow: 0 0 0 3px rgba(26, 95, 255, 0.12);
}

.home-hero__field-icon,
.destination-card__meta img,
.benefit-card__icon {
  flex-shrink: 0;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(2876%)
    hue-rotate(212deg) brightness(98%) contrast(104%);
}

.home-hero__field-input {
  flex: 1;
  min-width: 0;
}

.home-hero__submit {
  width: 100%;
  margin-bottom: 1.45rem;
}

.home-hero__submit :deep(.btn-blue) {
  width: 100%;
  min-height: 46px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
}

.home-hero__submit-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}

.home-hero__submit-icon {
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.home-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0.3rem 0 0;
  list-style: none;
}

.home-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.home-hero__stat-value {
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  font-weight: 700;
  line-height: 1.1;
  color: #1a5fff;
}

.home-hero__stat-label {
  color: #111827;
  font-size: 0.95rem;
  line-height: 1.25;
}

.home-section {
  box-sizing: border-box;
  padding: clamp(3rem, 7vw, 4.8rem) 1rem;
}

.home-section--white {
  background: #fff;
}

.home-section--blue-soft {
  background:
    radial-gradient(circle at 12% 18%, rgba(211, 238, 255, 0.85), transparent 34%),
    linear-gradient(105deg, #e8f6ff 0%, #f8fcff 55%, #ffffff 100%);
}

.home-section__inner {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.home-section__header {
  margin: 0 auto 2.2rem;
  text-align: center;
}

.home-section__lead {
  max-width: 620px;
  margin: 1rem auto 0;
  color: #3f4756;
  font-size: 0.95rem;
  line-height: 1.55;
}

.home-section__empty {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.25rem;
  border: 1px solid #dfe5ef;
  border-radius: 8px;
  background: #fff;
  color: #3f4756;
  text-align: center;
}

.destination-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.destination-card {
  overflow: hidden;
  border: 1px solid #dfe5ef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(16, 35, 70, 0.04);
}

.destination-card__image-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.destination-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.destination-card__badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  background: #1a5fff;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.destination-card__body {
  padding: 0.9rem;
}

.destination-card__title {
  margin: 0 0 0.55rem;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
}

.destination-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.85rem;
  color: #111827;
}

.destination-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  line-height: 1.3;
}

.destination-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 170px);
  min-height: 36px;
  border-radius: 8px;
  background: #1a5fff;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.destination-card__link:hover {
  background: #0d4fe6;
  color: #fff;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.benefit-card {
  min-height: 210px;
  padding: 1.6rem 1rem;
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.benefit-card__icon-wrap,
.home-cta__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dceaff;
}

.benefit-card__icon-wrap {
  width: 48px;
  height: 48px;
  margin-bottom: 1.25rem;
}

.benefit-card__title {
  margin: 0 0 0.85rem;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.benefit-card__text {
  margin: 0;
  color: #111827;
  font-size: 0.9rem;
  line-height: 1.35;
}

.home-cta {
  box-sizing: border-box;
  padding: 3.8rem 1rem;
  background: #1a5fff;
  color: #fff;
}

.home-cta__inner {
  width: min(100%, 1180px);
  margin: 0 auto;
  text-align: center;
}

.home-cta__icon-wrap {
  width: 62px;
  height: 62px;
  margin-bottom: 1.4rem;
  background: rgba(255, 255, 255, 0.16);
}

.home-cta__icon {
  filter: brightness(0) invert(1);
}

.home-cta__title {
  color: #fff;
}

.home-cta__text {
  max-width: 560px;
  margin: 1rem auto 1.25rem;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.95rem;
  line-height: 1.55;
}

.home-cta__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-width: min(100%, 310px);
  min-height: 44px;
  padding: 0 1.35rem;
  border-radius: 12px;
  background: #fff;
  color: #1a5fff;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.home-cta__link:hover {
  background: #edf3ff;
  color: #1a5fff;
  transform: translateY(-1px);
}

.home-cta__link img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(2876%)
    hue-rotate(212deg) brightness(98%) contrast(104%);
}

@media (max-width: 860px) {
  .home-hero {
    min-height: auto;
    padding-top: 3rem;
  }

  .destination-grid,
  .benefit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-hero__fields,
  .home-hero__stats,
  .destination-grid,
  .benefit-grid {
    grid-template-columns: 1fr;
  }

  .home-hero__card {
    border-radius: 14px;
  }

  .home-hero__stat {
    align-items: center;
    text-align: center;
  }

  .destination-card__link,
  .home-cta__link {
    width: 100%;
  }
}
</style>
