<script setup lang="ts">
useSeoMeta({
  title: 'Tarif Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia — Cek Naskah',
  description: 'Daftar tarif resmi Cek Plagiasi & AI No. 1 di Indonesia: Turnitin No-Repo (Rp 15.000), AI Writer Detector (Rp 20.000), Ambil Artikel Scopus (Rp 10.000), dan Parafrase Manual.',
  ogTitle: 'Tarif Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia — Cek Naskah',
  ogDescription: 'Tarif hemat dan transparan Cek Plagiasi & AI No. 1 di Indonesia dengan garansi 100% No-Repository untuk mahasiswa dan akademisi.',
  ogType: 'website',
  ogUrl: 'https://cek-naskah.web.id/charge',
  ogImage: 'https://cek-naskah.web.id/logo.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tarif Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia — Cek Naskah',
  twitterDescription: 'Daftar tarif resmi Cek Plagiasi & AI No. 1 di Indonesia: Turnitin No-Repo, AI Detector, Scopus, dan Parafrase.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://cek-naskah.web.id/charge' }
  ]
})

useSchemaOrg([
  defineWebPage({
    name: 'Tarif Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di Indonesia — Cek Naskah',
    description: 'Daftar tarif resmi layanan Cek Plagiasi & AI Turnitin / iThenticate No. 1 di Indonesia dengan garansi 100% No-Repository.'
  })
])

const { getWhatsappUrl } = useAppSettings()
const { activeServices, activeBundles } = useServices()
const { formatPriceToPoints, openTopupModal, user, userPoints } = usePoints()

