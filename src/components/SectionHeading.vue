<template>
  <div v-reveal class="max-w-3xl" :class="alignClasses">
    <!-- Mono index + rule + eyebrow -->
    <p class="flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-accent uppercase" :class="eyebrowAlign">
      <span v-if="index" class="text-muted-2">{{ index }}</span>
      <span class="h-px w-8 bg-accent/40" />
      <span>{{ eyebrow }}</span>
    </p>

    <h2
      class="mt-5 text-[2.15rem] leading-[1.08] font-bold tracking-tight text-copy sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem] lg:leading-[1.02]"
    >
      <!-- Editorial serif accent: the matching word is set in italic serif -->
      <template v-if="parts.length > 1">
        <span v-for="(part, i) in parts" :key="i">
          <em v-if="i % 2 === 1" class="accent-serif text-gradient">{{ part }}</em>
          <template v-else>{{ part }}</template>
        </span>
      </template>
      <template v-else>{{ title }}</template>
    </h2>

    <p v-if="desc" class="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg" :class="descAlign">
      {{ desc }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    desc?: string
    /** Mono index shown before the eyebrow, e.g. "01" */
    index?: string
    /** Substring of `title` to set in editorial serif italic */
    accent?: string
    /** Defaults to left — vary per section for asymmetric rhythm */
    align?: 'left' | 'center' | 'right'
    centered?: boolean
  }>(),
  { align: 'left', centered: false },
)

const effectiveAlign = computed(() => (props.centered ? 'center' : props.align))

const alignClasses = computed(() => {
  if (effectiveAlign.value === 'center') return 'mx-auto text-center'
  if (effectiveAlign.value === 'right') return 'ml-auto text-right'
  return ''
})

const eyebrowAlign = computed(() => {
  if (effectiveAlign.value === 'center') return 'justify-center'
  if (effectiveAlign.value === 'right') return 'justify-end'
  return ''
})

const descAlign = computed(() => {
  if (effectiveAlign.value === 'center') return 'mx-auto'
  if (effectiveAlign.value === 'right') return 'ml-auto'
  return ''
})

/** Split title around the accent word so it can be set in serif italic. */
const parts = computed(() => {
  const accent = props.accent?.trim()
  if (!accent || !props.title.includes(accent)) return [props.title]
  const at = props.title.indexOf(accent)
  return [props.title.slice(0, at), accent, props.title.slice(at + accent.length)]
})
</script>
