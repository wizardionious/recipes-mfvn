<script setup lang="ts">
interface CategoryItem {
  name: string;
  icon: string;
  count: number;
  gradient: string;
}

const categories: CategoryItem[] = [
  {
    name: "Breakfast",
    icon: "pi pi-sun",
    count: 42,
    gradient: "from-amber-100 to-orange-100",
  },
  {
    name: "Lunch",
    icon: "pi pi-bolt",
    count: 78,
    gradient: "from-emerald-50 to-teal-100",
  },
  {
    name: "Dinner",
    icon: "pi pi-moon",
    count: 63,
    gradient: "from-violet-50 to-indigo-100",
  },
  {
    name: "Desserts",
    icon: "pi pi-heart",
    count: 51,
    gradient: "from-pink-50 to-rose-100",
  },
  {
    name: "Soups",
    icon: "pi pi-box",
    count: 34,
    gradient: "from-yellow-50 to-amber-100",
  },
  {
    name: "Salads",
    icon: "pi pi-verified",
    count: 29,
    gradient: "from-lime-50 to-green-100",
  },
];
</script>

<template>
  <div class="mb-14 flex items-end justify-between">
    <div>
      <p
        class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
      >
        Pick a direction
      </p>
      <h2
        class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
      >
        Recipe Categories
      </h2>
    </div>
    <a
      href="#"
      class="text-terracotta hover:text-terracotta-dark hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
    >
      All categories
      <i class="pi pi-arrow-right text-xs" />
    </a>
  </div>

  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    <button
      v-for="(cat, index) in categories"
      :key="cat.name"
      type="button"
      class="group relative overflow-hidden rounded-2xl border border-stone-100 bg-linear-to-br p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-900/5"
      :class="cat.gradient"
      :style="{ animationDelay: `${index * 100}ms` }"
    >
      <div
        class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 shadow-sm"
      >
        <i :class="[cat.icon, 'text-xl text-stone-700']" />
      </div>
      <h3 class="text-base font-bold text-stone-800">
        {{ cat.name }}
      </h3>
      <p class="mt-1 text-sm text-stone-500">{{ cat.count }} recipes</p>
    </button>
  </div>
</template>
