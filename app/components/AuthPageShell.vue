<template>
  <main class="auth-shell">
    <Transition name="auth-goose">
      <div
        v-if="loginIntroVisible"
        class="auth-goose"
        aria-hidden="true"
      >
        <div class="auth-goose__track">
          <span class="auth-goose__runner">
            <img
              :src="goseeAnimIcon"
              alt=""
              width="58"
              height="62"
              class="auth-goose__image"
            >
          </span>
        </div>
      </div>
    </Transition>

    <section class="auth-shell__intro">
      <div class="auth-shell__intro-copy">
        <p class="auth-shell__eyebrow">
          Маршруты, которые хочется запомнить
        </p>
        <h2 class="auth-shell__intro-title">
          Открывайте город<br>
          в своем ритме
        </h2>
        <p class="auth-shell__intro-text">
          Планируйте прогулки, сохраняйте любимые места и делитесь находками с сообществом.
        </p>
      </div>

      <div class="auth-shell__features">
        <span class="auth-shell__feature">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.2" />
          </svg>
          Новые места
        </span>
        <span class="auth-shell__feature">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-12" />
            <path d="m7 9 2-3 2 3" />
            <path d="m13 15 2 3 2-3" />
          </svg>
          Свои маршруты
        </span>
      </div>
    </section>

    <section class="auth-shell__content">
      <div class="auth-shell__card">
        <nav
          class="auth-shell__tabs"
          aria-label="Авторизация"
        >
          <NuxtLink
            to="/login"
            class="auth-shell__tab"
            :class="{ 'auth-shell__tab--active': mode === 'login' }"
          >
            Вход
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="auth-shell__tab"
            :class="{ 'auth-shell__tab--active': mode === 'register' }"
          >
            Регистрация
          </NuxtLink>
        </nav>

        <header class="auth-shell__header">
          <p class="auth-shell__card-eyebrow">
            {{ mode === 'login' ? 'С возвращением' : 'Добро пожаловать' }}
          </p>
          <h1 class="auth-shell__title">
            {{ title }}
          </h1>
          <p class="auth-shell__subtitle">
            {{ subtitle }}
          </p>
        </header>

        <slot />
      </div>

      <NuxtLink
        to="/"
        class="auth-shell__back"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Вернуться на главную
      </NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import goseeAnimIcon from '~/assets/images/icons/goseeanim.svg'

const props = defineProps<{
  title: string
  subtitle: string
  mode: 'login' | 'register'
}>()

const loginIntroVisible = ref(props.mode === 'login')
let loginIntroTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (loginIntroVisible.value) {
    loginIntroTimer = setTimeout(() => {
      loginIntroVisible.value = false
    }, 1050)
  }
})

onBeforeUnmount(() => {
  if (loginIntroTimer) {
    clearTimeout(loginIntroTimer)
  }
})
</script>

<style scoped>
.auth-shell {
  --auth-blue: #1a5fff;
  box-sizing: border-box;
  min-height: 100dvh;
  padding: 1rem;
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(440px, 1.08fr);
  gap: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  background: #edf3ff;
}

.auth-goose {
  position: fixed;
  z-index: 1100;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(248, 251, 255, 0.9);
  backdrop-filter: blur(12px);
}

.auth-goose__track {
  position: relative;
  width: min(78vw, 620px);
  height: 104px;
}

.auth-goose__runner {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 84px;
  height: 90px;
  animation: auth-goose-run 1.05s linear both;
}

.auth-goose__image {
  display: block;
  width: 84px;
  height: 90px;
  scale: -1 1;
  filter: drop-shadow(0 8px 10px rgba(37, 99, 235, 0.18));
}

.auth-goose-enter-active,
.auth-goose-leave-active {
  transition: opacity 0.2s ease;
}

.auth-goose-enter-from,
.auth-goose-leave-to {
  opacity: 0;
}

.auth-shell__intro {
  position: relative;
  isolation: isolate;
  min-height: calc(100dvh - 2rem);
  padding: clamp(2rem, 4vw, 4.5rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 28px;
  color: #fff;
  background:
    linear-gradient(145deg, rgba(10, 48, 138, 0.9), rgba(26, 95, 255, 0.68)),
    url('~/assets/images/moscow4k.jpg') center / cover;
  box-shadow: 0 18px 50px rgba(33, 75, 163, 0.2);
  animation: auth-intro-reveal 0.7s ease-out both;
}

.auth-shell__intro::before,
.auth-shell__intro::after {
  position: absolute;
  z-index: -1;
  content: '';
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.11);
}

.auth-shell__intro::before {
  width: 22rem;
  height: 22rem;
  right: -8rem;
  top: -8rem;
}

.auth-shell__intro::after {
  width: 15rem;
  height: 15rem;
  left: -6rem;
  bottom: -5rem;
}

.auth-shell__intro-copy {
  max-width: 37rem;
  margin-top: auto;
  margin-bottom: clamp(4rem, 13vh, 9rem);
}

.auth-shell__eyebrow,
.auth-shell__card-eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.auth-shell__eyebrow {
  color: rgba(255, 255, 255, 0.8);
}

.auth-shell__intro-title {
  margin: 0.9rem 0 1rem;
  color: #fff;
  font-size: clamp(2.4rem, 4.8vw, 4.7rem);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.075em;
}

.auth-shell__intro-text {
  max-width: 34rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 1rem;
  line-height: 1.6;
}

.auth-shell__features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: auto;
}

