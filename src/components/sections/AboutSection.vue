<template>
  <section id="about" class="section section-tight scroll-mt-24">
    <div class="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
      <!-- Left: narrative -->
      <div>
        <SectionHeading
          index="01"
          :eyebrow="t.about.eyebrow"
          :title="t.about.title"
          :accent="t.about.accent"
        />

        <div class="mt-8 space-y-5">
          <p v-reveal="{ delay: 100 }" class="text-[15px] leading-8 text-muted sm:text-base">
            {{ t.about.p1 }}
          </p>
          <p v-reveal="{ delay: 180 }" class="text-[15px] leading-8 text-muted sm:text-base">
            {{ t.about.p2 }}
          </p>
          <p v-reveal="{ delay: 260 }" class="text-[15px] leading-8 text-muted sm:text-base">
            {{ t.about.p3 }}
          </p>
        </div>

        <!-- Strengths -->
        <div v-reveal="{ delay: 340 }" class="mt-9">
          <p class="text-xs font-semibold tracking-[0.2em] text-copy/70 uppercase">
            {{ t.about.strengths }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2.5">
            <span
              v-for="skill in t.about.strengthsList"
              :key="skill"
              class="neu-inset rounded-full px-3.5 py-1.5 text-[13px] font-medium text-copy/85 transition-all duration-300 hover:text-accent"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Currently -->
        <div
          v-reveal="{ delay: 420 }"
          class="glass card-glow relative mt-10 overflow-hidden rounded-[22px] p-6 sm:p-7"
        >
          <div class="flex items-start gap-5">
            <span
              class="neu-raised-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            >
              <Sparkles class="h-5 w-5 text-accent" />
            </span>
            <div>
              <p class="font-mono text-[11px] tracking-[0.24em] text-accent uppercase">
                {{ t.about.currentLabel }}
              </p>
              <p class="mt-1.5 text-[15px] font-semibold text-copy sm:text-base">
                {{ t.about.currentRole }}
              </p>
              <p class="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin class="h-3.5 w-3.5 text-muted-2" />
                {{ t.about.currentOrg }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: quick facts -->
      <aside class="lg:sticky lg:top-28">
        <div
          v-reveal="{ delay: 160 }"
          class="glass card-glow relative overflow-hidden rounded-[22px] p-8"
        >
          <p class="font-mono text-[11px] tracking-[0.24em] text-muted-2 uppercase">
            {{ t.about.factsLabel }}
          </p>

          <dl class="mt-6 space-y-6">
            <div v-for="fact in facts" :key="fact.label" class="flex items-start gap-4">
              <span
                class="neu-raised-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              >
                <component :is="fact.icon" class="h-4.5 w-4.5 text-primary-soft" />
              </span>
              <div>
                <dt class="text-xs text-muted-2">{{ fact.label }}</dt>
                <dd class="mt-1 flex items-center gap-2 text-sm font-medium text-copy">
                  <span v-if="fact.dot" class="animate-pulse-dot h-2 w-2 rounded-full bg-ok" />
                  {{ fact.value }}
                </dd>
              </div>
            </div>
          </dl>

          <div class="mt-8 flex items-center gap-3 border-t border-line/60 pt-6">
            <span class="relative flex h-10 w-10 items-center justify-center">
              <span class="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <span
                class="neu-raised-sm relative flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Terminal class="h-4 w-4 text-accent" />
              </span>
            </span>
            <p class="font-mono text-xs text-muted">{{ site.role }} — {{ site.location }}</p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Focus,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
  Terminal,
  type LucideIcon,
} from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { site } from '@/data/site'
import SectionHeading from '@/components/SectionHeading.vue'

const { t } = useLang()

const facts = computed(() => [
  {
    label: t.value.about.facts.based,
    value: site.location,
    icon: MapPin as LucideIcon,
    dot: false,
  },
  { label: t.value.about.facts.email, value: site.email, icon: Mail as LucideIcon, dot: false },
  {
    label: t.value.about.facts.education,
    value: t.value.about.educationValue,
    icon: GraduationCap as LucideIcon,
    dot: false,
  },
  {
    label: t.value.about.facts.focus,
    value: t.value.about.focusValue,
    icon: Focus as LucideIcon,
    dot: false,
  },
  {
    label: t.value.about.facts.status,
    value: t.value.about.statusValue,
    icon: Terminal as LucideIcon,
    dot: true,
  },
])
</script>
