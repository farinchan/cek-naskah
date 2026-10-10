<script setup lang="ts">
import type { ManuscriptRow, ExcludeOptions } from '~/composables/useManuscripts'
import { defaultExcludeOptions } from '~/composables/useManuscripts'
import { OCCUPATION_OPTIONS } from '~/utils/rewards'

useSeoMeta({
  title: 'Riwayat Naskah — Cek Naskah',
  description: 'Daftar lengkap riwayat pengajuan naskah dan dokumen pemeriksaan Turnitin, iThenticate, dan Turnitin AI.',
  ogTitle: 'Riwayat Naskah — Cek Naskah',
  ogDescription: 'Pantau status pengerjaan, periksa skor kemiripan atau skor AI, dan unduh laporan hasil PDF resmi untuk semua naskah Anda.',
  robots: 'noindex, nofollow'
})

// Composables
const { user, fetchUser } = useAuth()
const { services, fetchServices } = useServices()
const {
  manuscripts,
  loading: manuscriptsLoading,
  formatFileSize,
  getStatusBadge,
  fetchUserManuscripts
} = useManuscripts()
const { submitReview, calculateReviewPoints } = useTestimonials()

// View State
const viewMode = ref<'table' | 'cards'>('table')
const searchQuery = ref('')
const serviceFilter = ref('all')
const statusFilter = ref('all')

// Detail Modal State
const isDetailModalOpen = ref(false)
const selectedManuscript = ref<ManuscriptRow | null>(null)

// Review Modal State
const isReviewModalOpen = ref(false)
const isViewReviewModalOpen = ref(false)
const reviewTarget = ref<ManuscriptRow | null>(null)
const reviewRating = ref(5)
const reviewHoverRating = ref(0)
const reviewComment = ref('')
const reviewOccupation = ref('')
const reviewCustomOccupation = ref('')
const reviewAffiliation = ref('')
const isSubmittingReview = ref(false)
const reviewError = ref<string | null>(null)
const reviewSuccessMsg = ref<string | null>(null)
const awardedPointsCelebration = ref<number | null>(null)

// Live preview bonus reward
const currentRewardPreview = computed(() => {
  return calculateReviewPoints(reviewRating.value, reviewComment.value.trim().length)
})

