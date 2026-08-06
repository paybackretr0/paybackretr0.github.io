<template>
  <section id="stack" class="section section-loose scroll-mt-24">
    <SectionHeading
      index="04"
      align="right"
      :eyebrow="t.stack.eyebrow"
      :title="t.stack.title"
      :desc="t.stack.desc"
    />

    <!-- Bento grid: feature tiles span two columns, small tiles one -->
    <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(group, i) in techStack"
        :key="group.id"
        v-reveal="{ delay: i * 70 }"
        class="glass card-glow group relative overflow-hidden rounded-[22px]"
        :class="[spans[group.id] ?? '', wide.includes(group.id) ? 'p-7 sm:p-8' : 'p-6 sm:p-7']"
      >
        <span v-if="wide.includes(group.id)" class="absolute inset-x-0 top-0 h-px bg-primary/50" />

        <div class="flex items-center gap-4">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-line bg-tile text-muted-2 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/30 group-hover:text-primary-soft"
          >
            <component :is="groupIcons[group.icon]" class="h-5 w-5" />
          </span>
          <h3 class="text-lg font-bold tracking-tight text-copy">{{ group.label[locale] }}</h3>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <span
            v-for="item in group.items"
            :key="item"
            class="rounded-full border border-line bg-tile px-3 py-1 text-[12px] font-medium text-muted transition-colors duration-300 group-hover:border-line group-hover:text-copy/90"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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

const { t, locale } = useLang()

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
