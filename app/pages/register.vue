<template>
  <AuthPageShell
    title="Регистрация"
    subtitle="Создайте свой аккаунт"
  >
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="register-name"
        >Ваше имя</label>
        <TextField
          id="register-name"
          v-model="name"
          name="name"
          placeholder="Ваше имя..."
          autocomplete="name"
        />
      </div>
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="register-nickname"
        >Ваш никнейм</label>
        <TextField
          id="register-nickname"
          v-model="nickname"
          name="nickname"
          placeholder="Ваш никнейм..."
          autocomplete="username"
        />
      </div>
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="register-email"
        >Ваш e-mail</label>
        <TextField
          id="register-email"
          v-model="email"
          type="email"
          name="email"
          placeholder="Ваш e-mail..."
          autocomplete="email"
        />
      </div>
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
          placeholder="Ваш пароль..."
          password-toggle
          autocomplete="new-password"
        />
      </div>
      <div class="auth-field">
        <label
          class="auth-field__label"
          for="register-password-confirm"
        >Подтвердите пароль</label>
        <TextField
          id="register-password-confirm"
          v-model="passwordConfirm"
          type="password"
          name="password_confirm"
          placeholder="Ваш пароль..."
          password-toggle
          autocomplete="new-password"
        />
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
        <span class="auth-check__text">Я согласен с условиями</span>
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
          {{ pending ? 'Регистрация…' : 'Регистрация' }}
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
.auth-form :deep(.text-field) {
  border-radius: 9999px;
}

.auth-field + .auth-field {
  margin-top: 1rem;
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
