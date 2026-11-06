<template>
  <section id="stack" class="section section-loose scroll-mt-24">
    <SectionHeading
      index="04"
      align="right"
      :eyebrow="t.stack.eyebrow"
      :title="t.stack.title"
      :desc="t.stack.desc"
    />

    <!-- Endless tech strip: every item on the page, in one line -->
    <div class="mt-12">
      <Marquee :duration="52">
        <span
          v-for="item in marqueeItems"
          :key="item"
          class="neu-inset mr-2 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-muted uppercase"
        >
          <span class="h-1 w-1 rounded-full bg-accent/80" />
          {{ item }}
        </span>
      </Marquee>
    </div>

    <!-- Bento grid: feature tiles span two columns, small tiles one -->
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(group, i) in techStack"
        :key="group.id"
        v-reveal="{ delay: i * 70 }"
        v-tilt="{ max: 5 }"
        v-spotlight
        class="glass card-glow group relative overflow-hidden rounded-[22px]"
        :class="[spans[group.id] ?? '', wide.includes(group.id) ? 'p-7 sm:p-8' : 'p-6 sm:p-7']"
      >
        <div class="flex items-center gap-4">
          <span
            class="neu-raised-sm flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-muted-2 transition-all duration-300 group-hover:scale-110 group-hover:text-accent"
          >
            <component :is="groupIcons[group.icon]" class="h-5 w-5" />
          </span>
          <h3 class="text-lg font-bold tracking-tight text-copy">{{ group.label[locale] }}</h3>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <span
            v-for="item in group.items"
            :key="item"
            class="neu-inset rounded-full px-3 py-1 text-[12px] font-medium text-muted transition-colors duration-300 group-hover:text-copy/90"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Code,
  Container,
  Database,
  Layers,
  LayoutTemplate,
  Server,
  Smartphone,
  Wrench,
  type LucideIcon,
} from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { techStack, type TechGroup } from '@/data/techStack'
import SectionHeading from '@/components/SectionHeading.vue'
import Marquee from '@/components/ui/Marquee.vue'

const { t, locale } = useLang()

/** Every technology once, for the scrolling strip above the grid. */
const marqueeItems = computed(() => Array.from(new Set(techStack.flatMap((g) => g.items))))

const groupIcons: Record<TechGroup['icon'], LucideIcon> = {
  language: Code,
  frontend: LayoutTemplate,
  backend: Server,
  mobile: Smartphone,
  database: Database,
  devops: Container,
  tools: Wrench,
  architecture: Layers,
}

/** Bento spans — feature groups take a full row on 2-col and half on 4-col. */
const wide = ['frontend', 'backend', 'mobile', 'languages']

const spans: Record<string, string> = {
  frontend: 'sm:col-span-2 lg:col-span-2',
  backend: 'sm:col-span-2 lg:col-span-2',
  mobile: 'sm:col-span-2 lg:col-span-2',
  database: 'lg:col-span-1',
  devops: 'lg:col-span-1',
  languages: 'sm:col-span-2 lg:col-span-2',
  tools: 'lg:col-span-1',
  architecture: 'lg:col-span-1',
}
</script>