const pricingPlans = computed(() => {
  return activeServices.value.map(s => ({
    ...s,
    badgeClass: s.badgeClass || (s.highlight ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'),
    ctaLink: s.ctaLink || getWhatsappUrl(`Halo Admin Cek Naskah, saya ingin pesan ${s.name}`)
  }))
})

const bundlePlans = computed(() => {
  return activeBundles.value.map(b => ({
    ...b,
    link: b.ctaLink || getWhatsappUrl(`Halo Admin Cek Naskah, saya ingin pesan ${b.title}`)
  }))
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1">
      <!-- Hero Section -->
      <section class="py-16 sm:py-24 bg-slate-50/70 dark:bg-neutral-900/40 border-b border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-5 max-w-4xl mx-auto">
            Biaya Layanan <span class="text-primary-600 dark:text-primary-400">Cek Naskah</span> Akademik
          </h1>
          <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Daftar tarif resmi 4 produk unggulan kami: Cek Plagiarisme iThenticate/Turnitin No-Repo, AI Writer Detector, Ambil Artikel Scopus, dan Parafrase Manual.
          </p>

          <!-- Point Currency Info Banner -->
          <div class="mt-8 max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🪙</span>
              <div>
                <div class="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Pembayaran Praktis dengan Sistem Poin (1 Poin = Rp 1)
                </div>
                <div class="text-[11px] text-amber-700/80 dark:text-amber-400">
                  Semua layanan dapat dipesan langsung menggunakan saldo poin akun Anda.
                </div>
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              @click="openTopupModal"
            >
              <span v-if="user">Saldo: {{ userPoints }} Poin</span>
              <span v-else>Info Poin / Top Up</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 4 Core Products Pricing -->
      <section class="py-16 sm:py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(plan, idx) in pricingPlans"
              :key="idx"
              class="rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative border"
              :class="plan.highlight
                ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-600/25 lg:-translate-y-2'
                : 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white border-slate-200/80 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-800 shadow-sm'"
            >
              <div
                v-if="plan.highlight"
                class="absolute -top-3 left-6 bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm"
              >
                Rekomendasi
              </div>

              <div>
                <div class="mb-4">
                  <span
                    class="text-xs font-bold uppercase tracking-wider mb-2 block"
                    :class="plan.highlight ? 'text-primary-200' : 'text-primary-600 dark:text-primary-400'"
                  >
                    {{ plan.tag }}
                  </span>
                  <h2
                    class="text-lg font-bold"
                    :class="plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'"
                  >
                    {{ plan.name }}
                  </h2>
                </div>

                <!-- Price -->
                <div
                  class="mb-4 pb-4 border-b"
                  :class="plan.highlight ? 'border-white/20' : 'border-slate-200 dark:border-neutral-800'"
                >
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {{ plan.price }}
                    </span>
                    <span
                      class="text-xs"
                      :class="plan.highlight ? 'text-primary-100' : 'text-slate-500 dark:text-neutral-400'"
                    >
                      {{ plan.unit }}
                    </span>
                  </div>
                  <!-- Point Equivalent Badge -->
                  <div class="mt-2 flex items-center gap-1.5">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs"
                      :class="plan.highlight
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60'"
                    >
                      <span>🪙</span>
                      <span>{{ formatPriceToPoints(plan.price) }}</span>
                    </span>
                    <span
                      class="text-[11px]"
                      :class="plan.highlight ? 'text-primary-200' : 'text-slate-400 dark:text-neutral-500'"
                    >
                      (Setara poin)
                    </span>
                  </div>
                  <p
                    class="text-xs mt-2.5 leading-relaxed"
                    :class="plan.highlight ? 'text-primary-100' : 'text-slate-600 dark:text-neutral-400'"
                  >
                    {{ plan.description }}
                  </p>
                </div>

                <!-- Features list -->
                <ul class="space-y-2.5 mb-6 text-xs sm:text-sm">
                  <li
                    v-for="(feat, fIdx) in plan.features"
                    :key="fIdx"
                    class="flex items-start gap-2.5"
                  >
                    <svg
                      class="w-4 h-4 shrink-0 mt-0.5"
                      :class="plan.highlight ? 'text-amber-300' : 'text-primary-600 dark:text-primary-400'"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span :class="plan.highlight ? 'text-primary-50' : 'text-slate-700 dark:text-neutral-300'">
                      {{ feat }}
                    </span>
                  </li>
                </ul>
              </div>

              <!-- Action CTA -->
              <button
                v-if="!plan.active"
                type="button"
                disabled
                class="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                :class="plan.highlight
                  ? 'bg-white/30 text-white'
                  : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'"
              >
                <span>Tidak Tersedia</span>
                <UIcon
                  name="i-lucide-ban"
                  class="w-4 h-4"
                />
              </button>
              <NuxtLink
                v-else
                :to="plan.ctaLink"
                :target="plan.ctaLink && plan.ctaLink.startsWith('http') ? '_blank' : undefined"
                :rel="plan.ctaLink && plan.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined"
                class="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-2"
                :class="plan.highlight
                  ? 'bg-white text-primary-700 hover:bg-primary-50 shadow-md'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20'"
              >
                <span>{{ plan.ctaText }}</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Bundling Packages -->
      <section class="py-16 bg-slate-50 dark:bg-neutral-900/60 border-y border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Paket Bundling Lebih Hemat
            </h2>
            <p class="text-sm text-slate-600 dark:text-neutral-400">
              Kombinasi layanan pemeriksaan komprehensif untuk draft skripsi, tesis, disertasi, dan artikel jurnal ilmiah Anda.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div
              v-for="(bundle, bIdx) in bundlePlans"
              :key="bIdx"
              class="p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    {{ bundle.saving }}
                  </span>
                  <div class="text-right">
                    <span class="text-2xl font-black text-slate-900 dark:text-white block">
                      {{ bundle.price }}
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-extrabold mt-1 shadow-xs">
                      <span>🪙</span>
                      <span>{{ formatPriceToPoints(bundle.price) }}</span>
                    </span>
                  </div>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {{ bundle.title }}
                </h3>
                <p class="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mb-5">
                  {{ bundle.desc }}
                </p>

                <ul class="space-y-2 mb-6">
                  <li
                    v-for="(item, iIdx) in bundle.items"
                    :key="iIdx"
                    class="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-neutral-300"
                  >
                    <svg
                      class="w-4 h-4 text-emerald-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <button
                v-if="!bundle.active"
                type="button"
                disabled
                class="w-full py-3 px-4 bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 rounded-xl text-xs sm:text-sm font-semibold text-center transition-colors cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
              >
                <span>Tidak Tersedia</span>
                <UIcon
                  name="i-lucide-ban"
                  class="w-4 h-4"
                />
              </button>
              <NuxtLink
                v-else
                :to="bundle.link"
                :target="bundle.link && bundle.link.startsWith('http') ? '_blank' : undefined"
                :rel="bundle.link && bundle.link.startsWith('http') ? 'noopener noreferrer' : undefined"
                class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-slate-900 rounded-xl text-xs sm:text-sm font-semibold text-center transition-colors cursor-pointer"
              >
                Pilih Paket Ini
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Help & FAQ Link -->
      <section class="py-14 bg-white dark:bg-neutral-950 text-center">
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ada Pertanyaan Seputar Layanan Kami?
          </h3>
          <p class="text-sm text-slate-600 dark:text-neutral-400 mb-6">
            Temukan jawaban lengkap mengenai jaminan No-Repository, keaslian dokumen Scopus, waktu pengerjaan, dan ketentuan garansi revisi.
          </p>
          <NuxtLink
            to="/about-us#faq"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 bg-slate-50 dark:bg-neutral-900 text-primary-600 dark:text-primary-400 font-semibold text-sm transition-colors"
          >
            <span>Lihat Pertanyaan yang Sering Diajukan (FAQ)</span>
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </NuxtLink>
        </div>
      </section>

      <!-- Bottom Guarantee Banner -->
      <section class="py-12 bg-primary-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold mb-1">
              Punya Naskah yang Perlu Segera Diperiksa?
            </h2>
            <p class="text-primary-100 text-sm">
              Hubungi tim kami via WhatsApp sekarang. Layanan aktif 24 jam dengan fast response pukul 08:00 - 21:00 WIB.
            </p>
          </div>
          <a
            :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin konsultasi layanan')"
            target="_blank"
            class="shrink-0 px-6 py-3.5 bg-white text-primary-700 hover:bg-primary-50 font-bold text-sm rounded-xl transition-colors shadow-lg cursor-pointer"
          >
            Hubungi Admin WhatsApp
          </a>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
