<template>
  <div class="street-view">
    <div
      ref="containerEl"
      class="street-view__canvas"
      role="img"
      :aria-label="ariaLabel"
    />
    <p
      v-if="!position"
      class="street-view__empty"
    >
      Выберите точку на маршруте или запустите превью прогулки.
    </p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue'
import type { YandexMapsLatLng } from '~/composables/useYandexMaps'

const props = defineProps<{
  position: YandexMapsLatLng | null
  heading?: number
}>()

const { load, loadPanoramaModule, createPanorama } = useYandexMaps()

const containerEl = ref<HTMLElement | null>(null)
let panorama: any = null

/** Защита от гонок при быстром обновлении координат превью */
let syncGeneration = 0

const ariaLabel = computed(() =>
  props.position ? 'Панорама улиц в точке маршрута' : 'Панорама улиц',
)

function destroyPanorama() {
  if (panorama) {
    try {
      panorama.destroy?.()
    }
    catch {
      // ignore
    }
    panorama = null
  }
  if (containerEl.value) {
    containerEl.value.innerHTML = ''
  }
}

function applyDirection(player: unknown, headingDeg: number | undefined) {
  if (player == null || headingDeg == null || Number.isNaN(headingDeg)) {
    return
  }
  const p = player as {
    setDirection?: (v: [number, number]) => void
    setPanoramaDirection?: (v: [number, number]) => void
  }
  try {
    if (typeof p.setDirection === 'function') {
      p.setDirection([headingDeg, 10])
    }
    else if (typeof p.setPanoramaDirection === 'function') {
      p.setPanoramaDirection([headingDeg, 10])
    }
  }
  catch {
    // API панорамы может отличаться по версии
  }
}

async function syncView() {
  await nextTick()
  const el = containerEl.value
  const pos = props.position
  if (!el || !pos) {
    destroyPanorama()
    return
  }

  const gen = ++syncGeneration

  try {
    const ok = await load()
    if (!ok || gen !== syncGeneration) {
      return
    }
    await loadPanoramaModule()
    if (gen !== syncGeneration) {
      return
    }

    if (panorama && typeof panorama.moveTo === 'function') {
      try {
        await panorama.moveTo([pos.lat, pos.lng])
        if (gen !== syncGeneration) {
          return
        }
        applyDirection(panorama, props.heading)
        await nextTick()
        requestAnimationFrame(() => {
          try {
            panorama?.fitToViewport?.()
          }
          catch {
            // ignore
          }
        })
        return
      }
      catch {
        destroyPanorama()
      }
    }

    if (gen !== syncGeneration) {
      return
    }

    destroyPanorama()
    panorama = await createPanorama(el, pos)
    if (gen !== syncGeneration || !panorama) {
      return
    }
    applyDirection(panorama, props.heading)
    await nextTick()
    requestAnimationFrame(() => {
      try {
        panorama?.fitToViewport?.()
      }
      catch {
        // ignore
      }
    })
  }
  catch (error) {
    console.error('Panorama error:', error)
  }
}

/** Плавное превью обновляет точку часто — coalesce, чтобы не ддосить moveTo */
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const SYNC_DEBOUNCE_MS = 100

function scheduleSync() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void syncView()
  }, SYNC_DEBOUNCE_MS)
}

watch(
  () => [props.position, props.heading] as const,
  () => {
    if (!props.position) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      destroyPanorama()
      return
    }
    scheduleSync()
  },
  { deep: true, flush: 'post' },
)

onMounted(() => {
  if (props.position) {
    void syncView()
  }
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  destroyPanorama()
})
</script>

<style scoped>
.street-view {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
}

.street-view__canvas {
  width: 100%;
  flex: 1;
  min-height: 320px;
  border-radius: 14px;
  overflow: hidden;
  background: #1a1f2e;
}

.street-view__empty {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: #666;
  overflow-wrap: anywhere;
}

@media (min-width: 768px) {
  .street-view__empty {
    font-size: 0.9375rem;
  }
}
</style>
