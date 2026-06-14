<script lang="ts" setup>
import AppCard from "@/components/ui/AppCard.vue";
import type { RecipeCatalogInput } from "@/data/recipes";

defineProps<{
  recipe: Pick<
    RecipeCatalogInput,
    "id" | "slug" | "title" | "image"
  > & {
    category: Pick<RecipeCatalogInput["category"], "name">;
  };
}>();
</script>

<template>
  <AppCard
    tag="section"
    :title="recipe.title"
    :subtitle="recipe.category.name"
    :link="`/recipes/${recipe.slug}`"
  >
    <template #header>
      <img
        :src="recipe.image.url"
        :alt="recipe.image.alt"
        class="recipe-card__image"
      />
    </template>
  </AppCard>
</template>

<style scoped lang="scss">
.recipe-card {
  min-width: 0;
  overflow: hidden;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-soft);

  &__link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  &__image-wrapper {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: var(--color-border-soft);
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition:
      transform 180ms ease,
      filter 180ms ease;
  }
}
</style>
