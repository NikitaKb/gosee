<template>
  <div class="plan-form">
    <h1 class="plan-form__title">
      Создайте свой маршрут
    </h1>

    <div class="plan-form__field">
      <span class="plan-form__label">Выбери город</span>
      <div class="plan-form__cover">
        <div class="plan-form__input-wrap">
        <img
          :src="iconSearch"
          alt=""
          width="18"
          height="18"
          class="plan-form__input-icon"
          aria-hidden="true"
        >
        <input
          id="pf-city"
          :value="cityQuery"
          type="text"
          class="plan-form__input plan-form__input--with-icon"
          placeholder="Поиск…"
          autocomplete="address-level2"
          @keyup.enter.prevent="$emit('applyCity')"
          @input="$emit('update:cityQuery', ($event.target as HTMLInputElement).value)"
        >
        <button
          type="button"
          class="plan-form__search"
          @click="$emit('applyCity')"
        >
          Найти
        </button>
      </div>
        <div class="plan-form__field">
      <label
        class="plan-form__label"
        for="pf-name"
      >Название прогулки</label>
      <input
        id="pf-name"
        :value="routeName"
        type="text"
        class="plan-form__input"
        placeholder="Придумайте название…"
        @input="$emit('update:routeName', ($event.target as HTMLInputElement).value)"
      >
    </div><label
        class="plan-form__label"
        for="pf-name"
      >Превью прогулки</label>
        <div
          class="plan-form__cover-preview"
          :class="{ 'plan-form__cover-preview--empty': !coverPreviewUrl }"
        >
          <img
            v-if="coverPreviewUrl"
            :src="coverPreviewUrl"
            alt=""
            class="plan-form__cover-img"
          >
          <span
            v-else
            class="plan-form__cover-placeholder"
          >Фото не выбрано</span>
        </div>
        <div class="plan-form__cover-actions">
          <label class="plan-form__cover-btn">
            <input
              type="file"
              class="visually-hidden"
              accept="image/jpeg,image/png,image/webp"
              @change="onCoverChange"
            >
            Выбрать фото
          </label>
          <button
            v-if="coverPreviewUrl"
            type="button"
            class="plan-form__cover-remove"
            @click="clearCover"
          >
            Убрать
          </button>
        </div>
        <p class="plan-form__cover-hint">
          JPEG, PNG или WebP, до 4 МБ — покажется на карточке прогулки.
        </p>
      </div>
    </div>

    <div class="plan-form__field">
      <label
        class="plan-form__label"
        for="pf-desc"
      >Краткое описание</label>
      <textarea
        id="pf-desc"
        :value="description"
        class="plan-form__input plan-form__textarea plan-form__textarea--desc"
        rows="3"
        maxlength="1200"
        placeholder="Расскажите, что интересного на маршруте…"
        @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    

    <div class="plan-form__field">
      <span class="plan-form__label">Тип прогулки</span>
      <div
        class="plan-form__modes"
        role="group"
        aria-label="Тип прогулки"
      >
        <button
          v-for="m in modes"
          :key="m.id"
          type="button"
          class="plan-form__mode"
          :class="{ 'plan-form__mode--active': travelModeId === m.id }"
          :title="m.label"
          :aria-pressed="travelModeId === m.id"
          @click="$emit('update:travelModeId', m.id)"
        >
          <img
            :src="m.icon"
            alt=""
            width="22"
            height="22"
            class="plan-form__mode-icon"
          >
          <span class="visually-hidden">{{ m.label }}</span>
        </button>
      </div>
    </div>

    <div class="plan-form__field">
      
     
      <p
        v-if="geocodeError"
        class="plan-form__err"
        role="alert"
      >
        {{ geocodeError }}
      </p>
    </div>

    <div class="plan-form__field">
      <label
        class="plan-form__label"
        for="pf-theme"
      >Тематика</label>
      <select
        id="pf-theme"
        :value="theme"
        class="plan-form__input plan-form__select"
        @change="$emit('update:theme', ($event.target as HTMLSelectElement).value)"
      >
        <option
          value=""
          disabled
        >
          Выберите тематику
        </option>
        <option
          v-for="t in themeOptions"
          :key="t"
          :value="t"
        >
          {{ t }}
        </option>
      </select>
    </div>

    <div class="plan-form__field">
      <label
        class="plan-form__label"
        for="pf-points"
      >Точки маршрута</label>
      <div
        v-if="waypoints.length"
        class="plan-form__waypoints"
      >
        <div
          v-for="(p, idx) in (showAllWaypoints ? waypoints : waypoints.slice(0, 2))"
          :key="`${p.lat}-${p.lng}-${idx}`"
          class="plan-form__waypoint-item"
        >
          <span class="plan-form__waypoint-text">
            Точка {{ idx + 1 }}: {{ p.lat.toFixed(5) }}, {{ p.lng.toFixed(5) }}
          </span>
          <button
            type="button"
            class="plan-form__waypoint-remove"
            :aria-label="`Удалить точку ${idx + 1}`"
            @click="$emit('removeWaypoint', idx)"
          >
            Удалить
          </button>
        </div>
        <div class="plan-form__waypoints-actions">
          <button
            v-if="waypoints.length > 2 && !showAllWaypoints"
            type="button"
            class="plan-form__expand-waypoints"
            @click="showAllWaypoints = true"
          >
            +{{ waypoints.length - 2 }} ещё
          </button>
          <button
            v-else-if="waypoints.length > 2 && showAllWaypoints"
            type="button"
            class="plan-form__expand-waypoints"
            @click="showAllWaypoints = false"
          >
            Свернуть
          </button>
          <button
            type="button"
            class="plan-form__clear-waypoints"
            @click="$emit('clearWaypoints')"
          >
            Очистить все точки
          </button>
        </div>
      </div>
      <textarea
        v-else
        id="pf-points"
        :value="waypointsSummary"
        readonly
        rows="3"
        class="plan-form__input plan-form__textarea"
        placeholder="Тут появятся точки вашего путешествия…"
      />
    </div>

    <div class="plan-form__field">
      <label
        class="plan-form__label"
        for="pf-pace"
      >Темп прогулки</label>
      <select
        id="pf-pace"
        :value="pace"
        class="plan-form__input plan-form__select"
        @change="$emit('update:pace', ($event.target as HTMLSelectElement).value)"
      >
        <option
          value=""
          disabled
        >
          Выберите темп
        </option>
        <option
          v-for="p in paceOptions"
          :key="p"
          :value="p"
        >
          {{ p }}
        </option>
      </select>
    </div>

    <div class="plan-form__field">
      <span class="plan-form__label">Начало — конец прогулки</span>
      <div class="plan-form__time-row">
        <input
          :value="timeStart"
          type="time"
          class="plan-form__input plan-form__time"
          aria-label="Время начала"
          @input="$emit('update:timeStart', ($event.target as HTMLInputElement).value)"
        >
        <span
          class="plan-form__time-sep"
          aria-hidden="true"
        >—</span>
        <input
          :value="timeEnd"
          type="time"
          class="plan-form__input plan-form__time"
          aria-label="Время окончания"
          @input="$emit('update:timeEnd', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <p
        v-if="routeEstimateHint"
        class="plan-form__time-hint"
      >
        {{ routeEstimateHint }}
      </p>
    </div>

    <button
      type="button"
      class="plan-form__cta"
      :disabled="disableActions || !canSave"
      @click="$emit('publishRoute')"
    >
      <img
        :src="iconMap"
        alt=""
        width="20"
        height="20"
        class="plan-form__cta-icon"
      >
      Опубликовать маршрут
    </button>
  </div>
