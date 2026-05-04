<script setup lang="ts">
const { rating = 5 } = defineProps<{
  rating?: number;
}>();
</script>

<template>
  <div class="flex items-center gap-1">
    <i
      v-for="i in 5"
      :key="i"
      class="pi text-xs text-amber-400"
      :class="i <= Math.round(rating) ? 'pi-star-fill' : 'pi-star'"
    />
  </div>
</template>
