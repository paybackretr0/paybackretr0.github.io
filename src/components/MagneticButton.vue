<template>
  <span ref="el" :style="style" class="inline-flex">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { useMagnetic } from '@/composables/useMagnetic'

const { el, style } = useMagnetic()
</script>
