<script setup lang="ts">
const props = defineProps<{
  title: string;
  image: string;
  tag: string;
}>();
</script>

<template>
  <div class="relative overflow-hidden">
    <img
      :src="image"
      :alt="title"
      class="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div
      class="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-700 backdrop-blur-md"
    >
      {{ tag }}
    </div>
    <button
      type="button"
      class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-400 backdrop-blur-md transition-colors hover:text-rose-500"
    >
      <i class="pi pi-heart-fill text-sm" />
    </button>
  </div>
</template>
