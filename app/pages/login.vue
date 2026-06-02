<template>
  <AuthPageShell
    mode="login"
    title="Войдите в аккаунт"
    subtitle="Продолжайте собирать идеи для новых прогулок."
  >
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="login-identity"
        >Никнейм или e-mail</label>
        <TextField
          id="login-identity"
          v-model="identity"
          name="identity"
          placeholder="Введите никнейм или e-mail"
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
          placeholder="Введите пароль"
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
        <span class="auth-check__text">Запомнить меня</span>
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
          {{ pending ? 'Входим…' : 'Войти' }}
        </ButtonBlue>
      </div>
      <p class="auth-switch">
        Еще нет аккаунта?
        <NuxtLink
          to="/register"
          class="auth-switch__link"
        >
          Создать аккаунт
        </NuxtLink>
      </p>
    </form>
  </AuthPageShell>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Вход — GoSee',
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
