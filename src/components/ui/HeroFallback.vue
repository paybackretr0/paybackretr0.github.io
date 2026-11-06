<template>
  <!-- Static stand-in for the WebGL hero. The prerenderer, reduced-motion
       visitors, ?perf=low and browsers without WebGL all see this, so it has
       to read as a deliberate composition rather than an empty box. -->
  <div
    class="hero-fallback absolute inset-x-0 top-0 h-svh"
    :class="hidden ? 'opacity-0' : 'opacity-100'"
  >
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <!-- Two lamp cones above the table -->
      <defs>
        <radialGradient id="hero-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="hero-vignette" cx="50%" cy="58%" r="62%">
          <stop offset="55%" stop-color="var(--ink)" stop-opacity="0" />
          <stop offset="100%" stop-color="var(--ink)" stop-opacity="0.72" />
        </radialGradient>
        <linearGradient id="hero-felt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--scene-fog)" stop-opacity="0.9" />
          <stop offset="42%" stop-color="var(--scene-felt)" stop-opacity="0.97" />
          <stop offset="100%" stop-color="var(--scene-felt)" stop-opacity="1" />
        </linearGradient>
      </defs>

      <ellipse cx="420" cy="170" rx="300" ry="200" fill="url(#hero-lamp)" />
      <ellipse cx="790" cy="150" rx="260" ry="180" fill="url(#hero-lamp)" />

      <!-- Felt in perspective: wide at the viewer, meeting the cushions at the
           horizon line so the composition works at any aspect ratio.
           viewBox 1200x800 is drawn for a 16:10 hero: the visible window after
           `slice` is x 90-1110, y 50-800, which is where the table sits. -->
      <polygon points="90,800 390,625 810,625 1110,800" fill="url(#hero-felt)" />

      <!-- Cushion hairline + rails -->
      <polyline
        points="390,625 810,625"
        fill="none"
        stroke="var(--scene-felt-line)"
        stroke-width="1.8"
        opacity="0.8"
      />
      <path d="M90 800 L390 625" stroke="var(--scene-cue)" stroke-width="6" opacity="0.32" />
      <path d="M1110 800 L810 625" stroke="var(--scene-cue)" stroke-width="6" opacity="0.32" />

      <!-- Pockets -->
      <g fill="var(--scene-pocket)">
        <ellipse cx="390" cy="625" rx="13" ry="6" />
        <ellipse cx="810" cy="625" rx="13" ry="6" />
        <ellipse cx="600" cy="625" rx="10" ry="5" opacity="0.75" />
      </g>

      <!-- Rack, foreshortened: smaller and tighter the further away it sits -->
      <g v-for="ball in rack" :key="ball.n">
        <circle
          :cx="ball.x"
          :cy="ball.y"
          :r="ball.r"
          fill="var(--scene-ball-rim)"
          fill-opacity="0.3"
          stroke="var(--scene-ball-rim)"
          stroke-width="1.1"
          stroke-opacity="0.7"
        />
      </g>

      <!-- Cue ball + stick. Everything sits in the middle of the viewBox: the
           portrait crop of `slice` keeps x 415-785 only, so a left-aligned
           composition would be cut off on a phone. -->
      <circle
        cx="600"
        cy="717"
        r="14"
        fill="var(--scene-ball-rim)"
        stroke="var(--scene-ball-rim)"
        stroke-width="1.2"
      />
      <line
        x1="614"
        y1="726"
        x2="740"
        y2="764"
        stroke="var(--scene-cue)"
        stroke-width="6"
        stroke-linecap="round"
        opacity="0.6"
      />
      <circle cx="614" cy="726" r="3.6" fill="var(--scene-cue-tip)" />

      <rect x="0" y="0" width="1200" height="800" fill="url(#hero-vignette)" />
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * Poster version of the billiard hero.
 *
 * Everything is drawn from the `--scene-*` tokens, so it re-themes with one
 * attribute and never needs a second asset. No filters and no blur: this is
 * captured by the prerenderer and screenshotted by `npm run shots`, and both
 * want a frame that is identical every time.
 */
defineProps<{ hidden?: boolean }>()

interface RackBall {
  x: number
  y: number
  r: number
  n: number
}

/** Triangle of 15 balls, each row larger and lower as it nears the viewer. */
const rack: RackBall[] = []
let n = 1
for (let row = 0; row < 5; row += 1) {
  for (let i = 0; i <= row; i += 1) {
    rack.push({
      x: 600 + (i - row / 2) * (16 + row * 0.8),
      y: 640 + row * 15,
      r: 5.8 + row * 0.6,
      n: n++,
    })
  }
}
</script>
