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
  border: 1px solid transparent;
  border-radius: var(--radius-round);

  background-color: var(--button-icon-bg);
  color: var(--button-icon-text);

  cursor: pointer;
  overflow: hidden;

  transition:
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);

  &:hover {
    background-color: var(--button-icon-bg-hover);
    color: var(--button-icon-text-hover);
  }

  &:active {
    background-color: var(--button-icon-bg-active);
    color: var(--button-icon-text-active);
    transform: translateY(1px);
  }

  &.is-active,
  &[aria-expanded="true"],
  &[aria-pressed="true"] {
    background-color: var(--button-icon-bg-hover);
    color: var(--button-icon-text-hover);
    border-color: var(--button-icon-bg-active);
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid var(--button-icon-focus-ring);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: var(--button-disabled-bg);
    color: var(--button-disabled-text);
    border-color: var(--button-disabled-border);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
    transform: none;
  }
}

@media (max-width: 480px) {
  .app-button {
    width: 32px;
    height: 32px;
  }
}
</style>
