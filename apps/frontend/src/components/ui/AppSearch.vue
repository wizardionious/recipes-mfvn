<script lang="ts" setup>
import { SearchIcon, XIcon } from "@lucide/vue";
import { nextTick, ref, useTemplateRef } from "vue";
import AppButton from "./AppButton.vue";
import { onClickOutside } from "@vueuse/core";
import { useRouter } from "vue-router";

const router = useRouter();
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

async function submit() {
  const searchQuery = query.value.trim();

  if (!searchQuery) {
    return;
  }

  try {
    await router.push({
      path: "/recipes",
      query: {
        search: searchQuery,
      },
    });

    close();
  } catch (error) {
    console.error("Search navigation failed:", error);
  }
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

  display: flex;
  align-items: center;

  width: 100%;
  height: 100%;
  overflow: hidden;

  background-color: transparent;
  pointer-events: none;

  &__toggle {
    position: relative;
    z-index: 1001;
  }

  &__form {
    position: absolute;
    top: 0;
    right: 80px;
    bottom: 0;

    display: flex;
    align-items: center;
    gap: 16px;

    width: calc(100% - 80px);
    padding: 0 8px;
    overflow: hidden;

    background-color: var(--search-form-bg);
    color: var(--search-icon);
    pointer-events: all;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 10px;

    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    outline: none;

    background-color: var(--search-input-bg);
    color: var(--search-input-text);

    font-size: 16px;
    line-height: 1;

    transition:
      background-color var(--duration-base) var(--ease-standard),
      border-color var(--duration-base) var(--ease-standard),
      box-shadow var(--duration-base) var(--ease-standard),
      color var(--duration-base) var(--ease-standard);

    &::placeholder {
      color: var(--search-input-placeholder);
      opacity: 1;
    }

    &:hover {
      background-color: var(--search-input-bg-hover);
      border-color: var(--input-border-hover);
    }

    &:focus-visible {
      background-color: var(--search-input-bg-focus);
      border-color: var(--input-border-focus);
      box-shadow: 0 0 0 3px var(--color-focus-ring-soft);
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.expand-search-enter-active,
.expand-search-leave-active {
  transition:
    width var(--duration-slow) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
}

.expand-search-enter-from,
.expand-search-leave-to {
  width: 0;
  opacity: 0;
}

@media (max-width: 480px) {
  .app-search {
    &__form {
      right: 76px;
      gap: 12px;
      width: calc(100% - 76px);
    }

    &__input {
      height: 36px;
    }
  }
}
</style>