</template>

<script setup lang="ts">
import type { YandexMapsLatLng } from '~/composables/useYandexMaps'
import iconBicycle from '~/assets/images/icons/bicycle.svg'
import iconBus from '~/assets/images/icons/bus.svg'
import iconMap from '~/assets/images/icons/map.svg'
import iconRoad from '~/assets/images/icons/road.svg'
import iconSearch from '~/assets/images/icons/search.svg'
import iconWalking from '~/assets/images/icons/walking.svg'

defineProps<{
  routeName: string
  description: string
  /** URL превью (blob: или уже загруженный путь). */
  coverPreviewUrl: string | null
  cityQuery: string
  theme: string
  pace: string
  timeStart: string
  timeEnd: string
  travelModeId: string
  waypoints: YandexMapsLatLng[]
  waypointsSummary: string
  routeEstimateHint: string
  geocodeError: string
  disableActions: boolean
  canSave: boolean
}>()

const emit = defineEmits<{
  'update:routeName': [v: string]
  'update:description': [v: string]
  'update:cityQuery': [v: string]
  'update:theme': [v: string]
  'update:pace': [v: string]
  'update:timeStart': [v: string]
  'update:timeEnd': [v: string]
  'update:travelModeId': [v: string]
  removeWaypoint: [index: number]
  clearWaypoints: []
  applyCity: []
  publishRoute: []
  'update:coverFile': [file: File | null]
}>()

const showAllWaypoints = ref(false)

function onCoverChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  emit('update:coverFile', file)
}

function clearCover() {
  emit('update:coverFile', null)
}

const themeOptions = [
  'Исторический центр',
  'Парки и набережные',
  'Архитектура и дворы',
  'Кофе и неформальные маршруты',
  'Семейная прогулка',
] as const

const paceOptions = ['Спокойный', 'Обычный', 'Активный'] as const

const modes = [
  { id: 'walk', label: 'Пешком', icon: iconWalking },
  { id: 'bike', label: 'Велосипед', icon: iconBicycle },
  { id: 'car', label: 'Авто', icon: iconRoad },
  { id: 'transit', label: 'Транспорт', icon: iconBus },
  { id: 'roller', label: 'Ролики', icon: iconBicycle },
] as const
</script>

