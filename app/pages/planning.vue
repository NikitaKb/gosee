<template>
  <div class="planning-page">
    <div
      v-if="!hasKey"
      class="planning-page__warn planning-page__warn--standalone"
    >
      Задайте переменную окружения
      <code>NUXT_PUBLIC_YANDEX_MAPS_API_KEY</code>
      с ключом Yandex Maps API.
    </div>

    <client-only>
      <template v-if="hasKey">
        <div class="planning-page__shell">
          <div class="planning-page__card">
            <PlanningFormPanel
              v-model:route-name="routeName"
              v-model:city-query="cityQuery"
              v-model:theme="theme"
              v-model:pace="pace"
              v-model:time-start="timeStart"
              v-model:time-end="timeEnd"
              v-model:travel-mode-id="travelModeId"
              :waypoints="waypoints"
              :waypoints-summary="waypointsSummary"
              :route-estimate-hint="routeEstimateHint"
              :geocode-error="geocodeError"
              :disable-actions="false"
              :can-save="waypoints.length > 0"
              @remove-waypoint="removeWaypoint"
              @clear-waypoints="clearWaypoints"
              @apply-city="applyCity"
              @publish-route="publishRoute"
            />
            <div class="planning-page__map-col">
              <MapView
                ref="mapViewRef"
                v-model:waypoints="waypoints"
                :travel-mode="directionsMode"
                @update:path="onPathUpdate"
              />
            </div>
          </div>

         

          <section
            class="planning-page__preview"
            aria-label="Превью прогулки"
          >
            <StreetView
              :position="streetPosition"
              :heading="streetHeading"
            />
            <div class="planning-page__preview-controls">
              <Controls
                :is-playing="isPlaying"
                :has-path="path.length > 0"
                :can-play="path.length > 0"
                :can-step-back="currentIndex > 0"
                :can-step-fwd="currentIndex < path.length - 1"
                @play="play"
                @pause="pause"
                @next="onNext"
                @prev="onPrev"
                @stop="stop"
              />
            </div>
          </section>
        </div>
      </template>
      <template #fallback>
        <p class="planning-page__loading">
          Загрузка планировщика…
        </p>
      </template>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { DirectionsTravelMode, MapsLatLng } from '~/composables/useYandexMaps'
import Controls from '~/components/planning/Controls.vue'
import MapView from '~/components/planning/MapView.vue'
import PlanningFormPanel from '~/components/planning/PlanningFormPanel.vue'
import StreetView from '~/components/planning/StreetView.vue'


useHead({
  title: 'Виртуальный планировщик прогулок — GoSee',
})

const { apiKey, load, geocode, computeHeading, getYandex } = useYandexMaps()


const hasKey = computed(() => !!apiKey.value?.trim())

const mapViewRef = ref<{ centerMap: (p: MapsLatLng, z?: number) => void } | null>(null)

const routeName = ref('')
const cityQuery = ref('Москва')
const cityLabel = ref('Москва')
const geocodeError = ref('')
const theme = ref('')
const pace = ref('')
const timeStart = ref('')
const timeEnd = ref('')
const travelModeId = ref('walk')

const directionsMode = computed<DirectionsTravelMode>(() => {
  switch (travelModeId.value) {
    case 'bike':
    case 'roller':
      return 'bicycle'
    case 'car':
      return 'car'
    case 'transit':
      return 'masstransit'
    default:
      return 'pedestrian'
  }
})

const waypoints = ref<MapsLatLng[]>([])
const path = ref<MapsLatLng[]>([])

const waypointsSummary = computed(() => {
  if (waypoints.value.length === 0) {
    return ''
  }
  return waypoints.value
    .map(
      (p, i) =>
        `Точка ${i + 1}: ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`,
    )
    .join('\n')
})

const {
  currentIndex,
  isPlaying,
  currentPoint,
  play,
  pause,
  stop,
  next,
  prev,
} = useRoutePlayer(path, { intervalMs: 2500 })

const streetPosition = computed(() => currentPoint.value)

