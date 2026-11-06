<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <!-- Three drifting light sources. Blur + low opacity keep them from ever
         competing with text, and the identical layout in both themes means a
         theme switch is a pure colour transition. -->
    <div class="aurora-field">
      <span class="aurora-blob animate-drift" :style="blobs[0]" />
      <span class="aurora-blob animate-drift-slow" :style="blobs[1]" />
      <span class="aurora-blob animate-drift" :style="blobs[2]" />
    </div>

    <!-- Blueprint grid, masked to the top of the page -->
    <div class="grid-lines absolute inset-0 opacity-70" />

    <GrainOverlay />

    <!-- Blends the page edges back into the base colour -->
    <div class="orb-vignette absolute inset-0" />
  </div>
</template>

<script setup lang="ts">
import GrainOverlay from '@/components/ui/GrainOverlay.vue'

const blobs = [
  {
    top: '-24%',
    left: '-12%',
    width: '58vw',
    height: '58vw',
    background: 'radial-gradient(circle, var(--aurora-1), transparent 68%)',
    animationDelay: '0s',
  },
  {
    top: '6%',
    right: '-18%',
    width: '62vw',
    height: '62vw',
    background: 'radial-gradient(circle, var(--aurora-2), transparent 68%)',
    animationDelay: '-9s',
  },
  {
    bottom: '-28%',
    left: '18%',
    width: '72vw',
    height: '60vw',
    background: 'radial-gradient(circle, var(--aurora-3), transparent 70%)',
    animationDelay: '-17s',
  },
] as const
</script>
