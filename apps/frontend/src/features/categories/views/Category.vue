<script setup lang="ts">
import type { CategoryWithComputed } from "@recipes/shared";
import { RouterLink } from "vue-router";
import { getCategoryPresentation } from "../category.presentation";

const props = defineProps<{
  category: Pick<CategoryWithComputed, "name" | "recipeCount" | "slug">;
}>();
</script>

<template>
  <RouterLink
    to="#"
    class="group relative block overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/15"
  >
    <img
      :src="getCategoryPresentation(category.slug).image"
      :alt="category.name"
      class="aspect-3/4 w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div
      class="absolute inset-0 bg-linear-to-t from-stone-900/70 via-stone-900/20 to-transparent"
    />
    <div class="absolute right-0 bottom-0 left-0 p-4">
      <h3 class="text-base font-bold text-white drop-shadow-sm">
        {{ category.name }}
      </h3>
      <p class="mt-0.5 text-sm text-white/75">
        {{ category.recipeCount }} recipes
      </p>
    </div>
  </RouterLink>
</template>
