<script setup lang="ts">
import { ref } from 'vue'

const carouselContainer = ref<HTMLElement | null>(null)

const scrollCarousel = (direction: 'prev' | 'next') => {
  if (!carouselContainer.value) return
  const scrollAmount = 360
  carouselContainer.value.scrollBy({
    left: direction === 'next' ? scrollAmount : -scrollAmount,
    behavior: 'smooth'
  })
}

const testimonials = [
  {
    name: 'Dr. Hendra Pratama, M.Si',
    role: 'Dosen & Peneliti, Universitas Indonesia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    quote: '"Cek plagiarisme iThenticate di sini sangat memuaskan, prosesnya cepat dan yang paling penting garansi no-repository membuat kami tenang saat mengirimkan draft naskah jurnal."',
    bgClass: 'bg-primary-50 dark:bg-primary-900/20'
  },
  {
    name: 'Anisa Rahmawati, S.T., M.T.',
    role: 'Kandidat Doktor, ITB Bandung',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    quote: '"Fitur AI Writer Detector Turnitin sangat presisi mendeteksi kalimat rawan AI pada naskah tesis saya. Rekomendasi perbaikannya sangat membantu!"',
    bgClass: 'bg-slate-100 dark:bg-neutral-800'
  },
  {
    name: 'Prof. Dr. Ir. Bambang Wijaya',
    role: 'Guru Besar, Universitas Gadjah Mada',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    quote: '"Layanan ambil artikel Scopus sangat memudahkan tim riset kami mengunduh literatur Q1 yang terkunci paywall secara cepat dan lengkap dengan metadata sitasi."',
    bgClass: 'bg-primary-50 dark:bg-primary-900/20'
  },
  {
    name: 'Rian Hidayat, M.Pd',
    role: 'Author Jurnal Sinta 2, Universitas Negeri Malang',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    quote: '"Layanan Parafrase Manual sukses menurunkan skor kemiripan naskah saya dari 36% menjadi 12% tanpa merubah konteks dan istilah ilmiah. Luar biasa profesional."',
    bgClass: 'bg-slate-100 dark:bg-neutral-800'
  },
  {
    name: 'drg. Fitri Lestari, Sp.KG',
    role: 'Peneliti Biomedis, Universitas Airlangga',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    quote: '"Hasil uji Turnitin dan AI detector keluar kurang dari 15 menit. Dokumen PDF rapi dan customer care via WhatsApp sangat ramah dan sigap membantu."',
    bgClass: 'bg-primary-50 dark:bg-primary-900/20'
  }
]
</script>

<template>
  <section
    id="_testimonial_shaped_cards_v6_t28_001"
    class="py-20 sm:py-24 bg-white dark:bg-neutral-950"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-14">
        <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-3 block">
          Testimoni Akademisi
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Apa Kata Dosen & Peneliti
        </h2>
        <p class="text-lg text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Pengalaman nyata para akademisi dan mahasiswa yang berhasil menerbitkan karya ilmiah bebas plagiasi.
        </p>
      </div>

      <!-- Carousel -->
      <div class="relative">
        <div
          ref="carouselContainer"
          class="flex gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar scrollbar-none"
          style="scrollbar-width: none;"
        >
          <div
            v-for="(item, index) in testimonials"
            :key="index"
            class="shrink-0 w-[320px] sm:w-[360px] p-6 rounded-3xl transition-transform hover:-translate-y-1 duration-300"
            :class="item.bgClass"
          >
            <div class="flex items-start gap-4 mb-4">
              <img
                :src="item.avatar"
                :alt="item.name"
                class="w-12 h-12 rounded-full object-cover shadow-sm"
              >
              <div>
                <h6 class="font-semibold text-slate-900 dark:text-white">
                  {{ item.name }}
                </h6>
                <p class="text-sm text-primary-600 dark:text-primary-400">
                  {{ item.role }}
                </p>
              </div>
            </div>
            <p class="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              {{ item.quote }}
            </p>
            <!-- 5 Stars -->
            <div class="flex gap-1 text-primary-500">
              <svg
                v-for="star in 5"
                :key="star"
                class="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Navigation Controls -->
        <div class="flex justify-center gap-3 mt-8">
          <button
            type="button"
            aria-label="Previous testimonial"
            class="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-800/50 flex items-center justify-center transition-colors cursor-pointer text-primary-600 dark:text-primary-400"
            @click="scrollCarousel('prev')"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            class="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-800/50 flex items-center justify-center transition-colors cursor-pointer text-primary-600 dark:text-primary-400"
            @click="scrollCarousel('next')"
          >
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
