<template>
  <div class="plan-form">
    <h1 class="plan-form__title">
      Создайте свой маршрут
    </h1>

    <div class="plan-form__field">
      <label
        class="plan-form__label"
        for="pf-name"
      >Название</label>
      <input
        id="pf-name"
        :value="routeName"
        type="text"
        class="plan-form__input"
        placeholder="Придумайте название…"
        @input="$emit('update:routeName', ($event.target as HTMLInputElement).value)"
      >
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
      <label
        class="plan-form__label"
        for="pf-city"
      >Найдите город</label>
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
          @keyup.enter="$emit('applyCity')"
          @input="$emit('update:cityQuery', ($event.target as HTMLInputElement).value)"
        >
      </div>
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
      <textarea
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
    </div>

    <button
      type="button"
      class="plan-form__cta"
      :disabled="disableActions"
      @click="$emit('startPlanning')"
    >
      <img
        :src="iconMap"
        alt=""
        width="20"
        height="20"
        class="plan-form__cta-icon"
      >
      Начать планирование
    </button>

    <button
      type="button"
      class="plan-form__save"
      :disabled="disableActions || !canSave"
      @click="$emit('saveRoute')"
    >
      Сохранить маршрут в галерею
    </button>
  </div>
</template>

<script setup lang="ts">
import iconBicycle from '~/assets/images/icons/bicycle.svg'
import iconBus from '~/assets/images/icons/bus.svg'
import iconMap from '~/assets/images/icons/map.svg'
import iconRoad from '~/assets/images/icons/road.svg'
import iconSearch from '~/assets/images/icons/search.svg'
import iconWalking from '~/assets/images/icons/walking.svg'

defineProps<{
  routeName: string
  cityQuery: string
  theme: string
  pace: string
  timeStart: string
  timeEnd: string
  travelModeId: string
  waypointsSummary: string
  geocodeError: string
  disableActions: boolean
  canSave: boolean
}>()

defineEmits<{
  'update:routeName': [v: string]
  'update:cityQuery': [v: string]
  'update:theme': [v: string]
  'update:pace': [v: string]
  'update:timeStart': [v: string]
  'update:timeEnd': [v: string]
  'update:travelModeId': [v: string]
  applyCity: []
  startPlanning: []
  saveRoute: []
}>()

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

.plan-form__save {
  width: 100%;
  padding: 0.55rem;
  border: none;
  background: none;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2b65ff;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.plan-form__save:hover:not(:disabled) {
  color: #1f52d8;
}

.plan-form__save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: none;
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
