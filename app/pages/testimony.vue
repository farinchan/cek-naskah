<script setup lang="ts">
const { getWhatsappUrl } = useAppSettings()
const { publicTestimonials, fetchPublicTestimonials } = useTestimonials()

await useAsyncData('testimony_page_list', () => fetchPublicTestimonials())

useSeoMeta({
  title: 'Testimoni Klien Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia — Cek Naskah',
  description: 'Pengalaman nyata dan testimoni para dosen, peneliti, dan mahasiswa di Indonesia yang menggunakan Layanan Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository.',
  ogTitle: 'Testimoni Klien Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia — Cek Naskah',
  ogDescription: 'Ulasan dan kepuasan ribuan akademisi menggunakan Layanan Cek Plagiasi & AI No. 1 di Indonesia: Turnitin No-Repo, AI Writer Detector, Scopus, dan Parafrase.',
  ogType: 'website',
  ogUrl: 'https://cek-naskah.web.id/testimony',
  ogImage: 'https://cek-naskah.web.id/logo.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Testimoni Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia — Cek Naskah',
  twitterDescription: 'Testimoni ribuan civitas akademika di Indonesia yang mempercayakan naskahnya kepada Cek Naskah.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://cek-naskah.web.id/testimony' }
  ]
})

useSchemaOrg([
  defineWebPage({
    name: 'Testimoni Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia — Cek Naskah',
    description: 'Ulasan dan bukti kepuasan pengguna layanan Cek Plagiasi & AI Turnitin / iThenticate No. 1 di Indonesia.'
  })
])

interface TestimonyCard {
  name: string
  role: string
  campus: string
  category: string
  service: string
  avatar: string
  quote: string
  rating?: number
}

const displayTestimonials = computed<TestimonyCard[]>(() => {
  return (publicTestimonials.value || []).map(t => ({
    name: t.userName || 'Klien Cek Naskah',
    role: t.userOccupation || 'Civitas Akademika',
    campus: t.userAffiliation || t.serviceName || 'Cek Naskah',
    category: t.serviceName || 'Review Naskah',
    service: t.manuscriptTitle || 'Pemeriksaan Naskah',
    rating: t.rating || 5,
    avatar: t.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.userName || 'U')}&background=4F46E5&color=fff`,
    quote: t.comment
  }))
})

const averageRating = computed(() => {
  if (publicTestimonials.value.length === 0) return '5.0'
  const total = publicTestimonials.value.reduce((acc, t) => acc + (t.rating || 5), 0)
  return (total / publicTestimonials.value.length).toFixed(1)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1">
      <!-- Hero Header -->
      <section class="py-16 sm:py-24 bg-slate-50/70 dark:bg-neutral-900/40 border-b border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-3 block">
            Ulasan & Pengalaman Akademisi
          </span>
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Kisah Sukses <span class="text-primary-600 dark:text-primary-400">Riset & Publikasi</span> Bersama Cek Naskah
          </h1>
          <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Dipercaya oleh lebih dari 25.000 dosen, peneliti, dan mahasiswa di seluruh Indonesia untuk memastikan orisinalitas karya ilmiah bebas plagiasi dan lolos review jurnal bereputasi.
          </p>

          <!-- Quick Stats -->
          <div class="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm text-left">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                ★
              </div>
              <div>
                <span class="block text-base font-black text-slate-900 dark:text-white">{{ averageRating }} / 5.0</span>
                <span class="block text-xs text-slate-500 dark:text-neutral-400">Tingkat Kepuasan</span>
              </div>
            </div>
            <div class="hidden sm:block w-px h-8 bg-slate-200 dark:bg-neutral-800" />
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span class="block text-base font-black text-slate-900 dark:text-white">25.000+</span>
                <span class="block text-xs text-slate-500 dark:text-neutral-400">Naskah Diperiksa</span>
              </div>
            </div>
            <div class="hidden sm:block w-px h-8 bg-slate-200 dark:bg-neutral-800" />
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                100%
              </div>
              <div>
                <span class="block text-base font-black text-slate-900 dark:text-white">No-Repository</span>
                <span class="block text-xs text-slate-500 dark:text-neutral-400">Garansi Keamanan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Testimonials with Masonry Layout -->
      <section class="py-16 sm:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Empty State -->
          <div
            v-if="displayTestimonials.length === 0"
            class="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-8 max-w-md mx-auto"
          >
            <div class="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
              <UIcon
                name="i-lucide-message-square-quote"
                class="w-8 h-8"
              />
            </div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Belum Ada Ulasan
            </h3>
            <p class="text-sm text-slate-500 dark:text-neutral-400">
              Ulasan pengguna yang telah terverifikasi akan segera ditampilkan di sini.
            </p>
          </div>

          <!-- Masonry Grid Layout via CSS Columns -->
          <div
            v-else
            class="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]"
          >
            <div
              v-for="(item, idx) in displayTestimonials"
              :key="idx"
              class="break-inside-avoid mb-6 p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-800 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <!-- Top Row: Service Tag & Stars -->
                <div class="flex items-center justify-between gap-2 mb-4">
                  <span class="px-2.5 py-1 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-semibold">
                    {{ item.category }}
                  </span>
                  <div class="flex items-center gap-0.5 text-amber-400 text-xs">
                    <span
                      v-for="star in 5"
                      :key="star"
                      :class="star <= (item.rating || 5) ? 'text-amber-400' : 'text-slate-300 dark:text-neutral-700'"
                    >★</span>
                  </div>
                </div>

                <!-- Quote text -->
                <p class="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed mb-6 font-normal">
                  {{ item.quote }}
                </p>
              </div>

              <!-- Author Info Footer -->
              <div class="pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex items-center gap-3">
                <img
                  :src="item.avatar"
                  :alt="item.name"
                  class="w-11 h-11 rounded-xl object-cover shadow-sm shrink-0 border border-slate-100 dark:border-neutral-800"
                >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {{ item.name }}
                    </h4>
                    <svg
                      class="w-3.5 h-3.5 text-primary-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 truncate">
                    {{ item.role }}
                  </p>
                  <p class="text-xs font-medium text-primary-600 dark:text-primary-400 truncate">
                    {{ item.campus }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Contact CTA -->
      <section class="py-12 bg-primary-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold mb-1">
              Siap Memulai Pemeriksaan Naskah Anda?
            </h2>
            <p class="text-primary-100 text-sm">
              Bergabunglah dengan ribuan akademisi yang telah mempercayakan naskah ilmiah mereka kepada Cek Naskah.
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <NuxtLink
              to="/charge"
              class="px-6 py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-bold text-sm rounded-xl transition-colors border border-white/20"
            >
              Lihat Biaya Layanan
            </NuxtLink>
            <a
              :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin konsultasi')"
              target="_blank"
              class="px-6 py-3.5 bg-white text-primary-700 hover:bg-primary-50 font-bold text-sm rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              Chat WhatsApp CS
            </a>
          </div>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
