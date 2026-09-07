<script setup lang="ts">
useSeoMeta({
  title: 'Testimoni & Pengalaman Klien — Cek Naskah',
  description: 'Pengalaman nyata dan testimoni para dosen, peneliti, dan mahasiswa di Indonesia yang menggunakan layanan Cek Plagiarisme Turnitin, AI Detector, Scopus, dan Parafrase Manual di Cek Naskah.',
  ogTitle: 'Testimoni & Pengalaman Klien — Cek Naskah',
  ogDescription: 'Ulasan dan bukti nyata integritas akademik: Cek Plagiarisme Turnitin No-Repo, AI Writer Detector, Ambil Artikel Scopus, dan Parafrase Manual.'
})

const testimonials = [
  {
    name: 'Dr. Hendra Pratama, M.Si',
    role: 'Dosen & Peneliti',
    campus: 'Universitas Indonesia',
    category: 'Cek Plagiarisme',
    service: 'iThenticate / Turnitin No-Repo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    quote: 'Cek plagiarisme iThenticate di sini sangat memuaskan. Prosesnya cepat dan yang paling penting garansi no-repository membuat kami tenang saat mengirimkan draft naskah jurnal internasional sebelum proses peer review.'
  },
  {
    name: 'Anisa Rahmawati, S.T., M.T.',
    role: 'Kandidat Doktor Teknik Elektro',
    campus: 'Institut Teknologi Bandung',
    category: 'AI Writer Detector',
    service: 'Turnitin AI Writing Score',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    quote: 'Fitur AI Writer Detector Turnitin sangat presisi mendeteksi kalimat rawan false-positive pada naskah disertasi saya. Highlight per paragrafnya membuat saya tahu persis bagian mana yang perlu diperbaiki kalimatnya.'
  },
  {
    name: 'Prof. Dr. Ir. Bambang Wijaya',
    role: 'Guru Besar Fakultas Teknik',
    campus: 'Universitas Gadjah Mada',
    category: 'Ambil Artikel Scopus',
    service: 'Jurnal Scopus Q1 Full-Text',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    quote: 'Layanan ambil artikel Scopus sangat memudahkan tim riset kami mengunduh literatur Elsevier dan IEEE yang terkunci paywall, lengkap dengan metadata sitasi RIS untuk Mendeley. Sangat menghemat waktu riset kami.'
  },
  {
    name: 'Rian Hidayat, M.Pd',
    role: 'Author Jurnal Sinta 2',
    campus: 'Universitas Negeri Malang',
    category: 'Parafrase Manual',
    service: 'Parafrase Tim Editor S2/S3',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    quote: 'Layanan Parafrase Manual sukses menurunkan skor kemiripan naskah saya dari 36% menjadi 11% tanpa merubah konteks teori dan istilah ilmiah baku. Tim editor benar-benar manusia akademisi yang paham EYD V, bukan bot spinner abal-abal.'
  },
  {
    name: 'drg. Fitri Lestari, Sp.KG',
    role: 'Peneliti Spesialis Konservasi Gigi',
    campus: 'Universitas Airlangga',
    category: 'Cek Plagiarisme',
    service: 'Turnitin Similarity Report',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    quote: 'Hasil uji Turnitin keluar tepat waktu di jam fast response. Dokumen PDF rapi dengan kode warna per sumber. Pelayanan customer care via WhatsApp sangat ramah, santun, dan langsung tanggap saat kami butuh penjelasan.'
  },
  {
    name: 'Muhammad Fajar, S.Ked',
    role: 'Dokter Muda / Mahasiswa Profesi',
    campus: 'Universitas Diponegoro',
    category: 'AI Writer Detector',
    service: 'Deteksi AI Writer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    quote: 'Naskah tinjauan pustaka saya sempat dicurigai dosen pembimbing karena gaya bahasa terlalu kaku. Setelah dicek dengan AI Detector Turnitin di Cek Naskah, kami tahu kalimat mana saja yang ambigu dan berhasil merevisinya sampai lolos 4%.'
  },
  {
    name: 'Dr. Dian Kusuma, S.E., M.M.',
    role: 'Dosen Manajemen Keuangan',
    campus: 'Universitas Padjadjaran',
    category: 'Parafrase Manual',
    service: 'Parafrase Naskah Disertasi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    quote: 'Editor Cek Naskah sangat memahami istilah teknis perbankan dan ekonometrika. Kalimat disusun ulang dengan variasi struktur kalimat aktif-pasif yang elegan. Hasilnya langsung disetujui promotor tanpa revisi plagiasi lanjutan.'
  },
  {
    name: 'Nadia Putri Utami, S.Kom',
    role: 'Lulusan Ilmu Komputer',
    campus: 'Universitas Brawijaya',
    category: 'Cek Plagiarisme',
    service: 'Garansi No-Repository',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    quote: 'Garansi 100% No-Repository benar-benar terbukti nyata! Ketika naskah skripsi saya diunggah ulang ke Turnitin resmi perpustakaan kampus dua hari kemudian, skor similarity tetap sama dan tidak menjadi 100%. Sangat terpercaya!'
  },
  {
    name: 'Ir. Ahmad Syarifuddin, Ph.D',
    role: 'Peneliti Bidang Energi Terbarukan',
    campus: 'Institut Teknologi Sepuluh Nopember',
    category: 'Ambil Artikel Scopus',
    service: 'Scopus Q1 Springer & Wiley',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    quote: 'Bantuan legalitas pengunduhan paper internasional dari Springer dan Wiley sangat cepat. File PDF beresolusi tajam lengkap dengan metadata BibTeX. Layanan ini sangat membantu riset publikasi kami di jurnal internasional bereputasi.'
  },
  {
    name: 'Siti Nurhaliza, S.Farm., Apt.',
    role: 'Mahasiswi Magister Farmasi Bahan Alam',
    campus: 'Universitas Andalas',
    category: 'Parafrase Manual',
    service: 'Parafrase Manual Tesis',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    quote: 'Sebelumnya saya ragu memakai jasa parafrase karena takut maknanya berubah. Tapi di Cek Naskah, nama latin tanaman obat dan metode ekstraksi tetap terjaga utuh. Skor kemiripan turun drastis dan saya bisa daftar sidang tepat waktu.'
  },
  {
    name: 'Wahyu Pratama, S.H., M.H.',
    role: 'Peneliti Hukum Agraria',
    campus: 'Universitas Hasanuddin',
    category: 'Cek Plagiarisme',
    service: 'Cek Turnitin Mahasiswa S2',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    quote: 'Laporan similarity report berformat PDF berwarna yang diberikan sangat detail. Pasal undang-undang dan rujukan putusan mahkamah teridentifikasi dengan jelas. Sangat transparan dan profesional.'
  },
  {
    name: 'Kevin Sanjaya, M.T.',
    role: 'Author Konferensi Internasional',
    campus: 'Telkom University',
    category: 'AI Writer Detector',
    service: 'Evaluasi Turnitin AI',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    quote: 'Laporan deteksi AI dilengkapi persentase dan highlight spesifik per baris teks. Setelah merevisi bagian yang disorot, paper kami akhirnya lolos seleksi reviewer konferensi IEEE tanpa catatan AI.'
  }
]
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
                <span class="block text-base font-black text-slate-900 dark:text-white">4.9 / 5.0</span>
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
          <!-- Masonry Grid Layout via CSS Columns -->
          <div class="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            <div
              v-for="(item, idx) in testimonials"
              :key="idx"
              class="break-inside-avoid mb-6 p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-800 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <!-- Top Row: Service Tag & Stars -->
                <div class="flex items-center justify-between gap-2 mb-4">
                  <span class="px-2.5 py-1 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-semibold">
                    {{ item.category }}
                  </span>
                  <div class="flex text-amber-400 text-sm tracking-widest">
                    ★★★★★
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
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Cek%20Naskah,%20saya%20ingin%20konsultasi"
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
