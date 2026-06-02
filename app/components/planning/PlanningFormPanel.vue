<template>
  <div class="plan-form">
    <p class="plan-form__eyebrow">
      Конструктор прогулки
    </p>
    <h1 class="plan-form__title">
      Создайте свой маршрут
    </h1>

    <section class="plan-form__field plan-form__field--compact">
      <span class="plan-form__step">Поиск города</span>
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
          :value="cityQuery"
          type="text"
          class="plan-form__input plan-form__input--with-icon"
          placeholder="Город или адрес"
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
    </section>

    <section class="plan-form__field plan-form__field--compact">
      <label
        class="plan-form__step"
        for="pf-name"
      >Название прогулки</label>
      <input
        id="pf-name"
        :value="routeName"
        type="text"
        class="plan-form__input"
        placeholder="Придумайте название"
        @input="$emit('update:routeName', ($event.target as HTMLInputElement).value)"
      >
    </section>

    <section class="plan-form__field plan-form__field--muted plan-form__field--cover">
      <span class="plan-form__step">Превью</span>
      <div class="plan-form__cover-inline">
        <label class="plan-form__cover-btn">
          <input
            type="file"
            class="visually-hidden"
            accept="image/jpeg,image/png,image/webp"
            @change="onCoverChange"
          >
          Добавить фото
        </label>
        <button
          v-if="coverPreviewUrl"
          type="button"
          class="plan-form__cover-remove"
          @click="clearCover"
        >
          Удалить
        </button>
      </div>
      <p
        v-if="coverPreviewUrl"
        class="plan-form__cover-success"
      >
        Фото успешно добавлено.
      </p>
    </section>

    <section class="plan-form__field plan-form__field--compact">
      <label
        class="plan-form__step"
        for="pf-desc"
      >Краткое описание</label>
      <textarea
        id="pf-desc"
        :value="description"
        class="plan-form__input plan-form__textarea plan-form__textarea--desc"
        rows="3"
        maxlength="1200"
        placeholder="Расскажите, что интересного на маршруте"
        @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
      />
    </section>

    <section class="plan-form__field plan-form__field--compact">
      <span class="plan-form__step">Тип прогулки</span>
      <div
        class="plan-form__modes"
        role="group"
        aria-label="Тип прогулки"
      >
        <button
          v-for="m in planningModes"
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
            class="plan-form__mode-icon"
            width="24"
            height="24"
            aria-hidden="true"
          >
          <span class="visually-hidden">{{ m.label }}</span>
        </button>
      </div>
    </section>

    <section class="plan-form__route-builder">
      <div class="plan-form__route-builder-copy">
        <span class="plan-form__step">Маршрут на карте</span>
        <p class="plan-form__route-status">
          {{ routeSelectionHint }}
        </p>
      </div>
      <button
        type="button"
        class="plan-form__action-btn"
        :disabled="disableActions || !canBuildRoute"
        @click="$emit('buildRoute')"
      >
        Построить по дорогам
      </button>
    </section>

    <section class="plan-form__meta-grid">
      <div class="plan-form__field plan-form__field--compact plan-form__field--time">
        <span class="plan-form__step">Начало и конец прогулки</span>
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
            readonly
            disabled
          >
        </div>
        <p
          v-if="routeEstimateHint"
          class="plan-form__hint"
        >
          {{ routeEstimateHint }}
        </p>
      </div>

      <div class="plan-form__field plan-form__field--compact plan-form__field--address">
        <span class="plan-form__step">Адрес маршрута</span>
        <button
          type="button"
          class="plan-form__address-toggle"
          :disabled="waypoints.length === 0"
          @click="isAddressOpen = !isAddressOpen"
        >
          <span class="plan-form__address-toggle-text">
            {{ addressToggleLabel }}
          </span>
          <span
            class="plan-form__address-toggle-icon"
            :class="{ 'plan-form__address-toggle-icon--open': isAddressOpen }"
            aria-hidden="true"
          >⌄</span>
        </button>

        <div
          v-if="waypoints.length > 0 && isAddressOpen"
          class="plan-form__waypoints"
        >
          <div
            v-for="item in displayedWaypoints"
            :key="`${item.point.lat}-${item.point.lng}-${item.index}`"
            class="plan-form__waypoint-item"
          >
            <span class="plan-form__waypoint-text">
              {{ waypointTitle(item.index, waypoints.length) }}:
              {{ item.point.label || `${item.point.lat.toFixed(5)}, ${item.point.lng.toFixed(5)}` }}
            </span>
            <button
              type="button"
              class="plan-form__waypoint-remove"
              :aria-label="`Удалить точку ${item.index + 1}`"
              @click="$emit('removeWaypoint', item.index)"
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
              Очистить
            </button>
          </div>
        </div>

      </div>

      <div class="plan-form__field plan-form__field--compact">
        <label
          class="plan-form__step"
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
    </section>

    <p
      v-if="geocodeError"
      class="plan-form__err"
      role="alert"
    >
      {{ geocodeError }}
    </p>

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

    <div
      v-if="cropDialog.open"
      class="plan-form__cropper-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Редактирование обложки маршрута"
    >
      <div class="plan-form__cropper">
        <div class="plan-form__cropper-header">
          <h2 class="plan-form__cropper-title">
            Настройте обложку
          </h2>
          <button
            type="button"
            class="plan-form__cropper-close"
            @click="closeCropper"
          >
            Закрыть
          </button>
        </div>

        <div class="plan-form__cropper-frame">
          <img
            :src="cropDialog.imageUrl"
            alt=""
            class="plan-form__cropper-image"
            :style="cropImageStyle"
          >
        </div>

        <div class="plan-form__cropper-controls">
          <label class="plan-form__cropper-control">
            <span>Масштаб</span>
            <input
              v-model="cropDialog.zoom"
              type="range"
              min="1"
              max="2.5"
              step="0.01"
            >
          </label>
          <label class="plan-form__cropper-control">
            <span>Горизонталь</span>
            <input
              v-model="cropDialog.offsetX"
              type="range"
              min="-100"
              max="100"
              step="1"
            >
          </label>
          <label class="plan-form__cropper-control">
            <span>Вертикаль</span>
            <input
              v-model="cropDialog.offsetY"
              type="range"
              min="-100"
              max="100"
              step="1"
            >
          </label>
        </div>

        <div class="plan-form__cropper-actions">
          <button
            type="button"
            class="plan-form__cover-remove"
            @click="closeCropper"
          >
            Отмена
          </button>
          <button
            type="button"
            class="plan-form__action-btn"
            @click="applyCrop"
          >
            Сохранить фото
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { YandexWaypoint } from '~/composables/useYandexMaps'
import iconBicycle from '~/assets/images/icons/bicycle.svg'
import iconCar from '~/assets/images/icons/car.svg'
import iconMap from '~/assets/images/icons/map.svg'
import iconRoller from '~/assets/images/icons/roller.svg'
import iconSearch from '~/assets/images/icons/search.svg'
import iconWalking from '~/assets/images/icons/walking.svg'

