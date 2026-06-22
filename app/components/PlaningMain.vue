<template>
  <div class="home-page">
    <section
      class="home-hero"
      :style="{ '--home-hero-image': `url(${moscowHeroImage})` }"
    >
      <div class="home-hero__card home-reveal">
        <p class="home-hero__eyebrow">
          Маршруты для прогулок по городу
        </p>
        <h1 class="home-hero__title">
          Планируйте свою прогулку онлайн
        </h1>
        <p class="home-hero__lead">
          Соберите маршрут на карте, заранее посмотрите панорамы улиц
          и поделитесь прогулкой с сообществом.
        </p>

        <div class="home-search">
          <div class="home-search__fields">
            <label class="home-search__field">
              <img
                :src="geoIcon"
                alt=""
                class="home-search__field-icon"
                width="20"
                height="28"
              >
              <TextField
                v-model="destination"
                placeholder="Куда хотите пойти?"
                embedded
                class="home-search__field-input"
              />
            </label>
            <label class="home-search__field">
              <img
                :src="roadIcon"
                alt=""
                class="home-search__field-icon"
                width="22"
                height="22"
              >
              <TextField
                v-model="travelType"
                placeholder="Пешком, вело, авто..."
                embedded
                class="home-search__field-input"
              />
            </label>
          </div>

          <ButtonBlue
            type="button"
            class="home-search__submit"
            @click="onSearch"
          >
            <span class="home-search__submit-inner">
              <img
                :src="searchIcon"
                alt=""
                class="home-search__submit-icon"
                width="20"
                height="20"
              >
              Найти подходящий маршрут
            </span>
          </ButtonBlue>
        </div>

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

    <section class="home-section home-section--routes">
      <div class="home-section__inner">
        <header class="home-section__header home-reveal">
          <p class="home-section__eyebrow">
            Куда отправиться
          </p>
          <h2 class="home-section__title">
            Популярные маршруты
          </h2>
          <p class="home-section__lead">
            Идеи для прогулок появляются из опубликованных маршрутов сообщества.
          </p>
        </header>

        <div
          v-if="popularDestinations.length"
          class="destination-grid"
        >
          <article
            v-for="(place, index) in popularDestinations"
            :key="place.id"
            class="destination-card home-reveal"
            :style="{ transitionDelay: `${index * 90}ms` }"
            role="link"
            tabindex="0"
            @click="navigateTo(place.to)"
            @keydown.enter.prevent="navigateTo(place.to)"
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
            </div>
          </article>
        </div>
        <p
          v-else
          class="home-section__empty home-reveal"
        >
          Пока нет опубликованных маршрутов. Создайте первый маршрут, и он появится здесь.
        </p>
      </div>
    </section>

    <section class="home-story">
      <div class="home-story__inner">
        <header class="home-section__header home-reveal">
          <p class="home-section__eyebrow">
            Как это работает
          </p>
          <h2 class="home-section__title">
            От идеи до прогулки за несколько спокойных шагов
          </h2>
        </header>

        <div class="story-track">
          <article
            v-for="(step, index) in storySteps"
            :key="step.id"
            class="story-step home-reveal"
            :style="{ transitionDelay: `${index * 80}ms` }"
          >
            <span class="story-step__icon">
              <img
                :src="step.icon"
                alt=""
                width="24"
                height="24"
                aria-hidden="true"
              >
            </span>
            <h3 class="story-step__title">
              {{ step.title }}
            </h3>
            <p class="story-step__text">
              {{ step.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="home-section home-section--benefits">
      <div class="home-section__inner">
        <header class="home-section__header home-reveal">
          <p class="home-section__eyebrow">
            Почему GoSee
          </p>
          <h2 class="home-section__title">
            Сервис для маршрутов, которые ощущаются живыми
          </h2>
          <p class="home-section__lead">
            Планируйте заранее, сохраняйте маршруты и открывайте новые места вместе с GoSee.
          </p>
        </header>

        <div class="benefit-grid">
          <article
            v-for="(item, index) in benefits"
            :key="item.id"
            class="benefit-card home-reveal"
            :style="{ transitionDelay: `${index * 70}ms` }"
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
      <div class="home-cta__inner home-reveal">
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
          Выберите точки прогулки, добавьте фото и посмотрите путь на карте перед публикацией.
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
import moscowHeroImage from '~/assets/images/moscow4k.jpg'
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
let revealObserver: IntersectionObserver | undefined

const { data: routesData } = await useAsyncData('home-popular-routes', () =>
  $fetch<{ walks: WalkSummary[]; paceOptions: string[] }>('/api/routes', {
    credentials: 'include',
  }),
)

const stats = [
  { id: 'd', value: '500+', label: 'направлений' },
  { id: 'u', value: '10000+', label: 'пользователей' },
  { id: 'c', value: '50+', label: 'городов России' },
  { id: 'r', value: '4.9', label: 'рейтинг' },
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

const storySteps = [
  {
    id: 'idea',
    title: 'Выберите настроение',
    text: 'Город, тема и темп задают маршруту характер еще до первой точки.',
    icon: searchIcon,
  },
  {
    id: 'map',
    title: 'Соберите линию',
    text: 'Добавляйте места на карту и сразу видьте, как складывается путь.',
    icon: mapIcon,
  },
  {
    id: 'preview',
    title: 'Проверьте глазами',
    text: 'Панорамы помогают почувствовать улицу до того, как вы выйдете из дома.',
    icon: panoramaIcon,
  },
  {
    id: 'share',
    title: 'Сохраните находку',
    text: 'Опубликуйте прогулку, чтобы другие могли пройти ее в своем ритме.',
    icon: walkingIcon,
  },
] as const

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
    text: 'Профиль, маршруты и избранное хранятся аккуратно и предсказуемо.',
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

onMounted(() => {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.home-reveal'))

  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }
        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      })
    },
    { threshold: 0.18, rootMargin: '0px 0px -7% 0px' },
  )

  items.forEach(item => revealObserver?.observe(item))
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<style scoped>
.home-page {
  width: 100%;
  overflow: hidden;
  background: #fff;
  color: #111827;
}