const streetHeading = computed(() => {
  const pts = path.value
  if (pts.length < 2) {
    return 0
  }
  const i = Math.min(Math.max(0, currentIndex.value), pts.length - 1)
  const cur = pts[i]!
  if (i >= pts.length - 1) {
    const prevPt = pts[i - 1]!
    return computeHeading(prevPt, cur)
  }
  const nextPt = pts[i + 1]!
  return computeHeading(cur, nextPt)
})

function onPathUpdate(next: MapsLatLng[]) {
  path.value = next
}

function onNext() {
  next()
}

function onPrev() {
  prev()
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function getDistanceMeters(a: MapsLatLng, b: MapsLatLng): number {
  const earthRadius = 6371000
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

function getRouteDistanceKm(points: MapsLatLng[]): number {
  if (points.length < 2) {
    return 0
  }
  let meters = 0
  for (let i = 1; i < points.length; i++) {
    meters += getDistanceMeters(points[i - 1]!, points[i]!)
  }
  return meters / 1000
}

function estimateDurationMinutes(distanceKm: number): number {
  if (distanceKm <= 0) {
    return 0
  }

  const paceSpeedMultiplier: Record<string, number> = {
    Спокойный: 0.85,
    Обычный: 1,
    Активный: 1.2,
  }

  const modeSpeedKmh: Record<string, number> = {
    walk: 5,
    bike: 15,
    roller: 13,
    car: 28,
    transit: 20,
  }

  const baseSpeed = modeSpeedKmh[travelModeId.value] ?? 5
  const paceMultiplier = paceSpeedMultiplier[pace.value] ?? 1
  const effectiveSpeed = Math.max(2, baseSpeed * paceMultiplier)

  const pureTravelMinutes = (distanceKm / effectiveSpeed) * 60
  const stopBufferByMode: Record<string, number> = {
    walk: 1.15,
    bike: 1.12,
    roller: 1.1,
    car: 1.2,
    transit: 1.25,
  }
  const modeBuffer = stopBufferByMode[travelModeId.value] ?? 1.15

  return Math.max(5, Math.round(pureTravelMinutes * modeBuffer))
}

const routeDistanceKm = computed(() => {
  const sourcePath = path.value.length >= 2 ? path.value : waypoints.value
  return getRouteDistanceKm(sourcePath)
})

const estimatedDurationMinutes = computed(() => estimateDurationMinutes(routeDistanceKm.value))

const routeEstimateHint = computed(() => {
  if (waypoints.value.length < 2 || routeDistanceKm.value <= 0) {
    return ''
  }
  return `Дистанция: ~${routeDistanceKm.value.toFixed(1)} км, длительность: ~${estimatedDurationMinutes.value} мин`
})

function removeWaypoint(index: number) {
  if (index < 0 || index >= waypoints.value.length) {
    return
  }
  const next = [...waypoints.value]
  next.splice(index, 1)
  waypoints.value = next
}

function clearWaypoints() {
  waypoints.value = []
  path.value = []
}

async function applyCity() {
  geocodeError.value = ''
  const q = cityQuery.value.trim()
  if (!q) {
    geocodeError.value = 'Введите название города'
    return
  }

  const ready = await load()
  if (!ready) {
    geocodeError.value = 'Не удалось загрузить карты. Попробуйте обновить страницу.'
    return
  }

  try {
    const loc = await geocode(q)
    cityLabel.value = q
    
    // Ждём до 5 попыток центрирования с интервалом
    let attempts = 0
    const maxAttempts = 5
    const attemptCenter = () => {
      attempts++
      
      if (!mapViewRef.value) {
        if (attempts < maxAttempts) {
          setTimeout(attemptCenter, 300)
        }
        return
      }
      
      try {
        mapViewRef.value.centerMap(loc, 13)
      } catch (err) {
        if (attempts < maxAttempts) {
          setTimeout(attemptCenter, 300)
        }
      }
    }
    
    attemptCenter()
    
    // Проверяем поддержку панорам для этого города
    const ymaps = getYandex() as any
    if (ymaps?.panorama?.isSupported?.()) {
      geocodeError.value = '✅ Панорамы доступны в этом городе'
    } else {
      geocodeError.value = '⚠️ Панорамы могут быть недоступны в этом городе'
    }
  } catch (e) {
    geocodeError.value = e instanceof Error ? e.message : 'Не удалось найти город'
  }
}

async function publishRoute() {
  await applyCity()
  
  if (waypoints.value.length >= 2) {
    const totalMinutes = estimatedDurationMinutes.value

    if (totalMinutes > 0) {
      // Устанавливаем время начала (текущее время, если не указано вручную)
      if (!timeStart.value) {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const mins = String(now.getMinutes()).padStart(2, '0')
        timeStart.value = `${hours}:${mins}`
      }

      const [startHour, startMin] = timeStart.value.split(':').map(Number)
      const endTime = new Date()
      endTime.setHours(startHour, startMin + totalMinutes)
      const endHours = String(endTime.getHours()).padStart(2, '0')
      const endMins = String(endTime.getMinutes()).padStart(2, '0')
      timeEnd.value = `${endHours}:${endMins}`
    }
  }
  
  await nextTick()
  document
    .querySelector('.planning-page__map-col')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<style scoped>
.planning-page {
  box-sizing: border-box;
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.75rem;
  min-height: 0;
  flex: 1;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1a1a1a;
  background: linear-gradient(165deg, #e2ecff 0%, #f2f5fb 42%, #f0f3f8 100%);
  border-radius: 0;
}

.planning-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.planning-page__card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 1.75rem 2rem;
  align-items: stretch;
  padding: clamp(1.25rem, 3vw, 2rem);
  border-radius: 22px;
  background: #fff;
  box-shadow:
    0 4px 24px rgba(15, 40, 90, 0.07),
    0 18px 48px rgba(43, 101, 255, 0.06);
  border: 1px solid rgba(232, 236, 243, 0.95);
}

.planning-page__map-col {
  min-width: 0;
  min-height: 420px;
  display: flex;
}

.planning-page__map-col :deep(.map-view) {
  flex: 1;
  min-height: 420px;
}

.planning-page__map-col :deep(.map-view__canvas) {
  min-height: 420px;
  border-radius: 16px;
}

.planning-page__map-col :deep(.map-view__hint) {
  font-size: 0.78rem;
  color: #777;
}

.planning-page__maps-help {
  margin: 0;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  background: #f0f4fc;
  border: 1px solid #d8e2f5;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #3d4d66;
}

.planning-page__maps-help-summary {
  cursor: pointer;
  font-weight: 600;
  color: #2b4a8f;
}

.planning-page__maps-help-body {
  margin: 0.5rem 0 0;
  padding-left: 0.25rem;
}

.planning-page__maps-help-body a {
  color: #2b65ff;
}

.planning-page__preview {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
}

.planning-page__preview-controls {
  position: sticky;
  top: 1rem;
}

.planning-page__warn {
  padding: 1.25rem 1rem;
  border-radius: 14px;
  background: #fff8e6;
  border: 1px solid #f0e0a8;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #5c4a00;
}

.planning-page__warn--standalone {
  margin-bottom: 1rem;
}

.planning-page__warn code {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
}

.planning-page__loading {
  margin: 0;
  padding: 2.5rem 1rem;
  text-align: center;
  color: #666;
}

@media (max-width: 920px) {
  .planning-page__card {
    grid-template-columns: 1fr;
  }

  .planning-page__map-col {
    min-height: 340px;
  }

  .planning-page__map-col :deep(.map-view__canvas) {
    min-height: 340px;
  }

  .planning-page__preview {
    grid-template-columns: 1fr;
  }

  .planning-page__preview-controls {
    position: static;
    width: 100%;
  }

  .planning-page__preview-controls :deep(.plan-controls) {
    width: 100%;
    justify-content: center;
  }
}
</style>
