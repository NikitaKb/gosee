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
import type { YandexDirectionsTravelMode, YandexMapsLatLng } from '~/composables/useYandexMaps'

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

const { load, createMap, getYandex } = useYandexMaps()

const hintText = computed(() => {
  if (routeBuilt.value) {
    return 'Маршрут построен по дорогам. Перетаскивайте точки и линию маршрута, чтобы изменить путь.'
  }
  if (waypoints.value.length === 0) {
    return 'Кликните по карте, чтобы поставить первую точку маршрута.'
  }
  if (waypoints.value.length === 1) {
    return 'Кликните ещё раз, чтобы добавить следующую точку.'
  }
  return 'Продолжайте добавлять точки на карте. «Построить по дорогам» можно использовать по желанию.'
})

const containerEl = ref<HTMLElement | null>(null)
type YMap = ReturnType<NonNullable<ReturnType<typeof useYandexMaps>['createMap']>>

let map: YMap | null = null
const markers: any[] = []
let multiRoute: any | null = null
const routeBuilt = ref(false)
let syncingFromRoute = false
let suppressRouteRebuild = false
let resizeObserver: ResizeObserver | null = null

function getWaypointsSignature(points: YandexMapsLatLng[]) {
  return points
    .map(point => `${point.lat.toFixed(6)}:${point.lng.toFixed(6)}`)
    .join('|')
}

function getTravelModeForApi(mode: YandexDirectionsTravelMode) {
  if (mode === 'car') {
    return 'auto'
  }
  if (mode === 'masstransit') {
    return 'masstransit'
  }
  return 'pedestrian'
}

function redrawMarkers() {
  const g = getYandex() as any
  if (!g || !map || routeBuilt.value) {
    return
  }

  map.geoObjects.removeAll()
  markers.length = 0

  for (const [index, point] of waypoints.value.entries()) {
    const preset = index === 0
      ? 'islands#greenCircleIcon'
      : index === waypoints.value.length - 1
        ? 'islands#redCircleIcon'
        : 'islands#blueCircleIcon'
    const marker = new g.Placemark([point.lat, point.lng], {}, { preset, draggable: false })
    map.geoObjects.add(marker)
    markers.push(marker)
  }
}

function fitToWaypoints() {
  if (!map || waypoints.value.length === 0) {
    return
  }
  if (waypoints.value.length === 1) {
    const p0 = waypoints.value[0]!
    map.setCenter([p0.lat, p0.lng], 15)
    return
  }
  const lats = waypoints.value.map(p => p.lat)
  const lngs = waypoints.value.map(p => p.lng)
  map.setBounds([
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ], {
    checkZoomRange: true,
    zoomMargin: 24,
  })
}

function clearRouteFromMap() {
  if (!map) {
    return
  }
  if (multiRoute) {
    map.geoObjects.remove(multiRoute)
    try {
      multiRoute.editor.stop()
    } catch {
      // ignore
    }
    multiRoute = null
  }
  routeBuilt.value = false
  redrawMarkers()
}

function extractWaypointsFromRoute() {
  const collection = multiRoute?.getWayPoints?.()
  if (!collection?.each) {
    return
  }

  const next: YandexMapsLatLng[] = []
  collection.each((item: any) => {
    const coords = item?.geometry?.getCoordinates?.()
    if (Array.isArray(coords) && coords.length >= 2) {
      next.push({ lat: Number(coords[0]), lng: Number(coords[1]) })
    }
  })

  if (next.length >= 2) {
    syncingFromRoute = true
    waypoints.value = next
    syncingFromRoute = false
  }
}

function extractPathFromRoute() {
  const activeRoute = multiRoute?.getActiveRoute?.()
  const pathParts = activeRoute?.getPaths?.()
  const points: YandexMapsLatLng[] = []

  pathParts?.each?.((pathPart: any) => {
    const coords = pathPart?.geometry?.getCoordinates?.()
    if (Array.isArray(coords)) {
      for (const point of coords) {
        if (Array.isArray(point) && point.length >= 2) {
          points.push({ lat: Number(point[0]), lng: Number(point[1]) })
        }
      }
    }
  })

  const distanceValue = Number(activeRoute?.properties?.get?.('distance')?.value ?? 0)
  const durationValue = Number(activeRoute?.properties?.get?.('duration')?.value ?? 0)
  emit('update:path', {
    path: points,
    distanceKm: Number.isFinite(distanceValue) ? distanceValue / 1000 : 0,
    durationMinutes: Number.isFinite(durationValue) ? Math.round(durationValue / 60) : 0,
  })
}

