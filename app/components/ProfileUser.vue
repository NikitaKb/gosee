<template>
  <div class="profile-user">
    <section class="profile-hero">
      <div class="profile-hero__main">
        <label class="profile-hero__avatar-label">
          <input
            type="file"
            class="profile-hero__avatar-input"
            accept="image/jpeg,image/png,image/webp,image/gif"
            :disabled="avatarUploading"
            @change="onAvatarFileChange"
          >
          <span class="profile-hero__avatar-wrap">
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              alt=""
              class="profile-hero__avatar"
              width="128"
              height="128"
            >
            <div
              v-else
              class="profile-hero__avatar profile-hero__avatar--placeholder"
              aria-hidden="true"
            >
              {{ initials }}
            </div>
            <span
              v-if="avatarUploading"
              class="profile-hero__avatar-overlay"
              aria-live="polite"
            >
              <span class="profile-hero__avatar-spinner" />
            </span>
          </span>
          
        </label>
        <div class="profile-hero__body">
          <div class="profile-hero__text">
          <h1 class="profile-hero__name">
            {{ profile.name }}
          </h1>
          <div class="profile-hero__bio-wrap">
            <textarea
              id="profile-bio-inline"
              v-model="bioDraft"
              class="profile-hero__bio-input"
              rows="3"
              maxlength="2000"
              placeholder="Расскажите о себе…"
              :disabled="bioSaving"
              aria-label="Описание профиля"
              @input="heroError = ''"
              @blur="saveBioIfChanged"
            />
          </div>
          <div class="profile-hero__meta">
            <label class="profile-hero__meta-item profile-hero__city-row">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
              <select
                v-model="cityDraft"
                class="profile-hero__city-select"
                :disabled="citySaving"
                aria-label="Город"
                @change="saveCityIfChanged"
              >
                <option value="">
                  Город не выбран
                </option>
                <option
                  v-for="c in cityOptions"
                  :key="c"
                  :value="c"
                >
                  {{ c }}
                </option>
              </select>
            </label>
            <span class="profile-hero__meta-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                />
                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                />
                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                />
              </svg>
              Присоединился {{ joinedLabel }}
            </span>
          </div>
          <p
            v-if="heroError"
            class="profile-hero__error"
            role="alert"
          >
            {{ heroError }}
          </p>
          </div>
          <button
            type="button"
            class="profile-hero__logout"
            aria-label="Выйти"
            @click="onLogout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <section
      class="profile-stats"
      aria-label="Статистика"
    >
      <article
        v-for="card in statCards"
        :key="card.id"
        class="profile-stat-card"
      >
        <div
          class="profile-stat-card__icon"
          aria-hidden="true"
        >
          <component :is="card.icon" />
        </div>
        <p class="profile-stat-card__label">
          {{ card.label }}
        </p>
        <p class="profile-stat-card__value">
          {{ card.value }}
        </p>
      </article>
    </section>

    <div class="profile-tabs-wrap">
      <div
        class="profile-tabs"
        role="tablist"
        aria-label="Разделы профиля"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'favorites'"
          class="profile-tab"
          :class="{ 'profile-tab--active': activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            :fill="activeTab === 'favorites' ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Избранное
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'walks'"
          class="profile-tab"
          :class="{ 'profile-tab--active': activeTab === 'walks' }"
          @click="activeTab = 'walks'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="18"
            />
            <line
              x1="16"
              y1="6"
              x2="16"
              y2="22"
            />
          </svg>
          Мои прогулки
        </button>
      </div>

      <div
        v-show="activeTab === 'favorites'"
        class="profile-panel profile-panel--flush"
        role="tabpanel"
      >
        <p class="profile-panel__caption">
          <template v-if="profile.favoritesCount === 0">
            Пока нет избранного в базе — ниже пример карточки.
          </template>
          <template v-else>
            В избранном {{ formatInt(profile.favoritesCount) }}
            {{ pluralFavorites(profile.favoritesCount) }}. Пример оформления:
          </template>
        </p>
        <WalkPreviewCard
          variant="favorite"
          :demo="demoMoscow"
        />
      </div>

      <div
        v-show="activeTab === 'walks'"
        class="profile-panel profile-panel--flush"
        role="tabpanel"
      >
        <p
          v-if="profile.walksCount === 0"
          class="profile-panel__caption"
        >
          У вас пока нет прогулок в каталоге — пример карточки:
        </p>
        <p
          v-else
          class="profile-panel__caption"
        >
          Прогулок в профиле: {{ formatInt(profile.walksCount) }}. Пример карточки:
        </p>
        <WalkPreviewCard
          variant="walk"
          :demo="demoMoscow"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/profile'
import { computed, h, ref, watch } from 'vue'

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  updated: [profile: UserProfile]
}>()

const { logout } = useAuth()

async function onLogout() {
  await logout()
  await navigateTo('/')
}

const activeTab = ref<'favorites' | 'walks'>('favorites')

