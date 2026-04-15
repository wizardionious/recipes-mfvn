<script setup lang="ts">
const socials = [
  {
    name: "Instagram",
    icon: "pi pi-instagram",
    href: "#",
  },
  {
    name: "YouTube",
    icon: "pi pi-youtube",
    href: "#",
  },
  {
    name: "Telegram",
    icon: "pi pi-telegram",
    href: "#",
  },
];
</script>

<template>
  <div>
    <h4 class="mb-4 text-sm font-semibold text-white">Social</h4>
    <ul class="flex gap-3">
      <li v-for="social in socials" :key="social.name">
        <!-- biome-ignore lint/a11y/useAnchorContent: correct vue aria-label syntax -->
        <a
          :href="social.href"
          :aria-label="social.name"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10"
        >
          <i :class="[social.icon, 'text-sm']" />
        </a>
      </li>
    </ul>
  </div>
</template>
