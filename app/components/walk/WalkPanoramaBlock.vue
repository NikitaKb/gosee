<template>
  <div class="walk-panorama">
    <StreetView
      :position="streetPosition"
      :heading="streetHeading"
    />
    <div class="walk-panorama__controls">
      <Controls
        :is-playing="isPlaying"
        :has-path="path.length > 0"
        :can-play="path.length > 0"
        :can-step-back="currentIndex > 0"
        :can-step-fwd="currentIndex < path.length - 1"
        @play="play"
        @pause="pause"
        @next="next"
        @prev="prev"
        @stop="stop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MapsLatLng } from '~/composables/useYandexMaps'
import Controls from '~/components/planning/Controls.vue'
import StreetView from '~/components/planning/StreetView.vue'

const props = defineProps<{
  path: MapsLatLng[]
}>()

const pathRef = toRef(props, 'path')

const { computeHeading } = useYandexMaps()

const {
  currentIndex,
  isPlaying,
  currentPoint,
  play,
  pause,
  stop,
  next,
  prev,
} = useRoutePlayer(pathRef, { intervalMs: 2500 })

const streetPosition = computed(() => currentPoint.value)

const streetHeading = computed(() => {
  const pts = props.path
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
</script>

<style scoped>
.walk-panorama {
  position: relative;
  min-height: 360px;
  border-radius: 16px;
  overflow: hidden;
  background: #1a1f2e;
}

.walk-panorama :deep(.street-view) {
  min-height: 360px;
}

.walk-panorama :deep(.street-view__canvas) {
  min-height: 360px;
  border-radius: 0;
}

.walk-panorama__controls {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 2;
  pointer-events: none;
}

.walk-panorama__controls :deep(.plan-controls) {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  padding: 0.35rem;
  box-shadow: 0 8px 22px rgba(15, 35, 80, 0.18);
}

@media (max-width: 900px) {
  .walk-panorama__controls {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .walk-panorama__controls :deep(.plan-controls) {
    width: 100%;
    justify-content: center;
  }
}
</style>