// Custom Service Options interface for parsing JSON
interface CustomServiceOptions {
  language?: string
  languageLabel?: string
  languageNative?: string
  isReviewed?: boolean
  reviewRating?: number
  reviewPoints?: number
  reviewComment?: string
  reviewedAt?: string
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

const isReviewed = (item: ManuscriptRow): boolean => {
  const opt = parseRawOptions(item.excludeOptions)
  return Boolean(opt.isReviewed)
}

const getReviewData = (item: ManuscriptRow) => {
  const opt = parseRawOptions(item.excludeOptions)
  return {
    isReviewed: Boolean(opt.isReviewed),
    rating: Number(opt.reviewRating) || 5,
    points: Number(opt.reviewPoints) || 0,
    comment: String(opt.reviewComment || ''),
    occupation: String(opt.reviewOccupation || ''),
    affiliation: String(opt.reviewAffiliation || ''),
    reviewedAt: String(opt.reviewedAt || '')
  }
}

const openReviewModal = (item: ManuscriptRow) => {
  reviewTarget.value = item
  reviewRating.value = 5
  reviewHoverRating.value = 0
  reviewComment.value = ''
  reviewError.value = null
  reviewSuccessMsg.value = null
  awardedPointsCelebration.value = null

  // Pre-fill pekerjaan dan afiliasi dari preferensi akun user
  const currentOcc = (user.value?.prefs?.pekerjaan as string) || ''
  if (OCCUPATION_OPTIONS.includes(currentOcc)) {
    reviewOccupation.value = currentOcc
    reviewCustomOccupation.value = ''
  } else if (currentOcc) {
    reviewOccupation.value = 'Lainnya'
    reviewCustomOccupation.value = currentOcc
  } else {
    reviewOccupation.value = ''
    reviewCustomOccupation.value = ''
  }

  reviewAffiliation.value = (user.value?.prefs?.afiliasi as string) || (user.value?.prefs?.affiliasi as string) || ''

  isReviewModalOpen.value = true
}

const openViewReviewModal = (item: ManuscriptRow) => {
  reviewTarget.value = item
  isViewReviewModalOpen.value = true
}

const handleSubmitReview = async () => {
  if (!reviewTarget.value?.$id) return
  const cleanComment = reviewComment.value.trim()

  if (cleanComment.length < 15) {
    reviewError.value = 'Mohon tulis ulasan minimal 15 karakter agar memberikan masukan yang bermanfaat.'
    return
  }

  let finalOccupation = reviewOccupation.value.trim()
  if (finalOccupation === 'Lainnya' && reviewCustomOccupation.value.trim()) {
    finalOccupation = reviewCustomOccupation.value.trim()
  }
  const finalAffiliation = reviewAffiliation.value.trim()

  isSubmittingReview.value = true
  reviewError.value = null

  const res = await submitReview({
    manuscriptId: reviewTarget.value.$id,
    rating: reviewRating.value,
    comment: cleanComment,
    occupation: finalOccupation,
    affiliation: finalAffiliation
  })

  isSubmittingReview.value = false

  if (res.success) {
    awardedPointsCelebration.value = res.pointsAwarded
    reviewSuccessMsg.value = res.message

    // Perbarui data naskah lokal
    const currentOpt = parseRawOptions(reviewTarget.value.excludeOptions)
    const updatedOpt = {
      ...currentOpt,
      isReviewed: true,
      reviewRating: reviewRating.value,
      reviewPoints: res.pointsAwarded,
      reviewComment: cleanComment,
      reviewOccupation: finalOccupation,
      reviewAffiliation: finalAffiliation,
      reviewedAt: new Date().toISOString()
    }
    reviewTarget.value.excludeOptions = JSON.stringify(updatedOpt)

    // Perbarui saldo poin & preferensi akun di antarmuka
    await fetchUser()
  } else {
    reviewError.value = res.message
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

interface SummaryParamsResult {
  type: 'ai' | 'similarity'
  items: string[]
  label: string
  flag?: string
  badgeClass?: string
}

const getSummaryParams = (item: ManuscriptRow): SummaryParamsResult => {
  if (item.serviceId === 'turnitin-ai') {
    const raw = parseRawOptions(item.excludeOptions)
    if (raw.language === 'en') {
      return {
        type: 'ai',
        items: [],
        label: 'English',
        flag: '🇬🇧',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
      }
    }
    if (raw.language === 'es') {
      return {
        type: 'ai',
        items: [],
        label: 'Español',
        flag: '🇪🇸',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
      }
    }
    if (raw.language === 'ja') {
      return {
        type: 'ai',
        items: [],
        label: '日本語',
        flag: '🇯🇵',
        badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
      }
    }
    return {
      type: 'ai',
      items: [],
      label: 'AI Engine',
      flag: '🤖',
      badgeClass: 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700'
    }
  }

  const opt = parseOptions(item.excludeOptions)
  const items: string[] = []
  if (opt.bibliography) items.push('Biblio')
  if (opt.quotes) items.push('Quotes')
  if (opt.abstract) items.push('Abstract')
  if (opt.methodsAndMaterial) items.push('Methods')
  if (opt.citations) items.push('Citations')
  if (opt.smallMatches) items.push(`${opt.smallMatchesValue || 8}w`)

  return {
    type: 'similarity',
    items,
    label: items.length > 0 ? items.join(', ') : 'Standar'
  }
}

const getScoreBadge = (scoreStr?: string, serviceId?: string) => {
  if (!scoreStr) return null
  const num = parseInt(scoreStr.replace(/[^0-9]/g, ''), 10)
  const isAi = serviceId === 'turnitin-ai'

  if (isNaN(num)) {
    return {
      text: scoreStr,
      prefix: isAi ? 'AI: ' : 'Sim: ',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border-slate-200 dark:border-neutral-700',
      dotClass: 'bg-slate-400'
    }
  }

  // Plagiarism similarity rules
  if (!isAi) {
    if (num <= 15) {
      return {
        text: scoreStr,
        prefix: 'Sim: ',
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
        dotClass: 'bg-emerald-500'
      }
    }
    if (num <= 25) {
      return {
        text: scoreStr,
        prefix: 'Sim: ',
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
        dotClass: 'bg-amber-500'
      }
    }
    return {
      text: scoreStr,
      prefix: 'Sim: ',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
      dotClass: 'bg-rose-500'
    }
  }

  // AI detector score rules
  if (num <= 10) {
    return {
      text: scoreStr,
      prefix: 'AI: ',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      dotClass: 'bg-emerald-500'
    }
  }
  if (num <= 30) {
    return {
      text: scoreStr,
      prefix: 'AI: ',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      dotClass: 'bg-amber-500'
    }
  }
  return {
    text: scoreStr,
    prefix: 'AI: ',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    dotClass: 'bg-rose-500'
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
            class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-slate-200/80 dark:border-neutral-800 bg-slate-50/90 dark:bg-neutral-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <th class="py-3.5 px-4 font-bold">
                      Naskah & Berkas
                    </th>
                    <th class="py-3.5 px-4 font-bold">
                      Layanan
                    </th>
                    <th class="py-3.5 px-4 font-bold">
                      Parameter
                    </th>
                    <th class="py-3.5 px-4 font-bold">
                      Status
                    </th>
                    <th class="py-3.5 px-4 font-bold text-center">
                      Skor Hasil
                    </th>
                    <th class="py-3.5 px-4 font-bold">
                      Laporan Hasil
                    </th>
                    <th class="py-3.5 px-4 font-bold">
                      <div class="flex items-center gap-1.5">
                        <span>Ulasan</span>
                        <UTooltip text="Beri ulasan pengalaman Anda dan dapatkan bonus saldo hingga 1.000 Poin!">
                          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-[10px] text-amber-700 dark:text-amber-300 font-extrabold normal-case cursor-help">
                            <UIcon
                              name="i-lucide-gift"
                              class="w-3 h-3 text-amber-600 dark:text-amber-400"
                            />
                            <span>s/d 1.000 Poin</span>
                          </span>
                        </UTooltip>
                      </div>
                    </th>
                    <th class="py-3.5 px-4 font-bold text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/70">
                  <tr
                    v-for="item in filteredManuscripts"
                    :key="item.$id"
                    class="group hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <!-- 1. Naskah & Berkas -->
                    <td class="py-4 px-4 min-w-[280px] max-w-[340px]">
                      <div class="flex items-start gap-3">
                        <div
                          class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 dark:text-neutral-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/60 group-hover:text-primary-600 transition-colors shrink-0 mt-0.5"
                          title="Klik judul untuk melihat rincian"
                        >
                          <UIcon
                            name="i-lucide-file-text"
                            class="w-5 h-5"
                          />
                        </div>
                        <div class="min-w-0 flex-1 space-y-1">
                          <div
                            class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-primary-600 transition-colors cursor-pointer"
                            :title="item.title"
                            @click="openDetailModal(item)"
                          >
                            {{ item.title }}
                          </div>
                          <div
                            v-if="item.fileName"
                            class="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 truncate"
                          >
                            <UIcon
                              name="i-lucide-paperclip"
                              class="w-3 h-3 text-slate-400 shrink-0"
                            />
                            <span class="truncate">{{ item.fileName }}</span>
                            <span
                              v-if="item.fileSize"
                              class="text-[10px] text-slate-400 shrink-0"
                            >({{ formatFileSize(item.fileSize) }})</span>
                          </div>
                          <div class="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                            <span class="inline-flex items-center gap-1">
                              <UIcon
                                name="i-lucide-calendar"
                                class="w-3 h-3 text-slate-400"
                              />
                              <span>{{ formatDate(item.$createdAt) }}</span>
                            </span>
                            <span>•</span>
                            <span class="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500">ID: {{ item.$id.slice(-6) }}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- 2. Layanan & Biaya -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="space-y-1">
                        <span
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                          :class="getServiceMeta(item.serviceId).badgeClass"
                        >
                          <UIcon
                            :name="getServiceMeta(item.serviceId).icon"
                            class="w-3.5 h-3.5"
                          />
                          <span>{{ item.serviceName || getServiceMeta(item.serviceId).name }}</span>
                        </span>
                        <div
                          v-if="item.price"
                          class="text-[11px] text-slate-500 dark:text-neutral-400 font-medium pl-0.5"
                        >
                          {{ item.price }}
                        </div>
                      </div>
                    </td>

                    <!-- 3. Parameter -->
                    <td class="py-4 px-4 min-w-[140px] max-w-[180px]">
                      <!-- AI Engine -->
                      <div
                        v-if="getSummaryParams(item).type === 'ai'"
                        class="flex items-center gap-1"
                      >
                        <span
                          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                          :class="getSummaryParams(item).badgeClass"
                        >
                          <span>{{ getSummaryParams(item).flag }}</span>
                          <span>{{ getSummaryParams(item).label }}</span>
                        </span>
                      </div>
                      <!-- Similarity Filters -->
                      <div
                        v-else
                        class="space-y-1"
                      >
                        <div
                          v-if="getSummaryParams(item).items.length > 0"
                          class="flex flex-wrap gap-1"
                        >
                          <span
                            v-for="param in getSummaryParams(item).items.slice(0, 3)"
                            :key="param"
                            class="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200/50 dark:border-neutral-700/50"
                          >
                            {{ param }}
                          </span>
                          <span
                            v-if="getSummaryParams(item).items.length > 3"
                            class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-500"
                            :title="getSummaryParams(item).label"
                          >
                            +{{ getSummaryParams(item).items.length - 3 }}
                          </span>
                        </div>
                        <span
                          v-else
                          class="text-[11px] text-slate-400 italic"
                        >
                          Standar
                        </span>
                      </div>
                    </td>

                    <!-- 4. Status Pengerjaan -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                        :class="getStatusBadge(item.status).badgeClass"
                      >
                        <UIcon
                          :name="getStatusBadge(item.status).icon"
                          class="w-3.5 h-3.5"
                          :class="{ 'animate-spin': item.status === 'processing' }"
                        />
                        <span>{{ getStatusBadge(item.status).label }}</span>
                      </span>
                    </td>

                    <!-- 5. Skor Hasil -->
                    <td class="py-4 px-4 whitespace-nowrap text-center">
                      <div
                        v-if="getScoreBadge(item.similarityScore, item.serviceId)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border shadow-2xs"
                        :class="getScoreBadge(item.similarityScore, item.serviceId)?.badgeClass"
                      >
                        <span
                          class="w-2 h-2 rounded-full"
                          :class="getScoreBadge(item.similarityScore, item.serviceId)?.dotClass"
                        />
                        <span>{{ getScoreBadge(item.similarityScore, item.serviceId)?.prefix }}{{ getScoreBadge(item.similarityScore, item.serviceId)?.text }}</span>
                      </div>
                      <div
                        v-else
                        class="text-[11px] text-slate-400 italic flex items-center justify-center gap-1"
                      >
                        <span
                          v-if="item.status === 'processing'"
                          class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"
                        >
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          <span>Diproses</span>
                        </span>
                        <span v-else>{{ item.status === 'completed' ? '-' : 'Menunggu hasil' }}</span>
                      </div>
                    </td>

                    <!-- 6. Laporan Hasil -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <!-- Unduh Laporan PDF Hasil Resmi -->
                        <a
                          v-if="item.resultFileUrl"
                          :href="item.resultFileUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
                          title="Unduh laporan hasil resmi PDF"
                        >
                          <UIcon
                            name="i-lucide-download"
                            class="w-3.5 h-3.5"
                          />
                          <span>Laporan PDF</span>
                        </a>
                        <span
                          v-else
                          class="text-[11px] text-slate-400 italic"
                        >
                          {{ item.status === 'processing' ? 'Menunggu...' : '-' }}
                        </span>

                        <!-- Unduh Naskah Asli -->
                        <a
                          v-if="item.fileUrl"
                          :href="item.fileUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Unduh naskah asli yang Anda kirim"
                        >
                          <UIcon
                            name="i-lucide-file-down"
                            class="w-4 h-4"
                          />
                        </a>
                      </div>
                    </td>

                    <!-- 7. Ulasan & Poin (Kolom Baru) -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <!-- Belum review & Naskah selesai: Tombol Klaim Poin dengan Tooltip -->
                      <div v-if="(item.resultFileUrl || item.status === 'completed') && !isReviewed(item)">
                        <UTooltip text="Beri ulasan pengalaman Anda dan dapatkan bonus saldo gratis hingga 1.000 Poin!">
                          <button
                            type="button"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer animate-pulse"
                            @click="openReviewModal(item)"
                          >
                            <UIcon
                              name="i-lucide-gift"
                              class="w-3.5 h-3.5"
                            />
                            <span>Ulas (+s/d 1.000 Poin)</span>
                          </button>
                        </UTooltip>
                      </div>

                      <!-- Sudah review: Badge Ulasan dengan Tooltip -->
                      <div v-else-if="(item.resultFileUrl || item.status === 'completed') && isReviewed(item)">
                        <UTooltip :text="`Ulasan Anda: ${getReviewData(item).rating}.0 Bintang (${getReviewData(item).points > 0 ? '+' + getReviewData(item).points.toLocaleString('id-ID') + ' Poin didapatkan' : 'Tanpa bonus'})`">
                          <button
                            type="button"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50"
                            @click="openViewReviewModal(item)"
                          >
                            <UIcon
                              name="i-lucide-star"
                              class="w-3.5 h-3.5 fill-current text-amber-500"
                            />
                            <span>⭐ {{ getReviewData(item).rating }}.0</span>
                            <span
                              v-if="getReviewData(item).points > 0"
                              class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black"
                            >
                              +{{ getReviewData(item).points }}
                            </span>
                          </button>
                        </UTooltip>
                      </div>

                      <!-- Belum selesai: Keterangan terkunci dengan Tooltip -->
                      <div v-else>
                        <UTooltip text="Setelah naskah selesai diproses, Anda dapat memberikan ulasan untuk klaim saldo hingga 1.000 Poin.">
                          <span class="inline-flex items-center gap-1 text-[11px] text-slate-400 italic cursor-help">
                            <UIcon
                              name="i-lucide-lock"
                              class="w-3 h-3 text-slate-400"
                            />
                            <span>Tersedia setelah selesai</span>
                          </span>
                        </UTooltip>
                      </div>
                    </td>

                    <!-- 8. Aksi -->
                    <td class="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                        title="Lihat rincian lengkap naskah"
                        @click="openDetailModal(item)"
                      >
                        <UIcon
                          name="i-lucide-info"
                          class="w-3.5 h-3.5 text-primary-500"
                        />
                        <span>Rincian</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer Ringkasan Tabel -->
            <div class="px-5 py-3.5 bg-slate-50/70 dark:bg-neutral-950/40 border-t border-slate-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-neutral-400">
              <div class="flex items-center gap-2">
                <span>Menampilkan <b>{{ filteredManuscripts.length }}</b> dari <b>{{ manuscripts.length }}</b> naskah</span>
                <span
                  v-if="filteredManuscripts.length < manuscripts.length"
                  class="text-amber-600 dark:text-amber-400 font-medium"
                >
                  (Filter Aktif)
                </span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800 text-xs font-semibold text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                  @click="fetchUserManuscripts()"
                >
                  <UIcon
                    name="i-lucide-refresh-cw"
                    class="w-3.5 h-3.5"
                    :class="{ 'animate-spin': manuscriptsLoading }"
                  />
                  <span>Segarkan</span>
                </button>
              </div>
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

                  <!-- Review Button Card View with Tooltips -->
                  <UTooltip
                    v-if="(item.resultFileUrl || item.status === 'completed') && !isReviewed(item)"
                    text="Beri ulasan pengalaman Anda dan dapatkan bonus saldo gratis hingga 1.000 Poin!"
                  >
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer animate-pulse"
                      @click="openReviewModal(item)"
                    >
                      <UIcon
                        name="i-lucide-gift"
                        class="w-3.5 h-3.5"
                      />
                      <span>Ulas (+s/d 1.000 Poin)</span>
                    </button>
                  </UTooltip>

                  <UTooltip
                    v-else-if="(item.resultFileUrl || item.status === 'completed') && isReviewed(item)"
                    :text="`Ulasan Anda: ${getReviewData(item).rating}.0 Bintang (${getReviewData(item).points > 0 ? '+' + getReviewData(item).points.toLocaleString('id-ID') + ' Poin' : 'Tanpa bonus'})`"
                  >
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50"
                      @click="openViewReviewModal(item)"
                    >
                      <UIcon
                        name="i-lucide-star"
                        class="w-3.5 h-3.5 fill-current text-amber-500"
                      />
                      <span>⭐ {{ getReviewData(item).rating }}</span>
                    </button>
                  </UTooltip>

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

              <button
                v-if="(selectedManuscript.resultFileUrl || selectedManuscript.status === 'completed') && !isReviewed(selectedManuscript)"
                type="button"
                class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                @click="openReviewModal(selectedManuscript); isDetailModalOpen = false"
              >
                <UIcon
                  name="i-lucide-star"
                  class="w-3.5 h-3.5 fill-current"
                />
                <span>Beri Review (+Poin)</span>
              </button>

              <button
                v-else-if="(selectedManuscript.resultFileUrl || selectedManuscript.status === 'completed') && isReviewed(selectedManuscript)"
                type="button"
                class="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                @click="openViewReviewModal(selectedManuscript); isDetailModalOpen = false"
              >
                <UIcon
                  name="i-lucide-star"
                  class="w-3.5 h-3.5 fill-current text-amber-500"
                />
                <span>Ulasan Anda (⭐ {{ getReviewData(selectedManuscript).rating }})</span>
              </button>

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

    <!-- MODAL FORM REVIEW & KLAIM POIN -->
    <UModal
      v-model:open="isReviewModalOpen"
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template #content>
        <div class="p-6 space-y-5">
          <!-- Celebration State (Setelah Berhasil Kirim) -->
          <div
            v-if="awardedPointsCelebration !== null"
            class="text-center py-6 space-y-4"
          >
            <div class="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
              <UIcon
                name="i-lucide-sparkles"
                class="w-8 h-8 fill-current"
              />
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Ulasan Berhasil Dikirim!
              </h3>
              <p class="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                Terima kasih telah berbagi pengalaman Anda. Ulasan Anda sangat berharga bagi sesama akademisi dan akan ditampilkan secara publik.
              </p>
            </div>

            <!-- Reward Points Badge -->
            <div
              v-if="awardedPointsCelebration > 0"
              class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 max-w-xs mx-auto space-y-1"
            >
              <div class="text-[11px] font-bold uppercase tracking-wider">
                Bonus Poin Diterima
              </div>
              <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{{ awardedPointsCelebration.toLocaleString('id-ID') }} Poin
              </div>
              <div class="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
                Saldo poin akun Anda telah otomatis bertambah!
              </div>
            </div>

            <div class="pt-2">
              <button
                type="button"
                class="px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-all cursor-pointer"
                @click="isReviewModalOpen = false"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>

          <!-- Form Review State -->
          <div
            v-else
            class="space-y-4"
          >
            <!-- Header Modal -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                  <UIcon
                    name="i-lucide-star"
                    class="w-5 h-5 fill-current"
                  />
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">
                    Beri Ulasan & Dapatkan Poin
                  </h3>
                  <p class="text-[11px] text-slate-500 dark:text-neutral-400">
                    Naskah: {{ reviewTarget?.title }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
                @click="isReviewModalOpen = false"
              >
                <UIcon
                  name="i-lucide-x"
                  class="w-4 h-4"
                />
              </button>
            </div>

            <!-- Notice Publik (Sesuai Aturan Kebutuhan) -->
            <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <UIcon
                name="i-lucide-info"
                class="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5"
              />
              <div class="space-y-0.5 leading-relaxed text-[11px]">
                <span class="font-bold">Pemberitahuan Publik:</span>
                <p>
                  Ulasan, nama akun, dan rating bintang yang Anda kirimkan akan ditampilkan secara publik di halaman Testimoni & Beranda kami. Dokumen naskah Anda tetap 100% terjaga kerahasiaannya.
                </p>
              </div>
            </div>

            <!-- Identitas Akademik: Profesi & Afiliasi Kampus (Tersinkronisasi ke Profil Akun) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1">
                  <UIcon
                    name="i-lucide-briefcase"
                    class="w-3.5 h-3.5 text-primary-500"
                  />
                  <span>Profesi / Pekerjaan:</span>
                </label>
                <select
                  v-model="reviewOccupation"
                  class="w-full py-2 px-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">
                    -- Pilih Profesi / Jenjang --
                  </option>
                  <option
                    v-for="opt in OCCUPATION_OPTIONS"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>
                <input
                  v-if="reviewOccupation === 'Lainnya'"
                  v-model="reviewCustomOccupation"
                  type="text"
                  placeholder="Ketik profesi Anda..."
                  class="w-full mt-1.5 py-1.5 px-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1">
                  <UIcon
                    name="i-lucide-building-2"
                    class="w-3.5 h-3.5 text-primary-500"
                  />
                  <span>Afiliasi / Kampus / Instansi:</span>
                </label>
                <input
                  v-model="reviewAffiliation"
                  type="text"
                  placeholder="Contoh: Universitas Indonesia, ITB, BRIN..."
                  class="w-full py-2 px-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-slate-400"
                >
                <p class="text-[10px] text-slate-400 dark:text-neutral-500 leading-tight">
                  Tampil pada kartu ulasan & otomatis tersimpan ke profil Anda.
                </p>
              </div>
            </div>

            <!-- Pemilihan Bintang (Rating 1 - 5) -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                Tingkat Kepuasan Layanan:
              </label>
              <div
                class="flex items-center gap-2 flex-wrap"
                @mouseleave="reviewHoverRating = 0"
              >
                <div class="flex items-center gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="p-1 rounded-xl hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                    @click="reviewRating = star"
                    @mouseenter="reviewHoverRating = star"
                  >
                    <!-- Bintang Terisi (Solid Filled) -->
                    <svg
                      v-if="star <= (reviewHoverRating || reviewRating)"
                      class="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-xs"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>

                    <!-- Bintang Kosong (Outline) -->
                    <svg
                      v-else
                      class="w-7 h-7 text-slate-300 dark:text-neutral-700 hover:text-amber-300 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Keterangan Kepuasan (Tanpa Bintang Emoji) -->
                <span class="ml-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                  {{ (reviewHoverRating || reviewRating) === 5 ? 'Sangat Puas' : (reviewHoverRating || reviewRating) === 4 ? 'Puas' : (reviewHoverRating || reviewRating) === 3 ? 'Cukup' : (reviewHoverRating || reviewRating) === 2 ? 'Kurang Puas' : 'Sangat Kecewa' }}
                </span>
              </div>
            </div>

            <!-- Teks Review -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <label class="font-bold text-slate-700 dark:text-neutral-300">
                  Ulasan & Pengalaman Anda:
                </label>
                <span
                  class="font-mono text-[11px]"
                  :class="reviewComment.trim().length >= 15 ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'"
                >
                  {{ reviewComment.trim().length }} / 2.500 karakter
                </span>
              </div>
              <textarea
                v-model="reviewComment"
                rows="4"
                placeholder="Ceritakan pengalaman Anda terkait kecepatan proses, keakuratan laporan Turnitin/iThenticate, maupun pelayanan admin kami..."
                class="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all leading-relaxed placeholder:text-slate-400"
              />
            </div>

            <!-- Live Reward Points Gamification Indicator -->
            <div class="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <UIcon
                    name="i-lucide-gift"
                    class="w-3.5 h-3.5"
                  />
                  <span>{{ currentRewardPreview.tierName }}</span>
                </span>
                <span
                  v-if="currentRewardPreview.points > 0"
                  class="px-2 py-0.5 rounded-md font-black text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  +{{ currentRewardPreview.points.toLocaleString('id-ID') }} Poin
                </span>
                <span
                  v-else
                  class="text-[10px] text-slate-400"
                >
                  Tanpa Poin
                </span>
              </div>
              <p
                v-if="currentRewardPreview.nextTierHint"
                class="text-[11px] text-amber-700 dark:text-amber-400 font-medium"
              >
                💡 {{ currentRewardPreview.nextTierHint }}
              </p>
            </div>

            <!-- Error Feedback -->
            <div
              v-if="reviewError"
              class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-alert-circle"
                class="w-4 h-4 shrink-0"
              />
              <span>{{ reviewError }}</span>
            </div>

            <!-- Footer Actions -->
            <div class="flex items-center justify-between pt-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                @click="isReviewModalOpen = false"
              >
                Batal
              </button>

              <button
                type="button"
                :disabled="isSubmittingReview || reviewComment.trim().length < 15"
                class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                @click="handleSubmitReview()"
              >
                <UIcon
                  v-if="isSubmittingReview"
                  name="i-lucide-loader-2"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <UIcon
                  v-else
                  name="i-lucide-send"
                  class="w-3.5 h-3.5"
                />
                <span>Kirim Ulasan & Klaim Poin</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- MODAL LIHAT ULASAN SAYA -->
    <UModal
      v-model:open="isViewReviewModalOpen"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #content>
        <div
          v-if="reviewTarget"
          class="p-6 space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                <UIcon
                  name="i-lucide-star"
                  class="w-5 h-5 fill-current"
                />
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Ulasan Anda
              </h3>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
              @click="isViewReviewModalOpen = false"
            >
              <UIcon
                name="i-lucide-x"
                class="w-4 h-4"
              />
            </button>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-850 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <svg
                  v-for="s in 5"
                  :key="s"
                  class="w-4 h-4 fill-current"
                  :class="s <= getReviewData(reviewTarget).rating ? 'text-amber-400' : 'text-slate-300 dark:text-neutral-700'"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="ml-1 text-xs font-bold text-slate-900 dark:text-white">
                  {{ getReviewData(reviewTarget).rating }}.0
                </span>
              </div>
              <span
                v-if="getReviewData(reviewTarget).points > 0"
                class="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                +{{ getReviewData(reviewTarget).points.toLocaleString('id-ID') }} Poin Diterima
              </span>
            </div>
            <div class="text-[11px] text-slate-400">
              Naskah: <b>{{ reviewTarget.title }}</b>
            </div>
            <div
              v-if="getReviewData(reviewTarget).occupation || getReviewData(reviewTarget).affiliation"
              class="text-[11px] text-primary-600 dark:text-primary-400 font-medium pt-0.5"
            >
              💼 {{ [getReviewData(reviewTarget).occupation, getReviewData(reviewTarget).affiliation].filter(Boolean).join(' • ') }}
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 dark:text-neutral-300">Isi Testimoni:</label>
            <div class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-200 italic leading-relaxed whitespace-pre-line">
              "{{ getReviewData(reviewTarget).comment || 'Ulasan telah terkirim.' }}"
            </div>
          </div>

          <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <UIcon
              name="i-lucide-check-circle"
              class="w-4 h-4 shrink-0 text-blue-500"
            />
            <span>Testimoni ini telah terverifikasi dan aktif di halaman publik.</span>
          </div>

          <div class="flex justify-end pt-1">
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold text-xs"
              @click="isViewReviewModalOpen = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>
