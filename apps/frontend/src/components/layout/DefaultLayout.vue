<script lang="ts" setup>
import AppFooter from "./AppFooter.vue";
import AppHeader from "./AppHeader.vue";
</script>

<template>
  <div class="default-layout">
    <div class="default-layout__page">
      <AppHeader />

      <slot />

      <AppFooter />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  min-height: 100dvh;
  background-color: var(--color-page-bg);
}

.default-layout__page {
  width: 100%;
  max-width: 480px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: var(--color-surface);
}
</style>
