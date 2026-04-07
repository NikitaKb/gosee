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
import type { DirectionsTravelMode, MapsLatLng } from '~/composables/useYandexMaps'

const props = withDefaults(
  defineProps<{
    travelMode?: DirectionsTravelMode
  }>(),
  { travelMode: 'pedestrian' },
)

const waypoints = defineModel<MapsLatLng[]>('waypoints', { default: () => [] })

const emit = defineEmits<{
  'update:path': [path: MapsLatLng[]]
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
let markers: Array<unknown> = []
let polyline: unknown | null = null

function redrawMarkers() {
  const ymaps = getYandex()
  if (!ymaps || !map) {
    return
  }
  // Удаляем старые маркеры
  for (const m of markers) {
    map.geoObjects.remove(m)
  }
  markers.length = 0
  // Добавляем новые маркеры
  for (const p of waypoints.value) {
    try {
      const marker = new ymaps.Placemark([p.lat, p.lng], {
        balloonContent: `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`,
      }, {
        preset: 'islands#redCircleDotIcon',
      })
      map.geoObjects.add(marker)
      markers.push(marker)
    } catch (error) {
      console.error('Error adding marker:', error, p)
    }
  }
}

async function rebuildPath() {
  const pts = waypoints.value
  if (pts.length < 2) {
    if (polyline) {
      map?.geoObjects.remove(polyline)
      polyline = null
    }
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
  } catch (error) {
    console.error('Path computation error:', error)
    const fallback = [...pts]
    emit('update:path', fallback)
    applyPolyline(fallback)
  }
}

function applyPolyline(path: MapsLatLng[]) {
  const ymaps = getYandex()
  if (!ymaps || !map) {
    return
  }
  const coords = path.map((p) => [p.lat, p.lng] as [number, number])
  try {
    if (!polyline) {
      polyline = new ymaps.Polyline(coords, {}, {
        strokeColor: '#2b65ff',
        strokeOpacity: 0.95,
        strokeWidth: 4,
      })
      map.geoObjects.add(polyline)
    } else {
      const poly = polyline as unknown as { geometry: { setCoordinates: (c: [number, number][]) => void } }
      poly.geometry.setCoordinates(coords)
    }
  } catch (error) {
    console.error('Error applying polyline:', error)
  }
}

function fitToWaypoints() {
  if (!map || waypoints.value.length === 0) {
    return
  }
  const ymaps = getYandex() as any
  if (!ymaps) {
    return
  }
  
  try {
    if (waypoints.value.length === 1) {
      const pt = waypoints.value[0]!
      map.setCenter([pt.lat, pt.lng], 15)
      return
    }
    
    // Для нескольких точек - находим границы
    const coords = waypoints.value.map((p) => [p.lat, p.lng] as [number, number])
    
    // Пытаемся использовать setBounds если доступен
    if (map.setBounds) {
      try {
        const bounds = ymaps.util?.bounds?.fromPoints(coords)
        if (bounds) {
          map.setBounds(bounds)
          return
        }
      } catch (e) {
        console.warn('setBounds failed:', e)
      }
    }
    
    // Fallback: вычисляем центр и зум вручную
    const minLat = Math.min(...waypoints.value.map((p) => p.lat))
    const maxLat = Math.max(...waypoints.value.map((p) => p.lat))
    const minLng = Math.min(...waypoints.value.map((p) => p.lng))
    const maxLng = Math.max(...waypoints.value.map((p) => p.lng))
    
    const center: MapsLatLng = {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    }
    
    // Вычисляем примерный зум
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)
    const zoom = maxDiff > 0.1 ? 13 : 15
    
    map.setCenter([center.lat, center.lng], zoom)
  } catch (error) {
    console.error('fitToWaypoints error:', error)
  }
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
    setTimeout(() => {
      if (map) {
        const coords = [latlng.lat, latlng.lng] as [number, number]
        map.setCenter(coords, zoom)
        if (map.panTo) {
          map.panTo(coords, { duration: 500 })
        }
      } else {
        console.warn('Map is not ready yet')
      }
    }, 200)
    return
  }
  const coords = [latlng.lat, latlng.lng] as [number, number]
  map.setCenter(coords, zoom)
  if (map.panTo) {
    map.panTo(coords, { duration: 500 })
  }
}

const mapReady = ref(false)

defineExpose({
  centerMap,
  mapReady,
})

onMounted(async () => {
  try {
    const ok = await load()
    if (!ok || !containerEl.value) {
      console.error('Maps not loaded or container missing')
      return
    }

    // Даём DOM время отрендериться
    await nextTick()
    
    // Убеждаемся что контейнер имеет размеры
    if (!containerEl.value.offsetWidth || !containerEl.value.offsetHeight) {
      console.warn('Container has no dimensions')
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const start: MapsLatLng = waypoints.value[0] ?? { lat: 55.7558, lng: 37.6173 }
    map = createMap(containerEl.value, start, waypoints.value.length ? 14 : 12)
    if (!map) {
      console.error('Failed to create map')
      return
    }

    mapReady.value = true

    // Обработка клика на карте
    map.events.add('click', (e: unknown) => {
      const coords = (e as unknown as { get?: (key: string) => [number, number] })?.get?.('coords')
      if (!coords) {
        return
      }
      const [lat, lng] = coords
      const next: MapsLatLng = { lat, lng }
      waypoints.value = [...waypoints.value, next]
    })

    redrawMarkers()
    await rebuildPath()
    fitToWaypoints()
    emit('ready')
  } catch (error) {
    console.error('MapView mount error:', error)
  }
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
