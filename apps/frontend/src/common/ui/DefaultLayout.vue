<script setup lang="ts">
import Footer from "./footer/Footer.vue";
import Header from "./header/Header.vue";
</script>

<template>
  <Header />

  <slot></slot>

  <Footer />
</template>
