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
        class="app-header__nav"
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
          <li
            v-else
            class="app-header__account"
          >
            <NuxtLink
              to="/profile"
              class="app-header__user-name app-header__user-name--link"
            >
              {{ displayName }}
            </NuxtLink>
            <button
              type="button"
              class="app-header__logout"
              @click="onLogout"
            >
              Выйти
            </button>
          </li>
        </ul>
        <ButtonBlue
          type="button"
          class="app-header__cta"
        >
          Начать планирование
        </ButtonBlue>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import logoSrc from '~/assets/logo-gosee.svg'

const navItems = [
  { id: 'nav-direction', label: 'Направление', to: '/napravlenie' },
  { id: 'nav-planning-1', label: 'Планирование', to: '/planning' },
  { id: 'nav-planning-2', label: 'Планирование', to: '/planning' },
] as const

const { user, displayName, logout } = useAuth()

async function onLogout() {
  await logout()
  await navigateTo('/')
}
</script>

<style scoped>
.app-header {
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.app-header__inner {
  box-sizing: border-box;
  max-width: 954px;
  margin: 0 auto;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.app-header__logo-link {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 0;
}

.app-header__logo {
  display: block;
  height: 78px;
  width: auto;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
  flex-shrink: 0;
}

.app-header__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(1rem, 2.5vw, 1.75rem);
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-header__link {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s ease, opacity 0.15s ease;
}

.app-header__link:hover {
  color: #1a5fff;
}

.app-header__account {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.app-header__user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__user-name--link {
  text-decoration: none;
  transition: color 0.15s ease;
}

.app-header__user-name--link:hover {
  color: #1a5fff;
}

.app-header__logout {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #1a5fff;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.app-header__logout:hover {
  color: #0d4fe6;
}

.app-header__cta :deep(.btn-blue) {
  border-radius: 10px;
  min-height: 44px;
  padding: 0 1.25rem;
  font-size: 15px;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .app-header__inner {
    flex-direction: column;
    align-items: stretch;
  }

  .app-header__nav {
    flex-direction: column;
    align-items: stretch;
  }

  .app-header__list {
    justify-content: center;
  }

  .app-header__cta {
    width: 100%;
  }

  .app-header__cta :deep(.btn-blue) {
    width: 100%;
  }
}
</style>
