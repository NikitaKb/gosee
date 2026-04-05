<template>
  <button
    class="btn-white"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot>Button</slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  type: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
  disabled: { type: Boolean, default: false },
})

defineEmits<{ click: [e: MouseEvent] }>()
</script>

<style scoped>
.btn-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  background-color: #fff;
  color: #1a5fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
}

.btn-white:hover:not(:disabled) {
  background-color: #f7f9ff;
  border-color: #c8d9ff;
}

.btn-white:active:not(:disabled) {
  background-color: #eef2ff;
}

.btn-white:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
