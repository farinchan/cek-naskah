<script setup lang="ts">
useSeoMeta({
  title: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  description: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository. Uji Turnitin & iThenticate resmi akurat, skor AI Writer Detector Turnitin, artikel Scopus, dan parafrase manual profesional.',
  ogTitle: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  ogDescription: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository. Uji Turnitin & iThenticate resmi akurat, skor AI Writer Detector Turnitin, artikel Scopus, dan parafrase manual profesional.',
  ogType: 'website',
  ogUrl: 'https://cek-naskah.web.id',
  ogImage: 'https://cek-naskah.web.id/logo.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  twitterDescription: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository: Turnitin, AI Writer Detector, Scopus, dan Parafrase Manual.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://cek-naskah.web.id' }
  ]
})

useSchemaOrg([
  defineWebPage({
    name: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
    description: 'Platform Cek Plagiasi & AI No. 1 di Indonesia: Garansi 100% No-Repository, Turnitin & iThenticate, AI Writer Detector, Jurnal Scopus, dan Parafrase Manual.'
  })
])
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200">
    <LandingHeader />

    <main>
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingTestimonials />
    </main>

    <LandingFooter />
  </div>
</template>
