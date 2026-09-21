<template>
  <div class="git-stream">
    <!-- Toolbar -->
    <div
      class="neu-inset mb-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[22px] px-5 py-4"
    >
      <div class="flex items-center gap-2.5 font-mono text-[11.5px] text-muted">
        <GitBranch class="h-4 w-4 text-primary-soft" />
        <span class="text-copy/90">$ {{ t.projects.stream.gitLog }}</span>
      </div>
      <div class="neu-inset flex items-center gap-1 rounded-full p-1">
        <button
          v-for="f in filterOptions"
          :key="f.key"
          type="button"
          class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-[0.14em] transition-all duration-300 uppercase"
          :class="filter === f.key ? 'neu-raised-sm text-copy' : 'text-muted-2 hover:text-copy'"
          :aria-pressed="filter === f.key"
          @click="filter = f.key"
        >
          <span v-if="f.dot" class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: f.dot }" />
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Timeline -->
    <div class="relative">
      <!-- main branch line -->
      <span
        aria-hidden="true"
        class="absolute inset-y-0 left-6 w-px -translate-x-1/2 bg-primary/40 md:left-1/2"
      />

      <ol class="relative space-y-12">
        <template v-for="(item, i) in timeline" :key="item.key">
          <!-- Year marker on the line -->
          <li v-if="item.kind === 'year'" class="relative h-10">
            <span
              class="neu-raised-sm absolute top-1/2 left-6 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-3.5 py-1 font-mono text-[11px] font-semibold tracking-[0.2em] text-copy/90 md:left-1/2"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-ok" />
              {{ item.year }}
            </span>
          </li>

          <!-- Commit row -->
          <li
            v-else
            v-reveal="{ delay: (commitDelay(item) % 4) * 90 }"
            class="relative md:grid md:grid-cols-2 md:gap-x-24"
          >
            <!-- commit dot -->
            <span
              class="absolute top-6 left-6 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 bg-ink md:left-1/2"
              :class="item.head ? 'animate-pulse-dot' : ''"
              :style="{
                borderColor: BRANCH[item.branch].color,
                boxShadow: `0 0 12px color-mix(in srgb, ${BRANCH[item.branch].color} 60%, transparent)`,
              }"
            />
            <!-- branch connector -->
            <span
              aria-hidden="true"
              class="absolute top-[30px] left-6 h-px w-10 md:top-8 md:w-16"
              :class="item.side === 'left' ? 'md:right-1/2 md:left-auto' : 'md:left-1/2'"
              :style="{
                backgroundColor: `color-mix(in srgb, ${BRANCH[item.branch].color} 45%, transparent)`,
              }"
            />

            <!-- commit card -->
            <button
              type="button"
              class="group commit-card card-glow glass w-full rounded-[22px] p-5 text-left sm:p-6"
              :class="
                item.side === 'left'
                  ? 'md:col-start-1 md:justify-self-end'
                  : 'md:col-start-2 md:justify-self-start'
              "
              @click="$emit('select', item.project)"
            >
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <span class="font-mono text-[11px] text-muted-2">[{{ item.hash }}]</span>
                <span class="font-mono text-[11.5px] font-semibold text-success">feat:</span>
                <span
                  class="rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-medium tracking-[0.14em] uppercase"
                  :class="BRANCH[item.branch].chip"
                >
                  {{ t.projects.stream[item.branch] }}
                </span>
                <span
                  v-if="item.head"
                  class="neu-raised-sm rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.14em] text-success uppercase"
                >
                  {{ t.projects.stream.head }}
                </span>
              </div>

              <h3
                class="mt-3.5 text-lg leading-snug font-bold tracking-tight text-copy transition-colors duration-300 group-hover:text-accent"
              >
                {{ item.project.title[locale] }}
              </h3>
              <p class="mt-2 line-clamp-2 text-[13px] leading-6 text-muted">
                {{ item.project.desc[locale] }}
              </p>

              <div class="mt-4.5 flex items-center justify-between gap-3">
                <span class="font-mono text-[10.5px] text-muted-2">
                  {{ item.project.year }} · {{ item.project.category }}
                </span>
                <span
                  class="inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                >
                  {{ t.projects.stream.details }}
                  <ChevronRight
                    class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </button>
          </li>
        </template>
      </ol>
    </div>

    <p class="mt-12 text-center font-mono text-[11px] text-muted-2">{{ t.projects.stream.hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, GitBranch } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { projects, type Project } from '@/data/projects'

const { t, locale } = useLang()

defineEmits<{ select: [project: Project] }>()

const BRANCH = {
  web: { color: 'var(--branch-web)', chip: 'neu-inset text-primary-soft' },
  mobile: { color: 'var(--branch-mobile)', chip: 'neu-inset text-accent' },
} as const

type Branch = keyof typeof BRANCH
type FilterKey = 'all' | Branch

/** web vs mobile is derived from the category, same rule as the branch line. */
const branchOf = (p: Project): Branch =>
  p.category.toLowerCase().includes('web') ? 'web' : 'mobile'

const filter = ref<FilterKey>('all')

const filterOptions = computed(() => [
  { key: 'all' as const, label: t.value.projects.stream.all, dot: undefined as string | undefined },
  { key: 'web' as const, label: t.value.projects.stream.web, dot: 'var(--branch-web)' },
  { key: 'mobile' as const, label: t.value.projects.stream.mobile, dot: 'var(--branch-mobile)' },
])

function hashOf(id: string): string {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(7, '0').slice(0, 7)
}

interface TimelineYear {
  kind: 'year'
  key: string
  year: number
}

interface TimelineCommit {
  kind: 'commit'
  key: string
  project: Project
  side: 'left' | 'right'
  head: boolean
  branch: Branch
  hash: string
  delay: number
}

type TimelineItem = TimelineYear | TimelineCommit

/* Newest first, like `git log`. Year markers are inserted when the
   commit's starting year changes, giving the "branches per year" feel.
   The whole timeline is a computed so the web/mobile filter can re-build
   it (year markers only appear when a year has commits on this branch). */
/** A year may be plain ("2026") or a period ("2025 – 2026", "Sep 2026"). */
const yearOf = (value: string): number => Number(value.match(/\d{4}/)?.[0] ?? 0)

/** HEAD stays on the newest commit overall. */
const HEAD_ID = projects[0]?.id

const timeline = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = []
  let lastYear: number | null = null
  let commitIndex = 0
  // Projects are listed newest first in the data file — that is the timeline order.
  for (const project of projects) {
    const branch = branchOf(project)
    if (filter.value !== 'all' && branch !== filter.value) continue
    const year = yearOf(project.year)
    if (year !== lastYear) {
      items.push({ kind: 'year', key: `year-${year}-${filter.value}`, year })
      lastYear = year
    }
    items.push({
      kind: 'commit',
      key: project.id,
      project,
      side: commitIndex % 2 === 0 ? 'left' : 'right',
      // HEAD stays on the newest commit overall regardless of filter.
      head: project.id === HEAD_ID,
      branch,
      hash: hashOf(project.id),
      delay: commitIndex,
    })
    commitIndex++
  }
  return items
})

function commitDelay(item: TimelineItem): number {
  return item.kind === 'commit' ? item.delay : 0
}
</script>

<style scoped>
.commit-card {
  /* Inset the card beside the timeline. Minimum 4rem keeps the branch
     connector (ends at 64px) clear of the card. Width must shrink by the
     same amount, or the card overflows the viewport on phones. */
  margin-left: clamp(4rem, 13vw, 4.25rem);
  width: calc(100% - clamp(4rem, 13vw, 4.25rem));
}
@media (min-width: 768px) {
  .commit-card {
    margin-left: 0;
    width: min(100%, 30rem);
  }
}
</style>
