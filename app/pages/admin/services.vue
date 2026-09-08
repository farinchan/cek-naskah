<script setup lang="ts">
import type { ServicePlan, BundlePlan } from '~/composables/useServices'

definePageMeta({
  middleware: 'admin'
})

useSeoMeta({
  title: 'Layanan & Tarif — Panel Admin Cek Naskah',
  description: 'Kelola katalog layanan pemeriksaan naskah, tarif resmi, paket bundling, dan pengaturan template pesan pemesanan.',
  ogTitle: 'Layanan & Tarif — Panel Admin Cek Naskah',
  ogDescription: 'Kelola katalog layanan pemeriksaan naskah, tarif resmi, paket bundling, dan pengaturan template pesan pemesanan.',
  robots: 'noindex, nofollow'
})

const { user: currentUser, fetchUser, isAdmin, userAvatar } = useAuth()
const { formatPriceToPoints } = usePoints()
const {
  services,
  bundles,
  metrics,
  loading: isServicesLoading,
  saving: isServicesSaving,
  error: serviceError,
  success: serviceSuccess,
  clearFeedback,
  fetchServices,
  addService,
  updateService,
  deleteService,
  toggleServiceStatus,
  toggleServiceVisibility,
  toggleServiceHighlight,
  addBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  toggleBundleVisibility,
  resetToDefaults
} = useServices()

const isPageLoading = ref(true)
const isRefreshing = ref(false)
const activeTab = ref<'services' | 'bundles'>('services')
const searchQuery = ref('')
const statusFilter = ref<'all' | 'visible' | 'hidden' | 'active' | 'inactive'>('all')
const viewMode = ref<'table' | 'cards'>('table')

// --- Modal States: Services ---
const isServiceModalOpen = ref(false)
const isEditingService = ref(false)
const editingServiceId = ref<string | null>(null)
const serviceForm = ref({
  name: '',
  tag: '',
  price: '',
  unit: '/ naskah',
  description: '',
  featuresText: '',
  highlight: false,
  active: true,
  visible: true,
  ctaText: 'Pesan Layanan',
  ctaLink: '',
  order: 1
})

// --- Modal States: Bundles ---
const isBundleModalOpen = ref(false)
const isEditingBundle = ref(false)
const editingBundleId = ref<string | null>(null)
const bundleForm = ref({
  title: '',
  price: '',
  saving: 'Hemat Rp 5.000',
  desc: '',
  itemsText: '',
  active: true,
  visible: true,
  ctaLink: '',
  order: 1
})

// --- Modal States: Confirmations ---
const isDeleteModalOpen = ref(false)
const deleteType = ref<'service' | 'bundle'>('service')
const itemToDelete = ref<{ id: string, name: string } | null>(null)

const isResetModalOpen = ref(false)

// Filtered lists
const filteredServices = computed(() => {
  return services.value.filter((s) => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = s.name.toLowerCase().includes(q)
      const matchTag = s.tag.toLowerCase().includes(q)
      const matchDesc = s.description.toLowerCase().includes(q)
      if (!matchName && !matchTag && !matchDesc) return false
    }

    if (statusFilter.value === 'visible' && s.visible === false) return false
    if (statusFilter.value === 'hidden' && s.visible !== false) return false
    if (statusFilter.value === 'active' && !s.active) return false
    if (statusFilter.value === 'inactive' && s.active) return false

    return true
  })
})

const filteredBundles = computed(() => {
  return bundles.value.filter((b) => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = b.title.toLowerCase().includes(q)
      const matchDesc = b.desc.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc) return false
    }

    if (statusFilter.value === 'visible' && b.visible === false) return false
    if (statusFilter.value === 'hidden' && b.visible !== false) return false
    if (statusFilter.value === 'active' && !b.active) return false
    if (statusFilter.value === 'inactive' && b.active) return false

    return true
  })
})

// Service Modal Handlers
const openAddServiceModal = () => {
  clearFeedback()
  isEditingService.value = false
  editingServiceId.value = null
  serviceForm.value = {
    name: '',
    tag: '',
    price: 'Rp ',
    unit: '/ naskah',
    description: '',
    featuresText: '',
    highlight: false,
    active: true,
    visible: true,
    ctaText: 'Pesan Layanan',
    ctaLink: '',
    order: services.value.length + 1
  }
  isServiceModalOpen.value = true
}

const openEditServiceModal = (item: ServicePlan) => {
  clearFeedback()
  isEditingService.value = true
  editingServiceId.value = item.id
  serviceForm.value = {
    name: item.name,
    tag: item.tag,
    price: item.price,
    unit: item.unit,
    description: item.description,
    featuresText: (item.features || []).join('\n'),
    highlight: item.highlight,
    active: item.active,
    visible: item.visible !== false,
    ctaText: item.ctaText,
    ctaLink: item.ctaLink || '',
    order: item.order || 1
  }
  isServiceModalOpen.value = true
}

const handleSaveService = async () => {
  const features = serviceForm.value.featuresText
    .split('\n')
    .map(f => f.trim())
    .filter(f => f.length > 0)

  const payload: Omit<ServicePlan, 'id'> = {
    name: serviceForm.value.name.trim(),
    tag: serviceForm.value.tag.trim(),
    price: serviceForm.value.price.trim(),
    unit: serviceForm.value.unit.trim(),
    description: serviceForm.value.description.trim(),
    features,
    highlight: serviceForm.value.highlight,
    active: serviceForm.value.active,
    visible: serviceForm.value.visible,
    ctaText: serviceForm.value.ctaText.trim(),
    ctaLink: serviceForm.value.ctaLink.trim(),
    order: Number(serviceForm.value.order) || 1
  }

  let ok = false
  if (isEditingService.value && editingServiceId.value) {
    ok = await updateService(editingServiceId.value, payload)
  } else {
    ok = await addService(payload)
  }

  if (ok) {
    isServiceModalOpen.value = false
  }
}

// Bundle Modal Handlers
const openAddBundleModal = () => {
  clearFeedback()
  isEditingBundle.value = false
  editingBundleId.value = null
  bundleForm.value = {
    title: '',
    price: 'Rp ',
    saving: 'Hemat Rp 5.000',
    desc: '',
    itemsText: '',
    active: true,
    visible: true,
    ctaLink: '',
    order: bundles.value.length + 1
  }
  isBundleModalOpen.value = true
}