.home-hero {
  box-sizing: border-box;
  min-height: clamp(560px, 72vh, 720px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(3.5rem, 7vw, 6rem) 1rem;
  background:
    linear-gradient(90deg, rgba(9, 26, 54, 0.78), rgba(9, 26, 54, 0.42)),
    var(--home-hero-image) center / cover;
}

.home-section__inner,
.home-story__inner,
.home-cta__inner {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.home-hero__card {
  box-sizing: border-box;
  width: min(100%, 760px);
  margin-right: min(34vw, 360px);
  padding: clamp(1.35rem, 4vw, 2rem);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 24px 70px rgba(5, 18, 42, 0.24);
  backdrop-filter: blur(18px);
}

.home-hero__eyebrow,
.home-section__eyebrow {
  margin: 0 0 0.8rem;
  color: #1a5fff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-hero__title {
  margin: 0;
  color: #172033;
  font-size: clamp(2.25rem, 5vw, 3.65rem);
  font-weight: 760;
  line-height: 1.08;
  letter-spacing: 0;
}

.home-hero__lead {
  max-width: 60ch;
  margin: 1.25rem 0 0;
  color: #526174;
  font-size: 1rem;
  line-height: 1.75;
}

.home-search {
  box-sizing: border-box;
  margin-top: 1.35rem;
  padding: 0;
  border: 1px solid rgba(218, 227, 240, 0.95);
  border-radius: 14px;
  background: #fff;
  box-shadow: none;
}

.home-search__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin-bottom: 0;
  border-bottom: 1px solid #dfe5ef;
}

.home-search__field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 58px;
  padding: 0 1rem;
  border: none;
  border-right: 1px solid #dfe5ef;
  border-radius: 0;
  background: #fff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.home-search__field:focus-within {
  box-shadow: inset 0 0 0 2px rgba(26, 95, 255, 0.2);
  transform: translateY(-1px);
}