function attachRouteEvents() {
  if (!multiRoute) {
    return
  }

  multiRoute.model.events.add('requestsuccess', () => {
    extractWaypointsFromRoute()
    extractPathFromRoute()
    fitToWaypoints()
  })

  multiRoute.editor.events.add('waypointschange', () => {
    extractWaypointsFromRoute()
    extractPathFromRoute()
  })
}

async function buildAutoRoute() {
  if (!map || waypoints.value.length < 2) {
    return false
  }

  const g = getYandex() as any
  if (!g?.multiRouter?.MultiRoute) {
    return false
  }

  clearRouteFromMap()
  map.geoObjects.removeAll()

  multiRoute = new g.multiRouter.MultiRoute({
    referencePoints: waypoints.value.map(point => [point.lat, point.lng]),
    params: {
      routingMode: getTravelModeForApi(props.travelMode),
      results: 1,
    },
  }, {
    boundsAutoApply: true,
    routeActiveStrokeColor: '#2b65ff',
    routeActiveStrokeWidth: 5,
    routeStrokeColor: '#9bb8ff',
    routeStrokeWidth: 4,
    waypointVisible: true,
    pinVisible: true,
    editorDrawOver: false,
  })

  map.geoObjects.add(multiRoute)
  routeBuilt.value = true
  attachRouteEvents()

  try {
    multiRoute.editor.start({
      addWayPoints: true,
      removeWayPoints: true,
      addMidPoints: true,
      dragWayPoints: true,
    })
  } catch {
    // ignore editor start errors
  }

  return true
}

function clearRoute() {
  suppressRouteRebuild = true
  clearRouteFromMap()
  waypoints.value = []
  emit('update:path', { path: [], distanceKm: 0, durationMinutes: 0 })
  suppressRouteRebuild = false
}

function centerMap(latlng: YandexMapsLatLng, zoom = 14) {
  map?.setCenter([latlng.lat, latlng.lng], zoom)
}

watch(
  () => props.travelMode,
  async () => {
    if (routeBuilt.value && !syncingFromRoute) {
      await buildAutoRoute()
    }
  },
)

watch(
  () => getWaypointsSignature(waypoints.value),
  async () => {
    if (!map) {
      return
    }

    if (!routeBuilt.value) {
      redrawMarkers()
      fitToWaypoints()
      emit('update:path', { path: [...waypoints.value], distanceKm: 0, durationMinutes: 0 })
      return
    }

    if (syncingFromRoute || suppressRouteRebuild) {
      return
    }

    if (waypoints.value.length < 2) {
      clearRouteFromMap()
      redrawMarkers()
      emit('update:path', { path: [...waypoints.value], distanceKm: 0, durationMinutes: 0 })
      return
    }

    const referencePoints = waypoints.value.map(point => [point.lat, point.lng])
    multiRoute?.model?.setReferencePoints?.(referencePoints)
  },
)

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

  resizeObserver = new ResizeObserver(() => {
    map?.container?.fitToViewport?.()
  })
  resizeObserver.observe(containerEl.value)

  map.events.add('click', (e: any) => {
    if (routeBuilt.value) {
      return
    }
    const coords = e.get('coords')
    if (!Array.isArray(coords) || coords.length < 2) {
      return
    }
    const point = { lat: Number(coords[0]), lng: Number(coords[1]) }
    if (waypoints.value.length < 2) {
      waypoints.value = [...waypoints.value, point]
      return
    }
    const next = [...waypoints.value]
    next.splice(next.length - 1, 0, point)
    waypoints.value = next
  })

  redrawMarkers()
  fitToWaypoints()
  emit('ready')
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

defineExpose({
  centerMap,
  buildAutoRoute,
  clearRoute,
})
</script>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
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
  font-size: 0.875rem;
  line-height: 1.45;
  color: #666;
  overflow-wrap: anywhere;
}

@media (min-width: 768px) {
  .map-view__hint {
    font-size: 0.9375rem;
  }
}
</style>
