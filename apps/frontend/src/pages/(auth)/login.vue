<script setup lang="ts">
import { computed, reactive } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import { useAuthStore } from "@/stores/auth.store";

defineOptions({
  name: "LoginPage",
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: "",
  password: "",
});

const redirectPath = computed(() => {
  const redirect = route.query.redirect;

  if (typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }

  return "/account";
});

async function handleSubmit() {
  authStore.clearError();

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });

    await router.push(redirectPath.value);
  } catch {
    // Ошибка уже записывается внутри authStore.error.
  }
}
</script>

<template>
  <DefaultLayout>
    <section class="login-page">
      <div class="login-page__card">
        <p class="login-page__eyebrow">Вход</p>

        <h1 class="login-page__title">Войти в аккаунт</h1>

        <p class="login-page__description">
          Введи email и пароль, чтобы перейти в свой аккаунт.
        </p>

        <form class="login-page__form" @submit.prevent="handleSubmit">
          <label class="login-page__field">
            <span class="login-page__label">Email</span>

            <input
              v-model.trim="form.email"
              class="login-page__input"
              type="email"
              name="email"
              autocomplete="email"
              required
            />
          </label>

          <label class="login-page__field">
            <span class="login-page__label">Пароль</span>

            <input
              v-model.trim="form.password"
              class="login-page__input"
              type="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </label>

          <p v-if="authStore.error" class="login-page__error">
            {{ authStore.error }}
          </p>

          <button
            class="login-page__submit"
            type="submit"
            :disabled="authStore.isLoading"
          >
            {{ authStore.isLoading ? "Входим..." : "Войти" }}
          </button>
        </form>

        <p class="login-page__footer">
          Ещё нет аккаунта?
          <RouterLink class="login-page__link" to="/register">
            Зарегистрироваться
          </RouterLink>
        </p>
      </div>
    </section>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100%;
  padding: 32px 20px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.login-page__card {
  width: 100%;
  padding: 24px;

  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);

  background-color: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.login-page__eyebrow {
  margin: 0 0 8px;

  color: var(--color-accent-strong);

  font-size: 14px;
  font-weight: 700;
}

.login-page__title {
  margin: 0;

  color: var(--color-text-main);

  font-size: 28px;
  line-height: 1.15;
}

.login-page__description {
  margin: 12px 0 24px;

  color: var(--color-text-muted);

  font-size: 15px;
  line-height: 1.5;
}

.login-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-page__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-page__label {
  color: var(--color-text-body);

  font-size: 14px;
  font-weight: 600;
}

.login-page__input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;

  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);

  background-color: var(--color-surface);
  color: var(--color-text-body);

  font: inherit;
}

.login-page__input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.login-page__error {
  margin: 0;

  color: #c0392b;

  font-size: 14px;
  line-height: 1.4;
}

.login-page__submit {
  min-height: 46px;

  border: none;
  border-radius: var(--radius-md);

  background-color: var(--color-accent);
  color: #ffffff;

  font: inherit;
  font-weight: 700;

  cursor: pointer;
}

.login-page__submit:hover:not(:disabled) {
  background-color: var(--color-accent-strong);
}

.login-page__submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-page__footer {
  margin: 20px 0 0;

  color: var(--color-text-muted);

  font-size: 14px;
  text-align: center;
}

.login-page__link {
  color: var(--color-accent-strong);

  font-weight: 700;
  text-decoration: none;
}

.login-page__link:hover {
  text-decoration: underline;
}
</style>