.auth-shell__feature {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.82rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.auth-shell__feature svg,
.auth-shell__back svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.auth-shell__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vw, 4rem);
}

.auth-shell__card {
  box-sizing: border-box;
  width: 100%;
  max-width: 520px;
  padding: clamp(1.35rem, 3vw, 2rem);
  border: 1px solid rgba(210, 222, 245, 0.82);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 55px rgba(50, 86, 154, 0.12);
  animation: auth-card-enter 0.55s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.auth-shell__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
  padding: 0.3rem;
  border-radius: 14px;
  background: #f0f4fb;
}

.auth-shell__tab {
  padding: 0.7rem 0.5rem;
  border-radius: 10px;
  color: #7b879b;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.auth-shell__tab--active {
  background: #fff;
  box-shadow: 0 3px 10px rgba(51, 81, 139, 0.09);
  color: var(--auth-blue);
}

.auth-shell__header {
  margin: 2rem 0 1.6rem;
}

.auth-shell__card-eyebrow {
  color: var(--auth-blue);
}

.auth-shell__title {
  margin: 0.35rem 0 0.35rem;
  color: #17233d;
  font-size: clamp(1.8rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.06em;
}

.auth-shell__subtitle {
  margin: 0;
  color: #7b879b;
  font-size: 0.94rem;
  line-height: 1.55;
}

.auth-shell__back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1.4rem;
  color: #6c7a91;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
  animation: auth-back-enter 0.45s 0.28s ease-out both;
}

.auth-shell__back:hover {
  color: var(--auth-blue);
}

:deep(.auth-form) {
  display: grid;
  gap: 1rem;
}

:deep(.auth-field__label) {
  display: block;
  margin-bottom: 0.42rem;
  color: #39465c;
  font-size: 0.82rem;
  font-weight: 700;
}

:deep(.auth-form .text-field) {
  min-height: 52px;
  border: 1px solid #e3eaf5;
  border-radius: 13px;
  background: #f7f9fd;
  color: #17233d;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

:deep(.auth-form .text-field:focus-visible) {
  border-color: rgba(26, 95, 255, 0.6);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(26, 95, 255, 0.1);
}

:deep(.auth-check) {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  color: #65738b;
  font-size: 0.87rem;
  user-select: none;
}

:deep(.auth-check__input) {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

:deep(.auth-check__box) {
  position: relative;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border: 1.5px solid #bac6d8;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

:deep(.auth-check__input:checked + .auth-check__box) {
  border-color: var(--auth-blue);
  background: var(--auth-blue);
}

:deep(.auth-check__input:checked + .auth-check__box::after) {
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  content: '';
  transform: rotate(45deg);
}

:deep(.auth-check__input:focus-visible + .auth-check__box) {
  box-shadow: 0 0 0 3px rgba(26, 95, 255, 0.16);
}

:deep(.auth-form__error) {
  margin: 0;
  padding: 0.7rem 0.85rem;
  border: 1px solid #ffd5d5;
  border-radius: 11px;
  background: #fff4f4;
  color: #b42318;
  font-size: 0.82rem;
  line-height: 1.45;
}

:deep(.auth-form__submit .btn-blue) {
  width: 100%;
  min-height: 52px;
  border-radius: 13px;
  box-shadow: 0 10px 18px rgba(26, 95, 255, 0.18);
}

:deep(.auth-switch) {
  margin: 0.25rem 0 0;
  color: #8995a8;
  font-size: 0.87rem;
  text-align: center;
}

:deep(.auth-switch__link) {
  margin-left: 0.25rem;
  color: var(--auth-blue);
  font-weight: 700;
  text-decoration: none;
}

:deep(.auth-switch__link:hover) {
  text-decoration: underline;
}

@keyframes auth-intro-reveal {
  from {
    opacity: 0;
    transform: translateX(-18px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes auth-goose-run {
  0% {
    transform: translateX(-84px) translateY(0) rotate(-2deg);
  }

  25% {
    transform: translateX(calc((min(78vw, 620px) - 84px) * 0.25)) translateY(-9px) rotate(2deg);
  }

  50% {
    transform: translateX(calc((min(78vw, 620px) - 84px) * 0.5)) translateY(0) rotate(-2deg);
  }

  75% {
    transform: translateX(calc((min(78vw, 620px) - 84px) * 0.75)) translateY(-9px) rotate(2deg);
  }

  100% {
    transform: translateX(min(78vw, 620px)) translateY(0) rotate(-2deg);
  }
}

@keyframes auth-card-enter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes auth-back-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .auth-shell {
    display: block;
    padding: 0;
    background:
      linear-gradient(150deg, rgba(10, 48, 138, 0.85), rgba(26, 95, 255, 0.58)),
      url('~/assets/images/moscow4k.jpg') center / cover fixed;
  }

  .auth-shell__intro {
    display: none;
  }

  .auth-shell__content {
    box-sizing: border-box;
    min-height: 100dvh;
    justify-content: center;
    padding: 1rem;
  }

  .auth-shell__card {
    max-width: 560px;
    border-radius: 20px;
  }

  .auth-shell__back {
    color: rgba(255, 255, 255, 0.85);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-goose__runner {
    left: 50%;
    animation: none;
    transform: translateX(-50%);
  }

  .auth-shell__intro,
  .auth-shell__card,
  .auth-shell__back {
    animation: none;
  }
}

@media (max-width: 520px) {
  .auth-shell__card {
    padding: 1rem;
  }

  .auth-shell__header {
    margin: 1.5rem 0 1.25rem;
  }
}
</style>
