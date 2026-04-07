import type { MapsLatLng } from './useGoogleMaps'

export function useRoutePlayer(
  path: Ref<MapsLatLng[]>,
  options?: {
    intervalMs?: number
    onTick?: (index: number) => void
  },
) {
  const intervalMs = options?.intervalMs ?? 2500

  const currentIndex = ref(0)
  const isPlaying = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const currentPoint = computed(() => {
    const pts = path.value
    if (!pts.length) {
      return null
    }
    return pts[Math.min(currentIndex.value, pts.length - 1)]!
  })

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function pause() {
    isPlaying.value = false
    stopTimer()
  }

  function play() {
    const pts = path.value
    if (pts.length === 0) {
      return
    }
    pause()
    isPlaying.value = true
    timer = setInterval(() => {
      const n = path.value.length
      if (n === 0) {
        pause()
        return
      }
      if (currentIndex.value >= n - 1) {
        pause()
        return
      }
      currentIndex.value++
      options?.onTick?.(currentIndex.value)
    }, intervalMs)
  }

  function stop() {
    pause()
    currentIndex.value = 0
  }

  function next() {
    const n = path.value.length
    if (n === 0) {
      return
    }
    if (currentIndex.value < n - 1) {
      currentIndex.value++
    }
  }

  function prev() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  watch(
    path,
    () => {
      stop()
    },
    { deep: true },
  )

  onUnmounted(() => {
    stopTimer()
  })

  return {
    currentIndex,
    isPlaying,
    currentPoint,
    play,
    pause,
    stop,
    next,
    prev,
  }
}
