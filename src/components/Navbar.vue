<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="
      scrolled ? 'bg-[var(--nav-bg)] py-2.5 shadow-[var(--nav-shadow)]' : 'bg-transparent py-4'
    "
  >
    <!-- pt-[env(...)] only adds space on notched iPhones (0 elsewhere),
         keeping the logo row clear of the status bar with viewport-fit=cover. -->
    <nav
      class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 pt-[env(safe-area-inset-top)] sm:gap-4 sm:px-6"
      aria-label="Main navigation"
    >
      <!-- Logo -->
      <a
        href="#home"
        class="group flex shrink-0 items-center gap-3"
        aria-label="Back to top"
        @click.prevent="scrollTo('#home')"
      >
        <span class="text-base font-bold tracking-tight text-copy">
          Khalied<span class="accent-serif text-gradient">.</span>
        </span>
      </a>

      <!-- Desktop links -->
      <ul class="hidden items-center gap-1 md:flex">
        <li v-for="link in links" :key="link.id">
          <a
            :href="`#${link.id}`"
            class="relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-300"
            :class="activeId === link.id ? 'text-copy' : 'text-muted hover:text-copy'"
            @click.prevent="scrollTo(`#${link.id}`)"
          >
            {{ t.nav[link.key] }}
            <span
              class="absolute inset-x-3 -bottom-0.5 h-px bg-accent transition-opacity duration-300"
              :class="activeId === link.id ? 'opacity-100' : 'opacity-0'"
            />
          </a>
        </li>
      </ul>

      <!-- Right actions -->
      <div class="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          class="neu-raised-sm inline-flex h-10 w-10 items-center justify-center rounded-xl text-copy transition-all duration-300 active:shadow-[var(--neu-pressed)]"
          :aria-label="theme === 'dark' ? t.nav.lightMode : t.nav.darkMode"
          @click="toggleTheme"
        >
          <Sun v-if="theme === 'dark'" class="h-[18px] w-[18px]" />
          <Moon v-else class="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          class="lang-pill"
          :aria-label="locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'"
          @click="toggleLang"
        >
          <span :class="locale === 'en' ? 'is-active' : ''">EN</span>
          <span :class="locale === 'id' ? 'is-active' : ''">ID</span>
        </button>

        <button
          type="button"
          class="neu-raised-sm inline-flex h-10 w-10 items-center justify-center rounded-xl text-copy transition md:hidden"
          :aria-expanded="open"
          aria-label="Toggle navigation"
          @click="open = !open"
        >
          <Menu v-if="!open" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>
    </nav>

    <!-- Mobile panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="open"
        class="bg-[var(--nav-bg)] px-5 pt-4 pb-6 shadow-[var(--nav-shadow)] md:hidden"
      >
        <ul class="space-y-1">
          <li v-for="link in links" :key="link.id">
            <a
              :href="`#${link.id}`"
              class="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              :class="activeId === link.id ? 'neu-inset text-copy' : 'text-muted'"
              @click="onMobileNav(link.id)"
            >
              {{ t.nav[link.key] }}
            </a>
          </li>
        </ul>
        <div class="mt-4 flex items-center gap-2.5 border-t border-line/60 pt-4">
          <a href="./porto.pdf" target="_blank" rel="noopener" class="btn btn-ghost flex-1 px-3">
            <FileText class="h-4 w-4" />
            {{ t.nav.portfolio }}
          </a>
          <a href="./cv.pdf" download class="btn btn-primary flex-1 px-3">
            <Download class="h-4 w-4" />
            {{ t.nav.resume }}
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Download, FileText, Menu, Moon, Sun, X } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { useTheme } from '@/composables/useTheme'
import { scrollToTarget } from '@/composables/useSmoothScroll'

const { t, locale, toggleLang } = useLang()
const { theme, toggleTheme } = useTheme()
const open = ref(false)
const scrolled = ref(false)

const links = [
  { id: 'about', key: 'about' },
  { id: 'experience', key: 'experience' },
  { id: 'projects', key: 'projects' },
  { id: 'stack', key: 'stack' },
  { id: 'contact', key: 'contact' },
] as const

const { activeId } = useScrollSpy([
  'home',
  'about',
  'experience',
  'projects',
  'stack',
  'achievements',
  'contact',
])

function scrollTo(hash: string) {
  // -96 compensates for the fixed navbar height.
  scrollToTarget(hash, -96)
}

function onMobileNav(id: string) {
  open.value = false
  scrollTo(`#${id}`)
}

function onScroll() {
  scrolled.value = window.scrollY > 16
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
