<template>
  <section id="experience" class="section section-loose scroll-mt-24">
    <SectionHeading
      index="02"
      :eyebrow="t.experience.eyebrow"
      :title="t.experience.title"
      :desc="t.experience.desc"
    />

    <div class="mt-16 space-y-14 sm:space-y-16">
      <div v-for="group in groups" :key="group.key">
        <!-- Block heading: the category replaces the old per-entry badge -->
        <h3
          class="flex items-center gap-3 font-mono text-[11px] font-medium tracking-[0.24em] text-muted-2 uppercase"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="groupStyles[group.key]" />
          {{ t.experience.groups[group.key] }}
        </h3>

        <div class="relative mt-8 ml-3 sm:ml-5">
          <!-- Growing line -->
          <span
            v-reveal="{ y: 'grow' }"
            class="absolute top-1 bottom-0 left-0 w-px origin-top bg-primary/50"
          />

          <ol class="space-y-10">
            <li
              v-for="(entry, i) in group.entries"
              :key="entry.id"
              v-reveal="{ delay: i * 120 }"
              class="relative pl-10 sm:pl-14"
            >
              <!-- Node dot -->
              <span
                class="absolute top-2 left-0 h-[11px] w-[11px] -translate-x-1/2 rounded-full bg-accent shadow-[var(--neu-raised-sm)]"
              />

              <div class="glass card-glow rounded-[22px] p-6 sm:p-7">
                <span class="font-mono text-xs tracking-[0.18em] text-muted-2">{{
                  entry.period
                }}</span>

                <h4 class="mt-3 text-lg font-bold tracking-tight text-copy sm:text-xl">
                  {{ entry.role[locale] }}
                </h4>

                <p class="mt-1.5 flex items-center gap-2 text-sm font-medium text-primary-soft">
                  <Building2 class="h-4 w-4" />
                  {{ entry.org[locale] }}
                </p>

                <p class="mt-4 text-sm leading-7 text-muted">{{ entry.desc[locale] }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Building2 } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { experience, type ExperienceGroup } from '@/data/experience'
import SectionHeading from '@/components/SectionHeading.vue'

const { t, locale } = useLang()

/** Order of the blocks, top to bottom. */
const groupOrder: ExperienceGroup[] = ['work', 'organization', 'education']

/** Accent dot per block — keeps the old colour language of the badges. */
const groupStyles: Record<ExperienceGroup, string> = {
  work: 'bg-warn',
  organization: 'bg-violet',
  education: 'bg-success',
}

const groups = computed(() =>
  groupOrder
    .map((key) => ({ key, entries: experience.filter((entry) => entry.group === key) }))
    .filter((group) => group.entries.length > 0),
)
</script>
