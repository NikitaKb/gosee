<template>
  <header
    class="app-header"
    :class="{
      'app-header--scrolled': isScrolled,
      'app-header--hidden': isHeaderHidden,
    }"
  >
    <div class="app-header__inner">
      <NuxtLink
        to="/"
        class="app-header__logo-link"
        aria-label="Gosee — на главную"
      >
        <img
          :src="logoSrc"
          alt=""
          width="128"
          height="77"
          class="app-header__logo"
        >
      </NuxtLink>

      <nav
        class="app-header__nav app-header__nav--desktop"
        aria-label="Основное меню"
      >
        <ul class="app-header__list">
          <li
            v-for="item in navItems"
            :key="item.id"
          >
            <NuxtLink
              :to="item.to"
              class="app-header__link"
              active-class="app-header__link--active"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
          <li v-if="!user">
            <NuxtLink
              to="/login"
              class="app-header__link"
            >
              Войти
            </NuxtLink>
          </li>
          <li v-else>
            <NuxtLink
              to="/profile"
              class="app-header__link app-header__link--profile"
              active-class="app-header__link--active"
            >
              {{ headerProfileLabel }}
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink
          to="/planning"
          class="app-header__cta-link"
        >
          <ButtonBlue
            type="button"
            class="app-header__cta"
          >
            Начать планирование
          </ButtonBlue>
        </NuxtLink>
      </nav>

      <AppBurgerMenu
        v-model="isMenuOpen"
        menu-id="app-header-mobile-menu"
        class="app-header__burger"
      >
        <template #header>
          <div class="app-header__drawer-brand">
            <img
              :src="logoSrc"
              alt=""
              width="90"
              height="54"
              class="app-header__drawer-logo"
            >
            <span class="app-header__drawer-title">Навигация</span>
          </div>
        </template>

        <nav
          class="app-header__drawer-nav"
          aria-label="Мобильное меню"
        >
          <ul class="app-header__drawer-list">
            <li
              v-for="item in navItems"
              :key="`mobile-${item.id}`"
            >
              <NuxtLink
                :to="item.to"
                class="app-header__drawer-link"
                active-class="app-header__drawer-link--active"
                @click="closeMenu"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
            <li v-if="!user">
              <NuxtLink
                to="/login"
                class="app-header__drawer-link"
                @click="closeMenu"
              >
                Войти
              </NuxtLink>
            </li>
            <li v-else>
              <NuxtLink
                to="/profile"
                class="app-header__drawer-link"
                active-class="app-header__drawer-link--active"
                @click="closeMenu"
              >
                {{ headerProfileLabel }}
              </NuxtLink>
            </li>
          </ul>

          <NuxtLink
            to="/planning"
            class="app-header__drawer-cta-link"
            @click="closeMenu"
          >
            <ButtonBlue
              type="button"
              class="app-header__drawer-cta"
            >
              Начать планирование
            </ButtonBlue>
          </NuxtLink>
        </nav>
      </AppBurgerMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import logoSrc from '~/assets/logo-gosee.svg'

const navItems = [
  { id: 'nav-community', label: 'Сообщество', to: '/community' },
  { id: 'nav-about', label: 'О нас', to: '/about' },
] as const

const { user } = useAuth()
const route = useRoute()
const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isHeaderHidden = ref(false)
let lastScrollY = 0

const headerProfileLabel = computed(() => {
  const nickname = user.value?.nickname?.trim()
  if (nickname) {
    return nickname
  }
  const name = user.value?.name?.trim()
  return name && !name.includes('@') ? name : 'Профиль'
})

function closeMenu() {
  isMenuOpen.value = false
}

function onScroll() {
  const scrollY = window.scrollY
  isScrolled.value = scrollY > 8
  isHeaderHidden.value = !isMenuOpen.value && scrollY > 120 && scrollY > lastScrollY
  lastScrollY = scrollY
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)

