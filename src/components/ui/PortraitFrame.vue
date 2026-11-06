<template>
  <figure class="portrait">
    <div class="portrait__mat">
      <img
        class="portrait__print"
        :class="{ 'is-handoff': handoff }"
        :src="src"
        :srcset="srcset"
        sizes="(min-width: 900px) 40vw, (min-width: 620px) 62vw, 86vw"
        :alt="alt"
        width="480"
        height="600"
        fetchpriority="high"
        decoding="async"
      />
      <span class="portrait__glass" aria-hidden="true" />
    </div>
    <figcaption class="portrait__caption">
      <span>{{ caption }}</span>
      <span>{{ meta }}</span>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * The portrait as a physical print.
 *
 * This is deliberately a plain <img>: it is the LCP candidate, it is what the
 * prerenderer and reduced-motion visitors see, and it stays on screen for
 * everyone whose device skips WebGL. `handoff` only fades it once the 3D stage
 * reports it is drawing, so the composition never blanks.
 */
withDefaults(
  defineProps<{
    caption: string
    meta: string
    alt?: string
    /** Set by the stage once the WebGL print is live. */
    handoff?: boolean
  }>(),
  { alt: 'Khalied Nauly Maturino', handoff: false },
)

const base = import.meta.env.BASE_URL

/** The warm print grade; the untinted originals stay on disk for reuse. */
const src = computed(() => `${base}img/portrait-print-720.webp`)

const srcset = computed(() =>
  [480, 720, 1080, 1440]
    .map((width) => `${base}img/portrait-print-${width}.webp ${width}w`)
    .join(', '),
)
</script>
