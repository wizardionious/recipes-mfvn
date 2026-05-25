<script lang="ts" setup>
import { SearchIcon, XIcon } from "@lucide/vue";
import { nextTick, ref, useTemplateRef } from "vue";
import AppButton from "./AppButton.vue";
import { onClickOutside } from "@vueuse/core";

const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");
const searchBodyRef = useTemplateRef<HTMLFormElement>("searchBodyRef");
const toggleButtonRef = useTemplateRef<HTMLButtonElement>("toggleButtonRef");
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

const toggle = () => (isOpen.value ? close() : open());

function submit() {
  const searchQuery = query.value.trim();

  if (!searchQuery) {
    return;
  }

  console.log("Search:", searchQuery);
}

onClickOutside(searchBodyRef, close, { ignore: [toggleButtonRef] });
</script>

<template>
  <AppButton
    ref="toggleButtonRef"
    class="app-search__toggle"
    type="button"
    aria-label="Open search"
    :aria-expanded="isOpen"
    aria-controls="app-search"
    @click="toggle"
  >
    <Transition mode="out-in">
      <SearchIcon v-if="!isOpen" :size="20" aria-hidden="true" />
      <XIcon v-else :size="20" aria-hidden="true" />
    </Transition>
  </AppButton>

  <div class="app-search">
    <Transition name="expand-search">
      <form
        v-if="isOpen"
        ref="searchBodyRef"
        id="app-search"
        class="app-search__form"
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
      </form>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.app-search {
  position: absolute;
  inset: 0;
  z-index: 1000;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;

  &__toggle {
    position: relative;
    z-index: 1001;
  }

  &__form {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 80px;

    background-color: var(--color-surface);
    gap: 24px;
    display: flex;
    align-items: center;
    width: calc(100% - 80px);
    pointer-events: all;
    overflow: hidden;
    padding: 0 8px;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 8px 0;

    border: none;
    outline: none;
    background-color: var(--color-border-soft);
    border-radius: var(--radius-md);

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

.v-enter-active,
.v-leave-active {
  transition: translate 0.15s ease;
}

.v-enter-from,
.v-leave-to {
  translate: 0 -32px;
}

@media (max-width: 480px) {
  .app-search {
    &__form {
      right: 76px;
      width: calc(100% - 76px);
    }
  }
}

.expand-search-enter-active,
.expand-search-leave-active {
  transition: width 0.5s ease;
}

.expand-search-enter-from,
.expand-search-leave-to {
  width: 0px;
}
</style>