watch(isMenuOpen, (value) => {
  if (!import.meta.client) {
    return
  }
  document.body.style.overflow = value ? 'hidden' : ''
  if (value) {
    isHeaderHidden.value = false
  }
})

onUnmounted(() => {
  if (!import.meta.client) {
    return
  }
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  lastScrollY = window.scrollY
  onScroll()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onScroll, { passive: true })
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100%;
  background: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid rgba(225, 231, 240, 0.72);
  backdrop-filter: blur(18px);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.3s ease;
}

.app-header--scrolled {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(218, 227, 240, 0.9);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.app-header--hidden {
  transform: translateY(-110%);
}

.app-header__inner {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 0.75rem 1rem;
}

.app-header__logo-link {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 0;
  transition: transform 0.2s ease;
}

.app-header__logo-link:hover,
.app-header__logo-link:focus-visible {
  animation: header-logo-step 0.55s ease;
}

.app-header__logo {
  display: block;
  width: auto;
  height: clamp(3.15rem, 13vw, 4.15rem);
  max-width: min(10rem, 42vw);
}

.app-header__nav--desktop {
  display: none;
}

.app-header__list,
.app-header__drawer-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-header__drawer-brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.app-header__drawer-logo {
  display: block;
  width: auto;
  height: 3rem;
}

.app-header__drawer-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.app-header__drawer-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.app-header__drawer-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-header__drawer-link {
  display: flex;
  align-items: center;
  min-height: 3rem;
  padding: 0.875rem 1rem;
  border-radius: 14px;
  background: #f7f9fc;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.app-header__drawer-link:hover,
.app-header__drawer-link:focus-visible {
  background: #edf3ff;
  color: #1a5fff;
  transform: translateX(0.2rem);
}

.app-header__drawer-cta-link,
.app-header__cta-link {
  text-decoration: none;
}

.app-header__cta-link {
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(26, 95, 255, 0.2);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.app-header__cta-link:hover,
.app-header__cta-link:focus-visible {
  box-shadow: 0 12px 26px rgba(26, 95, 255, 0.28);
  transform: translateY(-2px);
}

.app-header__drawer-cta {
  width: 100%;
}

.app-header__drawer-cta :deep(.btn-blue),
.app-header__cta :deep(.btn-blue) {
  width: 100%;
  min-height: 3rem;
  border-radius: 14px;
  padding-inline: 1rem;
  font-size: 0.95rem;
  white-space: nowrap;
}

.app-header__burger {
  margin-left: auto;
}

@media (max-width: 480px) {
  .app-header__inner {
    padding-inline: 0.875rem;
  }

  .app-header__drawer-link {
    font-size: 0.95rem;
  }
}

@keyframes header-logo-step {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  35% {
    transform: translateY(-4px) rotate(-2deg);
  }

  70% {
    transform: translateY(-1px) rotate(1deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header,
  .app-header__drawer-link,
  .app-header__cta-link {
    transition-duration: 0.01ms;
  }

  .app-header__logo-link:hover,
  .app-header__logo-link:focus-visible {
    animation: none;
  }
}

@media (min-width: 768px) {
  .app-header__inner {
    padding-inline: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .app-header__inner {
    gap: 2rem;
    padding-block: 0.875rem;
  }

  .app-header__logo {
    height: 4.5rem;
    max-width: none;
  }

  .app-header__burger {
    display: none;
  }

  .app-header__nav--desktop {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    min-width: 0;
    margin-left: auto;
  }

  .app-header__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    min-width: 0;
  }

  .app-header__link {
    display: inline-flex;
    align-items: center;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.4;
    text-decoration: none;
    white-space: nowrap;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .app-header__link:hover,
  .app-header__link:focus-visible {
    color: #1a5fff;
  }

  .app-header__link--profile {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .app-header__cta-link {
    flex-shrink: 0;
  }

  .app-header__cta {
    display: block;
  }

  .app-header__cta :deep(.btn-blue) {
    width: auto;
    min-height: 3rem;
    padding-inline: 1.25rem;
  }
}
</style>
