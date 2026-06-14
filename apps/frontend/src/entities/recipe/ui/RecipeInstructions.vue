<script lang="ts" setup>
defineProps<{
  instructions: string[];
}>();
</script>

<template>
  <ol class="recipe-instructions">
    <li
      v-for="instruction in instructions"
      :key="instruction"
      class="recipe-instructions__item"
    >
      {{ instruction }}
    </li>
  </ol>
</template>

<style lang="scss" scoped>
.recipe-instructions {
  max-width: 760px;
  margin: 0;
  padding: 24px 28px 24px 52px;
  background-color: var(--color-surface);

  &__item {
    margin-bottom: 14px;
    color: var(--color-text-body);
    font-size: 16px;
    line-height: 1.7;
  }

  &__item:last-child {
    margin-bottom: 0;
  }
}
</style>