const props = defineProps<{
  routeName: string
  description: string
  coverPreviewUrl: string | null
  cityQuery: string
  routeSelectionHint: string
  theme: string
  pace: string
  timeStart: string
  timeEnd: string
  travelModeId: string
  waypoints: YandexWaypoint[]
  waypointsSummary: string
  routeEstimateHint: string
  geocodeError: string
  disableActions: boolean
  canBuildRoute: boolean
  canSave: boolean
}>()

const emit = defineEmits<{
  'update:routeName': [v: string]
  'update:description': [v: string]
  'update:cityQuery': [v: string]
  'update:theme': [v: string]
  'update:pace': [v: string]
  'update:timeStart': [v: string]
  'update:travelModeId': [v: string]
  removeWaypoint: [index: number]
  clearWaypoints: []
  applyCity: []
  buildRoute: []
  publishRoute: []
  'update:coverFile': [file: File | null]
}>()

const showAllWaypoints = ref(false)
const isAddressOpen = ref(false)
const cropDialog = reactive({
  open: false,
  imageUrl: '',
  fileType: 'image/jpeg',
  zoom: '1.2',
  offsetX: '0',
  offsetY: '0',
})

const displayedWaypoints = computed(() => {
  const indexed = props.waypoints.map((point, index) => ({ point, index }))
  return (showAllWaypoints.value ? indexed : indexed.slice(0, 3))
})

