<script lang="ts" setup></script>

<template>
  <button type="button" class="button">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background-color: transparent;
  color: #555555;
  cursor: pointer;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  gap: 8px;

  &:has(> svg) {
    padding: 0.5rem;
    border-radius: 9999px;
  }

  &:hover {
    background-color: #f2f2f2;
  }
}
</style>
