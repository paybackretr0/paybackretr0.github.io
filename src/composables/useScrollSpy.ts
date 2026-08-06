import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Tracks which section is currently in view using an IntersectionObserver.
 * Returns the id (without '#') of the active section.
 */
export function useScrollSpy(ids: string[]) {
  const activeId = ref<string>('')

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId.value = entry.target.id
          }
        }
      },
      // The band around the middle of the viewport decides "active".
      { rootMargin: '-35% 0px -60% 0px', threshold: 0 },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { activeId }
}
