<script lang="ts" setup></script>

<template>
  <button type="button" class="app-button">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.app-button {
  width: 36px;
  height: 36px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  padding: 0;
  border: none;
  border-radius: var(--radius-round);

  background-color: transparent;
  color: var(--color-text-body);

  cursor: pointer;
  overflow: hidden;

  &:hover {
    background-color: var(--color-border-soft);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>