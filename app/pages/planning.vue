<template>
  <div class="planning-page">
    <div
      v-if="!hasKey"
      class="planning-page__warn planning-page__warn--standalone"
    >
      Задайте переменную окружения
      <code>NUXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
      с ключом Google Maps JavaScript API (Geocoding, Directions; для «Транспорт» — также Routes API / Transit по документации Google).
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
              :waypoints-summary="waypointsSummary"
              :geocode-error="geocodeError"
              :disable-actions="false"
              :can-save="waypoints.length > 0"
              @apply-city="applyCity"
              @start-planning="startPlanning"
              @save-route="saveRoute"
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

          <RouteGallery
            :routes="savedRoutes"
            @select="onSelectSaved"
          />
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
import type { DirectionsTravelMode, MapsLatLng } from '~/composables/useGoogleMaps'
import Controls from '~/components/planning/Controls.vue'
import MapView from '~/components/planning/MapView.vue'
import PlanningFormPanel from '~/components/planning/PlanningFormPanel.vue'
import RouteGallery from '~/components/planning/RouteGallery.vue'
import StreetView from '~/components/planning/StreetView.vue'

type SavedRouteItem = {
  id: string
  name: string
  city: string
  coordinates: MapsLatLng[]
  savedAt: string
  theme?: string
  pace?: string
  travelModeId?: string
  timeStart?: string
  timeEnd?: string
}

const STORAGE_KEY = 'gosee-virtual-walk-routes'

useHead({
  title: 'Виртуальный планировщик прогулок — GoSee',
})

const { apiKey, geocode, computeHeading } = useGoogleMaps()

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
      return 'BICYCLING'
    case 'car':
      return 'DRIVING'
    case 'transit':
      return 'TRANSIT'
    default:
      return 'WALKING'
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

const savedRoutes = ref<SavedRouteItem[]>([])

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

function loadFromStorage(): SavedRouteItem[] {
  if (typeof localStorage === 'undefined') {
    return []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) {
      return []
    }
    return data.filter(
      (r): r is SavedRouteItem =>
        r
        && typeof r === 'object'
        && typeof (r as SavedRouteItem).id === 'string'
        && Array.isArray((r as SavedRouteItem).coordinates),
    )
  }
  catch {
    return []
  }
}

function persistToStorage() {
  if (typeof localStorage === 'undefined') {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoutes.value))
}

async function applyCity() {
  geocodeError.value = ''
  const q = cityQuery.value.trim()
  if (!q) {
    geocodeError.value = 'Введите название города'
    return
  }
  try {
    const loc = await geocode(q)
    cityLabel.value = q
    mapViewRef.value?.centerMap(loc, 13)
  }
  catch (e) {
    geocodeError.value
      = e instanceof Error ? e.message : 'Не удалось найти город'
  }
}

async function startPlanning() {
  await applyCity()
  await nextTick()
  document
    .querySelector('.planning-page__map-col')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function saveRoute() {
  const name = routeName.value.trim() || `Маршрут ${savedRoutes.value.length + 1}`
  const item: SavedRouteItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}`,
    name,
    city: cityLabel.value.trim() || cityQuery.value.trim() || 'Город',
    coordinates: waypoints.value.map((p) => ({ lat: p.lat, lng: p.lng })),
    savedAt: new Date().toISOString(),
    theme: theme.value.trim() || undefined,
    pace: pace.value.trim() || undefined,
    travelModeId: travelModeId.value,
    timeStart: timeStart.value || undefined,
    timeEnd: timeEnd.value || undefined,
  }
  savedRoutes.value = [item, ...savedRoutes.value]
  persistToStorage()
}

function onSelectSaved(route: SavedRouteItem) {
  cityQuery.value = route.city
  cityLabel.value = route.city
  routeName.value = route.name
  theme.value = route.theme ?? ''
  pace.value = route.pace ?? ''
  travelModeId.value = route.travelModeId ?? 'walk'
  timeStart.value = route.timeStart ?? ''
  timeEnd.value = route.timeEnd ?? ''
  stop()
  waypoints.value = route.coordinates.map((c) => ({ lat: c.lat, lng: c.lng }))
}

onMounted(() => {
  savedRoutes.value = loadFromStorage()
})
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
