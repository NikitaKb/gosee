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
import type { DirectionsTravelMode, MapsLatLng } from '~/composables/useGoogleMaps'

const props = withDefaults(
  defineProps<{
    travelMode?: DirectionsTravelMode
  }>(),
  { travelMode: 'WALKING' },
)

const waypoints = defineModel<MapsLatLng[]>('waypoints', { default: () => [] })

const emit = defineEmits<{
  'update:path': [path: MapsLatLng[]]
  ready: []
}>()

const { load, createMap, computeDirectionsPath, getGoogle } = useGoogleMaps()

const hintText = computed(() => {
  const m = props.travelMode
  if (m === 'DRIVING') {
    return 'Кликайте по карте, чтобы задать точки маршрута (от двух точек строится путь на автомобиле).'
  }
  if (m === 'BICYCLING') {
    return 'Кликайте по карте для маршрута на велосипеде / роликах (от двух точек).'
  }
  if (m === 'TRANSIT') {
    return 'Кликайте по карте для маршрута на общественном транспорте (нужен включённый Transit в Google Cloud).'
  }
  return 'Кликайте по карте, чтобы добавить точки пешего маршрута (минимум две для построения пути).'
})

/** Светлая палитра карты, ближе к макету. */
const MAP_STYLES: Array<Record<string, unknown>> = [
  { elementType: 'geometry', stylers: [{ color: '#f5f3ef' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d4e8f7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8e4dc' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dee8d8' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
]

const containerEl = ref<HTMLElement | null>(null)

type GMap = ReturnType<NonNullable<ReturnType<typeof useGoogleMaps>['createMap']>>
let map: GMap | null = null
const markers: Array<{ setMap: (m: GMap | null) => void }> = []
let polyline: { setMap: (m: GMap | null) => void; setPath: (p: MapsLatLng[]) => void } | null = null

function redrawMarkers() {
  const g = getGoogle()
  if (!g?.maps || !map) {
    return
  }
  for (const m of markers) {
    m.setMap(null)
  }
  markers.length = 0
  for (const p of waypoints.value) {
    const marker = new g.maps.Marker({
      position: p,
      map,
    }) as unknown as { setMap: (x: GMap | null) => void }
    markers.push(marker)
  }
}

async function rebuildPath() {
  const pts = waypoints.value
  if (pts.length < 2) {
    polyline?.setMap(null)
    polyline = null
    emit('update:path', [...pts])
    return
  }
  if (!map) {
    return
  }
  try {
    const path = await computeDirectionsPath(pts, props.travelMode)
    emit('update:path', path)
    applyPolyline(path)
  }
  catch {
    const fallback = [...pts]
    emit('update:path', fallback)
    applyPolyline(fallback)
  }
}

function applyPolyline(path: MapsLatLng[]) {
  const g = getGoogle()
  if (!g?.maps || !map) {
    return
  }
  if (!polyline) {
    polyline = new g.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#2b65ff',
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map,
    }) as unknown as { setMap: (m: GMap | null) => void; setPath: (p: MapsLatLng[]) => void }
  }
  else {
    polyline.setPath(path)
  }
}

function fitToWaypoints() {
  if (!map || waypoints.value.length === 0) {
    return
  }
  const g = getGoogle()
  if (!g?.maps) {
    return
  }
  if (waypoints.value.length === 1) {
    map.setCenter(waypoints.value[0]!)
    map.setZoom(15)
    return
  }
  const maps = g.maps as unknown as {
    LatLngBounds: new () => { extend: (p: MapsLatLng) => void }
  }
  const bounds = new maps.LatLngBounds()
  for (const p of waypoints.value) {
    bounds.extend(p)
  }
  map.fitBounds(bounds as unknown as Parameters<GMap['fitBounds']>[0])
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

function centerMap(latlng: MapsLatLng, zoom = 14) {
  if (!map) {
    return
  }
  map.setCenter(latlng)
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
  const start: MapsLatLng = waypoints.value[0] ?? { lat: 55.751244, lng: 37.618423 }
  map = createMap(containerEl.value, start, waypoints.value.length ? 14 : 12)
  if (!map) {
    return
  }
  const mapAny = map as unknown as { setOptions: (o: Record<string, unknown>) => void }
  mapAny.setOptions({ styles: MAP_STYLES })
  map.addListener('click', (e: { latLng?: { lat: () => number; lng: () => number } }) => {
    if (!e.latLng) {
      return
    }
    const next: MapsLatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    const list = [...waypoints.value, next]
    waypoints.value = list
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
