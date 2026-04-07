<template>
  <div
    class="plan-controls"
    role="toolbar"
    aria-label="Управление превью маршрута"
  >
    <button
      v-if="!isPlaying"
      type="button"
      class="plan-controls__btn plan-controls__btn--primary"
      :disabled="!canPlay"
      @click="$emit('play')"
    >
      Превью прогулки
    </button>
    <button
      v-else
      type="button"
      class="plan-controls__btn"
      @click="$emit('pause')"
    >
      Пауза
    </button>
    <button
      type="button"
      class="plan-controls__btn"
      :disabled="!canStepBack"
      @click="$emit('prev')"
    >
      Назад
    </button>
    <button
      type="button"
      class="plan-controls__btn"
      :disabled="!canStepFwd"
      @click="$emit('next')"
    >
      Вперёд
    </button>
    <button
      type="button"
      class="plan-controls__btn plan-controls__btn--ghost"
      :disabled="!hasPath"
      @click="$emit('stop')"
    >
      Сброс
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean
  hasPath: boolean
  canPlay: boolean
  canStepBack: boolean
  canStepFwd: boolean
}>()

defineEmits<{
  play: []
  pause: []
  next: []
  prev: []
  stop: []
}>()
</script>

<style scoped>
.plan-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 28px rgba(15, 30, 60, 0.12);
  border: 1px solid #e8ecf3;
}

.plan-controls__btn {
  padding: 0.5rem 0.95rem;
  border-radius: 10px;
  border: 1px solid #d8dee8;
  background: #f7f9fc;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
}

.plan-controls__btn:hover:not(:disabled) {
  background: #eef2f8;
  border-color: #c5cedc;
}

.plan-controls__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.plan-controls__btn--primary {
  background: #2b65ff;
  border-color: #2b65ff;
  color: #fff;
}

.plan-controls__btn--primary:hover:not(:disabled) {
  background: #1f52d8;
  border-color: #1f52d8;
}

.plan-controls__btn--ghost {
  background: transparent;
}
</style>
