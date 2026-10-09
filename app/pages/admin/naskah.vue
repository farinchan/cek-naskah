<script setup lang="ts">
import type { ManuscriptRow, ExcludeOptions } from '~/composables/useManuscripts'
import { defaultExcludeOptions } from '~/composables/useManuscripts'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Kelola Naskah — Panel Admin Cek Naskah',
  description: 'Panel manajemen pemeriksaan naskah, monitoring antrean, dan pengunggahan laporan resmi similarity iThenticate dan Turnitin.',
  ogTitle: 'Kelola Naskah — Panel Admin Cek Naskah',
  ogDescription: 'Panel manajemen antrean pemeriksaan naskah akademik dan pengunggahan hasil laporan.',
  robots: 'noindex, nofollow'
})

const { user } = useAuth()
const { services, fetchServices } = useServices()
const {
  allManuscripts,
  loading: isManuscriptsLoading,
  uploading: isSaving,
  success: manuscriptsSuccess,
  clearFeedback,
  formatFileSize,
  getStatusBadge,
  fetchAllManuscripts,
  adminUploadResult,
  adminUpdateStatus,
  adminDeleteManuscript
} = useManuscripts()

// Filters & Controls
const searchQuery = ref('')
const statusFilter = ref<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all')
const serviceFilter = ref<string>('all')
const viewMode = ref<'table' | 'cards'>('table')
const isRefreshing = ref(false)

// Modals State
const isUploadModalOpen = ref(false)
const targetManuscript = ref<ManuscriptRow | null>(null)
const adminStatus = ref<'pending' | 'processing' | 'completed' | 'cancelled'>('completed')
const adminSimilarityScore = ref('')
const adminResultFile = ref<File | null>(null)
const adminResultFileInputRef = ref<HTMLInputElement | null>(null)
const adminNotes = ref('')
const modalError = ref<string | null>(null)
const modalSuccess = ref<string | null>(null)

// Detail Modal
const isDetailModalOpen = ref(false)
const selectedManuscript = ref<ManuscriptRow | null>(null)

// Delete Confirm Modal
const isDeleteModalOpen = ref(false)
const manuscriptToDelete = ref<ManuscriptRow | null>(null)
const isDeleting = ref(false)

onMounted(async () => {
  await Promise.allSettled([
    fetchServices(),
    fetchAllManuscripts()
  ])
})

const handleRefresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  clearFeedback()
  await Promise.allSettled([
    fetchServices(),
    fetchAllManuscripts()
  ])
  isRefreshing.value = false
}

// Metrics
const metrics = computed(() => {
  const total = allManuscripts.value.length
  const pending = allManuscripts.value.filter(m => (m.status || 'pending').toLowerCase() === 'pending').length
  const processing = allManuscripts.value.filter(m => (m.status || '').toLowerCase() === 'processing').length
  const completed = allManuscripts.value.filter(m => (m.status || '').toLowerCase() === 'completed').length
  const cancelled = allManuscripts.value.filter(m => (m.status || '').toLowerCase() === 'cancelled').length
  return { total, pending, processing, completed, cancelled }
})

// Filtered Manuscripts
const filteredManuscripts = computed(() => {
  let list = [...allManuscripts.value]

  // Status Filter
  if (statusFilter.value !== 'all') {
    list = list.filter(m => (m.status || 'pending').toLowerCase() === statusFilter.value)
  }

  // Service Filter
  if (serviceFilter.value !== 'all') {
    list = list.filter(m => m.serviceId === serviceFilter.value)
  }

  // Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((m) => {
      const matchTitle = m.title?.toLowerCase().includes(q)
      const matchUser = m.userName?.toLowerCase().includes(q)
      const matchEmail = m.userEmail?.toLowerCase().includes(q)
      const matchPhone = m.userPhone?.toLowerCase().includes(q)
      const matchId = m.$id?.toLowerCase().includes(q)
      const matchService = m.serviceName?.toLowerCase().includes(q)
      return matchTitle || matchUser || matchEmail || matchPhone || matchId || matchService
    })
  }

  return list
})

