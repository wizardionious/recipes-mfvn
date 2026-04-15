<script setup lang="ts">
import AppLogo from "../AppLogo.vue";
import FooterCopyright from "./FooterCopyright.vue";
import FooterNav from "./FooterNav.vue";
import FooterSocials from "./FooterSocials.vue";
</script>

<template>
  <footer class="border-t border-stone-200 bg-stone-900 py-8 text-stone-400">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid gap-12 md:grid-cols-3">
        <div class="md:col-span-1">
          <AppLogo theme="dark" />

          <p class="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            Your trusted companion on culinary adventures. Delicious recipes for
            every day.
          </p>
        </div>

        <FooterNav />
        <FooterSocials />
      </div>

      <FooterCopyright />
    </div>
  </footer>
</template>
