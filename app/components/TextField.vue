<template>
  <div
    class="text-field-wrap"
    :class="{
      'text-field-wrap--embedded': embedded,
      'text-field-wrap--toggle': showPasswordToggle,
    }"
  >
    <div
      class="text-field-row"
      :class="{ 'text-field-row--toggle': showPasswordToggle }"
    >
      <input
        :id="id"
        class="text-field"
        :class="{ 'text-field--toggle-padding': showPasswordToggle }"
        :type="effectiveInputType"
        :value="displayValue"
        :placeholder="placeholderShown"
        :disabled="disabled"
        :name="name"
        :autocomplete="autocomplete"
        :aria-label="placeholder"
        @input="onInput"
        @animationend="onTypingAnimEnd"
        @focus="isFocused = true"
        @blur="isFocused = false"
      >
      <span
        v-show="showTypingLayer"
        class="typed-layer"
        aria-hidden="true"
      >
        <span class="typed-layer__text">{{ animatedSlice }}</span>
        <span class="typed-layer__cursor" />
      </span>
      <button
        v-if="showPasswordToggle"
        type="button"
        class="text-field__toggle"
        :aria-pressed="passwordVisible"
        :aria-label="passwordVisible ? 'Скрыть пароль' : 'Показать пароль'"
        tabindex="-1"
        @click="passwordVisible = !passwordVisible"
      >
        <svg
          v-if="!passwordVisible"
          class="text-field__toggle-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle
            cx="12"
            cy="12"
            r="3"
          />
        </svg>
        <svg
          v-else
          class="text-field__toggle-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line
            x1="1"
            y1="1"
            x2="23"
            y2="23"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /** Если не задан — локальное состояние (удобно из Markdown). */
  modelValue: { type: String, default: undefined },
  placeholder: { type: String, default: 'Введи сюда текст...' },
  type: { type: String, default: 'text' },
  name: { type: String, default: undefined },
  id: { type: String, default: undefined },
  autocomplete: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  /** Прозрачный фон и без обводки фокуса — для строки с иконкой (PlaningMain и т.п.). */
  embedded: { type: Boolean, default: false },
  /** Кнопка «глаз» для полей с type="password" (не используется в embedded). */
  passwordToggle: { type: Boolean, default: false },
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inner = ref('')
const isFocused = ref(false)
const passwordVisible = ref(false)

const showPasswordToggle = computed(
  () => props.passwordToggle && !props.embedded && props.type === 'password',
)

const effectiveInputType = computed(() => {
  if (showPasswordToggle.value) {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})
const animatedSlice = ref('')
/** Длина значения до последнего ввода — чтобы анимировать только набор, не удаление. */
let prevValueLength = 0

const displayValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : inner.value,
)

const isEmpty = computed(() => displayValue.value.length === 0)

/** Пока печатаем «сверху», в input оставляем пробел — иначе нативный placeholder мешает. */
const placeholderShown = computed(() => {
  if (!isEmpty.value || props.disabled) {
    return props.placeholder
  }
  if (isFocused.value) {
    return props.placeholder
  }
  return ' '
})

const showTypingLayer = computed(
  () => isEmpty.value && !isFocused.value && !props.disabled && props.placeholder.length > 0,
)

type Phase = 'typing' | 'pauseFull' | 'deleting' | 'pauseEmpty'

let phase: Phase = 'typing'
let charIndex = 0
let pauseUntil = 0
let intervalId: ReturnType<typeof setInterval> | undefined

function resetTypewriter() {
  phase = 'typing'
  charIndex = 0
  animatedSlice.value = ''
  pauseUntil = 0
}

