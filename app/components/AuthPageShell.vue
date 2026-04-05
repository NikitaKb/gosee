<template>
  <div class="auth-shell">
    <div class="auth-shell__card">
      <header class="auth-shell__header">
        <NuxtLink
          to="/"
          class="auth-shell__brand"
          aria-label="GoSee — на главную"
        >
          <img
            :src="logoSrc"
            alt=""
            width="128"
          height="77"
            class="auth-shell__logo"
          >

        </NuxtLink>
        <h1 class="auth-shell__title">
          {{ title }}
        </h1>
        <p class="auth-shell__subtitle">
          {{ subtitle }}
        </p>
      </header>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import logoSrc from '~/assets/logo-gosee.svg'

defineProps<{
  title: string
  subtitle: string
}>()
</script>

<style scoped>
.auth-shell {
  box-sizing: border-box;
  min-height: 100dvh;
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', system-ui, sans-serif;
  background: radial-gradient(
    ellipse 120% 90% at 50% 0%,
    #cfe0ff 0%,
    #e8f0ff 38%,
    #f7f9fc 65%,
    #fff 100%
  );
}

.auth-shell__card {
  width: 100%;
  max-width: 420px;
  padding: 2.25rem 1.75rem 2rem;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 48px rgba(26, 95, 255, 0.1);
}

.auth-shell__header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  text-decoration: none;
  color: inherit;
}

.auth-shell__logo {
  display: block;
  height: 40px;
  width: auto;
}

.auth-shell__brand-text {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.auth-shell__title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.auth-shell__subtitle {
  margin: 0;
  font-size: 0.9375rem;
  color: #888;
  font-weight: 400;
  line-height: 1.4;
}
</style>
