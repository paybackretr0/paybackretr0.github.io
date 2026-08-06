<template>
  <div>
    <HeroSection />
    <AboutSection />

    <div class="mx-auto max-w-6xl px-6">
      <div class="h-px bg-line" />
    </div>

    <ExperienceSection />
    <ProjectsSection />
    <TechStackSection />
    <AchievementsSection />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import TechStackSection from '@/components/sections/TechStackSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
</script>
