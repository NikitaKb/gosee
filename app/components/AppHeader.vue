<template>
  <header class="app-header">
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
              class="app-header__user-name app-header__user-name--link"
            >
              {{ displayName }}
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
                class="app-header__drawer-link app-header__drawer-link--user"
                @click="closeMenu"
              >
                {{ displayName }}
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
  { id: 'nav-direction', label: 'Направление', to: '/napravlenie' },
  { id: 'nav-community', label: 'Сообщество', to: '/community' },
  { id: 'nav-about', label: 'О нас', to: '/about' },
] as const

const { user, displayName } = useAuth()
const route = useRoute()
const isMenuOpen = ref(false)

function closeMenu() {
  isMenuOpen.value = false
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
})

onUnmounted(() => {
  if (!import.meta.client) {
    return
  }
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  window.addEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100%;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(225, 231, 240, 0.95);
  backdrop-filter: blur(14px);
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
}

.app-header__logo {
  display: block;
  width: auto;
  height: clamp(3rem, 13vw, 4rem);
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
    color 0.2s ease;
}

.app-header__drawer-link:hover,
.app-header__drawer-link:focus-visible {
  background: #edf3ff;
  color: #1a5fff;
}

.app-header__drawer-link--user {
  color: #1a5fff;
}

.app-header__drawer-cta-link,
.app-header__cta-link {
  text-decoration: none;
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
    height: 4.25rem;
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
    gap: 0.875rem 1.25rem;
    min-width: 0;
  }

  .app-header__link {
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.4;
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.15s ease;
  }

  .app-header__link:hover,
  .app-header__link:focus-visible,
  .app-header__user-name--link:hover,
  .app-header__user-name--link:focus-visible {
    color: #1a5fff;
  }

  .app-header__user-name {
    display: inline-block;
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1rem;
    font-weight: 600;
    color: #172033;
  }

  .app-header__user-name--link {
    text-decoration: none;
    transition: color 0.15s ease;
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
