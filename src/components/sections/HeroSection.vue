<template>
  <section
    id="home"
    ref="heroEl"
    class="relative flex min-h-svh flex-col justify-center overflow-hidden pt-24 pb-10"
  >
    <RoomStage />

    <div class="relative z-10 mx-auto w-full max-w-6xl px-6">
      <div class="hero-grid">
        <!-- Copy column: the type owns the left half -->
        <div class="hero-copy">
          <p data-hero class="hero-eyebrow">{{ t.hero.eyebrow }}</p>

          <h1 class="hero-name">
            <span data-hero class="hero-name__line">Khalied Nauly</span>
            <span data-hero class="hero-name__line hero-name__line--accent">Maturino</span>
          </h1>

          <p data-hero class="hero-role">
            {{ t.hero.role }}
            <span class="hero-role__focus">Mobile &amp; Web</span>
          </p>
        </div>

        <!-- Print column: the photograph is the only "real" object on the page -->
        <div data-hero class="hero-print">
          <PortraitFrame :caption="t.hero.eyebrow" :meta="site.location" />
        </div>

        <!-- Below the print on a phone, the second row of the spread on desktop -->
        <div class="hero-tail">
          <p data-hero class="hero-lead">{{ t.hero.tagline }}</p>
          <p data-hero class="hero-desc">{{ t.hero.desc }}</p>

          <div data-hero class="hero-actions">
            <MagneticButton>
              <a
                href="#projects"
                class="btn btn-primary group px-6 py-3"
                @click.prevent="goTo('#projects')"
              >
                {{ t.hero.viewProjects }}
                <ArrowRight
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </MagneticButton>
            <MagneticButton>
              <a
                :href="portfolioFile.url"
                target="_blank"
                rel="noopener"
                class="btn btn-ghost px-5 py-3"
              >
                <FileText class="h-4 w-4" />
                {{ t.hero.portfolio }}
              </a>
            </MagneticButton>
            <MagneticButton>
              <a
                :href="cvFile.url"
                target="_blank"
                rel="noopener"
                :download="cvFile.file"
                class="btn btn-ghost px-5 py-3"
              >
                <Download class="h-4 w-4" />
                {{ t.hero.downloadCv }}
              </a>
            </MagneticButton>
          </div>

          <div data-hero class="hero-socials">
            <SocialLinks />
          </div>

          <dl data-hero class="hero-stats">
            <div v-for="stat in stats" :key="stat.label" class="hero-stat">
              <dt class="hero-stat__label">{{ stat.label }}</dt>
              <dd class="hero-stat__value">
                <StatCounter :to="stat.value" :suffix="stat.suffix" />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <a data-hero href="#about" class="hero-scroll" @click.prevent="goTo('#about')">
        <span class="hero-scroll__line" />
        {{ t.hero.scroll }}
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ArrowRight, Download, FileText } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { site } from '@/data/site'
import { projects } from '@/data/projects'
import { scrollToTarget } from '@/composables/useSmoothScroll'
import SocialLinks from '@/components/SocialLinks.vue'
import MagneticButton from '@/components/MagneticButton.vue'
import StatCounter from '@/components/StatCounter.vue'
import PortraitFrame from '@/components/ui/PortraitFrame.vue'
import RoomStage from '@/components/stage/RoomStage.vue'

const { t, cvFile, portfolioFile } = useLang()

const heroEl = ref<HTMLElement | null>(null)

const stats = computed(() => [
  { value: 2, suffix: '+', label: t.value.hero.stats.years },
  { value: projects.length, suffix: '', label: t.value.hero.stats.projects },
  { value: 3, suffix: '', label: t.value.hero.stats.platforms },
  { value: 15, suffix: '+', label: t.value.hero.stats.technologies },
])

function goTo(hash: string) {
  scrollToTarget(hash, -96)
}

let timeline: gsap.core.Timeline | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !heroEl.value) return

  // A slow, gallery-like entrance: everything rises into place once. No
  // bounce, no overshoot — the motion should feel like lighting coming up.
  const items = gsap.utils.toArray<HTMLElement>('[data-hero]', heroEl.value)
  timeline = gsap
    .timeline({ defaults: { ease: 'expo.out', duration: 1.1 } })
    .from(items, { opacity: 0, y: 32, stagger: 0.085 })
})

onBeforeUnmount(() => {
  timeline?.kill()
  timeline = null
})
</script>
