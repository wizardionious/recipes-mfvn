<script lang="ts" setup>
import { SearchIcon, XIcon } from "@lucide/vue";
import { nextTick, ref, useTemplateRef } from "vue";
import AppButton from "./AppButton.vue";
import { onClickOutside } from "@vueuse/core";

const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");
const searchBodyRef = useTemplateRef<HTMLFormElement>("searchBodyRef");
const closeButtonRef = useTemplateRef<HTMLButtonElement>("closeButtonRef");
const isOpen = ref(false);
const query = ref("");

async function open() {
  isOpen.value = true;

  await nextTick();
  searchInputRef.value?.focus();
}

function close() {
  isOpen.value = false;
  query.value = "";
}

function submit() {
  const searchQuery = query.value.trim();

  if (!searchQuery) {
    return;
  }

  console.log("Search:", searchQuery);
}

onClickOutside(searchBodyRef, close, { ignore: [closeButtonRef] });
</script>

<template>
  <AppButton
    type="button"
    aria-label="Open search"
    :aria-expanded="isOpen"
    aria-controls="app-search"
    @click="open"
  >
    <SearchIcon :size="20" aria-hidden="true" />
  </AppButton>

  <form
    v-if="isOpen"
    ref="searchBodyRef"
    id="app-search"
    class="app-search"
    role="search"
    @submit.prevent="submit"
    @keydown.esc="close"
  >
    <SearchIcon :size="20" aria-hidden="true" />
    <input
      ref="searchInputRef"
      v-model="query"
      class="app-search__input"
      type="search"
      placeholder="Пошук рецепта..."
    />

    <AppButton
      ref="closeButtonRef"
      type="button"
      aria-label="Close search"
      @click="close"
    >
      <XIcon :size="20" aria-hidden="true" />
    </AppButton>
  </form>
</template>

<style lang="scss" scoped>
.app-search {
  position: absolute;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  height: 100%;
  padding: 0 12px;

  background-color: var(--color-surface);
  box-shadow: var(--shadow-soft);

  &__input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 8px 0;

    border: none;
    outline: none;
    background-color: transparent;

    color: var(--color-text-body);
    font-size: 16px;
  }

  &__input::placeholder {
    color: var(--color-text-muted);
  }

  &__input:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0;
    border-radius: var(--radius-md);
  }
}
</style>