.home-search__field:last-child {
  border-right: none;
}

.home-search__field-icon,
.destination-card__meta img,
.benefit-card__icon,
.story-step__icon img {
  flex-shrink: 0;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(2876%)
    hue-rotate(212deg) brightness(98%) contrast(104%);
}

.home-search__field-input {
  flex: 1;
  min-width: 0;
}

.home-search__submit {
  width: 100%;
}

.home-search__submit :deep(.btn-blue) {
  width: 100%;
  min-height: 46px;
  border-radius: 0 0 13px 13px;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: none;
}

.home-search__submit-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}

.home-search__submit-icon {
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.home-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.home-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid rgba(218, 227, 240, 0.82);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.home-hero__stat-value {
  color: #1a5fff;
  font-size: clamp(1.18rem, 2vw, 1.45rem);
  font-weight: 800;
  line-height: 1.1;
}

.home-hero__stat-label {
  color: #172033;
  font-size: 0.88rem;
  line-height: 1.25;
}

.home-section,
.home-story,
.home-cta {
  box-sizing: border-box;
  padding: clamp(4rem, 8vw, 6.4rem) 1rem;
}

.home-section--routes {
  background:
    radial-gradient(circle at 88% 12%, rgba(232, 240, 255, 0.95), transparent 22rem),
    #fff;
}

.home-section--benefits {
  background:
    radial-gradient(circle at 10% 20%, rgba(196, 230, 255, 0.72), transparent 30rem),
    radial-gradient(circle at 88% 85%, rgba(226, 236, 255, 0.9), transparent 28rem),
    linear-gradient(135deg, #eef8ff 0%, #f8fbff 52%, #fff 100%);
}

.home-section__header {
  max-width: 720px;
  margin: 0 auto 2.75rem;
  text-align: center;
}

.home-section__title,
.home-cta__title {
  margin: 0;
  color: #172033;
  font-size: clamp(1.8rem, 3vw, 2.65rem);
  font-weight: 740;
  line-height: 1.14;
  text-align: center;
  letter-spacing: 0;
}

.home-section__lead {
  max-width: 620px;
  margin: 0.85rem auto 0;
  color: #64748b;
  font-size: 0.96rem;
  line-height: 1.65;
}

.home-section__empty {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.25rem;
  border: 1px solid #dfe5ef;
  border-radius: 16px;
  background: #fff;
  color: #3f4756;
  text-align: center;
  box-shadow: 0 12px 30px rgba(31, 65, 115, 0.07);
}

.destination-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.35rem;
}

.destination-card {
  overflow: hidden;
  border: 1px solid rgba(218, 227, 240, 0.88);
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 34px rgba(31, 65, 115, 0.09);
  cursor: pointer;
  transition:
    opacity 0.6s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.destination-card:hover,
.destination-card:focus-visible {
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 22px 48px rgba(31, 65, 115, 0.16);
  transform: translateY(-7px);
}

.destination-card:focus-visible {
  outline: 3px solid rgba(26, 95, 255, 0.3);
  outline-offset: 3px;
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
  transition: transform 0.45s ease;
}

.destination-card:hover .destination-card__image,
.destination-card:focus-visible .destination-card__image {
  transform: scale(1.06);
}

.destination-card__badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  max-width: calc(100% - 1.5rem);
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  background: rgba(26, 95, 255, 0.9);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(17, 74, 210, 0.24);
  backdrop-filter: blur(10px);
}

.destination-card__body {
  padding: 1.1rem 1.15rem 1.2rem;
}

.destination-card__title {
  margin: 0 0 0.7rem;
  color: #111827;
  font-size: 1.08rem;
  font-weight: 750;
  line-height: 1.3;
}

.destination-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  color: #64748b;
}

.destination-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  line-height: 1.3;
}

.home-story {
  background: #fff;
}

