<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="project" class="fixed inset-0 z-[80]">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[var(--backdrop)]" @click="$emit('close')" />

        <!-- Panel -->
        <aside
          ref="panelRef"
          class="glass-strong absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col overflow-hidden border-l border-line shadow-[var(--drawer-shadow)]"
          role="dialog"
          aria-modal="true"
          :aria-label="project.title[locale]"
        >
          <!-- Header -->
          <header class="border-b border-line/60 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">{{ project.category }}</p>
                <h3 class="mt-2 text-xl leading-snug font-bold tracking-tight text-copy">
                  {{ project.title[locale] }}
                </h3>
                <p class="mt-1.5 font-mono text-[11px] text-muted-2">{{ project.year }}</p>
              </div>
              <button
                ref="closeBtn"
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-line bg-tile text-muted transition-colors duration-300 hover:border-line hover:text-copy"
                :aria-label="t.projects.drawer.close"
                @click="$emit('close')"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </header>

          <!-- Body -->
          <div data-lenis-prevent class="drawer-body">
            <p class="text-[13px] leading-6 text-muted">{{ project.desc[locale] }}</p>

            <!-- System architecture -->
            <section class="mt-8">
              <h4 class="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.22em] text-copy/70 uppercase">
                <Boxes class="h-3.5 w-3.5 text-primary-soft" />
                {{ t.projects.drawer.architecture }}
              </h4>
              <div class="mt-4 flex flex-col">
                <template v-for="(layer, i) in project.architecture" :key="i">
                  <div class="flex items-center gap-3.5 rounded-[14px] border border-line bg-tile-2 px-4 py-3 transition-colors duration-300 hover:border-line">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-tile text-muted-2">
                      <component :is="layerIcon(layer.layer)" class="h-4 w-4" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-semibold text-copy">{{ layer.layer }}</p>
                      <p class="truncate font-mono text-[10.5px] text-muted-2">{{ layer.tech }}</p>
                    </div>
                    <span class="font-mono text-[10px] text-muted-2">0{{ i + 1 }}</span>
                  </div>
                  <div
                    v-if="i < project.architecture.length - 1"
                    class="flex items-center justify-center gap-1.5 py-1.5"
                    aria-hidden="true"
                  >
                    <span class="h-4 w-px bg-line/60" />
                    <ChevronDown class="h-3 w-3 text-muted-2" />
                  </div>
                </template>
              </div>
            </section>

            <!-- Database schema -->
            <section class="mt-8">
              <h4 class="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.22em] text-copy/70 uppercase">
                <Database class="h-3.5 w-3.5 text-primary-soft" />
                {{ t.projects.drawer.schema }}
              </h4>
              <div class="mt-4 space-y-3">
                <div
                  v-for="table in project.schema"
                  :key="table.table"
                  class="overflow-hidden rounded-[16px] border border-line/70 bg-elevated/60"
                >
                  <div class="flex items-center gap-2 border-b border-line/60 bg-tile-2 px-4 py-2 font-mono text-[11px] font-semibold text-accent">
                    <Table2 class="h-3 w-3" />
                    {{ table.table }}
                  </div>
                  <ul class="divide-y divide-line/40">
                    <li
                      v-for="col in table.columns"
                      :key="col.name"
                      class="flex items-center justify-between gap-3 px-4 py-1.5 font-mono text-[11.5px]"
                    >
                      <span class="flex min-w-0 items-center gap-2">
                        <KeyRound v-if="col.key" class="h-3 w-3 shrink-0 text-warn" />
                        <span class="truncate text-copy/90">{{ col.name }}</span>
                      </span>
                      <span class="flex shrink-0 items-center gap-2">
                        <span class="text-muted-2">{{ col.type }}</span>
                        <span
                          v-if="col.key"
                          class="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                          :class="keyStyles[col.key]"
                        >
                          {{ col.key }}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <!-- Features -->
            <section class="mt-8">
              <h4 class="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.22em] text-copy/70 uppercase">
                <CheckCircle2 class="h-3.5 w-3.5 text-primary-soft" />
                {{ t.projects.features }}
              </h4>
              <ul class="mt-4 grid gap-2">
                <li v-for="feature in project.features[locale]" :key="feature" class="flex items-start gap-2.5">
                  <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15">
                    <Check class="h-3 w-3 text-accent" />
                  </span>
                  <span class="text-[12.5px] leading-5 text-copy/85">{{ feature }}</span>
                </li>
              </ul>
            </section>

            <!-- Stack -->
            <div class="mt-6 flex flex-wrap gap-1.5">
              <span
                v-for="tech in project.stack"
                :key="tech"
                class="rounded-full border border-line bg-tile px-2.5 py-1 font-mono text-[10.5px] text-muted"
              >
                {{ tech }}
              </span>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex gap-2.5">
              <a :href="project.github" target="_blank" rel="noreferrer" class="btn btn-ghost flex-1 px-3">
                <Github class="h-4 w-4" />
                {{ t.projects.code }}
              </a>
              <a
                v-if="project.demo"
                :href="project.demo"
                target="_blank"
                rel="noreferrer"
                class="btn btn-primary flex-1 px-3"
              >
                {{ t.projects.demo }}
                <ArrowUpRight class="h-4 w-4" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ArrowUpRight,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  FolderGit2,
  Github,
  KeyRound,
  Layers,
  MapPin,
  MonitorSmartphone,
  Server,
  Table2,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { startSmoothScroll, stopSmoothScroll } from '@/composables/useSmoothScroll'
