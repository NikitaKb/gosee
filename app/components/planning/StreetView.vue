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
import type { MapsLatLng } from '~/composables/useYandexMaps'

const props = defineProps<{
  position: MapsLatLng | null
  heading?: number
}>()

const { load, loadPanoramaModule, createPanorama } = useYandexMaps()

const containerEl = ref<HTMLElement | null>(null)
let panorama: any = null

const ariaLabel = computed(() =>
  props.position ? 'Панорама улиц в точке маршрута' : 'Панорама улиц',
)

async function ensurePanorama() {
  if (!containerEl.value || !props.position) {
    return
  }
  
  try {
    const ok = await load()
    if (!ok) {
      return
    }

    // Очищаем контейнер перед созданием новой панорамы
    if (panorama) {
      try {
        panorama.destroy?.()
      } catch {
        // ignore
      }
    }

    // Очищаем HTML
    if (containerEl.value) {
      containerEl.value.innerHTML = ''
    }

    // Создаём новую панораму
    panorama = createPanorama(containerEl.value!, props.position)
  } catch (error) {
    console.error('Panorama error:', error)
  }
}

watch(
  () => props.position,
  async (pos) => {
    if (pos) {
      await ensurePanorama()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await ensurePanorama()
})

onUnmounted(() => {
  if (panorama) {
    panorama.destroy()
    panorama = null
  }
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
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #666;
}
</style>
