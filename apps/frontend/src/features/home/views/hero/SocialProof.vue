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
      <div class="flex items-center gap-1">
        <i
          v-for="i in 5"
          :key="i"
          class="pi pi-star-fill text-xs text-amber-400"
        />
      </div>
      <p class="mt-0.5 text-sm text-stone-500">
        <span class="font-semibold text-stone-700">12,400+</span>
        happy cooks
      </p>
    </div>
  </div>
</template>
