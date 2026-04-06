<template>
  <footer
    class="app-footer"
    aria-label="Подвал сайта"
  >
    <div class="app-footer__inner">
      <div class="app-footer__brand">
        <NuxtLink
          to="/"
          class="app-footer__logo-link"
          aria-label="GoSee — на главную"
        >
          <img
            :src="logoSrc"
            alt=""
            width="128"
            height="77"
            class="app-footer__logo"
          >
        </NuxtLink>
        <p class="app-footer__tagline">
          Ваш надёжный спутник в мире путешествий и приключений
        </p>
        <ul
          class="app-footer__social"
          aria-label="Соцсети"
        >
          <li
            v-for="item in socialLinks"
            :key="item.id"
          >
            <a
              :href="item.href"
              class="app-footer__social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="item.icon"
                alt=""
                width="28"
                height="28"
                class="app-footer__social-icon"
              >
              <span class="visually-hidden">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </div>

      <nav
        v-for="col in columns"
        :key="col.id"
        class="app-footer__col"
        :aria-label="col.heading"
      >
        <h2 class="app-footer__heading">
          {{ col.heading }}
        </h2>
        <ul class="app-footer__links">
          <li
            v-for="link in col.links"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="app-footer__link"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="app-footer__bottom">
      <p class="app-footer__copy">
        © {{ year }} GoSee | DIRECT BY NIKITA ROMENSKY
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import logoSrc from '~/assets/logo-gosee.svg'
import instagramIcon from '~/assets/images/icons/instagram.svg'
import telegramIcon from '~/assets/images/icons/telegram.svg'
import twitterIcon from '~/assets/images/icons/twitter.svg'

const year = new Date().getFullYear()

const socialLinks = [
  {
    id: 'social-ig',
    label: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: instagramIcon,
  },
  {
    id: 'social-tg',
    label: 'Telegram',
    href: 'https://t.me/',
    icon: telegramIcon,
  },
  {
    id: 'social-x',
    label: 'X',
    href: 'https://x.com/',
    icon: twitterIcon,
  },
] as const

const columns = [
  {
    id: 'footer-travel',
    heading: 'Путешествия',
    links: [
      { label: 'Главная', to: '/' },
      { label: 'Направление', to: '/napravlenie' },
      { label: 'Планирование прогулок', to: '/planning' },
    ],
  },
  {
    id: 'footer-account',
    heading: 'Аккаунт',
    links: [
      { label: 'Вход', to: '/login' },
      { label: 'Регистрация', to: '/register' },
      { label: 'Профиль', to: '/profile' },
    ],
  },
  {
    id: 'footer-about',
    heading: 'О проекте',
    links: [
      { label: 'О нас', to: '/about' },
      { label: 'Сообщество', to: '/community' },
      { label: 'Помощь и контакты', to: '/about#contacts' },
    ],
  },
] as const
</script>

<style scoped>
.app-footer {
  width: 100%;
  margin-top: auto;
  background: #fff;
  border-top: 1px solid #eee;
  color: #1a1a1a;
}

.app-footer__inner {
  box-sizing: border-box;
  max-width: 954px;
  margin: 0 auto;
  padding: 2rem 1rem 1.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) repeat(3, minmax(0, 1fr));
  gap: 1.75rem 2rem;
  align-items: start;
}

.app-footer__brand {
  min-width: 0;
}

.app-footer__logo-link {
  display: inline-flex;
  line-height: 0;
}

.app-footer__logo {
  display: block;
  height: 64px;
  width: auto;
}

.app-footer__tagline {
  margin: 0.85rem 0 1.1rem;
  max-width: 22rem;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: #555;
}

.app-footer__social {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-footer__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  border-radius: 10px;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.app-footer__social-link:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.app-footer__social-icon {
  display: block;
  width: 28px;
  height: 28px;
  filter: invert(37%) sepia(93%) saturate(3084%) hue-rotate(214deg) brightness(101%) contrast(101%);
}

.app-footer__col {
  min-width: 0;
}

.app-footer__heading {
  margin: 0 0 0.65rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111;
}

.app-footer__links {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.app-footer__link {
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
  text-decoration: none;
  transition: color 0.15s ease;
}

.app-footer__link:hover {
  color: #1a5fff;
}

.app-footer__bottom {
  box-sizing: border-box;
  max-width: 954px;
  margin: 0 auto;
  padding: 0 1rem 1.35rem;
  display: flex;
  justify-content: flex-end;
}

.app-footer__copy {
  margin: 0;
  font-size: 0.8125rem;
  color: #9a9a9a;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .app-footer__inner {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .app-footer__brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .app-footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
