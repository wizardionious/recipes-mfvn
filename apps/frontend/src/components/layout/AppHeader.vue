<script lang="ts" setup>
import { MenuIcon, MoonIcon, SunIcon } from "@lucide/vue";
import { useTheme } from "@/composables/useTheme";
import logoURL from "@/assets/Logo_MyRecipes_transparent.png";
import AppButton from "@/components/ui/AppButton.vue";
import AppPopover from "@/components/ui/AppPopover.vue";
import AppSearch from "@/components/ui/AppSearch.vue";

const { isDarkTheme, toggleTheme } = useTheme();

const navigationListItems = [
  {
    label: "Список рецептов",
    to: "/recipes",
  },
  {
    label: "Завтраки",
    to: {
      path: "/recipes",
      query: {
        category: "breakfasts",
      },
    },
  },
  {
    label: "Обеды",
    to: {
      path: "/recipes",
      query: {
        category: "lunches",
      },
    },
  },
  {
    label: "Ужины",
    to: {
      path: "/recipes",
      query: {
        category: "dinners",
      },
    },
  },
];
</script>

<template>
  <header class="app-header">
    <AppPopover>
      <template #trigger>
        <MenuIcon :size="20" aria-hidden="true" />
      </template>

      <template #default="{ close }">
        <nav
          aria-label="Main navigation"
          class="app-header__nav min-w-45 p-4 flex flex-col gap-1"
        >
          <RouterLink
            v-for="item in navigationListItems"
            :key="item.label"
            class="app-header__menu-link block py-5 px-6 rounded-md text-body text-sm font-medium leading-compact no-underline"
            :to="item.to"
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
        :aria-label="
          isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'
        "
        @click="toggleTheme"
      >
        <SunIcon v-if="isDarkTheme" :size="20" aria-hidden="true" />
        <MoonIcon v-else :size="20" aria-hidden="true" />
      </AppButton>

      <AppSearch />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;

  width: 100%;
  height: 56px;
  display: grid;
  // Fixed side columns keep the logo visually centered between menu and search buttons.
  grid-template-columns: 76px minmax(0, 1fr) 76px;
  align-items: center;
  padding: 0 8px;
  column-gap: 8px;

  background-color: var(--color-surface);
  color: var(--color-text-body);

  border-bottom: 1px solid var(--color-border-soft);

  &__actions {
    justify-self: end;
    min-width: 76px;

    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  &__nav {
    min-width: 180px;
  }

  &__logo {
    justify-self: center;

    display: flex;
    align-items: center;
    justify-content: center;

    width: min(160px, 100%);
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

  &__menu-link:hover,
  &__menu-link:focus-visible {
    background-color: var(--color-border-soft);
    color: var(--color-accent-strong);
  }
}

@media (max-width: 480px) {
  .app-header {
    grid-template-columns: 88px minmax(0, 1fr) 88px;
    padding: 0 12px 0 6px;
    column-gap: 4px;

    &__logo {
      width: min(120px, 100%);
    }

    &__actions {
      gap: 0;
      min-width: auto;
    }
  }
}
</style>
