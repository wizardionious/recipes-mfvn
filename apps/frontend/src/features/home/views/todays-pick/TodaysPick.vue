<script setup lang="ts">
import { capitalize } from "vue";
import TodaysPickHeader from "./TodaysPickHeader.vue";

const recipe = {
  calories: 245,
  time: 40,
  servings: 4,
  difficulty: "easy" as const,
};
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 p-8 lg:p-16"
  >
    <!-- Decorative background -->
    <div
      class="absolute top-0 right-0 z-0 h-full w-1/2 opacity-20"
      style="
        background: radial-gradient(
          ellipse at 70% 30%,
          rgba(194, 122, 84, 0.4),
          transparent 70%
        );
      "
    />
    <div
      class="bg-terracotta/10 absolute -top-20 -left-20 z-0 h-80 w-80 rounded-full blur-3xl"
    />

    <div class="relative z-10 grid items-center gap-12 lg:grid-cols-2">
      <div>
        <TodaysPickHeader />

        <div class="mt-10 flex flex-wrap gap-4">
          <div
            class="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
          >
            <p class="text-sm text-stone-400">Calories</p>
            <p class="text-xl font-bold text-white">
              {{ recipe.calories }} kcal
            </p>
          </div>
          <div
            class="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
          >
            <p class="text-sm text-stone-400">Time</p>
            <p class="text-xl font-bold text-white">{{ recipe.time }} min</p>
          </div>
          <div
            class="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
          >
            <p class="text-sm text-stone-400">Servings</p>
            <p class="text-xl font-bold text-white">
              {{ recipe.servings }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="bg-terracotta shadow-terracotta/30 hover:bg-terracotta-dark mt-10 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
        >
          View Recipe
        </button>
      </div>

      <div class="relative">
        <div class="overflow-hidden rounded-2xl shadow-2xl shadow-black/30">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=500&fit=crop"
            alt="Pumpkin Soup"
            class="h-95 w-full object-cover lg:h-110"
          />
        </div>
        <div
          class="absolute -bottom-4 -left-4 rounded-2xl border border-stone-700 bg-stone-800/90 px-5 py-3 backdrop-blur-md"
        >
          <div class="flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20"
            >
              <i class="pi pi-check text-sm text-emerald-400" />
            </div>
            <div>
              <p class="text-xs text-stone-400">Difficulty</p>
              <p class="text-sm font-bold text-white">
                {{ capitalize(recipe.difficulty) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
