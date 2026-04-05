<template>
  <AuthPageShell
    title="Вход"
    subtitle="С возвращением!"
  >
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="login-identity"
        >Ваш никнейм или e-mail</label>
        <TextField
          id="login-identity"
          v-model="identity"
          name="identity"
          placeholder="Ваш никнейм..."
          autocomplete="username"
        />
      </div>
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="login-password"
        >Пароль</label>
        <TextField
          id="login-password"
          v-model="password"
          type="password"
          name="password"
          placeholder="Ваш пароль..."
          password-toggle
          autocomplete="current-password"
        />
      </div>
      <label class="auth-check">
        <input
          v-model="remember"
          type="checkbox"
          name="remember"
          class="auth-check__input"
        >
        <span
          class="auth-check__box"
          aria-hidden="true"
        />
        <span class="auth-check__text">Запомнить меня?</span>
      </label>
      <p
        v-if="formError"
        class="auth-form__error"
        role="alert"
      >
        {{ formError }}
      </p>
      <div class="auth-form__submit">
        <ButtonBlue
          type="submit"
          :disabled="pending"
        >
          {{ pending ? 'Вход…' : 'Войти' }}
        </ButtonBlue>
      </div>
      <p class="auth-switch">
        Ещё нет аккаунта?
        <NuxtLink
          to="/register"
          class="auth-switch__link"
        >
          Зарегистрироваться
        </NuxtLink>
      </p>
    </form>
  </AuthPageShell>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const identity = ref('')
const password = ref('')
const remember = ref(false)
const formError = ref('')
const pending = ref(false)

const { login } = useAuth()

async function onSubmit() {
  formError.value = ''
  pending.value = true
  try {
    await login({
      identity: identity.value.trim(),
      password: password.value,
      remember: remember.value,
    })
    await navigateTo('/')
  }
  catch (e: unknown) {
    const err = e as {
      data?: { statusMessage?: string }
      statusMessage?: string
    }
    formError.value
      = err.data?.statusMessage
        ?? err.statusMessage
        ?? 'Не удалось войти'
  }
  finally {
    pending.value = false
  }
}
</script>

<style scoped>
.auth-form :deep(.text-field) {
  border-radius: 9999px;
}

.auth-field + .auth-field {
  margin-top: 1.1rem;
}

.auth-field__label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: left;
}

.auth-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1.35rem;
  cursor: pointer;
  font-size: 15px;
  color: #1a1a1a;
  user-select: none;
}

.auth-check__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.auth-check__box {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #1a5fff;
  background: #fff;
  transition: background-color 0.15s ease;
}

.auth-check__input:checked + .auth-check__box {
  background: #1a5fff;
  box-shadow: inset 0 0 0 3px #fff;
}

.auth-check__input:focus-visible + .auth-check__box {
  box-shadow: 0 0 0 2px rgba(26, 95, 255, 0.35);
}

.auth-check__text {
  line-height: 1.3;
}

.auth-form__error {
  margin: 0 0 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  background: #ffe8e8;
  color: #b00020;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
}

.auth-form__submit :deep(.btn-blue) {
  width: 100%;
}

.auth-switch {
  margin: 1.25rem 0 0;
  text-align: center;
  font-size: 0.9375rem;
  color: #888;
}

.auth-switch__link {
  margin-left: 0.25rem;
  color: #1a5fff;
  font-weight: 500;
  text-decoration: none;
}

.auth-switch__link:hover {
  text-decoration: underline;
}
</style>
