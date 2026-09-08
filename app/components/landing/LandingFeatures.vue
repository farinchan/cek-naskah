<script setup lang="ts">
const { getWhatsappUrl } = useAppSettings()
</script>

<template>
  <section
    id="_features_split_panel_v6_001"
    class="py-20 sm:py-24 bg-slate-50 dark:bg-neutral-900/60"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Left Panel with Image -->
        <div class="lg:col-span-5">
          <div class="bg-white dark:bg-neutral-800 rounded-3xl p-8 h-full flex flex-col shadow-sm border border-slate-200/60 dark:border-neutral-700">
            <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-2 block">
              Layanan Unggulan
            </span>
            <h2 class="text-slate-900 dark:text-white text-3xl sm:text-4xl font-bold mb-4">
              4 Solusi Utama Naskah Akademik Anda
            </h2>
            <p class="text-slate-600 dark:text-neutral-400 text-base leading-relaxed mb-6">
              Membantu skripsi, tesis, disertasi, dan draft artikel jurnal ilmiah Anda bebas plagiasi, bersih dari AI score tinggi, dan siap lolos uji publikasi nasional (Sinta) maupun internasional (Scopus).
            </p>
            <div class="rounded-2xl overflow-hidden mt-auto shadow-md">
              <img
                src="https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&amp;auto=format&amp;fit=crop&amp;q=80"
                alt="Kolaborasi Penelitian & Akademik"
                class="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
              >
            </div>
            <a
              :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin konsultasi naskah')"
              target="_blank"
              class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all duration-300 w-fit mt-6"
            >
              Konsultasi Naskah Sekarang
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Right Grid (4 cards for the 4 products) -->
        <div class="lg:col-span-7 grid sm:grid-cols-2 gap-5">
          <!-- Product 1: Cek Plagiarisme iThenticate / Turnitin -->
          <div class="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-3xl border border-primary-100 dark:border-primary-800/50 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 bg-primary-100 dark:bg-primary-800/40 rounded-xl flex items-center justify-center mb-5">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 block mb-2">
                100% No-Repository
              </span>
              <h3 class="text-slate-900 dark:text-white text-lg font-bold mb-2">
                Cek Plagiarisme iThenticate / Turnitin
              </h3>
              <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Pemeriksaan similarity index resmi standar kampus dan jurnal internasional. Laporan PDF lengkap berwarna dengan indikator sumber kemiripan teks, tanpa naskah tersimpan ke repositori.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-primary-200/50 dark:border-primary-800/40 text-xs text-primary-700 dark:text-primary-300 font-medium">
              ✓ Hasil 5–25 Menit &bull; Privasi Naskah Terjamin
            </div>
          </div>

          <!-- Product 2: AI Writer Detector Turnitin -->
          <div class="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center mb-5">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 block mb-2">
                Standar Turnitin AI
              </span>
              <h3 class="text-slate-900 dark:text-white text-lg font-bold mb-2">
                AI Writer Detector Turnitin
              </h3>
              <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Deteksi akurat persentase tulisan yang diidentifikasi sebagai generasi AI (ChatGPT, Claude, Gemini) per kalimat dan paragraf. Menjamin keaslian penulisan sebelum submit ke dosen atau reviewer.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-700 text-xs text-slate-500 dark:text-neutral-400 font-medium">
              ✓ Highlight Kalimat AI &bull; Skor Resmi Akurat
            </div>
          </div>

          <!-- Product 3: Ambil Artikel Scopus -->
          <div class="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center mb-5">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 block mb-2">
                Scopus Q1 - Q4 & IEEE
              </span>
              <h3 class="text-slate-900 dark:text-white text-lg font-bold mb-2">
                Ambil Artikel Scopus
              </h3>
              <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Layanan pencarian dan pengunduhan artikel jurnal internasional terindeks Scopus (Q1, Q2, Q3, Q4), ScienceDirect, Springer, Wiley, dan IEEE. File PDF asli beserta metadata sitasi (RIS/BibTeX).
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-700 text-xs text-slate-500 dark:text-neutral-400 font-medium">
              ✓ Full-Text PDF &bull; Mendukung Mendeley & Zotero
            </div>
          </div>

          <!-- Product 4: Parafrase Manual -->
          <div class="p-6 bg-primary-600 rounded-3xl text-white shadow-lg shadow-primary-600/30 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-primary-200 block mb-2">
                100% Editor Akademik
              </span>
              <h3 class="text-white text-lg font-bold mb-2">
                Parafrase Manual
              </h3>
              <p class="text-primary-100 text-sm leading-relaxed">
                Dikerjakan manual oleh tim editor lulusan magister/doktor tanpa bot penerjemah. Efektif menurunkan persentase kemiripan Turnitin hingga di bawah batas toleransi kampus/jurnal sesuai EYD V.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-white/20 text-xs text-primary-100 font-medium">
              ✓ Substansi Ilmiah Terjaga &bull; Garansi Lolos Target %
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