const openEditBundleModal = (item: BundlePlan) => {
  clearFeedback()
  isEditingBundle.value = true
  editingBundleId.value = item.id
  bundleForm.value = {
    title: item.title,
    price: item.price,
    saving: item.saving,
    desc: item.desc,
    itemsText: (item.items || []).join('\n'),
    active: item.active,
    visible: item.visible !== false,
    ctaLink: item.ctaLink || '',
    order: item.order || 1
  }
  isBundleModalOpen.value = true
}

const handleSaveBundle = async () => {
  const items = bundleForm.value.itemsText
    .split('\n')
    .map(i => i.trim())
    .filter(i => i.length > 0)

  const payload: Omit<BundlePlan, 'id'> = {
    title: bundleForm.value.title.trim(),
    price: bundleForm.value.price.trim(),
    saving: bundleForm.value.saving.trim(),
    desc: bundleForm.value.desc.trim(),
    items,
    active: bundleForm.value.active,
    visible: bundleForm.value.visible,
    ctaLink: bundleForm.value.ctaLink.trim(),
    order: Number(bundleForm.value.order) || 1
  }

  let ok = false
  if (isEditingBundle.value && editingBundleId.value) {
    ok = await updateBundle(editingBundleId.value, payload)
  } else {
    ok = await addBundle(payload)
  }

  if (ok) {
    isBundleModalOpen.value = false
  }
}

// Delete Handlers
const openDeleteModal = (type: 'service' | 'bundle', id: string, name: string) => {
  deleteType.value = type
  itemToDelete.value = { id, name }
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  let ok = false
  if (deleteType.value === 'service') {
    ok = await deleteService(itemToDelete.value.id)
  } else {
    ok = await deleteBundle(itemToDelete.value.id)
  }

  if (ok) {
    isDeleteModalOpen.value = false
    itemToDelete.value = null
  }
}

// Reset Handler
const handleConfirmReset = async () => {
  const ok = await resetToDefaults()
  if (ok) {
    isResetModalOpen.value = false
  }
}

