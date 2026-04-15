<script setup lang="ts">
const props = defineProps<{
  text: string;
  author: string;
  role: string;
}>();
</script>

<template>
  <div
    class="rounded-2xl border border-stone-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-stone-900/5"
  >
    <div class="mb-4 flex gap-1">
      <i
        v-for="s in 5"
        :key="s"
        class="pi pi-star-fill text-sm text-amber-400"
      />
    </div>
    <p class="text-lg leading-relaxed text-stone-700 italic">"{{ text }}"</p>
    <div class="mt-6 flex items-center gap-3">
      <div
        class="from-terracotta/20 text-terracotta flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br to-amber-100 text-sm font-bold"
      >
        {{ author.charAt(0) }}
      </div>
      <div>
        <p class="text-sm font-semibold text-stone-800">
          {{ author }}
        </p>
        <p class="text-xs text-stone-500">{{ role }}</p>
      </div>
    </div>
  </div>
</template>
