<script setup lang="ts">
import type { ManuscriptRow, ExcludeOptions } from '~/composables/useManuscripts'
import { defaultExcludeOptions } from '~/composables/useManuscripts'

useSeoMeta({
  title: 'Riwayat Naskah — Cek Naskah',
  description: 'Daftar lengkap riwayat pengajuan naskah dan dokumen pemeriksaan Turnitin, iThenticate, dan Turnitin AI.',
  ogTitle: 'Riwayat Naskah — Cek Naskah',
  ogDescription: 'Pantau status pengerjaan, periksa skor kemiripan atau skor AI, dan unduh laporan hasil PDF resmi untuk semua naskah Anda.',
  robots: 'noindex, nofollow'
})

// Composables
const { user } = useAuth()
const { services, fetchServices } = useServices()
const {
  manuscripts,
  loading: manuscriptsLoading,
  formatFileSize,
  getStatusBadge,
  fetchUserManuscripts
} = useManuscripts()

// View State
const viewMode = ref<'table' | 'cards'>('table')
const searchQuery = ref('')
const serviceFilter = ref('all')
const statusFilter = ref('all')

// Detail Modal State
const isDetailModalOpen = ref(false)
const selectedManuscript = ref<ManuscriptRow | null>(null)

// Custom Service Options interface for parsing JSON
interface CustomServiceOptions {
  language?: string
  languageLabel?: string
  languageNative?: string
  [key: string]: unknown
}

const parseOptions = (raw?: string): ExcludeOptions => {
  if (!raw) return { ...defaultExcludeOptions }
  try {
    return JSON.parse(raw) as ExcludeOptions
  } catch {
    return { ...defaultExcludeOptions }
  }
}

const parseRawOptions = (raw?: string): CustomServiceOptions => {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as CustomServiceOptions
  } catch {
    return {}
  }
}

// Helpers
const formatDate = (isoStr: string): string => {
  if (!isoStr) return '-'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoStr
  }
}

const getServiceMeta = (serviceId: string) => {
  if (serviceId === 'turnitin-similarity') {
    return {
      name: 'Turnitin Similarity',
      badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      icon: 'i-lucide-file-check',
      isAi: false
    }
  }
  if (serviceId === 'turnitin-plagiarism') {
    return {
      name: 'iThenticate Plagiarism',
      badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      icon: 'i-lucide-shield-check',
      isAi: false
    }
  }
  if (serviceId === 'turnitin-ai') {
    return {
      name: 'Turnitin AI Detector',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      icon: 'i-lucide-sparkles',
      isAi: true
    }
  }
  return {
    name: serviceId,
    badgeClass: 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border-primary-200 dark:border-primary-900',
    icon: 'i-lucide-file-text',
    isAi: false
  }
}

// Open Detail Modal
const openDetailModal = (item: ManuscriptRow) => {
  selectedManuscript.value = item
  isDetailModalOpen.value = true
}

// Load data on mounted or user login
onMounted(async () => {
  await fetchServices()
  if (user.value?.$id) {
    await fetchUserManuscripts()
  }
})

watch(
  () => user.value?.$id,
  async (newId) => {
    if (newId) {
      await fetchUserManuscripts()
    }
  }
)

const handleRefresh = async () => {
  if (user.value?.$id) {
    await fetchUserManuscripts()
  }
}

// Computed: Filtered manuscripts
const filteredManuscripts = computed(() => {
  let list = manuscripts.value || []

  // Service Filter
  if (serviceFilter.value !== 'all') {
    list = list.filter(m => m.serviceId === serviceFilter.value)
  }

  // Status Filter
  if (statusFilter.value !== 'all') {
    list = list.filter(m => (m.status || 'pending') === statusFilter.value)
  }

  // Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((m) => {
      const matchTitle = m.title?.toLowerCase().includes(q)
      const matchFile = m.fileName?.toLowerCase().includes(q)
      const matchId = m.$id?.toLowerCase().includes(q)
      const matchService = m.serviceName?.toLowerCase().includes(q)
      return matchTitle || matchFile || matchId || matchService
    })
  }

  return list
})

