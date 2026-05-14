<script lang="ts" setup>
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import { MenuIcon, SearchIcon, XIcon } from "@lucide/vue";
import { nextTick, ref, useTemplateRef } from "vue";
import logoURL from "@/assets/Logo_MyRecipes.png";
import AppButton from "@/components/ui/AppButton.vue";

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

const isMenuOpen = ref(false);

const menuButtonRef = useTemplateRef<HTMLElement>('menuButtonRef');
const menuRef = useTemplateRef<HTMLElement>('menuRef');

const { floatingStyles } = useFloating(menuButtonRef, menuRef, {
  placement: "bottom-start",
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef');
const isSearchOpen = ref(false);
const searchQuery = ref("");

async function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value;

  if (isSearchOpen.value) {
    await nextTick();
    searchInputRef.value?.focus();
  }
}

function closeSearch() {
  isSearchOpen.value = false;
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
    <AppButton
      ref="menuButtonRef"
      type="button"
      aria-label="Open menu"
      aria-haspopup="menu"
      :aria-expanded="isMenuOpen"
      aria-controls="app-header-menu"
      @click="toggleMenu"
    >
      <MenuIcon :size="20" aria-hidden="true" />
    </AppButton>

    <RouterLink to="/" class="app-header__logo">
      <img class="app-header__logo-image" :src="logoURL" alt="My recipes" />
    </RouterLink>

    <AppButton
      aria-label="Open search"
      :aria-expanded="isSearchOpen"
      aria-controls="app-header-search"
      @click="toggleSearch"
    >
      <SearchIcon :size="20" aria-hidden="true" />
    </AppButton>

    <form
      v-if="isSearchOpen"
      id="app-header-search"
      class="app-header__search"
      role="search"
      @submit.prevent="submitSearch"
    >
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

    <nav
      v-if="isMenuOpen"
      id="app-header-menu"
      ref="menuRef"
      class="app-header__menu"
      :style="floatingStyles"
      aria-label="Main navigation"
    >
      <RouterLink
        v-for="item in navigationListItems"
        :key="item.link"
        class="app-header__menu-link"
        :to="item.link"
        @click="closeMenu"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: relative;

  width: 100%;
  height: 56px;
  display: grid;
  // Fixed side columns keep the logo visually centered between menu and search buttons.
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  padding: 0 8px;
  background-color: #ffffff;

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    height: 48px;
    text-decoration: none;
  }

  &__logo-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__menu {
    z-index: 1000;
    width: 220px;
    display: flex;
    flex-direction: column;
    padding: 8px;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  }

  &__menu-link {
    padding: 10px 12px;
    border-radius: 8px;
    color: #333333;
    text-decoration: none;
  }

  &__menu-link:hover {
    background-color: #f2f2f2;
  }

  &__search {
    position: absolute;
    top: 56px;
    left: 8px;
    right: 8px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  }

  &__search-input {
    flex: 1;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #dddddd;
    border-radius: 8px;
    font-size: 16px;
  }
}
</style>
