<script setup lang="ts">
import Rating from "@/common/ui/Rating.vue";

const props = defineProps<{
  text: string;
  author: string;
  rating: number;
}>();
</script>

<template>
  <div
    class="flex flex-col rounded-2xl border border-stone-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-stone-900/5"
  >
    <Rating :rating="rating" class="mb-4" />

    <p class="line-clamp-3 flex-1 leading-relaxed text-stone-700 italic">
      "{{ text }}"
    </p>

    <div class="mt-6 flex items-center gap-3">
      <div
        class="from-terracotta/20 text-terracotta flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br to-amber-100 text-sm font-bold"
      >
        {{ author.charAt(0) }}
      </div>
      <div class="">
        <p class="text-sm font-semibold text-stone-800">
          {{ author }}
        </p>
        <p class="text-xs text-stone-500">Verified Cook</p>
      </div>
    </div>
  </div>
</template>