// Format Helpers
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

const parseOptions = (raw?: string): ExcludeOptions => {
  if (!raw) return { ...defaultExcludeOptions }
  try {
    return JSON.parse(raw) as ExcludeOptions
  } catch {
    return { ...defaultExcludeOptions }
  }
}

const formatWaLink = (phone?: string): string => {
  if (!phone) return ''
  const clean = phone.replace(/[^0-9]/g, '')
  const intl = clean.startsWith('0') ? '62' + clean.slice(1) : clean
  return `https://wa.me/${intl}`
}

// Modal Actions
const openUploadModal = (item: ManuscriptRow) => {
  targetManuscript.value = item
  adminStatus.value = (item.status as 'pending' | 'processing' | 'completed' | 'cancelled') || 'completed'
  adminSimilarityScore.value = item.similarityScore || ''
  adminNotes.value = item.adminNotes || ''
  adminResultFile.value = null
  modalError.value = null
  modalSuccess.value = null
  if (adminResultFileInputRef.value) {
    adminResultFileInputRef.value.value = ''
  }
  isUploadModalOpen.value = true
}

const onResultFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    adminResultFile.value = file
  }
}

const handleSaveUploadModal = async () => {
  if (!targetManuscript.value) return
  modalError.value = null
  modalSuccess.value = null

  if (adminResultFile.value) {
    const res = await adminUploadResult({
      manuscriptId: targetManuscript.value.$id,
      resultFile: adminResultFile.value,
      similarityScore: adminSimilarityScore.value,
      adminNotes: adminNotes.value
    })
    if (!res.success) {
      modalError.value = res.message || 'Gagal mengunggah laporan hasil.'
      return
    }
  } else {
    const res = await adminUpdateStatus(
      targetManuscript.value.$id,
      adminStatus.value,
      adminNotes.value
    )
    if (!res.success) {
      modalError.value = res.message || 'Gagal memperbarui status.'
      return
    }
  }

  modalSuccess.value = 'Data naskah dan hasil laporan berhasil diperbarui!'
  setTimeout(() => {
    isUploadModalOpen.value = false
  }, 1000)
}

const openDetailModal = (item: ManuscriptRow) => {
  selectedManuscript.value = item
  isDetailModalOpen.value = true
}

const confirmDelete = (item: ManuscriptRow) => {
  manuscriptToDelete.value = item
  isDeleteModalOpen.value = true
}

const handleDeleteManuscript = async () => {
  if (!manuscriptToDelete.value) return
  isDeleting.value = true
  const res = await adminDeleteManuscript(manuscriptToDelete.value)
  isDeleting.value = false
  if (res.success) {
    isDeleteModalOpen.value = false
    manuscriptToDelete.value = null
  }
}

// Quick status updater directly from table
const handleQuickStatusChange = async (item: ManuscriptRow, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
  await adminUpdateStatus(item.$id, newStatus)
}

