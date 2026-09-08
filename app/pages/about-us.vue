<script setup lang="ts">
const { getWhatsappUrl } = useAppSettings()

useSeoMeta({
  title: 'Tentang Kami — Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia',
  description: 'Mengenal Cek Naskah: Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia dengan garansi 100% No-Repository, standar EYD V, dan editor manusia lulusan pascasarjana.',
  ogTitle: 'Tentang Kami — Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia',
  ogDescription: 'Platform Cek Plagiasi & AI No. 1 di Indonesia: Uji Turnitin resmi akurat, AI Writer Detector, Scopus, dan Parafrase Manual.',
  ogType: 'website',
  ogUrl: 'https://cek-naskah.web.id/about-us',
  ogImage: 'https://cek-naskah.web.id/logo.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tentang Kami — Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia',
  twitterDescription: 'Mengenal Cek Naskah: Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia untuk integritas karya ilmiah.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://cek-naskah.web.id/about-us' }
  ]
})

useSchemaOrg([
  defineWebPage({
    name: 'Tentang Kami — Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia',
    description: 'Profil dan standar integritas akademik Platform Cek Plagiasi & AI Turnitin/iThenticate No. 1 di Indonesia.'
  })
])

const values = [
  {
    title: 'Garansi 100% No-Repository',
    desc: 'Kami menjamin setiap naskah yang diperiksa tidak akan tersimpan di repositori database Turnitin publik mana pun, menjaga hak cipta dan orisinalitas karya Anda.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    title: 'Editor Manusia Profesional',
    desc: 'Layanan parafrase kami dikerjakan langsung oleh lulusan magister (S2) dan doktor (S3) dari perguruan tinggi terkemuka, bukan menggunakan bot penerjemah otomatis.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    title: 'Kecepatan & Responsivitas',
    desc: 'Layanan uji Turnitin dan AI detector diproses dalam waktu 5–25 menit dengan customer care yang aktif setiap hari melalui WhatsApp.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    title: 'Standar Mutu EYD V & Ilmiah',
    desc: 'Mengikuti pedoman Ejaan Bahasa Indonesia yang Disempurnakan (EYD V), kaidah PUEBI, dan format penulisan jurnal internasional bereputasi.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  }
]

const stats = [
  { value: '25.000+', label: 'Naskah Diperiksa' },
  { value: '120+', label: 'Kampus & Lembaga Riset' },
  { value: '99.8%', label: 'Tingkat Kepuasan' },
  { value: '100%', label: 'Garansi No-Repository' }
]

const services = [
  {
    number: '01',
    name: 'Cek Plagiarisme iThenticate / Turnitin',
    desc: 'Pemeriksaan similarity index resmi menggunakan software standar universitas dunia. Menghasilkan laporan lengkap berformat PDF berwarna yang menunjukkan rincian persentase kemiripan dan sumber sitasi.'
  },
  {
    number: '02',
    name: 'AI Writer Detector Turnitin',
    desc: 'Evaluasi probabilitas naskah yang ditulis oleh AI generatif (seperti ChatGPT, Claude, Gemini) untuk memastikan tulisan Anda lolos seleksi review jurnal nasional maupun internasional.'
  },
  {
    number: '03',
    name: 'Ambil Artikel Scopus (Q1 - Q4)',
    desc: 'Bantuan legal unduh artikel jurnal ilmiah internasional yang terkunci paywall di Scopus, IEEE Xplore, ScienceDirect, Springer, dan Wiley lengkap dengan berkas metadata sitasi.'
  },
  {
    number: '04',
    name: 'Parafrase Manual oleh Tim Editor Akademik',
    desc: 'Penyusunan ulang struktur kalimat untuk menurunkan similarity index tanpa mengubah makna, definisi, dan terminologi teknis bidang studi Anda.'
  }
]

const activeFaq = ref<number | null>(null)

const toggleFaq = (idx: number) => {
  activeFaq.value = activeFaq.value === idx ? null : idx
}

const faqs = [
  {
    q: 'Apakah naskah saya aman dan tidak tersimpan di repositori Turnitin?',
    a: 'Ya, 100% dijamin aman. Seluruh akun Turnitin dan iThenticate resmi kami berstatus No-Repository (Standard Repository dinonaktifkan). Naskah Anda tidak akan tersimpan di database publik Turnitin, sehingga tidak akan memicu similarity 100% saat diuji kembali di universitas Anda.'
  },
  {
    q: 'Bagaimana cara kerja AI Writer Detector Turnitin?',
    a: 'AI Writer Detector mengevaluasi pola konsistensi bahasa, perplexity, dan burstiness untuk mendeteksi probabilitas teks hasil buatan AI generatif seperti ChatGPT, Claude, dan Gemini. Hasil pemeriksaan berupa skor persentase AI beserta penandaan (highlight) paragraf terkait.'
  },
  {
    q: 'Bagaimana legalitas dan kelengkapan unduh artikel Scopus?',
    a: 'Kami membantu mengunduh artikel jurnal internasional resmi full-text PDF beresolusi tinggi langsung dari database penerbit bereputasi (Elsevier/ScienceDirect, Springer, IEEE, Wiley, dll.) yang terkunci paywall, lengkap dengan file referensi sitasi (.ris / .bib).'
  },
  {
    q: 'Apakah layanan parafrase manual benar-benar dikerjakan oleh manusia?',
    a: 'Benar, 100% dikerjakan secara manual oleh tim editor akademik manusia lulusan magister (S2) dan doktor (S3) sesuai rumpun ilmu naskah Anda. Kami tidak menggunakan software atau bot parafrase otomatis, sehingga substansi materi, terminologi ilmiah, dan kaidah EYD V tetap terjaga.'
  },
  {
    q: 'Berapa lama estimasi waktu pengerjaan untuk setiap layanan?',
    a: 'Pemeriksaan Turnitin dan AI Detector selesai dalam waktu 5–25 menit setelah konfirmasi berkas. Pengambilan artikel Scopus memakan waktu 5–20 menit. Sedangkan parafrase manual memerlukan waktu 1–3 hari kerja tergantung ketebalan naskah dan target penurunan similarity.'
  },
  {
    q: 'Apakah Cek Naskah melayani 24 jam dan kapan jam fast response-nya?',
    a: 'Ya, sistem penerimaan berkas kami aktif 24 jam non-stop setiap hari. Jam Fast Response aktif pada pukul 08:00 – 21:00 WIB di mana admin dan editor standby memproses naskah dalam hitungan menit. Berkas yang dikirim di luar jam tersebut (21:00 – 08:00 WIB) tetap kami terima dan diproses berkala oleh admin jaga malam atau menjadi antrean prioritas mulai pukul 08:00 WIB pagi.'
  },
  {
    q: 'Apakah ada garansi revisi jika hasil parafrase belum memenuhi target?',
    a: 'Tentu, kami menyediakan garansi revisi gratis tanpa biaya tambahan hingga naskah Anda mencapai target toleransi similarity yang ditentukan oleh fakultas, pascasarjana, atau jurnal tujuan.'
  },
  {
    q: 'Metode pembayaran apa saja yang diterima?',
    a: 'Kami menerima pembayaran instan melalui QRIS (bisa dari semua e-wallet: GoPay, OVO, Dana, ShopeePay, dan mobile banking) serta transfer bank langsung (BCA, Mandiri, BNI, BRI).'
  }
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1">
      <!-- Hero Section -->
      <section class="py-16 sm:py-24 bg-slate-50/70 dark:bg-neutral-900/40 border-b border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Mitra Tepercaya Riset & <span class="text-primary-600 dark:text-primary-400">Integritas Akademik</span> Indonesia
          </h1>
          <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Cek Naskah didirikan dengan komitmen mendampingi para akademisi, dosen, peneliti, dan mahasiswa di seluruh Indonesia untuk menghasilkan karya ilmiah orisinal, terbebas dari jeratan plagiarisme, dan siap menembus jurnal bereputasi.
          </p>
        </div>
      </section>

      <!-- Stats Bar -->
      <section class="py-12 bg-white dark:bg-neutral-950 border-b border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              v-for="(stat, idx) in stats"
              :key="idx"
              class="p-6 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 text-center"
            >
              <span class="text-3xl sm:text-4xl font-black text-primary-600 dark:text-primary-400 block mb-1">
                {{ stat.value }}
              </span>
              <span class="text-xs sm:text-sm font-medium text-slate-600 dark:text-neutral-400">
                {{ stat.label }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4 Pillars of Services -->
      <section class="py-16 sm:py-20 bg-slate-50 dark:bg-neutral-900/60 border-y border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-2 block">
              Fokus Kami
            </span>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              4 Layanan Utama Cek Naskah
            </h2>
            <p class="text-slate-600 dark:text-neutral-400 text-sm sm:text-base">
              Setiap layanan dirancang secara spesifik untuk menjawab tantangan penulisan dan publikasi artikel ilmiah modern.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div
              v-for="(srv, sIdx) in services"
              :key="sIdx"
              class="p-7 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex items-start gap-5"
            >
              <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shrink-0">
                {{ srv.number }}
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {{ srv.name }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  {{ srv.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Values -->
      <section class="py-16 sm:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-2 block">
              Nilai Utama
            </span>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Komitmen Integritas & Kualitas
            </h2>
            <p class="text-slate-600 dark:text-neutral-400 text-sm sm:text-base">
              Prinsip-prinsip yang kami junjung tinggi dalam setiap proses penanganan naskah Anda.
            </p>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(val, vIdx) in values"
              :key="vIdx"
              class="p-6 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="val.icon"
                    />
                  </svg>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white text-base mb-2">
                  {{ val.title }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  {{ val.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Operating Hours & Fast Response Section -->
      <section class="py-16 sm:py-24 bg-slate-50 dark:bg-neutral-900/60 border-t border-slate-100 dark:border-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-2 block">
              Jam Operasional & Layanan
            </span>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Layanan 24 Jam & Jam Fast Response
            </h2>
            <p class="text-slate-600 dark:text-neutral-400 text-sm sm:text-base">
              Kami memahami kebutuhan tugas akhir dan tenggat publikasi riset tidak mengenal waktu. Tim Cek Naskah siap membantu Anda kapan saja.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
            <!-- Prime Hours (Fast Response) -->
            <div class="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-primary-200 dark:border-primary-900/60 shadow-lg shadow-primary-500/5 relative flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Fast Response
                  </span>
                  <div class="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    CS & Editor Standby
                  </div>
                </div>

                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  08:00 – 21:00 WIB
                </h3>
                <p class="text-xs text-primary-600 dark:text-primary-400 font-semibold mb-4">
                  Setiap Hari (Senin – Minggu termasuk Hari Libur)
                </p>

                <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed mb-6">
                  Waktu respon admin dan tim editor super cepat. Sangat direkomendasikan jika Anda membutuhkan laporan instan untuk bimbingan atau submit sidang hari ini.
                </p>

                <ul class="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
                  <li class="flex items-start gap-2.5">
                    <svg
                      class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
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
                    <span>Cek Turnitin & AI Detector: <strong>5 – 25 Menit</strong></span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <svg
                      class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
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
                    <span>Pengambilan Artikel Scopus: <strong>5 – 20 Menit</strong></span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <svg
                      class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
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
                    <span>Konsultasi parafrase manual langsung ditinjau</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 24-Hour Service (Night Shift) -->
            <div class="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="px-3 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Layanan 24 Jam
                  </span>
                  <span class="text-xs font-medium text-slate-500 dark:text-neutral-400">
                    Penerimaan Non-Stop
                  </span>
                </div>

                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  21:00 – 08:00 WIB
                </h3>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold mb-4">
                  Night Hours / Luar Jam Utama
                </p>

                <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed mb-6">
                  Naskah yang Anda kirim tetap kami terima 24 jam penuh dan langsung masuk antrean sistem otomatis. Anda tidak perlu menunggu pagi untuk mengirim berkas.
                </p>

                <ul class="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
                  <li class="flex items-start gap-2.5">
                    <svg
                      class="w-4 h-4 text-primary-500 shrink-0 mt-0.5"
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
                    <span>Penerimaan berkas & submit via WhatsApp aktif 24 jam</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <svg
                      class="w-4 h-4 text-primary-500 shrink-0 mt-0.5"
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
                    <span>Diproses berkala oleh admin jaga malam</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <svg
                      class="w-4 h-4 text-primary-500 shrink-0 mt-0.5"
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
                    <span>Jaminan antrean prioritas awal pukul 08:00 WIB pagi</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Operational Info Bar -->
          <div class="max-w-4xl mx-auto p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p class="text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
                <strong>Ingin cek naskah sekarang?</strong> Kirimkan dokumen Anda kapan saja, tim kami siap melayani sesuai jadwal operasional.
              </p>
            </div>
            <a
              :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin cek naskah')"
              target="_blank"
              class="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Hubungi Admin WhatsApp
            </a>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section
        id="faq"
        class="py-16 sm:py-24 bg-slate-50 dark:bg-neutral-900/50 border-t border-slate-100 dark:border-neutral-900"
      >
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-2 block">
              FAQ & Bantuan
            </span>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p class="text-slate-600 dark:text-neutral-400 text-sm sm:text-base">
              Informasi lengkap seputar keamanan data, keaslian laporan, dan jaminan kualitas layanan Cek Naskah.
            </p>
          </div>

          <div class="space-y-3.5">
            <div
              v-for="(faq, fIdx) in faqs"
              :key="fIdx"
              class="border border-slate-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm transition-colors"
            >
              <button
                type="button"
                class="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
                @click="toggleFaq(fIdx)"
              >
                <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                  {{ faq.q }}
                </span>
                <div
                  class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 transition-transform duration-200"
                  :class="activeFaq === fIdx ? 'rotate-180 bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400' : 'text-slate-400'"
                >
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              <div
                v-if="activeFaq === fIdx"
                class="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed border-t border-slate-100 dark:border-neutral-800/80"
              >
                {{ faq.a }}
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
              Tim admin dan editor kami siap membantu kebutuhan skripsi, tesis, disertasi, dan artikel jurnal Anda.
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
