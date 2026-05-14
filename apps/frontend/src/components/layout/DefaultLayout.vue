<script lang="ts" setup>
import AppFooter from "./AppFooter.vue";
import AppHeader from "./AppHeader.vue";
</script>

<template>
  <AppHeader />

  <slot />

  <AppFooter />
</template>

<style lang="scss" scoped></style>
