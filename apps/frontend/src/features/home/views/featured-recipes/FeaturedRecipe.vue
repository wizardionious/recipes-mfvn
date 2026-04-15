<script setup lang="ts">
import FeaturedRecipeFooter from "./FeaturedRecipeFooter.vue";
import FeaturedRecipeHeader from "./FeaturedRecipeHeader.vue";
import type { FeaturedRecipeData } from "./FeaturedRecipes.vue";

const props = defineProps<{
  recipe: FeaturedRecipeData;
}>();
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-900/8"
  >
    <FeaturedRecipeHeader
      :title="recipe.title"
      :image="recipe.image"
      :tag="recipe.tag"
    />

    <div class="p-5">
      <h3
        class="font-display group-hover:text-terracotta text-lg font-bold text-stone-900 transition-colors"
      >
        {{ recipe.title }}
      </h3>

      <div class="mt-3 flex items-center gap-4 text-sm text-stone-500">
        <span class="flex items-center gap-1.5">
          <i class="pi pi-clock text-xs" />
          {{ recipe.time }}
        </span>
        <span class="flex items-center gap-1.5">
          <i class="pi pi-chart-bar text-xs" />
          {{ recipe.difficulty }}
        </span>
      </div>

      <FeaturedRecipeFooter :rating="recipe.rating" />
    </div>
  </article>
</template>
