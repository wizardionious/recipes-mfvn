<script lang="ts" setup>
import { MenuIcon, MoonIcon, SunIcon } from "@lucide/vue";
import { useRoute } from "vue-router";
import { useTheme } from "@/composables/useTheme";
import logoURL from "@/assets/Logo_MyRecipes_transparent.png";
import AppButton from "@/components/ui/AppButton.vue";
import AppPopover from "@/components/ui/AppPopover.vue";
import AppSearch from "@/components/ui/AppSearch.vue";

const { isDarkTheme, toggleTheme } = useTheme();
const route = useRoute();

const navigationListItems = [
  {
    label: "Список рецептов",
    to: "/recipes",
    meal: null,
  },
  {
    label: "Завтраки",
    to: {
      path: "/recipes",
      query: {
        meal: "breakfast",
      },
    },
    meal: "breakfast",
  },
  {
    label: "Обеды",
    to: {
      path: "/recipes",
      query: {
        meal: "lunch",
      },
    },
    meal: "lunch",
  },
  {
    label: "Ужины",
    to: {
      path: "/recipes",
      query: {
        meal: "dinner",
      },
    },
    meal: "dinner",
  },
];

function isNavigationItemActive(item: (typeof navigationListItems)[number]) {
  const currentMeal =
    typeof route.query.meal === "string" ? route.query.meal : null;

  if (item.meal === null) {
    return route.path === "/recipes" && currentMeal === null;
  }

  return route.path === "/recipes" && currentMeal === item.meal;
}
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
            :class="{ 'is-current': isNavigationItemActive(item) }"
            :to="item.to"
            :aria-current="isNavigationItemActive(item) ? 'page' : undefined"
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
  grid-template-columns: 76px minmax(0, 1fr) 76px;
  align-items: center;
  padding: 0 8px;
  column-gap: 8px;

  background-color: var(--header-bg);
  color: var(--header-text);
  border-bottom: 1px solid var(--header-border);
  box-shadow: var(--header-shadow);

  transition:
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);

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
    color: inherit;
    text-decoration: none;
    line-height: 0;

    border-radius: var(--radius-md);

    transition:
      box-shadow var(--duration-base) var(--ease-standard),
      transform var(--duration-fast) var(--ease-standard);

    &:focus-visible {
      outline: 2px solid var(--nav-link-focus-ring);
      outline-offset: 3px;
    }

    &:active {
      transform: translateY(1px);
    }
  }

  &__logo-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__menu-link {
    background-color: var(--nav-link-bg);
    color: var(--nav-link-text);

    transition:
      background-color var(--duration-base) var(--ease-standard),
      color var(--duration-base) var(--ease-standard),
      box-shadow var(--duration-base) var(--ease-standard),
      transform var(--duration-fast) var(--ease-standard);

    &:hover {
      background-color: var(--nav-link-bg-hover);
      color: var(--nav-link-text-hover);
    }

    &:active {
      background-color: var(--nav-link-bg-active);
      color: var(--nav-link-text-active);
      transform: translateY(1px);
    }

    &.is-current,
    &[aria-current="page"] {
      background-color: var(--nav-link-bg-current);
      color: var(--nav-link-text-current);
      font-weight: 700;
      box-shadow: inset 3px 0 0 var(--color-accent-interactive);
    }

    &:focus-visible {
      outline: 2px solid var(--nav-link-focus-ring);
      outline-offset: 2px;
    }

    &[aria-current="page"] {
      background-color: var(--nav-link-bg-current);
      color: var(--nav-link-text-current);
    }
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
