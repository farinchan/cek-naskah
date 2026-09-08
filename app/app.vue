<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk && !titleChunk.includes('Cek Naskah')
      ? `${titleChunk} · Cek Naskah`
      : (titleChunk || 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia')
  },
  htmlAttrs: {
    lang: 'id',
    dir: 'ltr'
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#2563EB' },
    { name: 'msapplication-TileColor', content: '#2563EB' },
    { name: 'application-name', content: 'Cek Naskah' },
    { name: 'apple-mobile-web-app-title', content: 'Cek Naskah' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'author', content: 'Cek Naskah' },
    { name: 'publisher', content: 'Cek Naskah' },
    {
      name: 'keywords',
      content: 'cek plagiasi dan ai, cek plagiasi, cek plagiarisme dan ai, cek ai turnitin, turnitin no 1 di indonesia, ithenticate no 1 di indonesia, cek turnitin no 1 di indonesia, cek plagiasi no 1 di indonesia, turnitin no repository, ithenticate resmi, ai writer detector, cek naskah, cek skripsi, cek tesis, cek disertasi, download jurnal scopus, ambil artikel scopus, parafrase manual akademik, publikasi jurnal internasional, eyd v'
    }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/logo.png' },
    { rel: 'apple-touch-icon', href: '/logo.png' }
  ]
})

useSeoMeta({
  title: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  description: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository. Uji Turnitin & iThenticate resmi akurat, skor AI Writer Detector Turnitin, artikel Scopus, dan parafrase manual terpercaya.',
  ogTitle: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  ogDescription: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository. Uji Turnitin & iThenticate resmi akurat, skor AI Writer Detector Turnitin, artikel Scopus, dan parafrase manual terpercaya.',
  ogType: 'website',
  ogSiteName: 'Cek Naskah',
  ogLocale: 'id_ID',
  ogImage: 'https://cek-naskah.web.id/logo.png',
  ogImageAlt: 'Logo Cek Naskah — Layanan Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  ogImageWidth: 512,
  ogImageHeight: 512,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Cek Naskah — Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  twitterDescription: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository: Turnitin resmi, AI Writer Detector, Scopus, dan Parafrase.',
  twitterImage: 'https://cek-naskah.web.id/logo.png',
  twitterImageAlt: 'Logo Cek Naskah — Layanan Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
})

useSchemaOrg([
  defineOrganization({
    name: 'Cek Naskah',
    url: 'https://cek-naskah.web.id',
    logo: 'https://cek-naskah.web.id/logo.png',
    description: 'Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository untuk mahasiswa, dosen, dan peneliti.',
    sameAs: [
      'https://github.com/farinchan/cek-naskah'
    ]
  }),
  defineWebSite({
    name: 'Cek Naskah',
    url: 'https://cek-naskah.web.id',
    description: 'Platform Cek Plagiasi & AI No. 1 di Indonesia: Turnitin & iThenticate No-Repository, AI Writer Detector, Artikel Scopus, dan Parafrase Manual.',
    inLanguage: 'id-ID'
  })
])
</script>

<template>
  <UApp>
    <NuxtPage />
    <PointTopupModal />
  </UApp>
</template>