const bioDraft = ref(props.profile.profileDescription ?? '')
const cityDraft = ref(props.profile.city ?? '')
const heroError = ref('')
const avatarUploading = ref(false)
const bioSaving = ref(false)
const citySaving = ref(false)

/** Города в списке; текущий город из профиля добавляется, если его нет в списке. */
const PROFILE_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Воронеж',
  'Пермь',
  'Волгоград',
  'Краснодар',
  'Сочи',
  'Тюмень',
  'Иркутск',
  'Барнаул',
] as const

const cityOptions = computed(() => {
  const extra = props.profile.city?.trim()
  const known = new Set<string>(PROFILE_CITIES)
  if (extra && !known.has(extra)) {
    return [extra, ...PROFILE_CITIES]
  }
  return [...PROFILE_CITIES]
})

watch(
  () => props.profile.profileDescription,
  (d) => {
    if (!bioSaving.value) {
      bioDraft.value = d ?? ''
    }
  },
)

watch(
  () => props.profile.city,
  (c) => {
    if (!citySaving.value) {
      cityDraft.value = c ?? ''
    }
  },
)

async function saveBioIfChanged() {
  const next = bioDraft.value.trim() || null
  const prev = props.profile.profileDescription?.trim() || null
  if (next === prev) {
    return
  }
  heroError.value = ''
  bioSaving.value = true
  try {
    const res = await $fetch<{ profile: UserProfile }>('/api/profile/me', {
      method: 'PATCH',
      body: { profileDescription: next },
      credentials: 'include',
    })
    emit('updated', res.profile)
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    heroError.value
      = err.data?.statusMessage
        ?? err.statusMessage
        ?? 'Не удалось сохранить описание'
  }
  finally {
    bioSaving.value = false
  }
}

async function saveCityIfChanged() {
  const next = cityDraft.value.trim() || null
  const prev = props.profile.city?.trim() || null
  if (next === prev) {
    return
  }
  heroError.value = ''
  citySaving.value = true
  try {
    const res = await $fetch<{ profile: UserProfile }>('/api/profile/me', {
      method: 'PATCH',
      body: { city: next },
      credentials: 'include',
    })
    emit('updated', res.profile)
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    heroError.value
      = err.data?.statusMessage
        ?? err.statusMessage
        ?? 'Не удалось сохранить город'
  }
  finally {
    citySaving.value = false
  }
}

async function onAvatarFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  heroError.value = ''
  avatarUploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const res = await $fetch<{ profile: UserProfile }>('/api/profile/avatar', {
      method: 'POST',
      body,
      credentials: 'include',
    })
    emit('updated', res.profile)
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    heroError.value
      = err.data?.statusMessage
        ?? err.statusMessage
        ?? 'Не удалось загрузить фото'
  }
  finally {
    avatarUploading.value = false
  }
}

const demoMoscow = {
  title: 'Великая Москва',
  typeLabel: 'Пешая прогулка',
  rating: '4.9',
  distance: '15 км',
  place: 'Красная площадь',
  description:
    'Почувствуйте невероятную энергетику столицы, где современные небоскребы соседствуют с древними соборами.',
  image:
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=560&h=360&fit=crop&q=80',
  images: [
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=560&h=360&fit=crop&q=80',
    'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=560&h=360&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=560&h=360&fit=crop&q=80',
  ],
} as const

const joinedLabel = computed(() => {
  const d = new Date(props.profile.createdAt)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
})

const initials = computed(() => {
  const parts = props.profile.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  const w = parts[0] ?? '?'
  return w.slice(0, 2).toUpperCase()
})

function formatInt(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n)
}

function formatRating(n: number): string {
  return n.toFixed(1)
}

function pluralFavorites(n: number): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m100 >= 11 && m100 <= 14) {
    return 'объектов'
  }
  if (m10 === 1) {
    return 'объект'
  }
  if (m10 >= 2 && m10 <= 4) {
    return 'объекта'
  }
  return 'объектов'
}

const IconUsers = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '22',
      height: '22',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    [
      h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '9', cy: '7', r: '4' }),
      h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }),
    ],
  )

const IconWalk = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '22',
      height: '22',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    [
      h('circle', { cx: '12', cy: '4', r: '2' }),
      h('path', { d: 'M10 22V12M14 22V12' }),
      h('path', { d: 'M8 12h8l-1 6H9l-1-6z' }),
    ],
  )

const IconStar = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '22',
      height: '22',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    [h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })],
  )

const IconHeart = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '22',
      height: '22',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    [h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })],
  )

const statCards = computed(() => [
  {
    id: 'followers',
    label: 'Подписчики',
    value: formatInt(props.profile.followersCount),
    icon: IconUsers,
  },
  {
    id: 'walks',
    label: 'Прогулки',
    value: formatInt(props.profile.walksCount),
    icon: IconWalk,
  },
  {
    id: 'rating',
    label: 'Рейтинг',
    value: formatRating(props.profile.rating),
    icon: IconStar,
  },
  {
    id: 'favorites',
    label: 'Избранное',
    value: formatInt(props.profile.favoritesCount),
    icon: IconHeart,
  },
])
</script>

