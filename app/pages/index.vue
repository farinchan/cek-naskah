<script setup lang="ts">
useSeoMeta({
  title: 'Cek Naskah — Intelligent Workflow Platform',
  description: 'Automate your development workflow with intelligent tools. From code to production in minutes, not hours.',
  ogTitle: 'Cek Naskah — Intelligent Workflow Platform',
  ogDescription: 'Automate your development workflow with intelligent tools. From code to production in minutes, not hours.'
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200">
    <LandingHeader />

    <main>
      <LandingHero />
      <LandingFeatures />
      <LandingTestimonials />
    </main>

    <LandingFooter />
  </div>
</template>
