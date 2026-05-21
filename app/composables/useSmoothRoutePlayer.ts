import type { ComputedRef, Ref } from 'vue'
import type { MapsLatLng } from './useGoogleMaps'

function useSmoothHeadings(path: Ref<MapsLatLng[]>, segmentIdx: Ref<number>, phase: Ref<'move' | 'dwell'>, currentPoint: ComputedRef<MapsLatLng | null>) {
  const { computeHeading } = useYandexMaps()

  const previewHeading = computed(() => {
    const pts = path.value
    const n = pts.length
    if (n < 2) {
      return 0
    }
    const i = Math.min(segmentIdx.value, n - 2)
    const at = pts[i]!
    const to = pts[i + 1]!

    if (phase.value === 'dwell') {
      if (i + 2 < n) {
        return computeHeading(to, pts[i + 2]!)
      }
      return computeHeading(at, to)
    }

    const cp = currentPoint.value
    if (!cp) {
      return computeHeading(at, to)
    }
    return computeHeading(cp, to)
  })

  return { previewHeading }
}

function lerp(a: MapsLatLng, b: MapsLatLng, t: number): MapsLatLng {
  const u = Math.min(1, Math.max(0, t))
  return {
    lat: a.lat + (b.lat - a.lat) * u,
    lng: a.lng + (b.lng - a.lng) * u,
  }
}

/** Плавное ускорение/замедление по сегменту */
function easeInOutQuad(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2
}

export type SmoothRoutePlayerOptions = {
  /** Время плавного «проезда» между двумя точками пути, мс */
  segmentMoveMs?: number
  /** Пауза на точке для осмотра панорамы, мс */
  dwellMs?: number
  /** Шаг таймера, мс */
  tickMs?: number
}

/**
 * Превью маршрута: плавное перемещение между соседними точками и пауза на осмотр,
 * вместо резкого переключения по одной точке раз в N секунд.
 */
export function useSmoothRoutePlayer(
  path: Ref<MapsLatLng[]>,
  options?: SmoothRoutePlayerOptions,
) {
  const segmentMoveMs = options?.segmentMoveMs ?? 3800
  const dwellMs = options?.dwellMs ?? 2800
  const tickMs = options?.tickMs ?? 80

  const segmentIdx = ref(0)
  /** 0..1 вдоль текущего сегмента path[i] → path[i+1] */
  const moveProgress = ref(0)
  const phase = ref<'move' | 'dwell'>('move')
  const dwellRemaining = ref(0)

  const isPlaying = ref(false)
  let tickTimer: ReturnType<typeof setInterval> | null = null

  const currentPoint = computed((): MapsLatLng | null => {
    const pts = path.value
    if (!pts.length) {
      return null
    }
    if (pts.length === 1) {
      return pts[0]!
    }
    const i = Math.min(segmentIdx.value, pts.length - 2)
    const a = pts[i]!
    const b = pts[i + 1]!
    if (phase.value === 'dwell') {
      return { ...b }
    }
    const t = easeInOutQuad(moveProgress.value)
    return lerp(a, b, t)
  })

  function stopTick() {
    if (tickTimer !== null) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  }

  function resetProgress() {
    segmentIdx.value = 0
    moveProgress.value = 0
    phase.value = 'move'
    dwellRemaining.value = 0
  }

  function tick() {
    const pts = path.value
    const n = pts.length
    if (n < 2 || !isPlaying.value) {
      return
    }

    const maxSeg = n - 2
    if (segmentIdx.value > maxSeg) {
      segmentIdx.value = maxSeg
    }

    if (phase.value === 'move') {
      const dt = tickMs / segmentMoveMs
      moveProgress.value = Math.min(1, moveProgress.value + dt)
      if (moveProgress.value >= 1 - 1e-6) {
        moveProgress.value = 1
        phase.value = 'dwell'
        dwellRemaining.value = dwellMs
      }
      return
    }

    // dwell
    dwellRemaining.value -= tickMs
    if (dwellRemaining.value <= 0) {
      if (segmentIdx.value >= maxSeg) {
        pause()
        return
      }
      segmentIdx.value++
      moveProgress.value = 0
      phase.value = 'move'
    }
  }

  function pause() {
    isPlaying.value = false
    stopTick()
  }

  function play() {
    const pts = path.value
    if (pts.length < 2) {
      return
    }
    pause()
    isPlaying.value = true
    tickTimer = setInterval(tick, tickMs)
  }

  function stop() {
    pause()
    resetProgress()
  }

  function next() {
    const pts = path.value
    const n = pts.length
    if (n < 2) {
      return
    }
    const maxSeg = n - 2
    if (segmentIdx.value < maxSeg) {
      segmentIdx.value++
      moveProgress.value = 0
      phase.value = 'move'
      dwellRemaining.value = 0
    }
  }

  function prev() {
    if (segmentIdx.value > 0) {
      segmentIdx.value--
      moveProgress.value = 0
      phase.value = 'move'
      dwellRemaining.value = 0
    }
  }

  const canStepForward = computed(() => {
    const pts = path.value
    const n = pts.length
    if (n < 2) {
      return false
    }
    return segmentIdx.value < n - 2
  })

  const canStepBack = computed(() => segmentIdx.value > 0)

  const { previewHeading } = useSmoothHeadings(path, segmentIdx, phase, currentPoint)

  watch(
    path,
    () => {
      stop()
    },
    { deep: true },
  )

  onUnmounted(() => {
    stopTick()
  })

  return {
    segmentIdx,
    phase,
    moveProgress,
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
  }
}
