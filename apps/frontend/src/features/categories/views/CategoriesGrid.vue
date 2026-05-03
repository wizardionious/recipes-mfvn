<script setup lang="ts">
import type { CategoryWithComputed } from "@recipes/shared";
import Category from "./Category.vue";

const props = defineProps<{
  categories: CategoryWithComputed[] | undefined;
  isLoading: boolean;
  error: Error | null;
}>();
</script>

<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    <template v-if="isLoading">
      <div
        v-for="n in 6"
        :key="n"
        class="aspect-3/4 animate-pulse overflow-hidden rounded-2xl bg-stone-200"
      />
    </template>

    <template v-else-if="error">
      <p class="text-sm font-semibold text-stone-500">
        {{ error.message }}
      </p>
    </template>

    <template v-else-if="categories">
      <Category
        v-for="(category, index) in categories.slice(0, 6)"
        :key="category.id"
        :category
        :style="{ animationDelay: `${index * 80}ms` }"
      />
    </template>
  </div>
</template>
