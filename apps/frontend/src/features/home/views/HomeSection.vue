<script setup lang="ts">
const { bg = "bg-white" } = defineProps<{
  id?: string;
  bg?: "bg-white" | "bg-stone-50";
}>();
</script>

<template>
  <section :id class="py-20 lg:py-28" :class="bg">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <slot></slot>
    </div>
  </section>
</template>
