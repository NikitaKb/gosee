<template>
  <AuthPageShell
    mode="register"
    title="Создайте аккаунт"
    subtitle="Сохраняйте маршруты и делитесь своими прогулками."
  >
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <div class="auth-form__row">
        <div class="auth-field">
          <label
            class="auth-field__label"
            for="register-name"
          >Ваше имя</label>
          <TextField
            id="register-name"
            v-model="name"
            name="name"
            placeholder="Как вас зовут"
            autocomplete="name"
          />
        </div>
        <div class="auth-field">
          <label
            class="auth-field__label"
            for="register-nickname"
          >Никнейм</label>
          <TextField
            id="register-nickname"
            v-model="nickname"
            name="nickname"
            placeholder="Придумайте никнейм"
            autocomplete="username"
          />
        </div>
      </div>
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="register-email"
        >E-mail</label>
        <TextField
          id="register-email"
          v-model="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          autocomplete="email"
        />
      </div>
      <div class="auth-form__row">
        <div class="auth-field">
          <label
            class="auth-field__label"
            for="register-password"
          >Пароль</label>
          <TextField
            id="register-password"
            v-model="password"
            type="password"
            name="password"
            placeholder="Придумайте пароль"
            password-toggle
            autocomplete="new-password"
          />
        </div>
        <div class="auth-field">
          <label
            class="auth-field__label"
            for="register-password-confirm"
          >Повторите пароль</label>
          <TextField
            id="register-password-confirm"
            v-model="passwordConfirm"
            type="password"
            name="password_confirm"
            placeholder="Повторите пароль"
            password-toggle
            autocomplete="new-password"
          />
        </div>
      </div>
      <label class="auth-check">
        <input
          v-model="termsAccepted"
          type="checkbox"
          name="terms"
          class="auth-check__input"
          required
        >
        <span
          class="auth-check__box"
          aria-hidden="true"
        />
        <span class="auth-check__text">Я согласен с условиями использования</span>
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
          {{ pending ? 'Создаем аккаунт…' : 'Создать аккаунт' }}
        </ButtonBlue>
      </div>
      <p class="auth-switch">
        Уже есть аккаунт?
        <NuxtLink
          to="/login"
          class="auth-switch__link"
        >
          Войти
        </NuxtLink>
      </p>
    </form>
  </AuthPageShell>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const name = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const termsAccepted = ref(false)
const formError = ref('')
const pending = ref(false)

const { register } = useAuth()

async function onSubmit() {
  formError.value = ''
  pending.value = true
  try {
    await register({
      name: name.value.trim(),
      nickname: nickname.value.trim() || undefined,
      email: email.value.trim(),
      password: password.value,
      passwordConfirm: passwordConfirm.value,
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
        ?? 'Не удалось зарегистрироваться'
  }
  finally {
    pending.value = false
  }
}
</script>

<style scoped>
.auth-form__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

@media (max-width: 520px) {
  .auth-form__row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
