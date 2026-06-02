<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Transition name="page-loader">
    <div
      v-if="pageTransitionVisible"
      class="page-loader"
      aria-hidden="true"
    >
      <div class="page-loader__track">
        <span class="page-loader__runner">
          <img
            :src="goseeAnimIcon"
            alt=""
            class="page-loader__goose"
            width="58"
            height="62"
          >
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import goseeAnimIcon from '~/assets/images/icons/goseeanim.svg'

const nuxtApp = useNuxtApp()
const pageTransitionVisible = ref(false)
const minimumVisibleMs = 620
let startedAt = 0
let hideTimer: ReturnType<typeof setTimeout> | undefined
let fallbackTimer: ReturnType<typeof setTimeout> | undefined
let finishTimer: ReturnType<typeof setTimeout> | undefined

function clearTimers() {
  if (hideTimer) {
    clearTimeout(hideTimer)
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
  }
  if (finishTimer) {
    clearTimeout(finishTimer)
  }
}

function showPageTransition() {
  clearTimers()
  startedAt = Date.now()
  pageTransitionVisible.value = true
  fallbackTimer = setTimeout(hidePageTransition, 2400)
}

function hidePageTransition() {
  const remainingMs = Math.max(0, minimumVisibleMs - (Date.now() - startedAt))
  if (hideTimer) {
    clearTimeout(hideTimer)
  }
  hideTimer = setTimeout(() => {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer)
      fallbackTimer = undefined
    }
    pageTransitionVisible.value = false
    if (finishTimer) {
      clearTimeout(finishTimer)
    }
    finishTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('gosee:page-transition-finished'))
    }, 220)
  }, remainingMs)
}

if (import.meta.client) {
  const removePageStartHook = nuxtApp.hook('page:start', showPageTransition)
  const removePageFinishHook = nuxtApp.hook('page:finish', hidePageTransition)

  onBeforeUnmount(() => {
    clearTimers()
    removePageStartHook()
    removePageFinishHook()
  })
}
</script>

<style scoped>
.page-loader {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(248, 251, 255, 0.88);
  backdrop-filter: blur(12px);
}

.page-loader__track {
  position: relative;
  width: min(78vw, 620px);
  height: 104px;
}

.page-loader__runner {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 84px;
  height: 90px;
  animation: goose-run 1.05s linear infinite;
}

.page-loader__goose {
  display: block;
  width: 84px;
  height: 90px;
  scale: -1 1;
  filter: drop-shadow(0 8px 10px rgba(37, 99, 235, 0.18));
}

.page-loader-enter-active,
.page-loader-leave-active {
  transition: opacity 0.2s ease;
}

.page-loader-enter-from,
.page-loader-leave-to {
  opacity: 0;
}

@keyframes goose-run {
  0% {
    transform: translateX(-84px) translateY(0) rotate(-2deg);
  }

  25% {
    transform: translateX(calc((min(78vw, 620px) - 84px) * 0.25)) translateY(-9px) rotate(2deg);
  }

  50% {
    transform: translateX(calc((min(78vw, 620px) - 84px) * 0.5)) translateY(0) rotate(-2deg);
  }

  75% {
    transform: translateX(calc((min(78vw, 620px) - 84px) * 0.75)) translateY(-9px) rotate(2deg);
  }

  100% {
    transform: translateX(min(78vw, 620px)) translateY(0) rotate(-2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-loader__runner {
    left: 50%;
    animation: none;
    transform: translateX(-50%);
  }
}
</style>