const addressToggleLabel = computed(() => {
  if (!props.waypoints.length) {
    return 'Адреса появятся после выбора точек'
  }
  const startLabel = props.waypoints[0]?.label || `${props.waypoints[0]!.lat.toFixed(4)}, ${props.waypoints[0]!.lng.toFixed(4)}`
  if (props.waypoints.length === 1) {
    return startLabel
  }
  const endPoint = props.waypoints[props.waypoints.length - 1]!
  const endLabel = endPoint.label || `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}`
  return `${startLabel} → ${endLabel}`
})

const cropImageStyle = computed(() => ({
  transform: `translate(${cropDialog.offsetX}%, ${cropDialog.offsetY}%) scale(${cropDialog.zoom})`,
}))

function onCoverChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  if (!file) {
    return
  }
  openCropper(file)
}

function clearCover() {
  emit('update:coverFile', null)
}

function openCropper(file: File) {
  if (cropDialog.imageUrl) {
    URL.revokeObjectURL(cropDialog.imageUrl)
  }
  cropDialog.open = true
  cropDialog.imageUrl = URL.createObjectURL(file)
  cropDialog.fileType = file.type || 'image/jpeg'
  cropDialog.zoom = '1.2'
  cropDialog.offsetX = '0'
  cropDialog.offsetY = '0'
}

function closeCropper() {
  cropDialog.open = false
  if (cropDialog.imageUrl) {
    URL.revokeObjectURL(cropDialog.imageUrl)
  }
  cropDialog.imageUrl = ''
}

async function applyCrop() {
  const img = new Image()
  img.src = cropDialog.imageUrl
  await new Promise((resolve, reject) => {
    img.onload = () => resolve(true)
    img.onerror = reject
  })

  const canvas = document.createElement('canvas')
  const targetWidth = 1200
  const targetHeight = 750
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    closeCropper()
    return
  }

  const zoom = Number(cropDialog.zoom)
  const offsetX = Number(cropDialog.offsetX) / 100
  const offsetY = Number(cropDialog.offsetY) / 100
  const baseScale = Math.max(targetWidth / img.width, targetHeight / img.height)
  const scale = baseScale * zoom
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  const maxOffsetX = Math.max(0, (drawWidth - targetWidth) / 2)
  const maxOffsetY = Math.max(0, (drawHeight - targetHeight) / 2)
  const dx = (targetWidth - drawWidth) / 2 - maxOffsetX * offsetX
  const dy = (targetHeight - drawHeight) / 2 - maxOffsetY * offsetY

  ctx.fillStyle = '#eef1f6'
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight)

  const mimeType = cropDialog.fileType === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.92))
  if (!blob) {
    closeCropper()
    return
  }

  const extension = mimeType === 'image/png' ? 'png' : 'jpg'
  emit('update:coverFile', new File([blob], `cover.${extension}`, { type: mimeType }))
  closeCropper()
}

function waypointTitle(index: number, total: number) {
  if (index === 0) {
    return 'Старт'
  }
  if (index === total - 1) {
    return 'Финиш'
  }
  return `Точка ${index + 1}`
}

const themeOptions = [
  'Исторический центр',
  'Парки и набережные',
  'Архитектура и дворы',
  'Кофе и неформальные маршруты',
  'Семейная прогулка',
] as const

const planningModes = [
  { id: 'walk', label: 'Пешком', icon: iconWalking },
  { id: 'roller', label: 'Ролики', icon: iconRoller },
  { id: 'bike', label: 'Велосипед', icon: iconBicycle },
  { id: 'car', label: 'Авто', icon: iconCar },
] as const

