<template>
  <section
    ref="heroEl"
    id="home"
    class="relative flex min-h-svh flex-col items-center justify-center overflow-hidden pt-28 pb-16 sm:pt-32"
  >
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
      <!-- Mono kicker -->
      <p
        data-hero
        class="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-accent uppercase"
      >
        <span class="h-px w-10 bg-accent/40" />
        {{ t.hero.eyebrow }}
      </p>

      <!-- Name — oversized display type -->
      <h1
        data-hero
        class="mt-8 text-[clamp(3rem,8.5vw,7rem)] leading-[0.98] font-extrabold tracking-[-0.03em] sm:leading-[0.95]"
      >
        Khalied Nauly
        <em class="accent-serif text-gradient block">Maturino</em>
      </h1>

      <!-- Role + tagline -->
      <div data-hero class="mt-8">
        <p
          class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-lg font-medium tracking-tight sm:text-2xl"
        >
          {{ t.hero.role }}
          <span class="hidden h-1 w-1 rounded-full bg-accent sm:block" />
          <span class="font-mono text-sm tracking-[0.2em] text-muted uppercase"
            >Mobile &amp; Web</span
          >
        </p>
      </div>

      <p data-hero class="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
        {{ t.hero.tagline }}
      </p>

      <p data-hero class="mt-3 max-w-2xl text-sm leading-7 text-muted-2">
        {{ t.hero.desc }}
      </p>

      <!-- CTAs -->
      <div
        data-hero
        class="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
      >
        <MagneticButton class="w-full sm:w-auto">
          <a
            href="#projects"
            class="btn btn-primary group w-full px-7 py-3.5 text-base sm:w-auto"
            @click.prevent="goTo('#projects')"
          >
            {{ t.hero.viewProjects }}
            <ArrowRight
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        </MagneticButton>
        <MagneticButton class="w-full sm:w-auto">
          <a
            href="./porto.pdf"
            target="_blank"
            rel="noopener"
            class="btn btn-ghost w-full px-7 py-3.5 text-base sm:w-auto"
          >
            <FileText class="h-4 w-4" />
            {{ t.hero.portfolio }}
          </a>
        </MagneticButton>
        <MagneticButton class="w-full sm:w-auto">
          <a
            href="./cv.pdf"
            target="_blank"
            rel="noopener"
            class="btn btn-ghost w-full px-7 py-3.5 text-base sm:w-auto"
          >
            <Download class="h-4 w-4" />
            {{ t.hero.downloadCv }}
          </a>
        </MagneticButton>
      </div>

      <!-- Socials -->
      <div data-hero class="mt-8">
        <SocialLinks />
      </div>

      <!-- Floating stats -->
      <div data-hero class="mt-16 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="glass card-glow animate-float rounded-[22px] p-5"
          :style="{ animationDelay: `${i * 0.9}s` }"
        >
          <component :is="stat.icon" class="mx-auto h-5 w-5 text-muted-2" />
          <p class="mt-3 text-2xl font-bold tracking-tight text-copy">
            <StatCounter :to="stat.value" :suffix="stat.suffix" />
          </p>
          <p class="mt-1 text-[11px] leading-4 text-muted">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Scroll hint -->
      <a
        data-hero
        href="#about"
        class="mt-14 inline-flex flex-col items-center gap-2.5 text-muted-2 transition-colors hover:text-copy"
        @click.prevent="goTo('#about')"
      >
        <span class="font-mono text-[10px] tracking-[0.28em] uppercase">{{ t.hero.scroll }}</span>
        <span class="neu-inset flex h-9 w-5 justify-center rounded-full pt-1.5">
          <span class="animate-scroll-hint h-1.5 w-1 rounded-full bg-accent" />
        </span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import {
  ArrowRight,
  Boxes,
  Briefcase,
  Download,
  FileText,
  FolderGit2,
  MonitorSmartphone,
  type LucideIcon,
} from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { projects } from '@/data/projects'
import { scrollToTarget } from '@/composables/useSmoothScroll'
import SocialLinks from '@/components/SocialLinks.vue'
import MagneticButton from '@/components/MagneticButton.vue'
import StatCounter from '@/components/StatCounter.vue'

const { t } = useLang()

const heroEl = ref<HTMLElement | null>(null)

const stats = computed(() => [
  { value: 2, suffix: '+', label: t.value.hero.stats.years, icon: Briefcase as LucideIcon },
  {
    value: projects.length,
    suffix: '',
    label: t.value.hero.stats.projects,
    icon: FolderGit2 as LucideIcon,
  },
  {
    value: 3,
    suffix: '',
    label: t.value.hero.stats.platforms,
    icon: MonitorSmartphone as LucideIcon,
  },
  { value: 15, suffix: '+', label: t.value.hero.stats.technologies, icon: Boxes as LucideIcon },
])

function goTo(hash: string) {
  scrollToTarget(hash, -96)
}

let timeline: gsap.core.Timeline | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !heroEl.value) return

  // GSAP entrance timeline — soft stagger, 500ms steps, power3.out.
  const items = gsap.utils.toArray<HTMLElement>('[data-hero]', heroEl.value)
  timeline = gsap
    .timeline({ defaults: { ease: 'power3.out', duration: 0.5 } })
    .from(items, { opacity: 0, y: 28, stagger: 0.08 })
})

onBeforeUnmount(() => {
  timeline?.kill()
  timeline = null
})
</script>
