<script setup lang="ts">
const props = defineProps<{
  rating: number;
}>();
</script>

<template>
  <div
    class="mt-4 flex items-center justify-between border-t border-stone-100 pt-4"
  >
    <div class="flex items-center gap-1">
      <i class="pi pi-star-fill text-xs text-amber-400" />
      <span class="text-sm font-semibold text-stone-700">
        {{ rating }}
      </span>
    </div>
    <span
      class="text-terracotta flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
    >
      View
      <i class="pi pi-arrow-right text-[10px]" />
    </span>
  </div>
</template>