onUnmounted(() => {
  if (cropDialog.imageUrl) {
    URL.revokeObjectURL(cropDialog.imageUrl)
  }
})
</script>

<style scoped>
.plan-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-width: 0;
}

.plan-form__title {
  margin: 0 0 0.15rem;
  font-size: clamp(1.5rem, 4vw, 1.9rem);
  font-weight: 700;
  color: #111;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.plan-form__eyebrow {
  margin: 0 0 0.35rem;
  color: #2b65ff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.plan-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #edf1f7;
  min-width: 0;
}

.plan-form__field + .plan-form__field {
  margin-top: -0.15rem;
}

.plan-form__field--compact {
  gap: 0.45rem;
  padding: 0.95rem 1rem;
}

.plan-form__field--muted {
  background: #f8fafc;
}

.plan-form__field--cover {
  gap: 0.4rem;
  padding: 0.7rem 0.85rem;
}

.plan-form__route-builder {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
  align-items: stretch;
  padding: 1rem;
  border-radius: 18px;
  background: linear-gradient(135deg, #f7faff 0%, #eef4ff 100%);
  border: 1px solid #dbe6ff;
}

.plan-form__route-builder-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.plan-form__meta-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.875rem;
  align-items: start;
}

.plan-form__step {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.35;
}

.plan-form__hint {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: #6b7280;
  overflow-wrap: anywhere;
}

.plan-form__input {
  width: 100%;
  box-sizing: border-box;
  min-height: 3rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #eef1f6;
  font: inherit;
  font-size: 1rem;
  line-height: 1.4;
  color: #1a1a1a;
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
  flex-direction: column;
  align-items: stretch;
  gap: 0.625rem;
}

.plan-form__input-icon {
  position: absolute;
  top: 1rem;
  left: 0.95rem;
  opacity: 0.45;
  pointer-events: none;
}

.plan-form__input--with-icon {
  padding-left: 2.5rem;
  padding-right: 0.95rem;
}

.plan-form__search {
  min-height: 3rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.plan-form__cover-inline,
.plan-form__cover-actions,
.plan-form__waypoints-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.plan-form__cover-btn,
.plan-form__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(43, 101, 255, 0.2);
  text-align: center;
}

.plan-form__field--cover .plan-form__cover-btn,
.plan-form__field--cover .plan-form__cover-remove {
  min-height: 2.35rem;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  font-size: 0.875rem;
}

.plan-form__cover-remove,
.plan-form__waypoint-remove,
.plan-form__expand-waypoints,
.plan-form__clear-waypoints {
  border: none;
  min-height: 2.75rem;
  border-radius: 10px;
  padding: 0.625rem 0.9rem;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.plan-form__cover-remove {
  background: #eef1f6;
  color: #444;
}

.plan-form__cover-success {
  margin: 0;
  font-size: 0.875rem;
  color: #1f7a4c;
}

.plan-form__route-status {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: #24344d;
  overflow-wrap: anywhere;
}

.plan-form__textarea {
  resize: vertical;
  min-height: 4.5rem;
  line-height: 1.45;
}

.plan-form__textarea--desc {
  min-height: 5.5rem;
}

.plan-form__modes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.plan-form__mode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3rem;
  border: 1px solid rgba(43, 101, 255, 0.22);
  border-radius: 12px;
  background: #f4f8ff;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.plan-form__mode:hover {
  border-color: rgba(43, 101, 255, 0.38);
  transform: translateY(-1px);
}

.plan-form__mode--active {
  background: #2b65ff;
  border-color: #2b65ff;
  box-shadow: 0 4px 14px rgba(43, 101, 255, 0.35);
}

.plan-form__mode-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(34%) sepia(87%) saturate(2711%) hue-rotate(219deg) brightness(103%) contrast(101%);
}

.plan-form__mode--active .plan-form__mode-icon {
  filter: brightness(0) invert(1);
}

