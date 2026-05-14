<script lang="ts" setup>
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import { ref, useTemplateRef } from "vue";
import AppButton from "./AppButton.vue";
import { onClickOutside } from "@vueuse/core";

const isOpen = ref(false);

const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");

const { floatingStyles } = useFloating(triggerRef, contentRef, {
  placement: "bottom-start",
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

function toggle() {
  isOpen.value = !isOpen.value;
}

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

onClickOutside(contentRef, close, { ignore: [triggerRef] });
</script>

<template>
  <AppButton
    ref="triggerRef"
    type="button"
    aria-label="Open popover"
    aria-haspopup="menu"
    @click="toggle"
  >
    <slot name="trigger" />
  </AppButton>

  <div v-if="isOpen" ref="contentRef" class="popover-content" :style="floatingStyles">
    <slot :close :isOpen :toggle :open />
  </div>
</template>

<style lang="scss" scoped>
.popover-content {
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}
</style>