// Refresh Data Handler
const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      fetchUser(),
      fetchServices(true)
    ])
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  isPageLoading.value = true
  try {
    const user = await fetchUser()
    if (!user) {
      navigateTo('/login?redirect=/admin/services')
      return
    }
    await fetchServices()
  } finally {
    isPageLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1 py-8 sm:py-12 bg-slate-50/70 dark:bg-neutral-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header & Title Bar -->
        <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                Panel Admin
              </span>
              <span class="text-slate-300 dark:text-neutral-700">•</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                Katalog Layanan & Tarif
              </span>
              <span class="text-slate-300 dark:text-neutral-700">•</span>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                TablesDB: services
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Layanan & Tarif
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Kelola daftar produk pemeriksaan naskah, tarif resmi, paket bundling hemat, dan template pesan WhatsApp pemesanan.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              class="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              :disabled="isRefreshing || isServicesLoading"
              title="Sinkronkan data layanan dari Appwrite"
              @click="handleRefresh"
            >
              <svg
                class="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400"
                :class="{ 'animate-spin': isRefreshing || isServicesLoading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{{ isRefreshing || isServicesLoading ? 'Memuat...' : 'Sinkronkan' }}</span>
            </button>

            <button
              type="button"
              class="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-primary-500/25 cursor-pointer"
              @click="openAddServiceModal"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Tambah Layanan</span>
            </button>

            <button
              type="button"
              class="px-3.5 py-2.5 rounded-xl border border-primary-200 dark:border-primary-800/60 bg-primary-50/70 dark:bg-primary-950/40 hover:bg-primary-100 text-primary-700 dark:text-primary-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              @click="openAddBundleModal"
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span>Tambah Bundling</span>
            </button>
          </div>
        </div>

        <!-- Success Alert -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="serviceSuccess"
            class="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm"
          >
            <div class="flex items-center gap-2.5">
              <svg
                class="w-5 h-5 text-emerald-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ serviceSuccess }}</span>
            </div>
            <button
              type="button"
              class="text-emerald-600 hover:text-emerald-800 cursor-pointer"
              @click="clearFeedback"
            >
              ✕
            </button>
          </div>
        </Transition>

        <!-- Error Alert -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="serviceError"
            class="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm"
          >
            <div class="flex items-center gap-2.5">
              <svg
                class="w-5 h-5 text-rose-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{{ serviceError }}</span>
            </div>
            <button
              type="button"
              class="text-rose-600 hover:text-rose-800 cursor-pointer"
              @click="clearFeedback"
            >
              ✕
            </button>
          </div>
        </Transition>

        <!-- MAIN LAYOUT GRID: SIDEBAR (KIRI) + KONTEN UTAMA (KANAN) -->
        <div class="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          <!-- SIDEBAR SEDERHANA: DAFTAR TOMBOL-TOMBOL -->
          <aside class="w-full md:w-56 lg:w-60 shrink-0 md:sticky md:top-6 space-y-4">
            <!-- Card Navigasi Menu Admin -->
            <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 space-y-1.5">
              <div class="px-2.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center justify-between">
                <span>Menu Admin</span>
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                  :class="isAdmin ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
                >
                  {{ isAdmin ? 'Admin' : 'Tamu' }}
                </span>
              </div>

              <!-- Tombol 1: Setting / Pengaturan (/admin/setting) -->
              <NuxtLink
                to="/admin/setting"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <svg
                    class="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span class="truncate">Setting</span>
                </div>
              </NuxtLink>

              <!-- Tombol 2: Pengguna & Akses (/admin/users) -->
              <NuxtLink
                to="/admin/users"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <svg
                    class="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span class="truncate">Pengguna & Akses</span>
                </div>
              </NuxtLink>

              <!-- Tombol 3: Manajemen Naskah (Segera) -->
              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <svg
                    class="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500"
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
                  <span class="truncate">Kelola Naskah</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 font-medium">
                  Segera
                </span>
              </button>

              <!-- Tombol 4: Layanan & Tarif (/admin/services) -> AKTIF -->
              <NuxtLink
                to="/admin/services"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all bg-primary-600 text-white shadow-md shadow-primary-500/20"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <svg
                    class="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span class="truncate">Layanan & Tarif</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-white shadow-sm" />
              </NuxtLink>

              <!-- Tombol 5: Statistik & Log (Segera) -->
              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <svg
                    class="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span class="truncate">Statistik & Log</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 font-medium">
                  Segera
                </span>
              </button>

              <!-- Garis Pemisah & Navigasi Luar -->
              <div class="pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800/80 space-y-1">
                <NuxtLink
                  to="/profile"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profil Pengguna</span>
                </NuxtLink>

                <NuxtLink
                  to="/"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Kembali ke Beranda</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Card Informasi Status Akun -->
            <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-sm shadow-primary-500/20">
                  <img
                    v-if="userAvatar"
                    :src="userAvatar"
                    :alt="currentUser?.name || 'Profil'"
                    class="w-full h-full object-cover"
                  >
                  <span v-else>{{ currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ currentUser?.name || 'Administrator' }}
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    {{ currentUser?.email }}
                  </div>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                <span class="text-slate-500 dark:text-neutral-400">Hak Akses:</span>
                <span
                  class="px-2 py-0.5 rounded-md font-bold text-[10px]"
                  :class="isAdmin
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
                >
                  {{ isAdmin ? 'Label admin (Aktif)' : 'Akses Dibatasi' }}
                </span>
              </div>
            </div>
          </aside>

          <!-- KONTEN UTAMA: METRICS, DAFTAR LAYANAN & TARIF (KANAN) -->
          <section class="flex-1 w-full min-w-0 space-y-6">
            <!-- Metric KPI Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- KPI 1: Total Produk -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Total Produk</span>
                  <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.totalServices + metrics.totalBundles }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  {{ metrics.totalServices }} layanan, {{ metrics.totalBundles }} bundling
                </p>
              </div>

              <!-- KPI 2: Tampil di Web -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Tampil di Web</span>
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UIcon
                      name="i-lucide-eye"
                      class="w-4 h-4"
                    />
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.visibleServices }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  {{ metrics.hiddenServices }} disembunyikan
                </p>
              </div>

              <!-- KPI 3: Ketersediaan -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Layanan Tersedia</span>
                  <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.activeServices }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  {{ metrics.inactiveServices }} tidak tersedia (tutup)
                </p>
              </div>

              <!-- KPI 4: Layanan Unggulan -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Rekomendasi Utama</span>
                  <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
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
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.highlightedServices }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  Berlabel rekomendasi utama
                </p>
              </div>
            </div>

            <!-- Tab Switcher & Search Filter Bar -->
            <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-5 space-y-4">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-4">
                <!-- Tabs: Layanan Utama vs Bundling -->
                <div class="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-neutral-800/80">
                  <button
                    type="button"
                    class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    :class="activeTab === 'services'
                      ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
                    @click="activeTab = 'services'"
                  >
                    <span>Layanan Utama</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 dark:bg-neutral-700">
                      {{ services.length }}
                    </span>
                  </button>

                  <button
                    type="button"
                    class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    :class="activeTab === 'bundles'
                      ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
                    @click="activeTab = 'bundles'"
                  >
                    <span>Paket Bundling</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 dark:bg-neutral-700">
                      {{ bundles.length }}
                    </span>
                  </button>
                </div>

                <!-- Reset to Default Button -->
                <button
                  type="button"
                  class="text-xs text-slate-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-center"
                  title="Kembalikan semua layanan dan bundling ke pengaturan bawaan"
                  @click="isResetModalOpen = true"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Reset Default</span>
                </button>
              </div>

              <!-- Search & Status Filter Controls & View Switcher -->
              <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="activeTab === 'services' ? 'Cari nama layanan, tag, atau deskripsi...' : 'Cari paket bundling...'"
                    class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                </div>

                <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <select
                    v-model="statusFilter"
                    class="px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-2xl text-xs text-slate-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="all">
                      Semua Status
                    </option>
                    <option value="visible">
                      Tampil di Web
                    </option>
                    <option value="hidden">
                      Disembunyikan
                    </option>
                    <option value="active">
                      Layanan Tersedia
                    </option>
                    <option value="inactive">
                      Tidak Tersedia
                    </option>
                  </select>

                  <!-- View Mode Switcher (Tabel / Kartu) -->
                  <div class="flex items-center p-1 bg-slate-100 dark:bg-neutral-800 rounded-2xl shrink-0">
                    <button
                      type="button"
                      class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      :class="viewMode === 'table'
                        ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'"
                      title="Tampilan Tabel Data"
                      @click="viewMode = 'table'"
                    >
                      <UIcon
                        name="i-lucide-table"
                        class="w-3.5 h-3.5"
                      />
                      <span class="hidden md:inline">Tabel</span>
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      :class="viewMode === 'cards'
                        ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'"
                      title="Tampilan Kartu"
                      @click="viewMode = 'cards'"
                    >
                      <UIcon
                        name="i-lucide-layout-grid"
                        class="w-3.5 h-3.5"
                      />
                      <span class="hidden md:inline">Kartu</span>
                    </button>
                  </div>

                  <!-- Quick Add Button -->
                  <button
                    v-if="activeTab === 'services'"
                    type="button"
                    class="px-3.5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                    @click="openAddServiceModal"
                  >
                    <UIcon
                      name="i-lucide-plus"
                      class="w-3.5 h-3.5"
                    />
                    <span class="hidden sm:inline">Tambah Layanan</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="px-3.5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                    @click="openAddBundleModal"
                  >
                    <UIcon
                      name="i-lucide-plus"
                      class="w-3.5 h-3.5"
                    />
                    <span class="hidden sm:inline">Tambah Paket</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- VIEW 1: DAFTAR LAYANAN UTAMA -->
            <div
              v-if="activeTab === 'services'"
              class="space-y-4"
            >
              <!-- Empty State -->
              <div
                v-if="filteredServices.length === 0"
                class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-12 text-center"
              >
                <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 mb-3">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                  Tidak Ada Layanan
                </h3>
                <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                  {{ searchQuery ? 'Tidak ada layanan yang cocok dengan pencarian Anda.' : 'Belum ada produk layanan yang ditambahkan.' }}
                </p>
                <button
                  type="button"
                  class="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  @click="openAddServiceModal"
                >
                  + Tambah Layanan Baru
                </button>
              </div>

              <!-- TABEL MODE (Default Table View dengan Kolom Tampilkan di Web) -->
              <div
                v-else-if="viewMode === 'table'"
                class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden"
              >
                <div class="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                      Katalog Layanan Utama
                    </h3>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                      {{ filteredServices.length }} dari {{ services.length }}
                    </span>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-neutral-500">
                    Klik badge status / visibilitas untuk ubah langsung
                  </span>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50/80 dark:bg-neutral-800/40 text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-neutral-800">
                      <tr>
                        <th class="px-6 py-3.5">
                          Layanan / Produk
                        </th>
                        <th class="px-4 py-3.5">
                          Tarif
                        </th>
                        <th class="px-4 py-3.5">
                          Tampilkan di Web
                        </th>
                        <th class="px-4 py-3.5">
                          Ketersediaan Layanan
                        </th>
                        <th class="px-4 py-3.5">
                          CTA Link
                        </th>
                        <th class="px-4 py-3.5 text-center">
                          Urutan
                        </th>
                        <th class="px-6 py-3.5 text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/80">
                      <tr
                        v-for="plan in filteredServices"
                        :key="plan.id"
                        class="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                        :class="{ 'bg-amber-50/30 dark:bg-amber-950/10': plan.highlight }"
                      >
                        <!-- Kolom 1: Layanan / Produk -->
                        <td class="px-6 py-4">
                          <div class="flex items-start gap-3">
                            <div
                              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                              :class="plan.highlight
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                : 'bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400'"
                            >
                              <UIcon
                                :name="plan.highlight ? 'i-lucide-star' : 'i-lucide-file-text'"
                                class="w-4 h-4"
                              />
                            </div>
                            <div class="min-w-0">
                              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                <span>{{ plan.name }}</span>
                              </div>
                              <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 line-clamp-1 max-w-sm">
                                {{ plan.description }}
                              </p>
                            </div>
                          </div>
                        </td>

                        <!-- Kolom 2: Tarif -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <div class="font-bold text-sm text-primary-600 dark:text-primary-400">
                            {{ plan.price }}
                          </div>
                          <div class="text-[11px] text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 mt-0.5">
                            <span>🪙</span>
                            <span>{{ formatPriceToPoints(plan.price) }}</span>
                          </div>
                          <div class="text-[10px] text-slate-400 dark:text-neutral-500">
                            {{ plan.unit || '/ naskah' }}
                          </div>
                        </td>

                        <!-- Kolom 3: TAMPILKAN DI WEB (Kolom Khusus) -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            class="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border"
                            :class="plan.visible !== false
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 hover:bg-blue-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-100'"
                            :title="plan.visible !== false ? 'Klik untuk sembunyikan dari website publik' : 'Klik untuk tampilkan di website publik'"
                            @click="toggleServiceVisibility(plan.id)"
                          >
                            <UIcon
                              :name="plan.visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                              class="w-3.5 h-3.5"
                            />
                            <span>{{ plan.visible !== false ? 'Tampil' : 'Disembunyikan' }}</span>
                          </button>
                        </td>

                        <!-- Kolom 4: KETERSEDIAAN (Status Pemesanan) -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            class="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border"
                            :class="plan.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 hover:bg-amber-100'"
                            :title="plan.active ? 'Klik untuk ubah jadi Tidak Tersedia (tombol tidak bisa ditekan)' : 'Klik untuk ubah jadi Tersedia (tombol aktif)'"
                            @click="toggleServiceStatus(plan.id)"
                          >
                            <span
                              class="w-2 h-2 rounded-full"
                              :class="plan.active ? 'bg-emerald-500' : 'bg-amber-500'"
                            />
                            <span>{{ plan.active ? 'Tersedia' : 'Tidak Tersedia' }}</span>
                          </button>
                        </td>

                        <!-- Kolom 5: CTA Link -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <div class="flex items-center gap-1.5">
                            <a
                              v-if="plan.ctaLink"
                              :href="plan.ctaLink"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 max-w-[150px] truncate"
                              :title="plan.ctaLink"
                            >
                              <UIcon
                                name="i-lucide-external-link"
                                class="w-3.5 h-3.5 shrink-0"
                              />
                              <span class="truncate">{{ plan.ctaLink }}</span>
                            </a>
                            <span
                              v-else
                              class="text-[11px] text-slate-400 dark:text-neutral-500 italic"
                            >
                              Default WhatsApp
                            </span>
                          </div>
                        </td>

                        <!-- Kolom 6: Urutan -->
                        <td class="px-4 py-4 whitespace-nowrap text-center">
                          <span class="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                            #{{ plan.order || 1 }}
                          </span>
                        </td>

                        <!-- Kolom 7: Aksi -->
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <!-- Toggle Highlight -->
                            <button
                              type="button"
                              class="p-1.5 rounded-lg transition-colors cursor-pointer"
                              :class="plan.highlight
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-neutral-800'"
                              :title="plan.highlight ? 'Hilangkan tanda rekomendasi' : 'Jadikan rekomendasi utama'"
                              @click="toggleServiceHighlight(plan.id)"
                            >
                              <UIcon
                                name="i-lucide-star"
                                class="w-4 h-4"
                              />
                            </button>

                            <!-- Edit Button -->
                            <button
                              type="button"
                              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
                              @click="openEditServiceModal(plan)"
                            >
                              Edit
                            </button>

                            <!-- Delete Button -->
                            <button
                              type="button"
                              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Hapus Layanan"
                              @click="openDeleteModal('service', plan.id, plan.name)"
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

              <!-- CARDS MODE (Tampilan Kartu Grid) -->
              <div
                v-else
                class="grid md:grid-cols-2 gap-4"
              >
                <div
                  v-for="plan in filteredServices"
                  :key="plan.id"
                  class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border transition-all flex flex-col justify-between shadow-sm relative"
                  :class="plan.highlight
                    ? 'border-primary-400/80 dark:border-primary-600/80 ring-2 ring-primary-500/10'
                    : 'border-slate-200/80 dark:border-neutral-800'"
                >
                  <!-- Card Top: Tags & Status -->
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-3">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                          {{ plan.tag || 'Layanan' }}
                        </span>
                        <span
                          v-if="plan.highlight"
                          class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1"
                        >
                          ⭐ Rekomendasi
                        </span>
                      </div>

                      <div class="flex flex-wrap items-center gap-1.5">
                        <!-- Visibilitas Tampil/Sembunyi -->
                        <span
                          class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1"
                          :class="plan.visible !== false
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'"
                          :title="plan.visible !== false ? 'Layanan ditampilkan di website' : 'Layanan disembunyikan dari website'"
                        >
                          <UIcon
                            :name="plan.visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                            class="w-3 h-3"
                          />
                          {{ plan.visible !== false ? 'Tampil' : 'Sembunyi' }}
                        </span>

                        <!-- Ketersediaan Layanan -->
                        <span
                          class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5"
                          :class="plan.active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
                          :title="plan.active ? 'Layanan tersedia & tombol CTA aktif' : 'Layanan tidak tersedia (tombol dinonaktifkan)'"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="plan.active ? 'bg-emerald-500' : 'bg-amber-500'"
                          />
                          {{ plan.active ? 'Tersedia' : 'Tutup' }}
                        </span>
                      </div>
                    </div>

                    <!-- Title & Price -->
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {{ plan.name }}
                    </h3>

                    <div class="mt-2 mb-3 flex items-center gap-2 flex-wrap">
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400">
                          {{ plan.price }}
                        </span>
                        <span class="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                          {{ plan.unit }}
                        </span>
                      </div>
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-xs font-bold">
                        <span>🪙</span>
                        <span>{{ formatPriceToPoints(plan.price) }}</span>
                      </span>
                    </div>

                    <p class="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed line-clamp-2 mb-4">
                      {{ plan.description }}
                    </p>

                    <!-- Features List Preview -->
                    <div class="space-y-1.5 pt-3 border-t border-slate-100 dark:border-neutral-800/80 mb-4">
                      <div
                        v-for="(feat, fIdx) in plan.features.slice(0, 4)"
                        :key="fIdx"
                        class="flex items-start gap-2 text-xs text-slate-600 dark:text-neutral-300"
                      >
                        <svg
                          class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span class="truncate">{{ feat }}</span>
                      </div>
                      <div
                        v-if="plan.features.length > 4"
                        class="text-[11px] text-slate-400 dark:text-neutral-500 italic pl-5.5"
                      >
                        + {{ plan.features.length - 4 }} fitur lainnya
                      </div>
                    </div>
                  </div>

                  <!-- Card Bottom Action Bar -->
                  <div class="pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 mt-auto">
                    <div class="flex items-center gap-1.5">
                      <!-- Quick Toggle Visibility -->
                      <button
                        type="button"
                        class="p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        :class="plan.visible !== false
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-neutral-800'"
                        :title="plan.visible !== false ? 'Sembunyikan dari website' : 'Tampilkan di website'"
                        @click="toggleServiceVisibility(plan.id)"
                      >
                        <UIcon
                          :name="plan.visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                          class="w-4 h-4"
                        />
                      </button>

                      <!-- Quick Toggle Active Status -->
                      <button
                        type="button"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        :class="plan.active
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300'"
                        :title="plan.active ? 'Ubah ketersediaan jadi Tutup (tombol tidak tersedia)' : 'Ubah ketersediaan jadi Tersedia (tombol aktif)'"
                        @click="toggleServiceStatus(plan.id)"
                      >
                        <span>{{ plan.active ? 'Tutup' : 'Buka' }}</span>
                      </button>

                      <!-- Quick Toggle Highlight -->
                      <button
                        type="button"
                        class="p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        :class="plan.highlight
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-400 hover:text-amber-600 dark:bg-neutral-800'"
                        :title="plan.highlight ? 'Hilangkan label rekomendasi' : 'Jadikan produk rekomendasi utama'"
                        @click="toggleServiceHighlight(plan.id)"
                      >
                        <UIcon
                          name="i-lucide-star"
                          class="w-4 h-4"
                        />
                      </button>

                      <!-- Test CTA Link -->
                      <a
                        :href="plan.ctaLink || '#'"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 transition-colors"
                        :title="plan.ctaLink ? `Buka CTA Link: ${plan.ctaLink}` : 'CTA Link belum disetel'"
                      >
                        <UIcon
                          name="i-lucide-external-link"
                          class="w-4 h-4"
                        />
                      </a>
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
                        @click="openEditServiceModal(plan)"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Layanan"
                        @click="openDeleteModal('service', plan.id, plan.name)"
                      >
                        <UIcon
                          name="i-lucide-trash-2"
                          class="w-4 h-4"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- VIEW 2: DAFTAR PAKET BUNDLING -->
            <div
              v-else-if="activeTab === 'bundles'"
              class="space-y-4"
            >
              <!-- Empty State -->
              <div
                v-if="filteredBundles.length === 0"
                class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-12 text-center"
              >
                <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 mb-3">
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                  Tidak Ada Paket Bundling
                </h3>
                <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                  {{ searchQuery ? 'Tidak ada paket bundling yang cocok dengan pencarian Anda.' : 'Belum ada paket bundling yang ditambahkan.' }}
                </p>
                <button
                  type="button"
                  class="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  @click="openAddBundleModal"
                >
                  + Tambah Paket Bundling
                </button>
              </div>

              <!-- TABEL MODE BUNDLING (Default Table View) -->
              <div
                v-else-if="viewMode === 'table'"
                class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden"
              >
                <div class="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                      Daftar Paket Bundling
                    </h3>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                      {{ filteredBundles.length }} dari {{ bundles.length }}
                    </span>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-neutral-500">
                    Klik badge status / visibilitas untuk ubah langsung
                  </span>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50/80 dark:bg-neutral-800/40 text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-neutral-800">
                      <tr>
                        <th class="px-6 py-3.5">
                          Paket Bundling
                        </th>
                        <th class="px-4 py-3.5">
                          Tarif Paket
                        </th>
                        <th class="px-4 py-3.5">
                          Tampilkan di Web
                        </th>
                        <th class="px-4 py-3.5">
                          Ketersediaan Paket
                        </th>
                        <th class="px-4 py-3.5">
                          Item Paket
                        </th>
                        <th class="px-4 py-3.5">
                          CTA Link
                        </th>
                        <th class="px-4 py-3.5 text-center">
                          Urutan
                        </th>
                        <th class="px-6 py-3.5 text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/80">
                      <tr
                        v-for="b in filteredBundles"
                        :key="b.id"
                        class="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        <!-- Kolom 1: Paket Bundling -->
                        <td class="px-6 py-4">
                          <div class="flex items-start gap-3">
                            <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                              <UIcon
                                name="i-lucide-package"
                                class="w-4 h-4"
                              />
                            </div>
                            <div class="min-w-0">
                              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                <span>{{ b.title }}</span>
                                <span
                                  v-if="b.saving"
                                  class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                >
                                  {{ b.saving }}
                                </span>
                              </div>
                              <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 line-clamp-1 max-w-sm">
                                {{ b.desc }}
                              </p>
                            </div>
                          </div>
                        </td>

                        <!-- Kolom 2: Tarif -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <div class="font-bold text-sm text-primary-600 dark:text-primary-400">
                            {{ b.price }}
                          </div>
                          <div class="text-[11px] text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 mt-0.5">
                            <span>🪙</span>
                            <span>{{ formatPriceToPoints(b.price) }}</span>
                          </div>
                        </td>

                        <!-- Kolom 3: TAMPILKAN DI WEB -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            class="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border"
                            :class="b.visible !== false
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 hover:bg-blue-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-100'"
                            :title="b.visible !== false ? 'Klik untuk sembunyikan dari website publik' : 'Klik untuk tampilkan di website publik'"
                            @click="toggleBundleVisibility(b.id)"
                          >
                            <UIcon
                              :name="b.visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                              class="w-3.5 h-3.5"
                            />
                            <span>{{ b.visible !== false ? 'Tampil' : 'Disembunyikan' }}</span>
                          </button>
                        </td>

                        <!-- Kolom 4: KETERSEDIAAN -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            class="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border"
                            :class="b.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 hover:bg-amber-100'"
                            :title="b.active ? 'Klik untuk ubah jadi Tidak Tersedia (tombol tidak bisa ditekan)' : 'Klik untuk ubah jadi Tersedia (tombol aktif)'"
                            @click="toggleBundleStatus(b.id)"
                          >
                            <span
                              class="w-2 h-2 rounded-full"
                              :class="b.active ? 'bg-emerald-500' : 'bg-amber-500'"
                            />
                            <span>{{ b.active ? 'Tersedia' : 'Tidak Tersedia' }}</span>
                          </button>
                        </td>

                        <!-- Kolom 5: Item Paket -->
                        <td class="px-4 py-4">
                          <div class="flex flex-wrap gap-1 max-w-xs">
                            <span
                              v-for="(item, itIdx) in b.items"
                              :key="itIdx"
                              class="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300"
                            >
                              {{ item }}
                            </span>
                          </div>
                        </td>

                        <!-- Kolom 6: CTA Link -->
                        <td class="px-4 py-4 whitespace-nowrap">
                          <div class="flex items-center gap-1.5">
                            <a
                              v-if="b.ctaLink"
                              :href="b.ctaLink"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 max-w-[150px] truncate"
                              :title="b.ctaLink"
                            >
                              <UIcon
                                name="i-lucide-external-link"
                                class="w-3.5 h-3.5 shrink-0"
                              />
                              <span class="truncate">{{ b.ctaLink }}</span>
                            </a>
                            <span
                              v-else
                              class="text-[11px] text-slate-400 dark:text-neutral-500 italic"
                            >
                              Default WhatsApp
                            </span>
                          </div>
                        </td>

                        <!-- Kolom 7: Urutan -->
                        <td class="px-4 py-4 whitespace-nowrap text-center">
                          <span class="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                            #{{ b.order || 1 }}
                          </span>
                        </td>

                        <!-- Kolom 8: Aksi -->
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
                              @click="openEditBundleModal(b)"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Hapus Paket Bundling"
                              @click="openDeleteModal('bundle', b.id, b.title)"
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

              <!-- CARDS MODE BUNDLING (Tampilan Kartu Grid) -->
              <div
                v-else
                class="grid md:grid-cols-2 gap-4"
              >
                <div
                  v-for="b in filteredBundles"
                  :key="b.id"
                  class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-3">
                      <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {{ b.saving || 'Paket Hemat' }}
                      </span>

                      <div class="flex flex-wrap items-center gap-1.5">
                        <!-- Visibilitas Tampil/Sembunyi -->
                        <span
                          class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1"
                          :class="b.visible !== false
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'"
                          :title="b.visible !== false ? 'Paket ditampilkan di website' : 'Paket disembunyikan dari website'"
                        >
                          <UIcon
                            :name="b.visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                            class="w-3 h-3"
                          />
                          {{ b.visible !== false ? 'Tampil' : 'Sembunyi' }}
                        </span>

                        <!-- Ketersediaan Paket -->
                        <span
                          class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5"
                          :class="b.active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
                          :title="b.active ? 'Paket tersedia & tombol CTA aktif' : 'Paket tidak tersedia (tombol dinonaktifkan)'"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="b.active ? 'bg-emerald-500' : 'bg-amber-500'"
                          />
                          {{ b.active ? 'Tersedia' : 'Tutup' }}
                        </span>
                      </div>
                    </div>

                    <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {{ b.title }}
                    </h3>

                    <div class="mt-2 mb-3 flex items-center gap-2 flex-wrap">
                      <span class="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400">
                        {{ b.price }}
                      </span>
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-xs font-bold">
                        <span>🪙</span>
                        <span>{{ formatPriceToPoints(b.price) }}</span>
                      </span>
                    </div>

                    <p class="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mb-4">
                      {{ b.desc }}
                    </p>

                    <!-- Bundle Items -->
                    <div class="space-y-1.5 pt-3 border-t border-slate-100 dark:border-neutral-800/80 mb-4">
                      <div
                        v-for="(item, iIdx) in b.items"
                        :key="iIdx"
                        class="flex items-start gap-2 text-xs text-slate-600 dark:text-neutral-300"
                      >
                        <svg
                          class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{{ item }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom Action Bar -->
                  <div class="pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 mt-auto">
                    <div class="flex items-center gap-1.5">
                      <!-- Quick Toggle Visibility -->
                      <button
                        type="button"
                        class="p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        :class="b.visible !== false
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-neutral-800'"
                        :title="b.visible !== false ? 'Sembunyikan dari website' : 'Tampilkan di website'"
                        @click="toggleBundleVisibility(b.id)"
                      >
                        <UIcon
                          :name="b.visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                          class="w-4 h-4"
                        />
                      </button>

                      <!-- Quick Toggle Active Status -->
                      <button
                        type="button"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        :class="b.active
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300'"
                        :title="b.active ? 'Ubah ketersediaan jadi Tutup (tombol tidak tersedia)' : 'Ubah ketersediaan jadi Tersedia (tombol aktif)'"
                        @click="toggleBundleStatus(b.id)"
                      >
                        <span>{{ b.active ? 'Tutup' : 'Buka' }}</span>
                      </button>

                      <!-- Test CTA Link -->
                      <a
                        :href="b.ctaLink || '#'"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 transition-colors"
                        :title="b.ctaLink ? `Buka CTA Link: ${b.ctaLink}` : 'CTA Link belum disetel'"
                      >
                        <UIcon
                          name="i-lucide-external-link"
                          class="w-4 h-4"
                        />
                      </a>
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
                        @click="openEditBundleModal(b)"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Paket Bundling"
                        @click="openDeleteModal('bundle', b.id, b.title)"
                      >
                        <UIcon
                          name="i-lucide-trash-2"
                          class="w-4 h-4"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- MODAL: TAMBAH / EDIT LAYANAN (Pinned Header, Scrollable Body, Pinned Footer) -->
    <div
      v-if="isServiceModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      @click.self="isServiceModalOpen = false"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto"
        @click.stop
      >
        <!-- Pinned Header -->
        <div class="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {{ isEditingService ? 'Edit Layanan' : 'Tambah Layanan Baru' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Atur nama, tarif, poin keunggulan, visibilitas di website, dan status ketersediaan pemesanan.
            </p>
          </div>
          <button
            type="button"
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            @click="isServiceModalOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Form with Scrollable Body & Pinned Footer -->
        <form
          class="flex flex-col flex-1 min-h-0"
          @submit.prevent="handleSaveService"
        >
          <!-- Scrollable Body -->
          <div class="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            <!-- 2-Column Responsive Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- KOLOM KIRI: Identitas, Tarif & Kontrol Status -->
              <div class="space-y-4">
                <!-- Nama Layanan -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Nama Layanan *
                  </label>
                  <input
                    v-model="serviceForm.name"
                    type="text"
                    required
                    placeholder="Contoh: Cek Plagiarisme iThenticate / Turnitin"
                    class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <!-- Tag / Badge Singkat -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Badge / Tag Singkat
                    </label>
                    <input
                      v-model="serviceForm.tag"
                      type="text"
                      placeholder="Contoh: 100% No-Repository"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                  </div>

                  <!-- Urutan Tampil -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Urutan Tampil (Order)
                    </label>
                    <input
                      v-model.number="serviceForm.order"
                      type="number"
                      min="1"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <!-- Tarif / Harga -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Tarif / Harga *
                    </label>
                    <input
                      v-model="serviceForm.price"
                      type="text"
                      required
                      placeholder="Contoh: Rp 15.000 atau Mulai Rp 35.000"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                    <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
                      <span>🪙</span>
                      <span>Konversi: {{ formatPriceToPoints(serviceForm.price) }} (1 Poin = Rp 1)</span>
                    </p>
                  </div>

                  <!-- Satuan Tarif -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Satuan Tarif
                    </label>
                    <input
                      v-model="serviceForm.unit"
                      type="text"
                      placeholder="Contoh: / naskah, / halaman"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                  </div>
                </div>

                <!-- Control Box: Visibilitas & Ketersediaan & Rekomendasi -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/80 space-y-3.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    Kontrol Visibilitas & Status
                  </div>

                  <!-- Toggle: Tampilkan di Website (Visibilitas) -->
                  <label class="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-eye"
                          class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                        />
                        Tampilkan di Website (Visibilitas)
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Jika dicentang, layanan tampil di web publik. Jika dimatikan, disembunyikan sepenuhnya dari website.
                      </div>
                    </div>
                    <input
                      v-model="serviceForm.visible"
                      type="checkbox"
                      class="w-4 h-4 mt-0.5 text-primary-600 rounded cursor-pointer shrink-0"
                    >
                  </label>

                  <!-- Toggle: Ketersediaan Layanan (Aktif / Tidak Tersedia) -->
                  <label class="flex items-start justify-between gap-3 cursor-pointer pt-3 border-t border-slate-200/60 dark:border-neutral-700/60">
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-check-circle-2"
                          class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                        />
                        Ketersediaan Layanan (Status Pemesanan)
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Jika dimatikan, layanan tetap tampil di web tetapi tombolnya menjadi <b>"Tidak Tersedia"</b> dan tidak bisa diklik.
                      </div>
                    </div>
                    <input
                      v-model="serviceForm.active"
                      type="checkbox"
                      class="w-4 h-4 mt-0.5 text-primary-600 rounded cursor-pointer shrink-0"
                    >
                  </label>

                  <!-- Toggle: Rekomendasi Utama (Highlight) -->
                  <label class="flex items-start justify-between gap-3 cursor-pointer pt-3 border-t border-slate-200/60 dark:border-neutral-700/60">
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-star"
                          class="w-3.5 h-3.5 text-amber-500"
                        />
                        Jadikan Rekomendasi Utama (Highlight)
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Kartu layanan ditandai dengan warna aksen menonjol dan badge bintang rekomendasi.
                      </div>
                    </div>
                    <input
                      v-model="serviceForm.highlight"
                      type="checkbox"
                      class="w-4 h-4 mt-0.5 text-primary-600 rounded cursor-pointer shrink-0"
                    >
                  </label>
                </div>
              </div>

              <!-- KOLOM KANAN: Deskripsi, Fitur & CTA -->
              <div class="space-y-4 flex flex-col justify-between">
                <div class="space-y-4">
                  <!-- Deskripsi Layanan -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Deskripsi Singkat *
                    </label>
                    <textarea
                      v-model="serviceForm.description"
                      rows="3"
                      required
                      placeholder="Jelaskan secara ringkas manfaat dan lingkup layanan ini..."
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <!-- Poin Fitur / Keunggulan -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Fitur / Keunggulan (Satu per baris)
                    </label>
                    <textarea
                      v-model="serviceForm.featuresText"
                      rows="6"
                      placeholder="Garansi 100% No-Repository (Aman)&#10;Laporan PDF Resmi Full Color&#10;Waktu Proses Cepat (5-25 Menit)"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span class="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">
                      Tulis tiap poin keunggulan pada baris baru (tekan Enter).
                    </span>
                  </div>

                  <!-- Teks Tombol CTA & Link Tombol CTA -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                        Teks Tombol CTA
                      </label>
                      <input
                        v-model="serviceForm.ctaText"
                        type="text"
                        placeholder="Contoh: Pesan Sekarang"
                        class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                        Link Tombol CTA (ctaLink)
                      </label>
                      <input
                        v-model="serviceForm.ctaLink"
                        type="text"
                        placeholder="Contoh: https://wa.me/... atau /register"
                        class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                    Tautan tujuan saat tombol CTA diklik oleh pengunjung. Bebas diisi tautan WhatsApp, form pemesanan, atau tautan registrasi/halaman lain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pinned Footer Action Buttons -->
          <div class="px-6 py-4 sm:px-8 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-slate-50/80 dark:bg-neutral-800/40 shrink-0">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              @click="isServiceModalOpen = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              :disabled="isServicesSaving"
            >
              {{ isServicesSaving ? 'Menyimpan...' : (isEditingService ? 'Simpan Perubahan' : 'Tambahkan Layanan') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: TAMBAH / EDIT PAKET BUNDLING (Pinned Header, Scrollable Body, Pinned Footer) -->
    <div
      v-if="isBundleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      @click.self="isBundleModalOpen = false"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto"
        @click.stop
      >
        <!-- Pinned Header -->
        <div class="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {{ isEditingBundle ? 'Edit Paket Bundling' : 'Tambah Paket Bundling Baru' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Atur paket gabungan hemat, visibilitas di website, serta status ketersediaan pemesanan.
            </p>
          </div>
          <button
            type="button"
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            @click="isBundleModalOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Form with Scrollable Body & Pinned Footer -->
        <form
          class="flex flex-col flex-1 min-h-0"
          @submit.prevent="handleSaveBundle"
        >
          <!-- Scrollable Body -->
          <div class="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            <!-- 2-Column Responsive Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- KOLOM KIRI: Identitas, Tarif & Kontrol Status -->
              <div class="space-y-4">
                <!-- Nama Paket -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Nama Paket Bundling *
                  </label>
                  <input
                    v-model="bundleForm.title"
                    type="text"
                    required
                    placeholder="Contoh: Paket Bundling Cek Turnitin + AI Detector"
                    class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <!-- Tarif Paket -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Tarif Paket *
                    </label>
                    <input
                      v-model="bundleForm.price"
                      type="text"
                      required
                      placeholder="Contoh: Rp 30.000"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                    <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
                      <span>🪙</span>
                      <span>Konversi: {{ formatPriceToPoints(bundleForm.price) }} (1 Poin = Rp 1)</span>
                    </p>
                  </div>

                  <!-- Label Hemat -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Label Hemat / Diskon
                    </label>
                    <input
                      v-model="bundleForm.saving"
                      type="text"
                      placeholder="Contoh: Hemat Rp 5.000"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                  </div>
                </div>

                <!-- Urutan Tampil -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Urutan Tampil (Order)
                  </label>
                  <input
                    v-model.number="bundleForm.order"
                    type="number"
                    min="1"
                    class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                </div>

                <!-- Control Box: Visibilitas & Ketersediaan -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/80 space-y-3.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    Kontrol Visibilitas & Status
                  </div>

                  <!-- Toggle: Tampilkan di Website (Visibilitas) -->
                  <label class="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-eye"
                          class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                        />
                        Tampilkan di Website (Visibilitas)
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Jika dicentang, paket bundling tampil di web. Jika dimatikan, paket disembunyikan sepenuhnya dari website.
                      </div>
                    </div>
                    <input
                      v-model="bundleForm.visible"
                      type="checkbox"
                      class="w-4 h-4 mt-0.5 text-primary-600 rounded cursor-pointer shrink-0"
                    >
                  </label>

                  <!-- Toggle: Ketersediaan Paket (Aktif / Tidak Tersedia) -->
                  <label class="flex items-start justify-between gap-3 cursor-pointer pt-3 border-t border-slate-200/60 dark:border-neutral-700/60">
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-check-circle-2"
                          class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                        />
                        Ketersediaan Paket (Status Pemesanan)
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Jika dimatikan, paket tetap tampil di web tetapi tombolnya menjadi <b>"Tidak Tersedia"</b> dan tidak bisa diklik.
                      </div>
                    </div>
                    <input
                      v-model="bundleForm.active"
                      type="checkbox"
                      class="w-4 h-4 mt-0.5 text-primary-600 rounded cursor-pointer shrink-0"
                    >
                  </label>
                </div>
              </div>

              <!-- KOLOM KANAN: Deskripsi, Item Paket & CTA -->
              <div class="space-y-4 flex flex-col justify-between">
                <div class="space-y-4">
                  <!-- Deskripsi Paket -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Deskripsi Paket *
                    </label>
                    <textarea
                      v-model="bundleForm.desc"
                      rows="3"
                      required
                      placeholder="Jelaskan untuk siapa paket ini cocok dan keuntungannya..."
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <!-- Item Paket (satu per baris) -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Item / Isi Paket (Satu per baris)
                    </label>
                    <textarea
                      v-model="bundleForm.itemsText"
                      rows="4"
                      placeholder="1x Cek Similarity Turnitin No-Repository&#10;1x Uji AI Writer Detector Turnitin&#10;2 Laporan PDF Resmi Terpisah"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span class="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">
                      Tulis tiap item paket pada baris baru (tekan Enter).
                    </span>
                  </div>

                  <!-- Link Tombol CTA (ctaLink) -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                        Link Tombol CTA (ctaLink)
                      </label>
                      <span class="text-[10px] text-slate-400 dark:text-neutral-500">
                        Web URL, WhatsApp, atau Rute
                      </span>
                    </div>
                    <input
                      v-model="bundleForm.ctaLink"
                      type="text"
                      placeholder="Contoh: https://wa.me/... atau /register"
                      class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                    <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      Tautan tujuan saat tombol CTA diklik oleh pengunjung. Bebas diisi tautan WhatsApp, landing khusus, checkout, dll.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pinned Footer Action Buttons -->
          <div class="px-6 py-4 sm:px-8 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-slate-50/80 dark:bg-neutral-800/40 shrink-0">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              @click="isBundleModalOpen = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              :disabled="isServicesSaving"
            >
              {{ isServicesSaving ? 'Menyimpan...' : (isEditingBundle ? 'Simpan Perubahan' : 'Tambahkan Paket') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: KONFIRMASI HAPUS -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      @click.self="isDeleteModalOpen = false"
    >
      <div
        class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 text-center"
        @click.stop
      >
        <div class="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Hapus {{ deleteType === 'service' ? 'Layanan' : 'Paket Bundling' }}?
          </h3>
          <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Apakah Anda yakin ingin menghapus <strong class="text-slate-900 dark:text-white">{{ itemToDelete?.name }}</strong>? Tindakan ini akan menyinkronkan data langsung ke database.
          </p>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            @click="isDeleteModalOpen = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            :disabled="isServicesSaving"
            @click="handleConfirmDelete"
          >
            {{ isServicesSaving ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: KONFIRMASI RESET DEFAULT -->
    <div
      v-if="isResetModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      @click.self="isResetModalOpen = false"
    >
      <div
        class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 text-center"
        @click.stop
      >
        <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Reset ke Katalog Bawaan?
          </h3>
          <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Seluruh daftar layanan dan paket bundling akan dikembalikan ke 4 produk standar resmi (Turnitin, AI Detector, Scopus, Parafrase Manual).
          </p>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            @click="isResetModalOpen = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            :disabled="isServicesSaving"
            @click="handleConfirmReset"
          >
            {{ isServicesSaving ? 'Mereset...' : 'Ya, Reset' }}
          </button>
        </div>
      </div>
    </div>

    <LandingFooter />
  </div>
</template>
