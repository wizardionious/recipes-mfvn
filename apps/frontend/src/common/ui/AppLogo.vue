<script setup lang="ts">
const { theme = "light" } = defineProps<{
  theme?: "light" | "dark";
}>();
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="bg-terracotta flex h-10 w-10 items-center justify-center rounded-xl"
    >
      <span class="text-lg text-white">🍳</span>
    </div>
    <span
      class="font-display text-2xl font-semibold"
      :class="{
        'text-white': theme === 'dark',
        'text-stone-900': theme === 'light',
      }"
    >
      Savory
    </span>
  </div>
</template>