.story-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.story-track::before {
  position: absolute;
  top: 39px;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(26, 95, 255, 0.4), transparent);
  content: "";
}

.story-step,
.benefit-card {
  border: 1px solid rgba(214, 226, 241, 0.9);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 28px rgba(50, 84, 130, 0.06);
  text-align: left;
  backdrop-filter: blur(10px);
  transition:
    opacity 0.6s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.story-step {
  position: relative;
  min-height: 240px;
  padding: 1.25rem;
}

.story-step:hover,
.benefit-card:hover {
  border-color: rgba(37, 99, 235, 0.25);
  box-shadow: 0 18px 38px rgba(50, 84, 130, 0.13);
  transform: translateY(-6px);
}

.story-step__icon,
.benefit-card__icon-wrap,
.home-cta__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.story-step__icon,
.benefit-card__icon-wrap {
  width: 54px;
  height: 54px;
  margin-bottom: 1.25rem;
  border-radius: 17px;
  background: linear-gradient(135deg, #e5efff, #d7f7ff);
}

.story-step__title,
.benefit-card__title {
  margin: 0 0 0.7rem;
  color: #111827;
  font-size: 1.02rem;
  font-weight: 750;
  line-height: 1.3;
}

.story-step__text,
.benefit-card__text {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.58;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.benefit-card {
  min-height: 220px;
  padding: 1.45rem;
}

.home-cta {
  padding-top: clamp(1.2rem, 4vw, 3rem);
  background: #fff;
}

.home-cta__inner {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  padding: clamp(2.8rem, 6vw, 4.5rem) 1.25rem;
  border-radius: 28px;
  background:
    radial-gradient(circle at 15% 15%, rgba(117, 166, 255, 0.75), transparent 16rem),
    radial-gradient(circle at 92% 88%, rgba(47, 209, 218, 0.38), transparent 18rem),
    linear-gradient(135deg, #1954df 0%, #2563eb 48%, #1b74e8 100%);
  box-shadow: 0 22px 54px rgba(23, 81, 196, 0.22);
  color: #fff;
  text-align: center;
}

.home-cta__icon-wrap {
  position: relative;
  z-index: 1;
  width: 62px;
  height: 62px;
  margin-bottom: 1.4rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
}

.home-cta__icon {
  filter: brightness(0) invert(1);
}

.home-cta__title {
  position: relative;
  z-index: 1;
  color: #fff;
}

.home-cta__text {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 1rem auto 1.25rem;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.95rem;
  line-height: 1.55;
}

.home-cta__link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-width: min(100%, 310px);
  min-height: 46px;
  padding: 0 1.35rem;
  border-radius: 14px;
  background: #fff;
  color: #1a5fff;
  box-shadow: 0 10px 22px rgba(11, 55, 146, 0.16);
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.home-cta__link:hover {
  background: #edf3ff;
  color: #1a5fff;
  transform: translateY(-2px);
}

.home-cta__link img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(2876%)
    hue-rotate(212deg) brightness(98%) contrast(104%);
}

.home-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.home-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 980px) {
  .home-hero {
    min-height: auto;
  }

  .home-hero__card {
    margin-right: 0;
  }

  .destination-grid,
  .story-track,
  .benefit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .story-track::before {
    display: none;
  }
}

@media (max-width: 640px) {
  .home-hero {
    padding-top: 3rem;
  }

  .home-search__fields,
  .home-hero__stats,
  .destination-grid,
  .story-track,
  .benefit-grid {
    grid-template-columns: 1fr;
  }

  .home-search {
    border-radius: 18px;
  }

  .home-search__fields {
    border-bottom: none;
  }

  .home-search__field {
    border-right: none;
    border-bottom: 1px solid #dfe5ef;
  }

  .home-hero__stat {
    align-items: center;
    text-align: center;
  }

  .home-cta__link {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-search__field,
  .destination-card,
  .story-step,
  .benefit-card,
  .home-cta__link,
  .home-reveal {
    transition-duration: 0.01ms;
  }

}
</style>