const onQuickStatusChange = (item: ManuscriptRow, e: Event) => {
  const target = e.target as HTMLSelectElement
  if (target?.value) {
    handleQuickStatusChange(item, target.value as 'pending' | 'processing' | 'completed' | 'cancelled')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
            <UIcon
              name="i-lucide-file-text"
              class="w-5 h-5"
            />
          </span>
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kelola Naskah Masuk
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
          Monitoring antrean pemeriksaan naskah, pengunggahan laporan resmi iThenticate / Turnitin, dan pelacakan status.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5">
        <NuxtLink
          to="/ithenticate"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 shadow-2xs transition-colors"
        >
          <UIcon
            name="i-lucide-external-link"
            class="w-3.5 h-3.5"
          />
          <span>Buka /ithenticate</span>
        </NuxtLink>

        <button
          type="button"
          :disabled="isRefreshing || isManuscriptsLoading"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-60"
          @click="handleRefresh"
        >
          <UIcon
            name="i-lucide-refresh-cw"
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin': isRefreshing || isManuscriptsLoading }"
          />
          <span>Segarkan</span>
        </button>
      </div>
    </div>

    <!-- Feedback Banner -->
    <div
      v-if="manuscriptsSuccess"
      class="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
    >
      <div class="flex items-center gap-2 font-medium">
        <UIcon
          name="i-lucide-check-circle"
          class="w-4 h-4 text-emerald-600 shrink-0"
        />
        <span>{{ manuscriptsSuccess }}</span>
      </div>
      <button
        type="button"
        class="text-emerald-600 hover:text-emerald-800 cursor-pointer"
        @click="clearFeedback"
      >
        <UIcon
          name="i-lucide-x"
          class="w-4 h-4"
        />
      </button>
    </div>

    <!-- Metrics Cards Row -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- Total -->
      <div
        class="bg-white dark:bg-neutral-900 rounded-3xl border p-4 shadow-2xs space-y-2 cursor-pointer transition-all"
        :class="statusFilter === 'all'
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300'"
        @click="statusFilter = 'all'"
      >
        <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400">
          <span class="text-[11px] font-bold uppercase tracking-wider">Total Naskah</span>
          <UIcon
            name="i-lucide-files"
            class="w-4 h-4 text-primary-600"
          />
        </div>
        <div class="text-2xl font-extrabold text-slate-900 dark:text-white">
          {{ metrics.total }}
        </div>
        <div class="text-[10px] text-slate-400">
          Semua dokumen masuk
        </div>
      </div>

      <!-- Pending -->
      <div
        class="bg-white dark:bg-neutral-900 rounded-3xl border p-4 shadow-2xs space-y-2 cursor-pointer transition-all"
        :class="statusFilter === 'pending'
          ? 'border-amber-500 ring-2 ring-amber-500/20'
          : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300'"
        @click="statusFilter = 'pending'"
      >
        <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400">
          <span class="text-[11px] font-bold uppercase tracking-wider">Menunggu</span>
          <UIcon
            name="i-lucide-clock-3"
            class="w-4 h-4 text-amber-500"
          />
        </div>
        <div class="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
          {{ metrics.pending }}
        </div>
        <div class="text-[10px] text-slate-400">
          Perlu diperiksa segera
        </div>
      </div>

      <!-- Processing -->
      <div
        class="bg-white dark:bg-neutral-900 rounded-3xl border p-4 shadow-2xs space-y-2 cursor-pointer transition-all"
        :class="statusFilter === 'processing'
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300'"
        @click="statusFilter = 'processing'"
      >
        <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400">
          <span class="text-[11px] font-bold uppercase tracking-wider">Diproses</span>
          <UIcon
            name="i-lucide-loader-2"
            class="w-4 h-4 text-blue-500"
          />
        </div>
        <div class="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
          {{ metrics.processing }}
        </div>
        <div class="text-[10px] text-slate-400">
          Sedang diuji similarity
        </div>
      </div>

      <!-- Completed -->
      <div
        class="bg-white dark:bg-neutral-900 rounded-3xl border p-4 shadow-2xs space-y-2 cursor-pointer transition-all"
        :class="statusFilter === 'completed'
          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
          : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300'"
        @click="statusFilter = 'completed'"
      >
        <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400">
          <span class="text-[11px] font-bold uppercase tracking-wider">Selesai</span>
          <UIcon
            name="i-lucide-check-circle-2"
            class="w-4 h-4 text-emerald-500"
          />
        </div>
        <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {{ metrics.completed }}
        </div>
        <div class="text-[10px] text-slate-400">
          Laporan siap diunduh
        </div>
      </div>

      <!-- Cancelled -->
      <div
        class="bg-white dark:bg-neutral-900 rounded-3xl border p-4 shadow-2xs space-y-2 cursor-pointer transition-all col-span-2 lg:col-span-1"
        :class="statusFilter === 'cancelled'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300'"
        @click="statusFilter = 'cancelled'"
      >
        <div class="flex items-center justify-between text-slate-500 dark:text-neutral-400">
          <span class="text-[11px] font-bold uppercase tracking-wider">Dibatalkan</span>
          <UIcon
            name="i-lucide-x-circle"
            class="w-4 h-4 text-rose-500"
          />
        </div>
        <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
          {{ metrics.cancelled }}
        </div>
        <div class="text-[10px] text-slate-400">
          Dibatalkan / refund
        </div>
      </div>
    </div>

    <!-- Filters, Search & View Controls Bar -->
    <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3.5">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <UIcon
            name="i-lucide-search"
            class="w-4 h-4"
          />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul, pelanggan, email, WA, ID..."
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        >
      </div>

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <!-- Service Filter Dropdown -->
        <select
          v-model="serviceFilter"
          class="px-3 py-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium"
        >
          <option value="all">
            Semua Layanan
          </option>
          <option value="turnitin-plagiarism">
            iThenticate
          </option>
          <option value="turnitin-similarity">
            Turnitin
          </option>
          <option value="turnitin-ai">
            AI Detector
          </option>
          <option
            v-for="s in services"
            :key="s.id"
            :value="s.id"
          >
            {{ s.name }}
          </option>
        </select>

        <!-- Status Filter Dropdown -->
        <select
          v-model="statusFilter"
          class="px-3 py-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium"
        >
          <option value="all">
            Semua Status ({{ metrics.total }})
          </option>
          <option value="pending">
            Menunggu ({{ metrics.pending }})
          </option>
          <option value="processing">
            Diproses ({{ metrics.processing }})
          </option>
          <option value="completed">
            Selesai ({{ metrics.completed }})
          </option>
          <option value="cancelled">
            Dibatalkan ({{ metrics.cancelled }})
          </option>
        </select>

        <!-- View Mode Switcher -->
        <div class="flex items-center rounded-2xl border border-slate-200 dark:border-neutral-800 p-1 bg-slate-50 dark:bg-neutral-950">
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

    <!-- Loading State -->
    <div
      v-if="isManuscriptsLoading"
      class="py-20 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin mx-auto text-primary-600"
      />
      <p class="text-xs text-slate-500 dark:text-neutral-400">
        Memuat data naskah dari Appwrite...
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredManuscripts.length === 0"
      class="rounded-3xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center space-y-3"
    >
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 flex items-center justify-center">
        <UIcon
          name="i-lucide-file-question"
          class="w-8 h-8"
        />
      </div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">
        Tidak Ada Naskah yang Sesuai
      </h3>
      <p class="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
        Tidak ditemukan naskah dengan kriteria pencarian atau filter yang Anda pilih.
      </p>
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-semibold text-primary-600 hover:underline cursor-pointer"
        @click="searchQuery = ''; statusFilter = 'all'; serviceFilter = 'all'"
      >
        Reset Filter
      </button>
    </div>

    <!-- VIEW 1: TABLE VIEW -->
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
                Pelanggan
              </th>
              <th class="py-3.5 px-4">
                Layanan
              </th>
              <th class="py-3.5 px-4">
                Exclude Parameters
              </th>
              <th class="py-3.5 px-4">
                Status
              </th>
              <th class="py-3.5 px-4">
                File & Hasil
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
              <td class="py-4 px-4 max-w-[220px]">
                <div class="space-y-1">
                  <div
                    class="font-bold text-slate-900 dark:text-white line-clamp-2"
                    :title="item.title"
                  >
                    {{ item.title }}
                  </div>
                  <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span class="font-mono">{{ item.$id }}</span>
                    <span>•</span>
                    <span>{{ formatDate(item.$createdAt) }}</span>
                  </div>
                </div>
              </td>

              <!-- 2. Pelanggan -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-900 dark:text-white">
                    {{ item.userName || 'Tamu' }}
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                    {{ item.userEmail || '-' }}
                  </div>
                  <div
                    v-if="item.userPhone"
                    class="pt-0.5"
                  >
                    <a
                      :href="formatWaLink(item.userPhone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <UIcon
                        name="i-simple-icons-whatsapp"
                        class="w-3 h-3"
                      />
                      <span>{{ item.userPhone }}</span>
                    </a>
                  </div>
                </div>
              </td>

              <!-- 3. Layanan -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-1">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                    {{ item.serviceName || item.serviceId }}
                  </span>
                  <div class="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                    {{ item.price || 'Rp 8.000' }}
                  </div>
                </div>
              </td>

              <!-- 4. Exclude Parameters -->
              <td class="py-4 px-4 max-w-[180px]">
                <div class="flex flex-wrap gap-1">
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

              <!-- 5. Status -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-1.5">
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

                  <!-- Quick Status Dropdown -->
                  <div>
                    <select
                      :value="item.status || 'pending'"
                      class="text-[10px] font-semibold rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-0.5 px-1.5"
                      @change="onQuickStatusChange(item, $event)"
                    >
                      <option value="pending">
                        Antrean (Pending)
                      </option>
                      <option value="processing">
                        Diproses
                      </option>
                      <option value="completed">
                        Selesai
                      </option>
                      <option value="cancelled">
                        Dibatalkan
                      </option>
                    </select>
                  </div>
                </div>
              </td>

              <!-- 6. File & Hasil -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-1.5">
                  <!-- Original Manuscript File -->
                  <div class="flex items-center gap-2">
                    <a
                      v-if="item.fileUrl"
                      :href="item.fileUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:underline"
                      title="Unduh naskah asli dari Appwrite Storage"
                    >
                      <UIcon
                        name="i-lucide-file-down"
                        class="w-3.5 h-3.5"
                      />
                      <span>Naskah Asli</span>
                    </a>
                    <span class="text-[10px] text-slate-400">({{ formatFileSize(item.fileSize) }})</span>
                  </div>

                  <!-- Result Report File -->
                  <div
                    v-if="item.resultFileUrl"
                    class="flex items-center gap-2"
                  >
                    <a
                      :href="item.resultFileUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-[10px] hover:bg-emerald-200"
                    >
                      <UIcon
                        name="i-lucide-file-check"
                        class="w-3 h-3"
                      />
                      <span>Hasil ({{ item.similarityScore || 'PDF' }})</span>
                    </a>
                  </div>
                  <div
                    v-else
                    class="text-[10px] text-amber-600 dark:text-amber-400 italic"
                  >
                    Belum ada laporan
                  </div>
                </div>
              </td>

              <!-- 7. Aksi -->
              <td class="py-4 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Unggah Hasil / Edit Button (Primary) -->
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    title="Unggah Laporan Hasil Similarity & Status"
                    @click="openUploadModal(item)"
                  >
                    <UIcon
                      name="i-lucide-upload-cloud"
                      class="w-3.5 h-3.5"
                    />
                    <span>Upload Hasil</span>
                  </button>

                  <!-- Detail Modal Trigger -->
                  <button
                    type="button"
                    class="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Lihat Detail Naskah"
                    @click="openDetailModal(item)"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="w-4 h-4"
                    />
                  </button>

                  <!-- Delete Trigger -->
                  <button
                    type="button"
                    class="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus Naskah"
                    @click="confirmDelete(item)"
                  >
                    <UIcon
                      name="i-lucide-trash-2"
                      class="w-4 h-4"
                    />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 2: CARDS VIEW -->
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
          <div class="flex items-start justify-between gap-2">
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

            <span
              v-if="item.similarityScore"
              class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300"
            >
              {{ item.similarityScore }}
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
              {{ item.title }}
            </h3>
            <p class="text-[11px] text-slate-400">
              ID: {{ item.$id }} • {{ formatDate(item.$createdAt) }}
            </p>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Pelanggan:</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ item.userName || 'Tamu' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Email:</span>
              <span class="text-slate-700 dark:text-neutral-300 truncate max-w-[160px]">{{ item.userEmail || '-' }}</span>
            </div>
            <div
              v-if="item.userPhone"
              class="flex justify-between"
            >
              <span class="text-slate-500">WA:</span>
              <a
                :href="formatWaLink(item.userPhone)"
                target="_blank"
                class="font-semibold text-emerald-600 hover:underline"
              >{{ item.userPhone }}</a>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <a
              v-if="item.fileUrl"
              :href="item.fileUrl"
              target="_blank"
              class="p-2 rounded-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40"
              title="Unduh naskah asli"
            >
              <UIcon
                name="i-lucide-file-down"
                class="w-4 h-4"
              />
            </a>
            <a
              v-if="item.resultFileUrl"
              :href="item.resultFileUrl"
              target="_blank"
              class="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="Unduh laporan hasil PDF"
            >
              <UIcon
                name="i-lucide-file-check"
                class="w-4 h-4"
              />
            </a>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
              @click="openUploadModal(item)"
            >
              Upload Hasil
            </button>
            <button
              type="button"
              class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              @click="openDetailModal(item)"
            >
              <UIcon
                name="i-lucide-info"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: UPLOAD RESULT & UPDATE STATUS (ADMIN) -->
    <UModal
      v-model:open="isUploadModalOpen"
      title="Unggah Hasil & Kelola Naskah"
      description="Unggah laporan resmi similarity index ke Appwrite Storage"
    >
      <template #content>
        <div
          v-if="targetManuscript"
          class="p-6 space-y-4"
        >
          <!-- Manuscript Info Card -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-primary-600">
              {{ targetManuscript.serviceName || targetManuscript.serviceId }}
            </div>
            <div class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
              {{ targetManuscript.title }}
            </div>
            <div class="text-xs text-slate-500">
              Pelanggan: {{ targetManuscript.userName }} ({{ targetManuscript.userEmail }})
            </div>
          </div>

          <!-- Status Selector -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-neutral-300">
              Status Pemeriksaan:
            </label>
            <select
              v-model="adminStatus"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold"
            >
              <option value="pending">
                Menunggu Antrean (Pending)
              </option>
              <option value="processing">
                Sedang Diperiksa (Processing)
              </option>
              <option value="completed">
                Selesai (Completed)
              </option>
              <option value="cancelled">
                Dibatalkan (Cancelled)
              </option>
            </select>
          </div>

          <!-- Similarity Score Input -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-neutral-300">
              Skor Similarity Index:
            </label>
            <input
              v-model="adminSimilarityScore"
              type="text"
              placeholder="Contoh: 12% atau 8%"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold"
            >
          </div>

          <!-- Upload Result Report File -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-neutral-300">
              Unggah File Laporan PDF Resmi:
            </label>
            <input
              ref="adminResultFileInputRef"
              type="file"
              accept=".pdf,.docx"
              class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-950/60 dark:file:text-primary-300 hover:file:bg-primary-100"
              @change="onResultFileSelected"
            >
            <p class="text-[10px] text-slate-400">
              File hasil akan disimpan ke Appwrite Storage bucket 'naskah'.
            </p>
          </div>

          <!-- Admin Notes -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-neutral-300">
              Catatan Admin (Terlihat oleh pengguna):
            </label>
            <textarea
              v-model="adminNotes"
              rows="2"
              placeholder="Misal: Pemeriksaan iThenticate selesai dengan exclude abstract dan bibliography sesuai instruksi."
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs resize-none"
            />
          </div>

          <!-- Admin Uploader Log -->
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Admin Pengunggah:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ user?.name || 'Administrator' }} ({{ user?.email }})</span>
          </div>

          <!-- Error / Success Alert -->
          <div
            v-if="modalError"
            class="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium"
          >
            {{ modalError }}
          </div>
          <div
            v-if="modalSuccess"
            class="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium"
          >
            {{ modalSuccess }}
          </div>

          <!-- Modal Actions -->
          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="w-1/2 py-2 px-3 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 font-bold text-xs cursor-pointer"
              @click="isUploadModalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isSaving"
              class="w-1/2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              @click="handleSaveUploadModal"
            >
              <UIcon
                v-if="isSaving"
                name="i-lucide-loader-2"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>{{ isSaving ? 'Menyimpan...' : 'Simpan & Kirim Hasil' }}</span>
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- MODAL: DETAIL NASKAH -->
    <UModal
      v-model:open="isDetailModalOpen"
      title="Detail Pengajuan Naskah"
      description="Rincian informasi dokumen dan preferensi pemeriksaan"
    >
      <template #content>
        <div
          v-if="selectedManuscript"
          class="p-6 space-y-4"
        >
          <div class="space-y-1 border-b border-slate-100 dark:border-neutral-800 pb-3">
            <span
              class="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
              :class="getStatusBadge(selectedManuscript.status).badgeClass"
            >
              {{ getStatusBadge(selectedManuscript.status).label }}
            </span>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ selectedManuscript.title }}
            </h3>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">ID Dokumen:</span>
              <span class="font-mono text-slate-900 dark:text-white">{{ selectedManuscript.$id }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Pelanggan:</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ selectedManuscript.userName }} ({{ selectedManuscript.userEmail }})</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Nama File:</span>
              <span class="text-slate-900 dark:text-white">{{ selectedManuscript.fileName }} ({{ formatFileSize(selectedManuscript.fileSize) }})</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Waktu Pengajuan:</span>
              <span class="text-slate-900 dark:text-white">{{ formatDate(selectedManuscript.$createdAt) }}</span>
            </div>
            <div
              v-if="selectedManuscript.similarityScore"
              class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80"
            >
              <span class="text-slate-500 font-bold">Skor Similarity:</span>
              <span class="font-extrabold text-primary-600 dark:text-primary-400 text-sm">{{ selectedManuscript.similarityScore }}</span>
            </div>
            <div
              v-if="selectedManuscript.adminUploaderName"
              class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80"
            >
              <span class="text-slate-500">Admin Pengunggah Hasil:</span>
              <span class="font-semibold text-slate-900 dark:text-white">{{ selectedManuscript.adminUploaderName }} ({{ selectedManuscript.adminUploaderEmail }})</span>
            </div>

            <!-- Exclude Breakdown -->
            <div class="py-2 space-y-1">
              <span class="text-slate-500 font-semibold">Parameter Exclude:</span>
              <div class="rounded-xl bg-slate-50 dark:bg-neutral-950 p-3 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span>Abstract:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).abstract ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Methods & Material:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).methodsAndMaterial ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Bibliography:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).bibliography ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Quotes:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).quotes ? 'Ya' : 'Tidak' }}</span>
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

            <!-- Notes -->
            <div
              v-if="selectedManuscript.userNotes"
              class="py-1"
            >
              <span class="text-slate-500 block mb-1">Catatan Pelanggan:</span>
              <p class="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 italic text-[11px]">
                {{ selectedManuscript.userNotes }}
              </p>
            </div>
            <div
              v-if="selectedManuscript.adminNotes"
              class="py-1"
            >
              <span class="text-slate-500 block mb-1">Catatan Admin:</span>
              <p class="p-2.5 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 text-primary-800 dark:text-primary-300 font-medium text-[11px]">
                {{ selectedManuscript.adminNotes }}
              </p>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              @click="isDetailModalOpen = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- MODAL: CONFIRM DELETE -->
    <UModal
      v-model:open="isDeleteModalOpen"
      title="Hapus Naskah"
      description="Konfirmasi penghapusan data naskah dan file terkait"
    >
      <template #content>
        <div
          v-if="manuscriptToDelete"
          class="p-6 text-center space-y-4"
        >
          <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <UIcon
              name="i-lucide-alert-triangle"
              class="w-7 h-7"
            />
          </div>

          <div class="space-y-1">
            <h4 class="text-base font-bold text-slate-900 dark:text-white">
              Hapus Naskah Ini?
            </h4>
            <p class="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
              Naskah "<span class="font-semibold text-slate-800 dark:text-neutral-200">{{ manuscriptToDelete.title }}</span>" beserta file di Appwrite Storage akan dihapus secara permanen.
            </p>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="w-1/2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 font-bold text-xs cursor-pointer"
              @click="isDeleteModalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isDeleting"
              class="w-1/2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              @click="handleDeleteManuscript"
            >
              <UIcon
                v-if="isDeleting"
                name="i-lucide-loader-2"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>{{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}</span>
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