<style scoped>
.profile-user {
  --pu-blue: #2b65ff;
  --pu-blue-soft: #e8f0ff;
  --pu-text: #1a1a1a;
  --pu-muted: #8e8e8e;
  --pu-bg-page: #f5f7fa;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--pu-text);
}

.profile-hero {
  position: relative;
  border-radius: 20px;
  padding: 1.75rem 1.5rem 1.65rem;
  background: var(--pu-blue);
  color: #fff;
  box-shadow: 0 10px 36px rgba(43, 101, 255, 0.28);
}

.profile-hero__main {
  display: flex;
  flex-wrap: wrap;
  gap: 1.35rem 1.5rem;
  align-items: flex-start;
}

.profile-hero__body {
  flex: 1;
  min-width: min(100%, 240px);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.profile-hero__avatar-label {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 9999px;
}

.profile-hero__avatar-label:focus-within .profile-hero__avatar,
.profile-hero__avatar-label:hover .profile-hero__avatar,
.profile-hero__avatar-label:hover .profile-hero__avatar--placeholder {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.85);
}

.profile-hero__avatar-input {
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

.profile-hero__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.profile-hero__avatar {
  display: block;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.profile-hero__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
  font-size: 2.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.profile-hero__avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
}

.profile-hero__avatar-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: profile-hero-spin 0.7s linear infinite;
}

@keyframes profile-hero-spin {
  to {
    transform: rotate(360deg);
  }
}

.profile-hero__avatar-hint {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  text-align: center;
  max-width: 128px;
  line-height: 1.25;
}

.profile-hero__text {
  flex: 1;
  min-width: min(100%, 200px);
}

.profile-hero__logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.profile-hero__logout:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.65);
}

.profile-hero__logout:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.45);
}

.profile-hero__name {
  margin: 0 0 0.55rem;
  font-size: clamp(1.55rem, 4vw, 1.95rem);
  font-weight: 700;
  line-height: 1.2;
  color: #fff;
}

.profile-hero__bio-wrap {
  margin: 0 0 0.85rem;
  max-width: min(100%, 56ch);
}

.profile-hero__bio-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0.5rem 0.65rem;
  border: 1px solid transparent;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.98);
  font: inherit;
  font-size: 0.98rem;
  line-height: 1.55;
  resize: vertical;
  min-height: 4.5rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.profile-hero__bio-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.profile-hero__bio-input:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.profile-hero__bio-input:focus {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
}

.profile-hero__bio-input:disabled {
  opacity: 0.75;
}

.profile-hero__city-row {
  gap: 0.4rem;
}

.profile-hero__city-select {
  appearance: none;
  min-width: 0;
  max-width: 200px;
  padding: 0.35rem 1.75rem 0.35rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.12);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.45rem center;
  color: rgba(255, 255, 255, 0.95);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.profile-hero__city-select:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.45);
}

.profile-hero__city-select:disabled {
  opacity: 0.7;
  cursor: wait;
}

.profile-hero__city-select option {
  color: #1a1a1a;
  background: #fff;
}

.profile-hero__error {
  margin: 0.65rem 0 0;
  font-size: 0.85rem;
  line-height: 1.35;
  color: #ffe0e0;
}

.profile-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.92);
}

.profile-hero__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1.35rem;
}

@media (max-width: 900px) {
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .profile-stats {
    grid-template-columns: 1fr;
  }
}

.profile-stat-card {
  border-radius: 16px;
  padding: 1.05rem 1.15rem;
  background: #fff;
  border: none;
  box-shadow: 0 4px 20px rgba(15, 30, 60, 0.06);
}

.profile-stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 0.7rem;
  border-radius: 12px;
  background: var(--pu-blue-soft);
  color: var(--pu-blue);
}

.profile-stat-card__label {
  margin: 0 0 0.25rem;
  font-size: 0.8125rem;
  color: var(--pu-muted);
  font-weight: 500;
}

.profile-stat-card__value {
  margin: 0;
  font-size: 1.28rem;
  font-weight: 700;
  color: #2c2c2c;
}

.profile-tabs-wrap {
  margin-top: 1.45rem;
}

.profile-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0.4rem;
  border-radius: 9999px;
  background: var(--pu-blue-soft);
}

.profile-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #5a6578;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.profile-tab:hover {
  color: var(--pu-blue);
}

.profile-tab--active {
  background: #fff;
  color: var(--pu-blue);
  box-shadow: 0 2px 12px rgba(43, 101, 255, 0.15);
}

.profile-panel {
  margin-top: 1.15rem;
  padding: 1.25rem 1rem;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(15, 30, 60, 0.05);
  min-height: 80px;
}

.profile-panel--flush {
  padding: 1.15rem 1rem 1.35rem;
}

.profile-panel__caption {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--pu-muted);
}
</style>
