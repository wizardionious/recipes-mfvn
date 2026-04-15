<script setup lang="ts">
import FeaturedRecipe from "./FeaturedRecipe.vue";

export interface FeaturedRecipeData {
  id: number;
  title: string;
  time: string;
  difficulty: string;
  rating: number;
  image: string;
  tag: string;
}

const featuredRecipes: FeaturedRecipeData[] = [
  {
    id: 1,
    title: "Classic Beef Bourguignon",
    time: "2 hr",
    difficulty: "Medium",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&h=400&fit=crop",
    tag: "Classic",
  },
  {
    id: 2,
    title: "Cherry Dumplings",
    time: "1.5 hr",
    difficulty: "Easy",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop",
    tag: "Popular",
  },
  {
    id: 3,
    title: "Lemon Ricotta Pancakes",
    time: "30 min",
    difficulty: "Easy",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop",
    tag: "Quick",
  },
  {
    id: 4,
    title: "Stuffed Bell Peppers",
    time: "2.5 hr",
    difficulty: "Medium",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
    tag: "Hearty",
  },
];
</script>

<template>
  <div class="mb-14 flex items-end justify-between">
    <div>
      <p
        class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
      >
        Popular dishes
      </p>
      <h2
        class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
      >
        Featured Recipes
      </h2>
    </div>
    <a
      href="#"
      class="text-terracotta hover:text-terracotta-dark hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
    >
      All recipes
      <i class="pi pi-arrow-right text-xs" />
    </a>
  </div>

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <FeaturedRecipe
      v-for="recipe in featuredRecipes"
      :key="recipe.id"
      :recipe="recipe"
    />
  </div>
</template>
