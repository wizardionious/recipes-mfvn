<script lang="ts" setup>
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="section-header mb-14 text-center">
    <div class="section-header__title-row grid items-center gap-3">
      <span class="section-header__divider" />

      <h2 class="section-header__title">{{ title }}</h2>

      <span class="section-header__divider" />
    </div>

    <p v-if="subtitle" class="section-header__subtitle">{{ subtitle }}</p>
  </header>
</template>

<style lang="scss" scoped>
.section-header {
  &__title-row {
    grid-template-columns: minmax(40px, 1fr) auto minmax(40px, 1fr);
  }

  &__divider {
    height: 2px;
    background-color: var(--color-border-soft);
  }

  &__text {
    text-align: center;
  }

  &__title {
    margin: 0;
    color: var(--color-text-main);
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__subtitle {
    max-width: 250px;
    margin: 8px auto 0;
    color: var(--color-text-muted);
    font-size: 9px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }
}
</style>