.plan-form__address-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid #dde4f1;
  border-radius: 12px;
  background: #f6f8fc;
  color: #30415c;
  font: inherit;
  cursor: pointer;
}

.plan-form__address-toggle:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.plan-form__address-toggle-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9375rem;
}

.plan-form__address-toggle-icon {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.plan-form__address-toggle-icon--open {
  transform: rotate(180deg);
}

.plan-form__waypoints {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.plan-form__waypoint-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0.6rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #dde4f1;
  background: #f6f8fc;
}

.plan-form__waypoint-text {
  min-width: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: #384152;
  overflow-wrap: anywhere;
}

.plan-form__waypoint-remove,
.plan-form__expand-waypoints {
  background: #eef2ff;
  color: #2b65ff;
}

.plan-form__clear-waypoints {
  background: #ffe8ec;
  color: #b00020;
}

.plan-form__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2rem;
}

.plan-form__time-row {
  display: grid;
  grid-template-columns: minmax(8.25rem, 1fr);
  align-items: center;
  gap: 0.5rem;
}

.plan-form__time {
  min-width: 8.25rem;
  padding-inline: 0.65rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.plan-form__time::-webkit-calendar-picker-indicator {
  opacity: 0.9;
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
  min-height: 3.25rem;
  padding: 0.95rem 1.25rem;
  border: none;
  border-radius: 14px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(43, 101, 255, 0.3);
}

.plan-form__cta:disabled,
.plan-form__action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.plan-form__cta-icon {
  filter: brightness(0) invert(1);
}

.plan-form__err {
  margin: 0;
  font-size: 0.875rem;
  color: #b00020;
}

.plan-form__cropper-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.58);
}

.plan-form__cropper {
  width: min(100%, 760px);
  padding: 1rem;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
}

.plan-form__cropper-header,
.plan-form__cropper-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.plan-form__cropper-title {
  margin: 0;
  font-size: 1.0625rem;
  color: #172033;
}

.plan-form__cropper-close {
  border: none;
  background: transparent;
  color: #5f6b7d;
  font: inherit;
  cursor: pointer;
}

.plan-form__cropper-frame {
  position: relative;
  width: 100%;
  margin: 1rem 0;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 18px;
  background: #0f172a;
}

.plan-form__cropper-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
}

.plan-form__cropper-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.plan-form__cropper-control {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;
  color: #4b5563;
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

@media (max-width: 480px) {
  .plan-form__field,
  .plan-form__field--compact,
  .plan-form__route-builder {
    padding-inline: 0.875rem;
  }

  .plan-form__cta {
    font-size: 0.95rem;
  }
}

@media (min-width: 481px) {
  .plan-form__input-wrap {
    flex-direction: row;
    align-items: center;
  }

  .plan-form__input-wrap .plan-form__input {
    flex: 1;
  }

  .plan-form__search {
    width: auto;
    flex-shrink: 0;
  }

  .plan-form__modes {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .plan-form__time-row {
    grid-template-columns: minmax(8.25rem, 1fr) auto minmax(8.25rem, 1fr);
  }

  .plan-form__time-sep {
    display: inline;
  }

  .plan-form__waypoint-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .plan-form__waypoint-remove {
    flex-shrink: 0;
  }
}

@media (max-width: 767px) {
  .plan-form__time-sep {
    display: none;
  }

  .plan-form__cropper-header,
  .plan-form__cropper-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .plan-form__cropper-actions > * {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .plan-form__meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .plan-form__field--time {
    grid-column: 1 / -1;
  }

  .plan-form__route-builder {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .plan-form__action-btn {
    width: auto;
  }

  .plan-form__cropper-controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .plan-form__cropper-header,
  .plan-form__cropper-actions {
    flex-direction: row;
    align-items: center;
  }
}

@media (min-width: 1024px) {
  .plan-form__field {
    padding: 1rem 1.05rem;
  }

  .plan-form__field--compact {
    padding: 0.9rem 1rem;
  }

  .plan-form__cover-btn,
  .plan-form__action-btn {
    width: auto;
  }
}
</style>
