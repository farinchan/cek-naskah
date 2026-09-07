<template>
  <section
    id="_hero_workflow_platform_v6_001"
    class="py-20 sm:py-24 bg-white dark:bg-neutral-950"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Asymmetric Split Layout -->
      <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        <!-- Left Content - Wider -->
        <div class="lg:col-span-7 space-y-8">
          <div class="space-y-6">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              <span>Solusi Naskah </span>
              <span class="text-primary-600 dark:text-primary-400">Akademik</span>,
              <span> Bebas </span>
              <span class="text-primary-600 dark:text-primary-400">Plagiasi</span>
            </h1>

            <p class="text-lg text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              Layanan terpercaya untuk mahasiswa, dosen, dan peneliti: Cek Plagiarisme iThenticate & Turnitin No-Repository, AI Writer Detector, Ambil Artikel Scopus, hingga Parafrase Manual profesional.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <NuxtLink
                to="/login"
                class="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary-600/25 hover:gap-3"
              >
                Mulai Cek Sekarang
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
              </NuxtLink>
              <a
                href="#_features_split_panel_v6_001"
                class="px-8 py-3.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-900 dark:text-white font-semibold rounded-full transition-colors"
              >
                Lihat 4 Layanan
              </a>
            </div>
          </div>

          <!-- Dashboard Preview -->
          <div class="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 p-2 border border-slate-200/60 dark:border-neutral-800 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&amp;auto=format&amp;fit=crop&amp;q=80"
              alt="Pemeriksaan Naskah Akademik"
              class="w-full h-64 sm:h-80 object-cover rounded-xl"
            >

            <!-- Floating Metrics -->
            <div class="absolute top-6 right-6 p-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 dark:border-neutral-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg
                    class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <span class="text-lg font-bold text-slate-900 dark:text-white block">100% Aman</span>
                  <span class="text-xs text-slate-500 dark:text-neutral-400">Garansi No-Repository</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Feature Cards - 4 Core Products -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Product Card 1: Cek Plagiarisme iThenticate/Turnitin -->
          <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-slate-100 dark:border-neutral-800/80 hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-5 h-5 text-primary-600 dark:text-primary-400"
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
              <div>
                <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  Cek Plagiarisme iThenticate / Turnitin
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  Pemeriksaan similarity index resmi dengan garansi 100% No Repository. Naskah tidak tersimpan di database sistem.
                </p>
              </div>
            </div>
          </div>

          <!-- Product Card 2: AI Writer Detector Turnitin -->
          <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-slate-100 dark:border-neutral-800/80 hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-5 h-5 text-primary-600 dark:text-primary-400"
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
              <div>
                <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  AI Writer Detector Turnitin
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  Deteksi tulisan generator AI (ChatGPT, Claude, Gemini) berstandar algoritma Turnitin terbaru untuk menjaga orisinalitas riset.
                </p>
              </div>
            </div>
          </div>

          <!-- Product Card 3: Ambil Artikel Scopus -->
          <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-slate-100 dark:border-neutral-800/80 hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-5 h-5 text-primary-600 dark:text-primary-400"
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
              <div>
                <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  Ambil Artikel Scopus
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  Bantuan unduh artikel jurnal ilmiah Scopus (Q1–Q4), IEEE, Springer, dan ScienceDirect full PDF lengkap dengan metadata sitasi.
                </p>
              </div>
            </div>
          </div>

          <!-- Product Card 4: Parafrase Manual -->
          <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-slate-100 dark:border-neutral-800/80 hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-5 h-5 text-primary-600 dark:text-primary-400"
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
              <div>
                <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  Parafrase Manual
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  Dikerjakan manual oleh tim editor akademik berpengalaman. Menurunkan similarity index tanpa mengubah substansi ilmiah dan istilah baku.
                </p>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-3 gap-3 pt-2">
            <div class="text-center p-3 sm:p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block">25K+</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400">Naskah Diuji</span>
            </div>
            <div class="text-center p-3 sm:p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block">100%</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400">No-Repository</span>
            </div>
            <div class="text-center p-3 sm:p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block">&lt; 15 Mnt</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400">Proses Cepat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
