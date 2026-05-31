<script lang="ts" setup>
import { RouterLink } from "vue-router";

const { tag = "div" } = defineProps<{
  tag?: "article" | "section" | "div";
  title: string;
  subtitle?: string;
  link?: string;
}>();
</script>

<template>
  <component :is="tag" class="app-card">
    <RouterLink v-if="link" :to="link" class="app-card__link">
      <div v-if="$slots.header" class="app-card__header">
        <slot name="header" />
      </div>

      <div class="app-card__content py-8 px-8">
        <p
          v-if="subtitle"
          class="app-card__subtitle mb-3 text-3xs font-bold tracking-wide uppercase"
        >
          {{ subtitle }}
        </p>

        <h3 class="app-card__title">
          {{ title }}
        </h3>

        <slot />
      </div>
    </RouterLink>

    <template v-else>
      <div v-if="$slots.header" class="app-card__header">
        <slot name="header" />
      </div>

      <div class="app-card__content py-8 px-8">
        <p
          v-if="subtitle"
          class="app-card__subtitle mb-3 text-3xs font-bold tracking-wide uppercase"
        >
          {{ subtitle }}
        </p>

        <h3 class="app-card__title">
          {{ title }}
        </h3>

        <slot />
      </div>
    </template>
  </component>
</template>

<style scoped lang="scss">
.app-card {
  position: relative;
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
  min-width: 0;
  overflow: hidden;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;

  &:focus-within {
    box-shadow:
      var(--shadow-soft),
      0 0 0 3px var(--color-focus);
  }

  &__link {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    color: inherit;
    text-decoration: none;
  }

  &__link:focus-visible {
    outline: none;
  }

  &__header {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: var(--color-border-soft);
  }

  &__content {
    min-height: 78px;
    flex-grow: 1;
    background-color: var(--color-surface);
  }

  &__subtitle {
    color: var(--color-seasonal);
  }

  &__title {
    color: var(--color-text-body);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.35;
  }

  @media (hover: hover) {
    &__link:hover img {
      transform: scale(1.04);
      filter: brightness(0.96);
    }

    &__link:hover &__title {
      color: var(--color-accent-strong);
    }
  }
}
</style>
