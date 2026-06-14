<script lang="ts" setup>
import type { Ingredient } from "@recipes/shared";

const { tag = "div", ingredient } = defineProps<{
  tag?: "div" | "li";
  ingredient: Ingredient;
}>();
</script>

<template>
  <component
    :is="tag"
    class="recipe-ingredient flex justify-between gap-4"
  >
    <span class="recipe-ingredient__name">
      {{ ingredient.name }}
    </span>

    <span class="recipe-ingredient__amount">
      {{ ingredient.quantity }} {{ ingredient.unit }}
    </span>
  </component>
</template>

<style lang="scss" scoped>
.recipe-ingredient {
  
    padding: 14px 16px;
    background-color: var(--color-surface);
    color: var(--color-text-body);
    font-size: 15px;
    line-height: 1.4;


  &__name {
    font-weight: 600;
  }

  &__amount {
    color: var(--color-text-muted);
    white-space: nowrap;
  }
}
</style>
