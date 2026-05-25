<script lang="ts" setup>
defineProps<{
  count: number;
  active: number;
}>();
defineEmits<{
  (e: "setActive", value: number): void;
}>();
</script>

<template>
  <div class="carousel-indicators flex justify-center gap-2">
    <button
      v-for="n in count"
      :key="n"
      type="button"
      class="carousel-indicators__indicator block"
      :class="{
        'carousel-indicators__indicator--active': active === n - 1,
      }"
      :aria-label="`Показать изображение ${n + 1}`"
      @click="$emit('setActive', n - 1)"
    ></button>
  </div>
</template>

<style lang="scss" scoped>
.carousel-indicators {
  padding: 8px 0 14px;

  &__indicator {
    width: 5px;
    height: 5px;
    padding: 0;
    border: none;
    border-radius: var(--radius-round);
    background-color: var(--color-slider-dot);
    cursor: pointer;
  }

  &__indicator--active {
    background-color: var(--color-slider-dot-active);
  }
}
</style>
