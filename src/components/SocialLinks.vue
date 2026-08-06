<template>
  <div class="flex items-center gap-3">
    <a
      v-for="social in site.socials"
      :key="social.label"
      :href="social.href"
      target="_blank"
      rel="noreferrer"
      :aria-label="social.label"
      class="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-tile text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]"
    >
      <component
        :is="icons[social.icon]"
        class="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import { Github, Instagram, Linkedin, Mail } from 'lucide-vue-next'
import type { Component } from 'vue'
import { site } from '@/data/site'
import type { SocialLink } from '@/data/site'

const icons: Record<SocialLink['icon'], Component> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
}
</script>
