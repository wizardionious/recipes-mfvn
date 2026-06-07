<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  showClearButton: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "submit-search"): void;
  (event: "clear-search"): void;
}>();

const searchQuery = computed({
  get() {
    return props.modelValue;
  },

  set(value: string) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <form
    class="recipe-search-form"
    role="search"
    @submit.prevent="emit('submit-search')"
  >
    <input
      v-model="searchQuery"
      class="recipe-search-form__input"
      type="search"
      placeholder="Например: кофе"
      aria-label="Поиск рецептов"
    />

    <div class="recipe-search-form__actions">
      <button class="recipe-search-form__button" type="submit">
        Найти
      </button>

      <button
        v-if="showClearButton"
        class="recipe-search-form__button recipe-search-form__button--secondary"
        type="button"
        @click="emit('clear-search')"
      >
        Очистить
      </button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.recipe-search-form {
  max-width: 560px;
  margin: 0 auto 20px;
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-soft);

  &__input {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 14px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    color: var(--color-text-body);
    font-size: 16px;
  }

  &__input::placeholder {
    color: var(--color-text-muted);
  }

  &__input:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__button {
    height: 44px;
    padding: 0 18px;
    border: none;
    border-radius: var(--radius-md);
    background-color: var(--color-accent);
    color: var(--color-surface);
    font-weight: 700;
    cursor: pointer;
  }

  &__button:hover,
  &__button:focus-visible {
    background-color: var(--color-accent-strong);
  }

  &__button:active {
    background-color: oklch(0.595 0.1367 3.86);
  }

  &__button--secondary {
    border: 1px solid var(--color-border-soft);
    background-color: transparent;
    color: var(--color-text-body);
  }

  &__button--secondary:hover,
  &__button--secondary:focus-visible {
    border-color: var(--color-accent);
    background-color: transparent;
    color: var(--color-accent-strong);
  }

  @media (max-width: 480px) {
    flex-direction: column;

    &__actions {
      width: 100%;
    }

    &__button {
      flex: 1;
    }
  }
}
</style>