<template>
  <div class="walk-panorama">
    <StreetView
      :position="streetPosition"
      :heading="streetHeading"
    />
    <div class="walk-panorama__controls">
      <Controls
        :is-playing="isPlaying"
        :has-path="pathRef.length > 1"
        :can-play="pathRef.length > 1"
        :can-step-back="canStepBack"
        :can-step-fwd="canStepForward"
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
import type { YandexMapsLatLng } from '~/composables/useYandexMaps'
import Controls from '~/components/planning/Controls.vue'
import StreetView from '~/components/planning/StreetView.vue'

const props = defineProps<{
  path: YandexMapsLatLng[]
}>()

const { buildPreviewPath } = useYandexMaps()
const pathRef = computed(() => buildPreviewPath(props.path))

const {
  isPlaying,
  currentPoint,
  previewHeading,
  play,
  pause,
  stop,
  next,
  prev,
  canStepForward,
  canStepBack,
} = useSmoothRoutePlayer(pathRef, {
  segmentMoveMs: 3800,
  dwellMs: 2800,
  tickMs: 80,
})

const streetPosition = computed(() => currentPoint.value)
const streetHeading = previewHeading
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
  .walk-panorama {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: visible;
    background: transparent;
  }

  .walk-panorama :deep(.street-view),
  .walk-panorama :deep(.street-view__canvas) {
    min-height: 280px;
    border-radius: 16px;
  }

  .walk-panorama__controls {
    position: static;
    margin-top: 0.75rem;
    pointer-events: auto;
  }

  .walk-panorama__controls :deep(.plan-controls) {
    width: 100%;
    justify-content: center;
    background: #fff;
    backdrop-filter: none;
  }
}
</style>
