<template>
  <section id="achievements" class="section section-tight scroll-mt-24">
    <SectionHeading
      index="05"
      centered
      :eyebrow="t.achievements.eyebrow"
      :title="t.achievements.title"
      :desc="t.achievements.desc"
    />

    <!-- Bento: Bangkit is the featured card, the rest fill the remaining cells -->
    <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
      <div
        v-for="(item, i) in achievements"
        :key="item.id"
        v-reveal="{ delay: i * 90 }"
        class="glass card-glow relative flex flex-col overflow-hidden rounded-[22px]"
        :class="[spans[item.id] ?? '', item.id === 'bangkit' ? 'p-7 sm:p-9' : 'p-6']"
      >
        <span
          class="absolute inset-x-0 top-0 h-px"
          :class="item.id === 'bangkit' ? 'bg-accent/60' : 'bg-primary/50'"
        />

        <div class="flex items-center justify-between">
          <span
            class="flex h-11 w-11 items-center justify-center rounded-[14px] border border-line bg-tile text-muted-2"
          >
            <component :is="typeIcons[item.type]" class="h-5 w-5" />
          </span>
          <span
            class="rounded-full border px-3 py-1 font-mono text-[10px] font-medium tracking-[0.16em] uppercase"
            :class="typeStyles[item.type]"
          >
            {{ t.achievements[item.type] }}
          </span>
        </div>

        <h3
          class="mt-5 font-bold tracking-tight text-copy"
          :class="item.id === 'bangkit' ? 'text-xl sm:text-2xl' : 'text-base leading-snug'"
        >
          {{ item.title[locale] }}
        </h3>
        <p class="mt-1.5 text-xs font-medium text-primary-soft">{{ item.org[locale] }}</p>
        <p class="mt-3 text-[13px] leading-6 text-muted" :class="item.id === 'bangkit' ? 'sm:text-sm' : ''">
          {{ item.desc[locale] }}
        </p>

        <span class="mt-auto pt-5 font-mono text-xs text-muted-2">{{ item.year }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Award, BadgeCheck, Trophy, type LucideIcon } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { achievements, type AchievementType } from '@/data/achievements'
import SectionHeading from '@/components/SectionHeading.vue'

const { t, locale } = useLang()

const typeIcons: Record<AchievementType, LucideIcon> = {
  certification: BadgeCheck,
  award: Award,
  hackathon: Trophy,
}

const typeStyles: Record<AchievementType, string> = {
  certification: 'border-primary/40 bg-primary/15 text-primary-soft',
  award: 'border-warn/40 bg-warn/15 text-warn',
  hackathon: 'border-fuchsia/40 bg-fuchsia/15 text-fuchsia',
}

/** Bento spans — Bangkit spans a wide featured cell. */
const spans: Record<string, string> = {
  bangkit: 'sm:col-span-2 lg:col-span-4',
  'impact-hackathon': 'lg:col-span-2',
  'cybertech-hackathon': 'lg:col-span-2',
  'neo-telemetri': 'sm:col-span-2 lg:col-span-2',
  'gold-medal-dampak': 'lg:col-span-2',
}
</script>
