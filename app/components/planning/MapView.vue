<template>
  <div class="map-view">
    <div
      ref="containerEl"
      class="map-view__canvas"
      role="application"
      aria-label="Карта маршрута"
    />
    <p class="map-view__hint">
      {{ hintText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { YandexMapsLatLng } from '~/composables/useYandexMaps'
import type { YandexDirectionsTravelMode } from '~/composables/useYandexMaps'

const props = withDefaults(
  defineProps<{
    travelMode?: YandexDirectionsTravelMode
  }>(),
  { travelMode: 'pedestrian' },
)

const waypoints = defineModel<YandexMapsLatLng[]>('waypoints', { default: () => [] })

const emit = defineEmits<{
  'update:path': [data: { path: YandexMapsLatLng[]; distanceKm: number; durationMinutes: number }]
  ready: []
}>()

const { load, createMap, computeDirectionsPath, getYandex } = useYandexMaps()

const hintText = computed(() => {
  const m = props.travelMode
  if (m === 'car') {
    return 'Кликайте по карте, чтобы задать точки маршрута (от двух точек строится путь на автомобиле).'
  }
  if (m === 'bicycle') {
    return 'Кликайте по карте для маршрута на велосипеде / роликах (от двух точек).'
  }
  if (m === 'masstransit') {
    return 'Кликайте по карте для маршрута на общественном транспорте.'
  }
  return 'Кликайте по карте, чтобы добавить точки пешего маршрута (минимум две для построения пути).'
})


const containerEl = ref<HTMLElement | null>(null)

type YMap = ReturnType<NonNullable<ReturnType<typeof useYandexMaps>['createMap']>>
let map: YMap | null = null
const markers: any[] = []
let polyline: any | null = null

function redrawMarkers() {
  const g = getYandex()
  if (!g || !map) {
    return
  }

  map.geoObjects.removeAll()
  markers.length = 0
  polyline = null

  for (const p of waypoints.value) {
    // API 2.1: [широта, долгота]
    const marker = new g.Placemark([p.lat, p.lng], {}, {
      preset: 'islands#blueCircleIcon',
    })
    map.geoObjects.add(marker)
    markers.push(marker)
  }
}

async function rebuildPath() {
  const pts = waypoints.value
  if (pts.length < 2) {
    polyline = null
    emit('update:path', { path: [...pts], distanceKm: 0, durationMinutes: 0 })
    return
  }
  if (!map) {
    return
  }
  try {
    const result = await computeDirectionsPath(pts, props.travelMode)
    emit('update:path', result)
    applyPolyline(result.path)
  }
  catch {
    const fallback = [...pts]
    emit('update:path', { path: fallback, distanceKm: 0, durationMinutes: 0 })
    applyPolyline(fallback)
  }
}

function applyPolyline(path: YandexMapsLatLng[]) {
  const g = getYandex()
  if (!g || !map) {
    return
  }

  const coordinates = path.map((p) => [p.lat, p.lng] as [number, number])

  if (!polyline) {
    polyline = new g.Polyline(coordinates, {}, {
      strokeColor: '#2b65ff',
      strokeWidth: 4,
      opacity: 0.95,
      strokeStyle: 'solid',
    })
    map.geoObjects.add(polyline)
  }
  else {
    polyline.geometry.setCoordinates(coordinates)
  }
}

function fitToWaypoints() {
  if (!map || waypoints.value.length === 0) {
    return
  }

  if (waypoints.value.length === 1) {
    const p0 = waypoints.value[0]!
    map.setCenter([p0.lat, p0.lng])
    map.setZoom(15)
    return
  }

  const g = getYandex()
  if (!g) {
    return
  }

  const lats = waypoints.value.map(p => p.lat)
  const lngs = waypoints.value.map(p => p.lng)
  const bounds = [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ] as [[number, number], [number, number]]
  map.setBounds(bounds, {
    checkZoomRange: true,
    zoomMargin: 20,
  })
}

let rebuildTimer: ReturnType<typeof setTimeout> | null = null
function scheduleRebuild() {
  if (rebuildTimer) {
    clearTimeout(rebuildTimer)
  }
  rebuildTimer = setTimeout(() => {
    rebuildTimer = null
    void rebuildPath()
  }, 350)
}

watch(
  waypoints,
  () => {
    redrawMarkers()
    scheduleRebuild()
    fitToWaypoints()
  },
  { deep: true },
)

watch(
  () => props.travelMode,
  () => {
    scheduleRebuild()
  },
)

function centerMap(latlng: YandexMapsLatLng, zoom = 14) {
  if (!map) {
    return
  }
  map.setCenter([latlng.lat, latlng.lng])
  map.setZoom(zoom)
}

defineExpose({
  centerMap,
})

onMounted(async () => {
  const ok = await load()
  if (!ok || !containerEl.value) {
    return
  }
  const start: YandexMapsLatLng = waypoints.value[0] ?? { lat: 55.751244, lng: 37.618423 }
  map = createMap(containerEl.value, start, waypoints.value.length ? 14 : 12)
  if (!map) {
    return
  }
  map.events.add('click', (e: any) => {
    const coords = e.get('coords')
    if (!coords || !Array.isArray(coords) || coords.length < 2) {
      return
    }
    // API 2.1: клик отдаёт [широта, долгота]
    const next: YandexMapsLatLng = { lat: coords[0], lng: coords[1] }
    waypoints.value = [...waypoints.value, next]
  })

  redrawMarkers()
  await rebuildPath()
  fitToWaypoints()
  emit('ready')
})
</script>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
}

.map-view__canvas {
  width: 100%;
  flex: 1;
  min-height: 320px;
  border-radius: 14px;
  overflow: hidden;
  background: #e8ecf3;
}

.map-view__hint {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #666;
}
</style>
