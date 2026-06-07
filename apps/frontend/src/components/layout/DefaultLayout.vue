<script lang="ts" setup>
import { AppFooter } from "@/widgets/app-footer";
import { AppHeader } from "@/widgets/app-header";
</script>

<template>
  <div class="default-layout">
    <div class="default-layout__page">
      <AppHeader />

      <main class="default-layout__main">
        <slot />
      </main>

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

  display: flex;
  flex-direction: column;

  background-color: var(--color-surface);
}

.default-layout__main {
  flex: 1;
}
</style>