// Metrics summary
const metrics = computed(() => {
  const total = manuscripts.value?.length || 0
  const completed = manuscripts.value?.filter(m => m.status === 'completed').length || 0
  const processing = manuscripts.value?.filter(m => m.status === 'processing').length || 0
  const pending = manuscripts.value?.filter(m => !m.status || m.status === 'pending').length || 0
  const cancelled = manuscripts.value?.filter(m => m.status === 'cancelled').length || 0

  return {
    total,
    completed,
    processing,
    pending,
    cancelled
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col font-sans">
    <!-- Header Navigation -->
    <LandingHeader />

    <!-- Main Content Area -->
    <main class="flex-1 py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <!-- 1. BREADCRUMBS & TOP BAR -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-neutral-800">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400">
              <NuxtLink
                to="/"
                class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Beranda
              </NuxtLink>
              <span>/</span>
              <span class="text-slate-800 dark:text-white font-bold">Riwayat Naskah</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span class="w-9 h-9 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <UIcon
                  name="i-lucide-file-clock"
                  class="w-5 h-5"
                />
              </span>
              <span>Riwayat Pengajuan Naskah</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-2xl">
              Pantau status pengerjaan, periksa skor kemiripan atau skor AI, dan unduh laporan hasil PDF resmi untuk semua naskah yang telah Anda ajukan.
            </p>
          </div>

          <!-- Top Right Action Buttons -->
          <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              :disabled="manuscriptsLoading"
              @click="handleRefresh"
            >
              <UIcon
                name="i-lucide-refresh-cw"
                class="w-3.5 h-3.5"
                :class="{ 'animate-spin': manuscriptsLoading }"
              />
              <span>Segarkan</span>
            </button>

            <!-- Quick Upload Dropdown / Links -->
            <NuxtLink
              to="/turnitin"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-colors"
            >
              <UIcon
                name="i-lucide-plus"
                class="w-3.5 h-3.5"
              />
              <span>Unggah Naskah Baru</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 2. LOGIN BANNER (IF NOT LOGGED IN) -->
        <div
          v-if="!user"
          class="rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-8 text-center space-y-4"
        >
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <UIcon
              name="i-lucide-lock"
              class="w-7 h-7"
            />
          </div>
          <div class="space-y-1">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Silakan Masuk untuk Melihat Riwayat Naskah Anda
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-md mx-auto">
              Seluruh riwayat pemeriksaan naskah, skor similarity, dan unduhan file PDF laporan resmi tertaut aman dengan akun Cek Naskah Anda.
            </p>
          </div>
          <NuxtLink
            to="/login?redirect=/riwayat-naskah"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/25 transition-colors"
          >
            <UIcon
              name="i-lucide-log-in"
              class="w-4 h-4"
            />
            <span>Masuk ke Akun Sekarang</span>
          </NuxtLink>
        </div>

        <!-- 3. METRICS OVERVIEW CARDS (IF LOGGED IN) -->
        <div
          v-else
          class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <!-- Metric 1: Total Naskah -->
          <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-semibold">
              <span>Total Diajukan</span>
              <span class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <UIcon
                  name="i-lucide-file-text"
                  class="w-4 h-4"
                />
              </span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ metrics.total }}
            </div>
            <p class="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
              Semua layanan pemeriksaan
            </p>
          </div>

          <!-- Metric 2: Selesai -->
          <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-semibold">
              <span>Selesai & Siap Unduh</span>
              <span class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="w-4 h-4"
                />
              </span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {{ metrics.completed }}
            </div>
            <p class="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
              Laporan PDF resmi tersedia
            </p>
          </div>

          <!-- Metric 3: Sedang Diproses -->
          <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-semibold">
              <span>Sedang Diproses</span>
              <span class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UIcon
                  name="i-lucide-clock"
                  class="w-4 h-4"
                />
              </span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {{ metrics.processing }}
            </div>
            <p class="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
              Sedang dianalisis analis/sistem
            </p>
          </div>

          <!-- Metric 4: Menunggu Antrean -->
          <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-semibold">
              <span>Menunggu Antrean</span>
              <span class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <UIcon
                  name="i-lucide-hourglass"
                  class="w-4 h-4"
                />
              </span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {{ metrics.pending }}
            </div>
            <p class="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
              Dalam antrean pemeriksaan
            </p>
          </div>
        </div>

        <!-- 4. SEARCH & FILTER CONTROLS BAR (IF LOGGED IN) -->
        <div
          v-if="user"
          class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        >
          <!-- Search Input -->
          <div class="relative flex-1 min-w-[200px]">
            <UIcon
              name="i-lucide-search"
              class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan judul, nama file, atau ID naskah..."
              class="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            >
          </div>

          <!-- Dropdown Filters Row -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Filter by Service -->
            <select
              v-model="serviceFilter"
              class="px-3 py-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium text-slate-700 dark:text-neutral-300 cursor-pointer focus:outline-hidden"
            >
              <option value="all">
                Semua Layanan ({{ metrics.total }})
              </option>
              <option
                v-for="s in services"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>

            <!-- Filter by Status -->
            <select
              v-model="statusFilter"
              class="px-3 py-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium text-slate-700 dark:text-neutral-300 cursor-pointer focus:outline-hidden"
            >
              <option value="all">
                Semua Status
              </option>
              <option value="completed">
                Selesai ({{ metrics.completed }})
              </option>
              <option value="processing">
                Diproses ({{ metrics.processing }})
              </option>
              <option value="pending">
                Menunggu ({{ metrics.pending }})
              </option>
              <option value="cancelled">
                Dibatalkan ({{ metrics.cancelled }})
              </option>
            </select>

            <!-- View Mode Switcher -->
            <div class="flex items-center rounded-2xl border border-slate-200 dark:border-neutral-800 p-1 bg-slate-50 dark:bg-neutral-950 shrink-0">
              <button
                type="button"
                class="p-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                :class="viewMode === 'table' ? 'bg-white dark:bg-neutral-800 text-primary-600 font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-600'"
                title="Tampilan Tabel"
                @click="viewMode = 'table'"
              >
                <UIcon
                  name="i-lucide-table"
                  class="w-4 h-4"
                />
              </button>
              <button
                type="button"
                class="p-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                :class="viewMode === 'cards' ? 'bg-white dark:bg-neutral-800 text-primary-600 font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-600'"
                title="Tampilan Kartu"
                @click="viewMode = 'cards'"
              >
                <UIcon
                  name="i-lucide-layout-grid"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- 5. MANUSCRIPTS CONTENT AREA (IF LOGGED IN) -->
        <div v-if="user">
          <!-- Loading State -->
          <div
            v-if="manuscriptsLoading"
            class="py-20 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-8 shadow-2xs"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-8 h-8 animate-spin mx-auto text-primary-600"
            />
            <p class="text-xs text-slate-500 dark:text-neutral-400 font-medium">
              Memuat data naskah Anda...
            </p>
          </div>

          <!-- Empty State: No manuscripts submitted yet -->
          <div
            v-else-if="manuscripts.length === 0"
            class="rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 sm:p-14 text-center space-y-6 shadow-2xs"
          >
            <div class="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 flex items-center justify-center">
              <UIcon
                name="i-lucide-folder-open"
                class="w-8 h-8"
              />
            </div>
            <div class="space-y-1.5">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Belum Ada Naskah yang Diajukan
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
                Anda belum pernah mengajukan pemeriksaan naskah. Pilih salah satu layanan unggulan di bawah ini untuk memulai pengujian pertama Anda.
              </p>
            </div>

            <!-- Service Quick Links Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
              <NuxtLink
                to="/turnitin"
                class="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500/50 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all text-left space-y-1 group"
              >
                <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 flex items-center gap-1.5">
                  <span>Turnitin Similarity</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-3.5 h-3.5"
                  />
                </div>
                <p class="text-[11px] text-slate-500 dark:text-neutral-400">
                  Standar kampus No-Repository
                </p>
              </NuxtLink>

              <NuxtLink
                to="/ithenticate"
                class="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500/50 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all text-left space-y-1 group"
              >
                <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 flex items-center gap-1.5">
                  <span>iThenticate Jurnal</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-3.5 h-3.5"
                  />
                </div>
                <p class="text-[11px] text-slate-500 dark:text-neutral-400">
                  Standar jurnal internasional
                </p>
              </NuxtLink>

              <NuxtLink
                to="/turnitin-ai"
                class="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500/50 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition-all text-left space-y-1 group"
              >
                <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 flex items-center gap-1.5">
                  <span>Turnitin AI Detector</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-3.5 h-3.5"
                  />
                </div>
                <p class="text-[11px] text-slate-500 dark:text-neutral-400">
                  Uji skor indikasi AI writing
                </p>
              </NuxtLink>
            </div>
          </div>

          <!-- Empty State: Filter matched nothing -->
          <div
            v-else-if="filteredManuscripts.length === 0"
            class="rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 text-center space-y-3 shadow-2xs"
          >
            <UIcon
              name="i-lucide-search-x"
              class="w-8 h-8 mx-auto text-slate-400"
            />
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">
              Tidak Ada Naskah yang Cocok
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
              Tidak ditemukan naskah dengan kriteria pencarian atau filter yang dipilih. Silakan reset filter untuk melihat naskah lainnya.
            </p>
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
              @click="searchQuery = ''; serviceFilter = 'all'; statusFilter = 'all'"
            >
              Reset Filter
            </button>
          </div>

          <!-- VIEW MODE 1: TABLE VIEW -->
          <div
            v-else-if="viewMode === 'table'"
            class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/75 dark:bg-neutral-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <th class="py-3.5 px-4">
                      Naskah & ID
                    </th>
                    <th class="py-3.5 px-4">
                      Layanan
                    </th>
                    <th class="py-3.5 px-4">
                      Parameter / Bahasa
                    </th>
                    <th class="py-3.5 px-4">
                      Status
                    </th>
                    <th class="py-3.5 px-4">
                      Skor Hasil
                    </th>
                    <th class="py-3.5 px-4">
                      Laporan & File
                    </th>
                    <th class="py-3.5 px-4 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/80">
                  <tr
                    v-for="item in filteredManuscripts"
                    :key="item.$id"
                    class="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <!-- 1. Naskah & ID -->
                    <td class="py-4 px-4 max-w-[240px]">
                      <div class="space-y-1">
                        <div
                          class="font-bold text-slate-900 dark:text-white line-clamp-2"
                          :title="item.title"
                        >
                          {{ item.title }}
                        </div>
                        <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span class="font-mono text-[9px]">{{ item.$id }}</span>
                          <span>•</span>
                          <span>{{ formatDate(item.$createdAt) }}</span>
                        </div>
                        <div
                          v-if="item.fileName"
                          class="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1 truncate"
                        >
                          <UIcon
                            name="i-lucide-file"
                            class="w-3 h-3 shrink-0"
                          />
                          <span class="truncate">{{ item.fileName }}</span>
                          <span v-if="item.fileSize">({{ formatFileSize(item.fileSize) }})</span>
                        </div>
                      </div>
                    </td>

                    <!-- 2. Layanan -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="space-y-1">
                        <span
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                          :class="getServiceMeta(item.serviceId).badgeClass"
                        >
                          <UIcon
                            :name="getServiceMeta(item.serviceId).icon"
                            class="w-3 h-3"
                          />
                          <span>{{ item.serviceName || getServiceMeta(item.serviceId).name }}</span>
                        </span>
                        <div
                          v-if="item.price"
                          class="text-[10px] text-slate-400"
                        >
                          Biaya: {{ item.price }}
                        </div>
                      </div>
                    </td>

                    <!-- 3. Parameter / Bahasa -->
                    <td class="py-4 px-4 max-w-[180px]">
                      <!-- Turnitin AI: Bahasa -->
                      <div
                        v-if="item.serviceId === 'turnitin-ai'"
                        class="flex flex-wrap gap-1"
                      >
                        <span
                          v-if="parseRawOptions(item.excludeOptions).language === 'en'"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40"
                        >
                          🇬🇧 English
                        </span>
                        <span
                          v-else-if="parseRawOptions(item.excludeOptions).language === 'es'"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40"
                        >
                          🇪🇸 Español
                        </span>
                        <span
                          v-else-if="parseRawOptions(item.excludeOptions).language === 'ja'"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
                        >
                          🇯🇵 日本語
                        </span>
                        <span
                          v-else
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          AI Engine
                        </span>
                      </div>

                      <!-- Similarity Exclude Badges -->
                      <div
                        v-else
                        class="flex flex-wrap gap-1"
                      >
                        <span
                          v-if="parseOptions(item.excludeOptions).bibliography"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Biblio
                        </span>
                        <span
                          v-if="parseOptions(item.excludeOptions).quotes"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Quotes
                        </span>
                        <span
                          v-if="parseOptions(item.excludeOptions).abstract"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Abstract
                        </span>
                        <span
                          v-if="parseOptions(item.excludeOptions).methodsAndMaterial"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Methods
                        </span>
                        <span
                          v-if="parseOptions(item.excludeOptions).citations"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Citations
                        </span>
                        <span
                          v-if="parseOptions(item.excludeOptions).smallMatches"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Small ({{ parseOptions(item.excludeOptions).smallMatchesValue }}w)
                        </span>
                      </div>
                    </td>

                    <!-- 4. Status -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold"
                        :class="getStatusBadge(item.status).badgeClass"
                      >
                        <UIcon
                          :name="getStatusBadge(item.status).icon"
                          class="w-3.5 h-3.5"
                        />
                        <span>{{ getStatusBadge(item.status).label }}</span>
                      </span>
                    </td>

                    <!-- 5. Skor Hasil -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div v-if="item.similarityScore">
                        <span
                          class="px-2 py-0.5 rounded-md text-[11px] font-extrabold border"
                          :class="item.serviceId === 'turnitin-ai'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                            : 'bg-primary-50 dark:bg-primary-950/50 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800'"
                        >
                          {{ item.serviceId === 'turnitin-ai' ? 'AI: ' : 'Sim: ' }}{{ item.similarityScore }}
                        </span>
                      </div>
                      <div
                        v-else
                        class="text-[11px] text-slate-400 italic"
                      >
                        {{ item.status === 'completed' ? '-' : 'Menunggu hasil' }}
                      </div>
                    </td>

                    <!-- 6. Berkas / Unduhan Laporan -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <!-- Unduh Laporan PDF Resmi (Jika Ada) -->
                        <a
                          v-if="item.resultFileUrl"
                          :href="item.resultFileUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                          title="Unduh laporan hasil resmi PDF"
                        >
                          <UIcon
                            name="i-lucide-download"
                            class="w-3.5 h-3.5"
                          />
                          <span>Laporan PDF</span>
                        </a>

                        <!-- Unduh Naskah Asli -->
                        <a
                          v-if="item.fileUrl"
                          :href="item.fileUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Unduh naskah asli yang Anda kirim"
                        >
                          <UIcon
                            name="i-lucide-file-down"
                            class="w-4 h-4"
                          />
                        </a>
                      </div>
                    </td>

                    <!-- 7. Aksi -->
                    <td class="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Lihat rincian naskah"
                        @click="openDetailModal(item)"
                      >
                        <UIcon
                          name="i-lucide-info"
                          class="w-3.5 h-3.5"
                        />
                        <span>Rincian</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- VIEW MODE 2: CARDS GRID VIEW -->
          <div
            v-else-if="viewMode === 'cards'"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="item in filteredManuscripts"
              :key="item.$id"
              class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-5 shadow-2xs space-y-4 hover:border-slate-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div class="space-y-3">
                <!-- Card Header Badges -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      :class="getServiceMeta(item.serviceId).badgeClass"
                    >
                      <UIcon
                        :name="getServiceMeta(item.serviceId).icon"
                        class="w-3 h-3"
                      />
                      <span>{{ item.serviceName || getServiceMeta(item.serviceId).name }}</span>
                    </span>

                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                      :class="getStatusBadge(item.status).badgeClass"
                    >
                      <UIcon
                        :name="getStatusBadge(item.status).icon"
                        class="w-3 h-3"
                      />
                      <span>{{ getStatusBadge(item.status).label }}</span>
                    </span>
                  </div>

                  <!-- Score badge if ready -->
                  <span
                    v-if="item.similarityScore"
                    class="px-2 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0"
                    :class="item.serviceId === 'turnitin-ai'
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                      : 'bg-primary-50 dark:bg-primary-950/50 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800'"
                  >
                    {{ item.serviceId === 'turnitin-ai' ? 'AI ' : 'Sim ' }}{{ item.similarityScore }}
                  </span>
                </div>

                <!-- Title & Meta -->
                <div class="space-y-1">
                  <h3
                    class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2"
                    :title="item.title"
                  >
                    {{ item.title }}
                  </h3>
                  <p class="text-[11px] text-slate-400">
                    ID: {{ item.$id }} • {{ formatDate(item.$createdAt) }}
                  </p>
                </div>

                <!-- Parameters Box -->
                <div class="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 space-y-1.5 text-xs">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-500">Berkas Naskah:</span>
                    <span class="font-semibold text-slate-800 dark:text-neutral-200 truncate max-w-[170px]">{{ item.fileName }}</span>
                  </div>

                  <div
                    v-if="item.serviceId === 'turnitin-ai'"
                    class="flex items-center justify-between text-[11px]"
                  >
                    <span class="text-slate-500">Bahasa Analisis:</span>
                    <span class="font-bold text-amber-700 dark:text-amber-300">
                      {{ parseRawOptions(item.excludeOptions).languageLabel || parseRawOptions(item.excludeOptions).language || 'English' }}
                    </span>
                  </div>

                  <div
                    v-else
                    class="flex items-center justify-between text-[11px]"
                  >
                    <span class="text-slate-500">Parameter Exclude:</span>
                    <span class="text-slate-700 dark:text-neutral-300 text-[10px] font-medium">
                      {{ Object.entries(parseOptions(item.excludeOptions)).filter(([k, v]) => v === true && k !== 'smallMatchesValue').length }} parameter aktif
                    </span>
                  </div>
                </div>
              </div>

              <!-- Card Actions Bottom Row -->
              <div class="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <a
                    v-if="item.resultFileUrl"
                    :href="item.resultFileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="w-3.5 h-3.5"
                    />
                    <span>Unduh Laporan</span>
                  </a>

                  <a
                    v-if="item.fileUrl"
                    :href="item.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Unduh naskah asli"
                  >
                    <UIcon
                      name="i-lucide-file-down"
                      class="w-4 h-4"
                    />
                  </a>
                </div>

                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  @click="openDetailModal(item)"
                >
                  Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL: DETAIL NASKAH LENGKAP -->
    <UModal
      v-model:open="isDetailModalOpen"
      title="Rincian Pengajuan Naskah"
      description="Informasi lengkap dokumen, opsi pemeriksaan, dan status hasil laporan"
    >
      <template #content>
        <div
          v-if="selectedManuscript"
          class="p-6 space-y-4"
        >
          <!-- Header Status & Title -->
          <div class="space-y-1.5 border-b border-slate-100 dark:border-neutral-800 pb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
                :class="getStatusBadge(selectedManuscript.status).badgeClass"
              >
                {{ getStatusBadge(selectedManuscript.status).label }}
              </span>

              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                :class="getServiceMeta(selectedManuscript.serviceId).badgeClass"
              >
                {{ selectedManuscript.serviceName || getServiceMeta(selectedManuscript.serviceId).name }}
              </span>
            </div>

            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ selectedManuscript.title }}
            </h3>
          </div>

          <!-- Metadata Detail List -->
          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">ID Naskah:</span>
              <span class="font-mono text-slate-900 dark:text-white">{{ selectedManuscript.$id }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Nama Berkas:</span>
              <span class="text-slate-900 dark:text-white">{{ selectedManuscript.fileName }} ({{ formatFileSize(selectedManuscript.fileSize) }})</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Waktu Pengajuan:</span>
              <span class="text-slate-900 dark:text-white">{{ formatDate(selectedManuscript.$createdAt) }}</span>
            </div>

            <!-- Skor Hasil Pemeriksaan -->
            <div
              v-if="selectedManuscript.similarityScore"
              class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80"
            >
              <span class="text-slate-500 font-bold">
                {{ selectedManuscript.serviceId === 'turnitin-ai' ? 'Skor AI Writing Detector:' : 'Skor Similarity Index:' }}
              </span>
              <span
                class="font-black text-sm"
                :class="selectedManuscript.serviceId === 'turnitin-ai' ? 'text-amber-600 dark:text-amber-400' : 'text-primary-600 dark:text-primary-400'"
              >
                {{ selectedManuscript.similarityScore }}
              </span>
            </div>

            <!-- Parameter Breakdown -->
            <div class="py-2 space-y-1">
              <span class="text-slate-500 font-semibold">
                {{ selectedManuscript.serviceId === 'turnitin-ai' ? 'Parameter Bahasa Turnitin AI:' : 'Parameter Exclude Similarity:' }}
              </span>

              <!-- Turnitin AI Parameter Box -->
              <div
                v-if="selectedManuscript.serviceId === 'turnitin-ai'"
                class="rounded-xl bg-slate-50 dark:bg-neutral-950 p-3 space-y-1 text-[11px]"
              >
                <div class="flex justify-between">
                  <span>Bahasa Naskah:</span>
                  <span class="font-bold text-amber-700 dark:text-amber-300">
                    {{ parseRawOptions(selectedManuscript.excludeOptions).languageLabel || parseRawOptions(selectedManuscript.excludeOptions).language || 'Bahasa Inggris (English)' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Model Engine:</span>
                  <span class="font-bold">Turnitin Official AI Writing Engine</span>
                </div>
              </div>

              <!-- Similarity Exclude Parameters Box -->
              <div
                v-else
                class="rounded-xl bg-slate-50 dark:bg-neutral-950 p-3 space-y-1 text-[11px]"
              >
                <div class="flex justify-between">
                  <span>Bibliography:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).bibliography ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Quotes:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).quotes ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Abstract:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).abstract ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Methods & Material:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).methodsAndMaterial ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Citations:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).citations ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Small Matches:</span>
                  <span class="font-bold">
                    {{ parseOptions(selectedManuscript.excludeOptions).smallMatches
                      ? `Ya (${parseOptions(selectedManuscript.excludeOptions).smallMatchesValue} kata)`
                      : 'Tidak' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Catatan Pengguna (Jika Ada) -->
            <div
              v-if="selectedManuscript.userNotes"
              class="py-1"
            >
              <span class="text-slate-500 block mb-1">Catatan Anda:</span>
              <p class="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 italic text-[11px]">
                {{ selectedManuscript.userNotes }}
              </p>
            </div>

            <!-- Catatan Admin (Jika Ada) -->
            <div
              v-if="selectedManuscript.adminNotes"
              class="py-1"
            >
              <span class="text-slate-500 block mb-1">Catatan Analis / Admin:</span>
              <p class="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 text-[11px]">
                {{ selectedManuscript.adminNotes }}
              </p>
            </div>
          </div>

          <!-- Action Buttons in Modal -->
          <div class="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
            <button
              type="button"
              class="py-2 px-4 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 text-xs font-bold cursor-pointer"
              @click="isDetailModalOpen = false"
            >
              Tutup
            </button>

            <div class="flex items-center gap-2">
              <a
                v-if="selectedManuscript.fileUrl"
                :href="selectedManuscript.fileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="py-2 px-3 rounded-xl border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <UIcon
                  name="i-lucide-file-down"
                  class="w-3.5 h-3.5"
                />
                <span>Naskah Asli</span>
              </a>

              <a
                v-if="selectedManuscript.resultFileUrl"
                :href="selectedManuscript.resultFileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <UIcon
                  name="i-lucide-download"
                  class="w-3.5 h-3.5"
                />
                <span>Unduh Laporan PDF</span>
              </a>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>
