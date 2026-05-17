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

      <AppSearch />
    </div>
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
}
</style>
