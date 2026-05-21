<template>
  <div class="burger-menu">
    <button
      type="button"
      class="burger-menu__trigger"
      :class="{ 'burger-menu__trigger--active': modelValue }"
      :aria-expanded="modelValue"
      :aria-controls="menuId"
      :aria-label="modelValue ? closeLabel : openLabel"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="burger-menu__line" />
      <span class="burger-menu__line" />
      <span class="burger-menu__line" />
    </button>

    <Transition name="burger-menu-fade">
      <button
        v-if="modelValue"
        type="button"
        class="burger-menu__overlay"
        :aria-label="closeLabel"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <Transition name="burger-menu-drawer">
      <aside
        v-if="modelValue"
        :id="menuId"
        class="burger-menu__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="menuLabel"
      >
        <div class="burger-menu__header">
          <slot name="header" />
          <button
            type="button"
            class="burger-menu__close"
            :aria-label="closeLabel"
            @click="$emit('update:modelValue', false)"
          >
            <span class="burger-menu__close-icon" aria-hidden="true">X</span>
          </button>
        </div>
        <div class="burger-menu__body">
          <slot />
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    menuId?: string
    openLabel?: string
    closeLabel?: string
    menuLabel?: string
  }>(),
  {
    menuId: 'app-burger-menu',
    openLabel: 'Открыть меню',
    closeLabel: 'Закрыть меню',
    menuLabel: 'Мобильное меню',
  },
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const {
  menuId,
  openLabel,
  closeLabel,
  menuLabel,
} = toRefs(props)
</script>

<style scoped>
.burger-menu {
  display: flex;
  align-items: center;
}

.burger-menu__trigger {
  position: relative;
  z-index: 42;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3125rem;
  width: 3rem;
  height: 3rem;
  padding: 0.75rem;
  border: 1px solid #dbe2ef;
  border-radius: 14px;
  background: #fff;
  color: #1a1a1a;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.burger-menu__trigger:hover {
  border-color: #c4d1ea;
  box-shadow: 0 10px 24px rgba(18, 36, 74, 0.08);
}

.burger-menu__trigger:focus-visible,
.burger-menu__close:focus-visible,
.burger-menu__overlay:focus-visible {
  outline: 2px solid #1a5fff;
  outline-offset: 2px;
}

.burger-menu__line {
  display: block;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.burger-menu__trigger--active .burger-menu__line:nth-child(1) {
  transform: translateY(0.4375rem) rotate(45deg);
}

.burger-menu__trigger--active .burger-menu__line:nth-child(2) {
  opacity: 0;
}

.burger-menu__trigger--active .burger-menu__line:nth-child(3) {
  transform: translateY(-0.4375rem) rotate(-45deg);
}

.burger-menu__overlay {
  position: fixed;
  inset: 0;
  z-index: 39;
  border: 0;
  background: rgba(10, 18, 34, 0.48);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.burger-menu__panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  width: min(88vw, 24rem);
  height: 100dvh;
  padding: 1rem;
  background: #fff;
  box-shadow: -18px 0 42px rgba(8, 16, 30, 0.16);
}

.burger-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
}

.burger-menu__body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 1rem;
}

.burger-menu__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid #dbe2ef;
  border-radius: 14px;
  background: #f8faff;
  color: #162033;
  cursor: pointer;
}

.burger-menu__close-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.burger-menu-fade-enter-active,
.burger-menu-fade-leave-active,
.burger-menu-drawer-enter-active,
.burger-menu-drawer-leave-active {
  transition: all 0.25s ease;
}

.burger-menu-fade-enter-from,
.burger-menu-fade-leave-to {
  opacity: 0;
}

.burger-menu-drawer-enter-from,
.burger-menu-drawer-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (min-width: 1024px) {
  .burger-menu {
    display: none;
  }
}
</style>
