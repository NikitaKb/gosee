<template>
  <button
    class="btn-blue"
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
.btn-blue {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.75rem;
  border: none;
  border-radius: 16px;
  background-color: #1a5fff;
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

.btn-blue:hover:not(:disabled) {
  background-color: #0d4fe6;
}

.btn-blue:active:not(:disabled) {
  background-color: #0a42cc;
}

.btn-blue:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
