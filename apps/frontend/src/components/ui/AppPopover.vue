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
    :aria-expanded="isOpen"
    :class="{ 'is-active': isOpen }"
    @click="toggle"
  >
    <slot name="trigger" />
  </AppButton>

  <Transition>
    <div v-if="isOpen" ref="contentRef" class="popover-content" :style="floatingStyles">
      <slot :close :isOpen :toggle :open />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.popover-content {
  z-index: 1000;

  display: flex;
  flex-direction: column;
  gap: 4px;

  min-width: 180px;
  padding: 8px;
  border: 1px solid var(--popover-border);
  border-radius: var(--radius-lg);

  background-color: var(--popover-bg);
  color: var(--popover-text);
  box-shadow: var(--popover-shadow);
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-standard);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