import type { Project } from '@/data/projects'

const props = defineProps<{ project: Project | null }>()
const emit = defineEmits<{ close: [] }>()

const { t, locale } = useLang()

const closeBtn = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

/** Element that had focus before the drawer opened — restored on close. */
let lastFocused: HTMLElement | null = null

const keyStyles = {
  PK: 'bg-warn/15 text-warn',
  FK: 'bg-info/15 text-info',
  UQ: 'bg-success/15 text-success',
} as const

function layerIcon(layer: string): LucideIcon {
  const l = layer.toLowerCase()
  if (l.includes('client') || l.includes('ui') || l.includes('browser') || l.includes('app')) return MonitorSmartphone
  if (l.includes('api') || l.includes('rest') || l.includes('controller') || l.includes('middleware')) return Server
  if (l.includes('cache')) return Zap
  if (l.includes('database') || l.includes('sqlite') || l.includes('room') || l.includes('db')) return Database
  if (l.includes('repository') || l.includes('orm')) return FolderGit2
  if (l.includes('viewmodel') || l.includes('mvvm')) return Boxes
  if (l.includes('location') || l.includes('geo')) return MapPin
  return Layers
}

watch(
  () => props.project,
  async (project) => {
    if (project) {
      lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
      stopSmoothScroll()
      await nextTick()
      closeBtn.value?.focus()
    } else {
      startSmoothScroll()
      // Return focus to whatever opened the drawer.
      lastFocused?.focus()
      lastFocused = null
    }
  },
  { immediate: true },
)

function onKeydown(e: KeyboardEvent) {
  if (!props.project) return
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key === 'Tab') {
    // Simple focus trap — keep Tab cycling inside the drawer.
    const panel = panelRef.value
    if (!panel) return
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null)
    const first = focusable[0] ?? null
    const last = focusable[focusable.length - 1] ?? null
    if (!first || !last) return
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  startSmoothScroll()
})
</script>

<style scoped>
.drawer-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 22px 24px calc(32px + env(safe-area-inset-bottom));
}

.drawer-body::-webkit-scrollbar {
  width: 8px;
}
.drawer-body::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border: 0;
}
.drawer-body::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}

/* Slide-over transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.35s ease;
}
.drawer-enter-active .glass-strong,
.drawer-leave-active .glass-strong {
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .glass-strong,
.drawer-leave-to .glass-strong {
  transform: translateX(100%);
}
</style>
