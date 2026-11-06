<template>
  <div class="marquee mask-fade-x overflow-hidden">
    <div class="marquee-track" :style="{ '--marquee-duration': `${duration}s` }">
      <div class="flex shrink-0 items-center">
        <slot />
      </div>
      <!-- Duplicate track: the animation translates by -50%, so the copy makes
           the loop seamless. Hidden from assistive tech to avoid repeats. -->
      <div class="flex shrink-0 items-center" aria-hidden="true">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Seconds for one full pass. Slower = calmer. */
    duration?: number
  }>(),
  { duration: 34 },
)
</script>
