<template>
  <section id="projects" class="section scroll-mt-24">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <SectionHeading
        index="03"
        :eyebrow="t.projects.eyebrow"
        :title="t.projects.title"
        :accent="t.projects.accent"
        :desc="t.projects.desc"
      />
      <a
        v-reveal="{ delay: 140 }"
        :href="site.github"
        target="_blank"
        rel="noreferrer"
        class="group inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        {{ t.projects.more }}
        <ArrowUpRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>

    <div v-reveal="{ y: 0 }" class="mt-14">
      <GitCommitStream @select="selectedProject = $event" />
    </div>

    <ProjectDrawer :project="selectedProject" @close="selectedProject = null" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { site } from '@/data/site'
import type { Project } from '@/data/projects'
import GitCommitStream from '@/components/projects/GitCommitStream.vue'
import ProjectDrawer from '@/components/projects/ProjectDrawer.vue'
import SectionHeading from '@/components/SectionHeading.vue'

const { t } = useLang()

const selectedProject = ref<Project | null>(null)
</script>
