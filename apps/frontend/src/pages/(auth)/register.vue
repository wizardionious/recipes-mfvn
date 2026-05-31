<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import { useAuthStore } from "@/stores/auth.store";

defineOptions({
  name: "RegisterPage",
});

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const validationError = ref("");

async function handleSubmit() {
  validationError.value = "";
  authStore.clearError();

  if (form.password !== form.confirmPassword) {
    validationError.value = "Пароли не совпадают.";
    return;
  }

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    await router.push("/account");
  } catch {
    // Ошибка уже записывается внутри authStore.error.
  }
}
</script>

<template>
  <DefaultLayout>
    <section class="register-page">
      <div class="register-page__card">
        <p class="register-page__eyebrow">Регистрация</p>

        <h1 class="register-page__title">Создать аккаунт</h1>

        <p class="register-page__description">
          Создай аккаунт, чтобы сохранять рецепты и работать со своим профилем.
        </p>

        <form class="register-page__form" @submit.prevent="handleSubmit">
          <label class="register-page__field">
            <span class="register-page__label">Имя</span>

            <input
              v-model.trim="form.name"
              class="register-page__input"
              type="text"
              name="name"
              autocomplete="name"
              minlength="2"
              maxlength="100"
              required
            />
          </label>

          <label class="register-page__field">
            <span class="register-page__label">Email</span>

            <input
              v-model.trim="form.email"
              class="register-page__input"
              type="email"
              name="email"
              autocomplete="email"
              required
            />
          </label>

          <label class="register-page__field">
            <span class="register-page__label">Пароль</span>

            <input
              v-model.trim="form.password"
              class="register-page__input"
              type="password"
              name="password"
              autocomplete="new-password"
              minlength="6"
              required
            />
          </label>

          <label class="register-page__field">
            <span class="register-page__label">Повтори пароль</span>

            <input
              v-model.trim="form.confirmPassword"
              class="register-page__input"
              type="password"
              name="confirmPassword"
              autocomplete="new-password"
              minlength="6"
              required
            />
          </label>

          <p
            v-if="validationError || authStore.error"
            class="register-page__error"
          >
            {{ validationError || authStore.error }}
          </p>

          <button
            class="register-page__submit"
            type="submit"
            :disabled="authStore.isLoading"
          >
            {{ authStore.isLoading ? "Создаём аккаунт..." : "Создать аккаунт" }}
          </button>
        </form>

        <p class="register-page__footer">
          Уже есть аккаунт?
          <RouterLink class="register-page__link" to="/login">
            Войти
          </RouterLink>
        </p>
      </div>
    </section>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.register-page {
  min-height: 100%;
  padding: 32px 20px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.register-page__card {
  width: 100%;
  padding: 24px;

  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);

  background-color: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.register-page__eyebrow {
  margin: 0 0 8px;

  color: var(--color-accent-strong);

  font-size: 14px;
  font-weight: 700;
}

.register-page__title {
  margin: 0;

  color: var(--color-text-main);

  font-size: 28px;
  line-height: 1.15;
}

.register-page__description {
  margin: 12px 0 24px;

  color: var(--color-text-muted);

  font-size: 15px;
  line-height: 1.5;
}

.register-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register-page__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.register-page__label {
  color: var(--color-text-body);

  font-size: 14px;
  font-weight: 600;
}

.register-page__input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;

  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);

  background-color: var(--color-surface);
  color: var(--color-text-body);

  font: inherit;
}

.register-page__input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.register-page__error {
  margin: 0;

  color: #c0392b;

  font-size: 14px;
  line-height: 1.4;
}

.register-page__submit {
  min-height: 46px;

  border: none;
  border-radius: var(--radius-md);

  background-color: var(--color-accent);
  color: #ffffff;

  font: inherit;
  font-weight: 700;

  cursor: pointer;
}

.register-page__submit:hover:not(:disabled) {
  background-color: var(--color-accent-strong);
}

.register-page__submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.register-page__footer {
  margin: 20px 0 0;

  color: var(--color-text-muted);

  font-size: 14px;
  text-align: center;
}

.register-page__link {
  color: var(--color-accent-strong);

  font-weight: 700;
  text-decoration: none;
}

.register-page__link:hover {
  text-decoration: underline;
}
</style>
