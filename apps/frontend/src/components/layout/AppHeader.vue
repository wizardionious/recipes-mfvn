<script lang="ts" setup>
import { MenuIcon, MoonIcon, SearchIcon, SunIcon, XIcon } from "@lucide/vue";
import { useTheme } from "@/composables/useTheme";

import { nextTick, ref, useTemplateRef } from "vue";
import logoURL from "@/assets/Logo_MyRecipes_transparent.png";
import AppButton from "@/components/ui/AppButton.vue";
import AppPopover from "@/components/ui/AppPopover.vue";

const { isDarkTheme, toggleTheme } = useTheme();

const navigationListItems = [
  {
    label: "Список рецептів",
    link: "#recipes",
  },
  {
    label: "Сніданки",
    link: "#breakfast",
  },
  {
    label: "Обіди",
    link: "#lunch",
  },
  {
    label: "Вечері",
    link: "#dinner",
  },
];

const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");
const isSearchOpen = ref(false);
const searchQuery = ref("");

// async function toggleSearch() {
//   isSearchOpen.value = !isSearchOpen.value;

//   if (isSearchOpen.value) {
//     await nextTick();
//     searchInputRef.value?.focus();
//   }
// }

async function openSearch() {
  isSearchOpen.value = true;

  await nextTick();
  searchInputRef.value?.focus();
}

function closeSearch() {
  isSearchOpen.value = false;
  searchQuery.value = "";
}

function submitSearch() {
  const query = searchQuery.value.trim();

  if (!query) {
    return;
  }

  console.log("Search:", query);
}
</script>

<template>
  <header class="app-header">
    <AppPopover>
      <template #trigger>
        <MenuIcon :size="20" aria-hidden="true" />
      </template>

      <template #default="{ close }">
        <nav aria-label="Main navigation" class="app-header__nav">
          <RouterLink
            v-for="item in navigationListItems"
            :key="item.link"
            class="app-header__menu-link"
            :to="item.link"
            @click="close"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </template>
    </AppPopover>

    <RouterLink to="/" class="app-header__logo" aria-label="Go to home page">
      <img class="app-header__logo-image" :src="logoURL" alt="My recipes" />
    </RouterLink>

    <div class="app-header__actions">
      <AppButton
        type="button"
        :aria-label="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggleTheme"
      >
        <SunIcon v-if="isDarkTheme" :size="20" aria-hidden="true" />
        <MoonIcon v-else :size="20" aria-hidden="true" />
      </AppButton>

      <AppButton
        type="button"
        aria-label="Open search"
        :aria-expanded="isSearchOpen"
        aria-controls="app-header-search"
        @click="openSearch"
      >
        <SearchIcon :size="20" aria-hidden="true" />
      </AppButton>
    </div>

    <form
      v-if="isSearchOpen"
      id="app-header-search"
      class="app-header__search"
      role="search"
      @submit.prevent="submitSearch"
      @keydown.esc="closeSearch"
    >
      <SearchIcon :size="20" aria-hidden="true" />
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        class="app-header__search-input"
        type="search"
        placeholder="Пошук рецепта..."
      />

      <AppButton type="button" aria-label="Close search" @click="closeSearch">
        <XIcon :size="20" aria-hidden="true" />
      </AppButton>
    </form>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: relative;

  width: 100%;
  height: 56px;
  display: grid;
  // Fixed side columns keep the logo visually centered between menu and search buttons.
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  padding: 0 8px;

  background-color: var(--color-surface);
  color: var(--color-text-body);

  border-bottom: 1px solid var(--color-border-soft);

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  &__nav {
    display: flex;
    flex-direction: column;
  }

  &__logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    align-items: center;
    justify-content: center;

    width: min(180px, 44vw);
    height: 42px;

    padding: 0;
    background-color: transparent;
    text-decoration: none;
    line-height: 0;
  }

  &__logo-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__menu-link {
    padding: 10px 12px;
    border-radius: var(--radius-md);
    color: var(--color-text-body);
    text-decoration: none;
  }

  &__menu-link:hover {
    background-color: var(--color-border-soft);
  }

  &__search {
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
  }

  &__search-input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0;

    border: none;
    outline: none;
    background-color: transparent;

    color: var(--color-text-body);
    font-size: 16px;
  }

  &__search-input::placeholder {
    color: var(--color-text-muted);
  }

  &__search-input:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0;
    border-radius: var(--radius-md);
  }
}
</style>