function tickTypewriter() {
  const text = props.placeholder
  if (!text.length || props.disabled || isFocused.value || !isEmpty.value) {
    animatedSlice.value = text
    return
  }

  const now = Date.now()

  if (phase === 'pauseFull' || phase === 'pauseEmpty') {
    if (now < pauseUntil) {
      return
    }
    if (phase === 'pauseFull') {
      phase = 'deleting'
    }
    else {
      phase = 'typing'
    }
  }

  if (phase === 'typing') {
    charIndex = Math.min(charIndex + 1, text.length)
    animatedSlice.value = text.slice(0, charIndex)
    if (charIndex >= text.length) {
      phase = 'pauseFull'
      pauseUntil = now + 1600
    }
  }
  else if (phase === 'deleting') {
    charIndex = Math.max(charIndex - 1, 0)
    animatedSlice.value = text.slice(0, charIndex)
    if (charIndex <= 0) {
      phase = 'pauseEmpty'
      pauseUntil = now + 500
    }
  }
}

function triggerUserTypingAnimation(el: HTMLInputElement) {
  el.classList.remove('text-field--user-type')
  void el.offsetWidth
  el.classList.add('text-field--user-type')
}

function onTypingAnimEnd(e: AnimationEvent) {
  const name = e.animationName
  if (name !== 'text-field-user-type' && name !== 'text-field-user-type-embedded') {
    return
  }
  const el = e.target as HTMLInputElement
  el.classList.remove('text-field--user-type')
}

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const v = el.value
  if (v.length > prevValueLength) {
    triggerUserTypingAnimation(el)
  }
  prevValueLength = v.length

  if (props.modelValue !== undefined) {
    emit('update:modelValue', v)
  }
  else {
    inner.value = v
    emit('update:modelValue', v)
  }
}

watch(
  displayValue,
  (next) => {
    prevValueLength = next.length
  },
  { immediate: true },
)

watch(
  () => [props.placeholder, props.disabled] as const,
  () => {
    resetTypewriter()
  },
)

onMounted(() => {
  intervalId = setInterval(tickTypewriter, 85)
})

onUnmounted(() => {
  if (intervalId !== undefined) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.text-field-wrap {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.text-field-row {
  position: relative;
  width: 100%;
}

.text-field-row--toggle .text-field--toggle-padding {
  padding-right: 3rem;
}

.text-field__toggle {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1a5fff;
  cursor: pointer;
  line-height: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.text-field__toggle:hover {
  background-color: rgba(26, 95, 255, 0.08);
}

.text-field__toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 95, 255, 0.35);
}

.text-field__toggle-icon {
  display: block;
}

.text-field-wrap--toggle .typed-layer {
  max-width: calc(100% - 2rem - 2.75rem);
}

.text-field {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  padding: 0 1rem;
  border: none;
  border-radius: 16px;
  background-color: #f2f2f2;
  color: #1a1a1a;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  outline: none;
  transition: box-shadow 0.15s ease;
}

.text-field::placeholder {
  color: #c0c0c0;
}

.text-field:focus-visible {
  box-shadow: 0 0 0 2px rgba(26, 95, 255, 0.35);
}

.text-field-wrap--embedded .text-field {
  min-height: 48px;
  padding: 0;
  border-radius: 0;
  background-color: transparent;
}

.text-field-wrap--embedded .text-field:focus-visible {
  box-shadow: none;
}

.text-field-wrap--embedded .typed-layer {
  left: 0;
  max-width: 100%;
}

.text-field--user-type {
  animation: text-field-user-type 0.28s ease-out;
}

@keyframes text-field-user-type {
  0% {
    background-color: #f2f2f2;
    transform: scale(1);
  }
  40% {
    background-color: #e2e8ff;
    transform: scale(1.012);
  }
  100% {
    background-color: #f2f2f2;
    transform: scale(1);
  }
}

.text-field-wrap--embedded .text-field--user-type {
  animation: text-field-user-type-embedded 0.28s ease-out;
}

@keyframes text-field-user-type-embedded {
  0% {
    background-color: transparent;
    transform: scale(1);
  }
  40% {
    background-color: rgba(26, 95, 255, 0.1);
    transform: scale(1.006);
  }
  100% {
    background-color: transparent;
    transform: scale(1);
  }
}

.text-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.typed-layer {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  max-width: calc(100% - 2rem);
  pointer-events: none;
  user-select: none;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  color: #c0c0c0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.typed-layer__cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 1px;
  background-color: #c0c0c0;
  animation: typed-blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes typed-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