<style scoped>
.plan-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  min-width: 0;
}

.plan-form__title {
  margin: 0 0 0.15rem;
  font-size: clamp(1.35rem, 3vw, 1.65rem);
  font-weight: 700;
  color: #111;
  letter-spacing: -0.02em;
}

.plan-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.plan-form__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #444;
}

.plan-form__input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.65rem 0.85rem;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #eef1f6;
  font: inherit;
  font-size: 0.9375rem;
  color: #1a1a1a;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.plan-form__input::placeholder {
  color: #8a9099;
}

.plan-form__input:hover:not(:disabled) {
  background: #e8ecf3;
}

.plan-form__input:focus {
  outline: none;
  background: #fff;
  border-color: #c5d4f5;
  box-shadow: 0 0 0 3px rgba(43, 101, 255, 0.18);
}

.plan-form__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.plan-form__input-icon {
  position: absolute;
  left: 0.85rem;
  opacity: 0.45;
  pointer-events: none;
}

.plan-form__input--with-icon {
  padding-left: 2.35rem;
  padding-right: 5.65rem;
}

.plan-form__search {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: 10px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.plan-form__search:hover {
  background: #254fcc;
  box-shadow: 0 4px 12px rgba(43, 101, 255, 0.28);
}

.plan-form__search:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(43, 101, 255, 0.24);
}

.plan-form__search:disabled {
  background: #9eabdc;
  cursor: not-allowed;
}

.plan-form__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2rem;
}

.plan-form__textarea {
  resize: vertical;
  min-height: 4.5rem;
  line-height: 1.45;
}

.plan-form__textarea--desc {
  min-height: 5.5rem;
}

.plan-form__cover {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.plan-form__cover-preview {
  aspect-ratio: 16 / 10;
  max-height: 200px;
  border-radius: 14px;
  overflow: hidden;
  background: #eef1f6;
  border: 1px dashed #c5cdd9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-form__cover-preview--empty {
  min-height: 140px;
}

.plan-form__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.plan-form__cover-placeholder {
  font-size: 0.875rem;
  color: #8a9099;
}

.plan-form__cover-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.plan-form__cover-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.plan-form__cover-btn:hover {
  background: #254fcc;
}

.plan-form__cover-remove {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 0.85rem;
  background: #eef1f6;
  color: #444;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.plan-form__cover-remove:hover {
  background: #e2e8f2;
}

.plan-form__cover-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.35;
}

.plan-form__waypoints {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.plan-form__waypoints-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.2rem;
}

.plan-form__waypoint-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  border: 1px solid #dde4f1;
  background: #f6f8fc;
}

.plan-form__waypoint-text {
  font-size: 0.8125rem;
  color: #384152;
}

.plan-form__waypoint-remove {
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
  background: #eef2ff;
  color: #2b65ff;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.plan-form__waypoint-remove:hover {
  background: #dfe8ff;
}

.plan-form__clear-waypoints {
  border: none;
  border-radius: 10px;
  padding: 0.45rem 0.7rem;
  background: #ffe8ec;
  color: #b00020;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.plan-form__clear-waypoints:hover {
  background: #ffd9e0;
}

.plan-form__expand-waypoints {
  border: none;
  border-radius: 10px;
  padding: 0.45rem 0.7rem;
  background: #e8f0ff;
  color: #2b65ff;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.plan-form__expand-waypoints:hover {
  background: #d8e6ff;
}

.plan-form__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.plan-form__mode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: #eef1f6;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.12s ease,
    box-shadow 0.15s ease;
}

.plan-form__mode:hover {
  background: #e2e8f2;
  transform: translateY(-1px);
}

.plan-form__mode--active {
  background: #2b65ff;
  box-shadow: 0 4px 14px rgba(43, 101, 255, 0.35);
}

.plan-form__mode--active .plan-form__mode-icon {
  filter: brightness(0) invert(1);
}

.plan-form__mode-icon {
  display: block;
  opacity: 0.92;
}

.plan-form__time-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan-form__time {
  flex: 1;
  min-width: 0;
}

.plan-form__time-sep {
  color: #888;
  font-weight: 500;
}

.plan-form__time-hint {
  margin: 0.1rem 0 0;
  font-size: 0.78rem;
  color: #586277;
}

.plan-form__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.85rem 1.25rem;
  border: none;
  border-radius: 14px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(43, 101, 255, 0.3);
  transition:
    background 0.15s ease,
    transform 0.12s ease,
    opacity 0.15s ease;
}

.plan-form__cta:hover:not(:disabled) {
  background: #1f52d8;
  transform: translateY(-1px);
}

.plan-form__cta:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.plan-form__cta-icon {
  filter: brightness(0) invert(1);
}

.plan-form__err {
  margin: 0;
  font-size: 0.8125rem;
  color: #b00020;
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
</style>
