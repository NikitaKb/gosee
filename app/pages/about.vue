<template>
  <div class="about-page">
    <section
      class="about-hero"
      @pointermove="onHeroPointerMove"
      @pointerleave="resetHeroPointer"
    >
      <div class="about-hero__inner">
        <div class="about-hero__copy reveal-item">
          <p class="about-hero__eyebrow">
            О GoSee
          </p>
          <h1 class="about-hero__title">
            Мы превращаем прогулку в маршрут, который хочется пройти
          </h1>
          <p class="about-hero__lead">
            GoSee помогает заранее собрать путь, увидеть улицы на панорамах,
            сохранить любимые места и найти идеи у людей, которые уже знают город ногами.
          </p>
          <div class="about-hero__actions">
            <NuxtLink
              to="/planning"
              class="about-hero__primary"
            >
              <img
                :src="mapIcon"
                alt=""
                width="20"
                height="20"
                aria-hidden="true"
              >
              Спланировать маршрут
            </NuxtLink>
            <NuxtLink
              to="/community"
              class="about-hero__secondary"
            >
              Смотреть сообщество
            </NuxtLink>
          </div>
        </div>

        <div
          class="route-stage reveal-item"
          :style="heroStageStyle"
          aria-hidden="true"
        >
          <div class="route-stage__map">
            <span class="route-stage__grid" />
            <svg
              class="route-stage__path"
              viewBox="0 0 520 420"
              role="img"
              aria-hidden="true"
            >
              <path
                class="route-stage__path-shadow"
                d="M70 320 C125 245 170 265 220 195 S335 98 420 150 S470 270 392 310 S240 345 182 360"
              />
              <path
                class="route-stage__path-line"
                d="M70 320 C125 245 170 265 220 195 S335 98 420 150 S470 270 392 310 S240 345 182 360"
              />
            </svg>

            <span
              v-for="point in heroPoints"
              :key="point.id"
              class="route-stage__pin"
              :class="`route-stage__pin--${point.tone}`"
              :style="{ left: point.left, top: point.top, animationDelay: point.delay }"
            >
              <img
                :src="point.icon"
                alt=""
                width="22"
                height="22"
              >
            </span>

            <div class="route-stage__card route-stage__card--top">
              <span>Панорама проверена</span>
              <strong>12 мин</strong>
            </div>
            <div class="route-stage__card route-stage__card--bottom">
              <span>Лучший вид</span>
              <strong>на закате</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="about-mission">
      <div class="about-mission__inner">
        <article
          v-for="item in missionItems"
          :key="item.id"
          class="mission-card reveal-item"
        >
          <span class="mission-card__number">{{ item.number }}</span>
          <h2 class="mission-card__title">
            {{ item.title }}
          </h2>
          <p class="mission-card__text">
            {{ item.text }}
          </p>
        </article>
      </div>
    </section>

    <section class="about-flow">
      <div class="about-flow__inner">
        <header class="about-section-header reveal-item">
          <p class="about-section-header__eyebrow">
            Как мы думаем о маршрутах
          </p>
          <h2 class="about-section-header__title">
            Хорошая прогулка собирается как маленькая история
          </h2>
        </header>

        <div class="flow-track">
          <article
            v-for="step in flowSteps"
            :key="step.id"
            class="flow-step reveal-item"
          >
            <span class="flow-step__icon">
              <img
                :src="step.icon"
                alt=""
                width="24"
                height="24"
                aria-hidden="true"
              >
            </span>
            <div>
              <h3 class="flow-step__title">
                {{ step.title }}
              </h3>
              <p class="flow-step__text">
                {{ step.text }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="about-values">
      <div class="about-values__inner">
        <div class="values-panel reveal-item">
          <p class="values-panel__eyebrow">
            Что важно внутри GoSee
          </p>
          <h2 class="values-panel__title">
            Меньше шума, больше точного ощущения места
          </h2>
          <p class="values-panel__text">
            Мы проектируем сервис так, чтобы он не спорил с городом за внимание:
            карта, панорамы, заметки и маршруты должны помогать выбрать путь спокойно и уверенно.
          </p>
        </div>

        <div class="values-grid">
          <article
            v-for="value in values"
            :key="value.id"
            class="value-card reveal-item"
          >
            <span class="value-card__dot" />
            <h3 class="value-card__title">
              {{ value.title }}
            </h3>
            <p class="value-card__text">
              {{ value.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="about-cta">
      <div class="about-cta__inner reveal-item">
        <span class="about-cta__icon">
          <img
            :src="walkingIcon"
            alt=""
            width="34"
            height="34"
            aria-hidden="true"
          >
        </span>
        <h2 class="about-cta__title">
          Соберите свою прогулку в GoSee
        </h2>
        <p class="about-cta__text">
          Начните с одной точки на карте, добавьте ритм, панорамы и места, которые хочется запомнить.
        </p>
        <NuxtLink
          to="/planning"
          class="about-cta__link"
        >
          Перейти к планированию
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import bicycleIcon from '~/assets/images/icons/bicycle.svg'
import eyeIcon from '~/assets/images/icons/eye.svg'
import geoIcon from '~/assets/images/icons/geo.svg'
import mapIcon from '~/assets/images/icons/map.svg'
import panoramaIcon from '~/assets/images/icons/panorama.svg'
import roadIcon from '~/assets/images/icons/road.svg'
import searchIcon from '~/assets/images/icons/search.svg'
import starIcon from '~/assets/images/icons/star.svg'
import walkingIcon from '~/assets/images/icons/walking.svg'

useHead({
  title: 'О нас — GoSee',
  meta: [
    {
      name: 'description',
      content: 'GoSee помогает планировать прогулки, смотреть маршруты на карте и открывать города через идеи сообщества.',
    },
  ],
})

const heroTiltX = ref(0)
const heroTiltY = ref(0)
let revealObserver: IntersectionObserver | undefined

const heroStageStyle = computed(() => ({
  '--tilt-x': `${heroTiltX.value}deg`,
  '--tilt-y': `${heroTiltY.value}deg`,
}))

const heroPoints = [
  { id: 'start', left: '10%', top: '70%', icon: geoIcon, tone: 'blue', delay: '0s' },
  { id: 'view', left: '39%', top: '42%', icon: eyeIcon, tone: 'cyan', delay: '0.25s' },
  { id: 'panorama', left: '73%', top: '25%', icon: panoramaIcon, tone: 'amber', delay: '0.5s' },
  { id: 'finish', left: '31%', top: '82%', icon: starIcon, tone: 'green', delay: '0.75s' },
] as const

const missionItems = [
  {
    id: 'plan',
    number: '01',
    title: 'Планировать без лишней суеты',
    text: 'Маршрут должен складываться быстро: точки, темп, способ передвижения и понятная картина пути до выхода из дома.',
  },
  {
    id: 'see',
    number: '02',
    title: 'Видеть город заранее',
    text: 'Панорамы и карта помогают почувствовать улицы до прогулки, оценить расстояния и выбрать более приятную дорогу.',
  },
  {
    id: 'share',
    number: '03',
    title: 'Делиться находками',
    text: 'Лучшие прогулки часто рождаются из чужих заметок, любимых дворов, видов, кафе и коротких советов по пути.',
  },
] as const

const flowSteps = [
  {
    id: 'search',
    title: 'Ищем настроение',
    text: 'Город, тема, темп и формат прогулки задают направление еще до первой точки.',
    icon: searchIcon,
  },
  {
    id: 'route',
    title: 'Собираем линию',
    text: 'Точки соединяются в понятный путь: пешком, на велосипеде, на машине или в своем ритме.',
    icon: roadIcon,
  },
  {
    id: 'preview',
    title: 'Проверяем глазами',
    text: 'Панорамы помогают заметить детали, которые обычная карта не показывает.',
    icon: panoramaIcon,
  },
  {
    id: 'move',
    title: 'Выходим в город',
    text: 'Маршрут остается под рукой, а после прогулки может стать идеей для других.',
    icon: bicycleIcon,
  },
] as const

const values = [
  {
    id: 'calm',
    title: 'Спокойный интерфейс',
    text: 'Без перегруза и лишних слоев: важное видно сразу, второстепенное не мешает.',
  },
  {
    id: 'local',
    title: 'Живые маршруты',
    text: 'Нас интересуют не только точки на карте, но и то, как между ними ощущается путь.',
  },
  {
    id: 'people',
    title: 'Опыт людей',
    text: 'Сообщество делает город объемнее: в маршрутах появляются личные находки и контекст.',
  },
  {
    id: 'care',
    title: 'Аккуратность',
    text: 'Профили, избранное и опубликованные прогулки должны храниться предсказуемо и бережно.',
  },
] as const

function onHeroPointerMove(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  heroTiltX.value = Number((-y * 7).toFixed(2))
  heroTiltY.value = Number((x * 9).toFixed(2))
}

function resetHeroPointer() {
  heroTiltX.value = 0
  heroTiltY.value = 0
}

onMounted(() => {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal-item'))

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
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
  )

  items.forEach(item => revealObserver?.observe(item))
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<style scoped>
.about-page {
  overflow: hidden;
  background: #fff;
  color: #111827;
}

.about-hero {
  box-sizing: border-box;
  min-height: clamp(640px, 78vh, 780px);
  display: flex;
  align-items: center;
  padding: clamp(3.5rem, 7vw, 6rem) 1rem;
  background:
    linear-gradient(135deg, rgba(248, 251, 255, 0.96), rgba(236, 246, 255, 0.92)),
    radial-gradient(circle at 78% 12%, rgba(26, 95, 255, 0.16), transparent 28rem);
}

.about-hero__inner,
.about-mission__inner,
.about-flow__inner,
.about-values__inner,
.about-cta__inner {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.about-hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(380px, 1.1fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
}

.about-hero__copy {
  max-width: 620px;
}

.about-hero__eyebrow,
.about-section-header__eyebrow,
.values-panel__eyebrow {
  margin: 0 0 0.8rem;
  color: #1a5fff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about-hero__title {
  margin: 0;
  color: #172033;
  font-size: clamp(2.35rem, 5vw, 4.85rem);
  font-weight: 750;
  line-height: 1.02;
}

.about-hero__lead {
  max-width: 58ch;
  margin: 1.25rem 0 0;
  color: #526174;
  font-size: 1rem;
  line-height: 1.75;
}

.about-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.7rem;
}

.about-hero__primary,
.about-hero__secondary,
.about-cta__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.15rem;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.about-hero__primary {
  gap: 0.6rem;
  background: #1a5fff;
  color: #fff;
  box-shadow: 0 14px 28px rgba(26, 95, 255, 0.22);
}

.about-hero__primary img {
  filter: brightness(0) invert(1);
}

.about-hero__primary:hover,
.about-cta__link:hover {
  background: #0d4fe6;
  color: #fff;
  transform: translateY(-2px);
}

.about-hero__secondary {
  border: 1px solid #d8e2f0;
  background: rgba(255, 255, 255, 0.72);
  color: #172033;
}

.about-hero__secondary:hover {
  border-color: rgba(26, 95, 255, 0.28);
  color: #1a5fff;
  transform: translateY(-2px);
}

.route-stage {
  perspective: 1100px;
}

.route-stage__map {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1.2 / 1;
  min-height: 420px;
  border: 1px solid rgba(207, 221, 239, 0.9);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(237, 247, 255, 0.88)),
    radial-gradient(circle at 22% 20%, rgba(34, 211, 238, 0.16), transparent 16rem);
  box-shadow: 0 28px 70px rgba(31, 65, 115, 0.14);
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transform-style: preserve-3d;
  transition: transform 0.18s ease-out;
}

.route-stage__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, #000 0%, transparent 76%);
}

.route-stage__path {
  position: absolute;
  inset: 5%;
  width: 90%;
  height: 90%;
  overflow: visible;
  transform: translateZ(52px);
}

.route-stage__path-shadow,
.route-stage__path-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.route-stage__path-shadow {
  stroke: rgba(26, 95, 255, 0.12);
  stroke-width: 22;
}

.route-stage__path-line {
  stroke: #1a5fff;
  stroke-width: 8;
  stroke-dasharray: 980;
  stroke-dashoffset: 980;
  animation: draw-route 2.1s ease forwards, route-pulse 2.8s ease-in-out 2.2s infinite;
}

.route-stage__pin {
  position: absolute;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 34px rgba(15, 42, 86, 0.18);
  transform: translate(-50%, -50%) translateZ(80px);
  animation: pin-float 3.4s ease-in-out infinite;
}

.route-stage__pin::after {
  position: absolute;
  inset: -8px;
  border: 1px solid currentColor;
  border-radius: 22px;
  content: "";
  opacity: 0;
  animation: pin-ring 2.4s ease-out infinite;
}

.route-stage__pin img,
.flow-step__icon img,
.about-cta__icon img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(2876%)
    hue-rotate(212deg) brightness(98%) contrast(104%);
}

.route-stage__pin--blue {
  color: #1a5fff;
}

.route-stage__pin--cyan {
  color: #06b6d4;
}

.route-stage__pin--amber {
  color: #f59e0b;
}

.route-stage__pin--green {
  color: #10b981;
}

.route-stage__card {
  position: absolute;
  z-index: 3;
  display: grid;
  gap: 0.2rem;
  min-width: 156px;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(218, 227, 240, 0.88);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 36px rgba(31, 65, 115, 0.14);
  backdrop-filter: blur(12px);
  transform: translateZ(110px);
}

.route-stage__card span {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.route-stage__card strong {
  color: #172033;
  font-size: 1.15rem;
}

.route-stage__card--top {
  top: 12%;
  left: 9%;
  animation: card-hover 4s ease-in-out infinite;
}

.route-stage__card--bottom {
  right: 8%;
  bottom: 10%;
  animation: card-hover 4.6s ease-in-out 0.4s infinite;
}

.about-mission,
.about-flow,
.about-values,
.about-cta {
  box-sizing: border-box;
  padding: clamp(4.2rem, 8vw, 6.8rem) 1rem;
}

.about-mission {
  background: #fff;
}

.about-mission__inner {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.mission-card,
.flow-step,
.value-card {
  border: 1px solid rgba(218, 227, 240, 0.9);
  background: #fff;
  box-shadow: 0 12px 30px rgba(31, 65, 115, 0.07);
}

.mission-card {
  min-height: 280px;
  padding: clamp(1.25rem, 3vw, 1.6rem);
  border-radius: 18px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.mission-card:hover,
.flow-step:hover,
.value-card:hover {
  border-color: rgba(26, 95, 255, 0.28);
  box-shadow: 0 18px 42px rgba(31, 65, 115, 0.13);
  transform: translateY(-5px);
}

.mission-card__number {
  display: inline-flex;
  margin-bottom: 2.3rem;
  color: #1a5fff;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.mission-card__title,
.flow-step__title,
.value-card__title {
  margin: 0;
  color: #172033;
  font-size: 1.15rem;
  line-height: 1.3;
}

.mission-card__text,
.flow-step__text,
.value-card__text,
.values-panel__text,
.about-cta__text {
  margin: 0;
  color: #64748b;
  line-height: 1.65;
}

.mission-card__text {
  margin-top: 0.9rem;
}

.about-flow {
  background:
    radial-gradient(circle at 12% 20%, rgba(196, 230, 255, 0.66), transparent 28rem),
    linear-gradient(135deg, #eef8ff 0%, #f8fbff 54%, #fff 100%);
}

.about-section-header {
  max-width: 720px;
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.about-section-header__title,
.values-panel__title,
.about-cta__title {
  margin: 0;
  color: #172033;
  font-size: clamp(1.8rem, 3vw, 2.65rem);
  line-height: 1.12;
}

.flow-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.flow-track::before {
  position: absolute;
  top: 38px;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(26, 95, 255, 0.4), transparent);
  content: "";
}

.flow-step {
  position: relative;
  display: grid;
  align-content: start;
  gap: 1.2rem;
  min-height: 250px;
  padding: 1.2rem;
  border-radius: 18px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.flow-step__icon,
.about-cta__icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #e5efff, #d7f7ff);
}

.flow-step__text {
  margin-top: 0.75rem;
  font-size: 0.93rem;
}

.about-values {
  background: #fff;
}

.about-values__inner {
  display: grid;
  grid-template-columns: minmax(280px, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(1.4rem, 4vw, 3rem);
  align-items: start;
}

.values-panel {
  position: sticky;
  top: 118px;
}

.values-panel__text {
  margin-top: 1rem;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.value-card {
  position: relative;
  overflow: hidden;
  min-height: 190px;
  padding: 1.35rem;
  border-radius: 18px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.value-card::after {
  position: absolute;
  right: -42px;
  bottom: -52px;
  width: 150px;
  height: 150px;
  border: 1px solid rgba(26, 95, 255, 0.1);
  border-radius: 50%;
  content: "";
}

.value-card__dot {
  display: block;
  width: 10px;
  height: 10px;
  margin-bottom: 1.2rem;
  border-radius: 50%;
  background: #1a5fff;
  box-shadow: 0 0 0 8px rgba(26, 95, 255, 0.1);
}

.value-card__text {
  margin-top: 0.8rem;
  font-size: 0.94rem;
}

.about-cta {
  padding-top: 1rem;
  background: #fff;
}

.about-cta__inner {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: clamp(2.7rem, 6vw, 4.6rem) 1.25rem;
  border-radius: 28px;
  background:
    radial-gradient(circle at 14% 16%, rgba(125, 211, 252, 0.44), transparent 16rem),
    radial-gradient(circle at 88% 78%, rgba(16, 185, 129, 0.18), transparent 18rem),
    linear-gradient(135deg, #1954df 0%, #2563eb 52%, #1786d9 100%);
  box-shadow: 0 22px 54px rgba(23, 81, 196, 0.22);
  color: #fff;
  text-align: center;
}

.about-cta__icon {
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
}

.about-cta__icon img {
  filter: brightness(0) invert(1);
}

.about-cta__title {
  margin-top: 1.35rem;
  color: #fff;
}

.about-cta__text {
  max-width: 580px;
  margin: 1rem auto 1.3rem;
  color: rgba(255, 255, 255, 0.88);
}

.about-cta__link {
  min-width: min(100%, 260px);
  background: #fff;
  color: #1a5fff;
}

.about-cta__link:hover {
  background: #edf3ff;
  color: #1a5fff;
}

.reveal-item {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.reveal-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes draw-route {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes route-pulse {
  0%,
  100% {
    stroke-width: 8;
  }

  50% {
    stroke-width: 10;
  }
}

@keyframes pin-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -10px;
  }
}

@keyframes pin-ring {
  0% {
    opacity: 0.26;
    transform: scale(0.86);
  }

  100% {
    opacity: 0;
    transform: scale(1.18);
  }
}

@keyframes card-hover {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -8px;
  }
}

@media (max-width: 980px) {
  .about-hero__inner,
  .about-values__inner {
    grid-template-columns: 1fr;
  }

  .route-stage__map {
    min-height: 360px;
  }

  .about-mission__inner,
  .flow-track {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .flow-track::before,
  .values-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .about-hero {
    min-height: auto;
    padding-top: 3rem;
  }

  .about-hero__actions,
  .about-mission__inner,
  .flow-track,
  .values-grid {
    grid-template-columns: 1fr;
  }

  .about-hero__primary,
  .about-hero__secondary,
  .about-cta__link {
    width: 100%;
  }

  .route-stage__map {
    min-height: 310px;
    border-radius: 20px;
  }

  .route-stage__pin {
    width: 46px;
    height: 46px;
    border-radius: 15px;
  }

  .route-stage__card {
    min-width: 132px;
    padding: 0.75rem 0.85rem;
  }

  .route-stage__card strong {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-stage__map,
  .about-hero__primary,
  .about-hero__secondary,
  .about-cta__link,
  .mission-card,
  .flow-step,
  .value-card,
  .reveal-item {
    transition-duration: 0.01ms;
  }

  .route-stage__path-line,
  .route-stage__pin,
  .route-stage__pin::after,
  .route-stage__card {
    animation: none;
  }

  .route-stage__path-line {
    stroke-dashoffset: 0;
  }
}
</style>
