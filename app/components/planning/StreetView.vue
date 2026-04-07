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
import type { MapsLatLng } from '~/composables/useGoogleMaps'

const props = defineProps<{
  position: MapsLatLng | null
  heading?: number
}>()

const { load, createPanorama } = useGoogleMaps()

const containerEl = ref<HTMLElement | null>(null)
type GPano = ReturnType<NonNullable<ReturnType<typeof useGoogleMaps>['createPanorama']>>
let panorama: GPano | null = null

const ariaLabel = computed(() =>
  props.position ? 'Панорама улиц в точке маршрута' : 'Панорама улиц',
)

async function ensurePanorama() {
  if (!containerEl.value || panorama || !props.position) {
    return
  }
  const ok = await load()
  if (!ok) {
    return
  }
  panorama = createPanorama(containerEl.value, props.position)
}

function applyView() {
  if (!panorama || !props.position) {
    return
  }
  panorama.setPosition(props.position)
  const h = Number.isFinite(props.heading) ? (props.heading as number) : 0
  panorama.setPov({ heading: h, pitch: 2 })
}

watch(
  () => props.position,
  async (pos) => {
    await ensurePanorama()
    if (pos) {
      applyView()
    }
  },
  { immediate: true },
)

watch(
  () => props.heading,
  () => {
    applyView()
  },
)

onMounted(async () => {
  await ensurePanorama()
  if (props.position) {
    applyView()
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
