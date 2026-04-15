<script setup lang="ts">
import Testimonial from "@/common/ui/Testimonial.vue";

interface TestimonialData {
  text: string;
  author: string;
  role: string;
}

const testimonials: TestimonialData[] = [
  {
    text: "Best recipe site ever! The beef stew turned out even better than my grandmother's.",
    author: "Elena K.",
    role: "Home Cook",
  },
  {
    text: "So easy to find recipes here. Step-by-step instructions are a real find for beginners.",
    author: "Andrew M.",
    role: "Beginner Chef",
  },
  {
    text: "Dumplings, buns, fritters — everything in one place. Thanks for such a collection!",
    author: "Maria S.",
    role: "Food Enthusiast",
  },
];
</script>

<template>
  <div class="mb-14 text-center">
    <p
      class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
    >
      Reviews
    </p>
    <h2
      class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
    >
      What Cooks Say
    </h2>
  </div>

  <div class="grid gap-6 md:grid-cols-3">
    <Testimonial
      v-for="(item, index) in testimonials"
      :key="index"
      :text="item.text"
      :author="item.author"
      :role="item.role"
    />
  </div>
</template>
