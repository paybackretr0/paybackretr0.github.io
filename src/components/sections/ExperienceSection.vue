<template>
  <section id="experience" class="section section-loose scroll-mt-24">
    <SectionHeading index="02" :eyebrow="t.experience.eyebrow" :title="t.experience.title" :desc="t.experience.desc" />

    <div class="relative mt-16 ml-3 sm:ml-5">
      <!-- Growing line -->
      <span
        v-reveal="{ y: 'grow' }"
        class="absolute top-1 bottom-0 left-0 w-px origin-top bg-primary/50"
      />

      <ol class="space-y-10">
        <li
          v-for="(entry, i) in experience"
          :key="entry.id"
          v-reveal="{ delay: i * 120 }"
          class="relative pl-10 sm:pl-14"
        >
          <!-- Node dot -->
          <span
            class="absolute top-2 left-0 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 border-accent bg-ink shadow-[0_0_14px_rgba(34,211,238,0.65)]"
          />

          <div class="glass card-glow rounded-[22px] p-6 sm:p-7">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="font-mono text-xs tracking-[0.18em] text-muted-2">{{ entry.period }}</span>
              <span
                class="rounded-full border px-3 py-1 font-mono text-[10px] font-medium tracking-[0.16em] uppercase"
                :class="typeStyles[entry.type]"
              >
                {{ t.experience[entry.type] }}
              </span>
            </div>

            <h3 class="mt-3 text-lg font-bold tracking-tight text-copy sm:text-xl">
              {{ entry.role[locale] }}
            </h3>

            <p class="mt-1.5 flex items-center gap-2 text-sm font-medium text-primary-soft">
              <Building2 class="h-4 w-4" />
              {{ entry.org[locale] }}
            </p>

            <p class="mt-4 text-sm leading-7 text-muted">{{ entry.desc[locale] }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { experience, type ExperienceType } from '@/data/experience'
import SectionHeading from '@/components/SectionHeading.vue'

const { t, locale } = useLang()

const typeStyles: Record<ExperienceType, string> = {
  internship: 'border-accent/40 bg-accent/15 text-accent',
  organization: 'border-violet/40 bg-violet/15 text-violet',
  education: 'border-success/40 bg-success/15 text-success',
}
</script>
