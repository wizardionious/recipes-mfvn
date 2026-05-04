<script setup lang="ts">
import Rating from "@/common/ui/Rating.vue";
import { useReviewStats } from "@/features/reviews/reviews.queries";

const { data: stats, isLoading } = useReviewStats();
</script>

<template>
  <div class="mt-12 flex items-center gap-6">
    <div class="flex -space-x-3">
      <div
        v-for="(user, index) in ['EK', 'AM', 'MS', 'JP']"
        :key="index"
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-stone-200 to-stone-300 text-xs font-bold text-stone-600"
      >
        {{ user }}
      </div>
    </div>

    <div>
      <div
        v-if="isLoading"
        class="h-3.5 w-24 animate-pulse rounded bg-stone-200"
      />
      <Rating v-else :rating="stats?.averageRating" />

      <p class="mt-0.5 text-sm text-stone-500">
        <span
          v-if="isLoading"
          class="inline-block h-4 w-16 animate-pulse rounded bg-stone-200"
        />
        <template v-else>
          <span class="font-semibold text-stone-700"
            >{{ stats?.happyCooksCount.toLocaleString() }}+</span
          >
          happy cooks
        </template>
      </p>
    </div>
  </div>
</template>
