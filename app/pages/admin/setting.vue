<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

useSeoMeta({
  title: 'Pengaturan Admin — Cek Naskah',
  description: 'Panel pengaturan sistem dan manajemen hak akses administrator Cek Naskah.',
  ogTitle: 'Pengaturan Admin — Cek Naskah',
  ogDescription: 'Panel pengaturan sistem dan manajemen hak akses administrator Cek Naskah.'
})

const { user, fetchUser, isAdmin, userAvatar } = useAuth()
const {
  settings,
  loading: isDbLoading,
  saving: isSaving,
  dbStatus,
  tableId,
  fetchSettings,
  saveSettings
} = useAppSettings()

const isPageLoading = ref(true)
const activeTab = ref<'general' | 'contacts'>('general')
const isRefreshing = ref(false)
const saveSuccess = ref(false)
const saveError = ref(false)
const saveMessage = ref('')

const handleSaveSettings = async () => {
  saveSuccess.value = false
  saveError.value = false
  saveMessage.value = ''

  const res = await saveSettings()
  if (res.success) {
    saveSuccess.value = true
    saveMessage.value = res.message
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  } else {
    saveError.value = true
    saveMessage.value = res.message
  }
}

const handleRefreshUser = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      fetchUser(),
      fetchSettings()
    ])
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  isPageLoading.value = true
  try {
    const currentUser = await fetchUser()
    if (!currentUser) {
      navigateTo('/login?redirect=/admin/setting')
      return
    }
    await fetchSettings()
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
                Pusat Kontrol & Konfigurasi
              </span>
              <span class="text-slate-300 dark:text-neutral-700">•</span>
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5"
                :class="dbStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'"
                title="Tersambung ke Appwrite TablesDB"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"
                />
                TablesDB: {{ tableId }}
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Pengaturan Admin
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Kelola preferensi platform, batasan pemeriksaan naskah, dan verifikasi hak akses administrator.
            </p>
          </div>

          <!-- Quick Refresh Button -->
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              :disabled="isRefreshing || isDbLoading"
              title="Sinkronkan data akun dan database dari Appwrite"
              @click="handleRefreshUser"
            >
              <svg
                class="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400"
                :class="{ 'animate-spin': isRefreshing || isDbLoading }"
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
              <span>{{ isRefreshing || isDbLoading ? 'Menyinkronkan...' : 'Sinkronkan Data & Izin' }}</span>
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
            v-if="saveSuccess"
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
              <span>{{ saveMessage }}</span>
            </div>
            <button
              type="button"
              class="text-emerald-600 hover:text-emerald-800 cursor-pointer"
              @click="saveSuccess = false"
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
            v-if="saveError"
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
              <span>{{ saveMessage }}</span>
            </div>
            <button
              type="button"
              class="text-rose-600 hover:text-rose-800 cursor-pointer"
              @click="saveError = false"
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

              <!-- Tombol 1: Setting / Pengaturan (/admin/setting) -> AKTIF -->
              <NuxtLink
                to="/admin/setting"
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
                <span class="w-2 h-2 rounded-full bg-white shadow-sm" />
              </NuxtLink>

              <!-- Tombol 2: Manajemen Naskah (Segera) -->
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

              <!-- Tombol 3: Manajemen Pengguna (/admin/users) -->
              <NuxtLink
                to="/admin/users"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-left"
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

              <!-- Tombol 4: Layanan & Tarif (Segera) -->
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span class="truncate">Layanan & Tarif</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 font-medium">
                  Segera
                </span>
              </button>

              <!-- Tombol 5: Log Aktivitas (Segera) -->
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
                    :alt="user?.name || 'Profil'"
                    class="w-full h-full object-cover"
                  >
                  <span v-else>{{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ user?.name || 'Administrator' }}
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    {{ user?.email }}
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

          <!-- CONTENT AREA UTAMA (KANAN) -->
          <section class="flex-1 w-full min-w-0">
            <!-- STATE 1: LOADING VERIFIKASI -->
            <div
              v-if="isPageLoading"
              class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-16 text-center"
            >
              <svg
                class="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p class="text-sm font-medium text-slate-600 dark:text-neutral-400">
                Memverifikasi hak akses administrator...
              </p>
            </div>

            <!-- STATE 2: AKSES DITOLAK (Akun belum memiliki label 'admin') -->
            <div
              v-else-if="!isAdmin"
              class="p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-amber-200/80 dark:border-amber-900/60 shadow-sm space-y-6"
            >
              <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <div class="text-center">
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Hak Akses Administrator Diperlukan
                </h2>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed max-w-lg mx-auto">
                  Halaman <strong>Pengaturan Admin</strong> (<code class="text-primary-600 dark:text-primary-400">/admin/setting</code>) dilindungi secara ketat. Akun Anda harus memiliki label <strong class="text-primary-600 dark:text-primary-400 font-bold">admin</strong> pada sistem autentikasi Appwrite untuk dapat mengakses menu ini.
                </p>
              </div>

              <!-- Appwrite Labels Specification Box -->
              <div class="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
                <div class="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Ketentuan Role Berdasarkan Update Labels Appwrite:</span>
                </div>
                <blockquote class="text-xs italic text-amber-900/90 dark:text-amber-200/90 border-l-3 border-amber-400 pl-3 leading-relaxed">
                  &ldquo;Update labels: Categorize and manage your users based on specific criteria by assigning them customizable labels. New label-based roles will be assigned.&rdquo;
                </blockquote>
                <p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Untuk mengaktifkan hak akses: Buka <strong>Appwrite Console &gt; Auth &gt; Users &gt; [Nama Akun Anda] &gt; Labels</strong>, tambahkan kata <code>admin</code>, lalu simpan.
                </p>
              </div>

              <!-- Current User Info -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-800 text-xs space-y-2">
                <div>Akun: <strong class="text-slate-800 dark:text-neutral-200">{{ user?.email || '-' }}</strong></div>
                <div>
                  Label Saat Ini:
                  <span
                    v-if="user?.labels && user.labels.length"
                    class="inline-flex flex-wrap gap-1 ml-1"
                  >
                    <span
                      v-for="lbl in user.labels"
                      :key="lbl"
                      class="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-[11px] font-mono font-semibold"
                    >
                      {{ lbl }}
                    </span>
                  </span>
                  <span
                    v-else
                    class="italic text-slate-400 ml-1"
                  >(Belum ada label terpasang)</span>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  :disabled="isRefreshing"
                  @click="handleRefreshUser"
                >
                  <svg
                    class="w-4 h-4"
                    :class="{ 'animate-spin': isRefreshing }"
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
                  <span>{{ isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan Ulang Izin' }}</span>
                </button>

                <NuxtLink
                  to="/"
                  class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold transition-colors text-center"
                >
                  Kembali ke Beranda
                </NuxtLink>
              </div>
            </div>

            <!-- STATE 3: AKSES DIIZINKAN (Admin Terverifikasi) -->
            <div
              v-else
              class="space-y-6"
            >
              <!-- Sub-Tabs Pengaturan Setting -->
              <div class="flex border-b border-slate-200 dark:border-neutral-800 overflow-x-auto gap-2">
                <button
                  type="button"
                  class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  :class="activeTab === 'general'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
                  @click="activeTab = 'general'"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Platform & Umum</span>
                </button>

                <button
                  type="button"
                  class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  :class="activeTab === 'contacts'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
                  @click="activeTab = 'contacts'"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Kontak & CS</span>
                </button>
              </div>

              <!-- FORM TAB 1: UMUM & PLATFORM (HANYA STATUS OPERASIONAL) -->
              <div
                v-if="activeTab === 'general'"
                class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden"
              >
                <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80">
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Status Operasional Sistem
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
                    Kelola ketersediaan layanan platform, pendaftaran akun baru, dan kebijakan verifikasi.
                  </p>
                </div>

                <div class="p-6 sm:p-8 space-y-4">
                  <!-- Switch: Mode Pemeliharaan -->
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800">
                    <div>
                      <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Mode Pemeliharaan (Maintenance Mode)</span>
                        <span
                          class="text-[10px] px-2 py-0.5 rounded-md font-bold"
                          :class="settings.maintenanceMode
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'"
                        >
                          {{ settings.maintenanceMode ? 'Aktif' : 'Nonaktif' }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        Kunci akses pemeriksaan untuk pengguna umum saat sistem sedang diperbarui.
                      </p>
                    </div>

                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.maintenanceMode"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>

                  <!-- Switch: Pendaftaran Akun Baru -->
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800">
                    <div>
                      <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Pendaftaran Pengguna Baru
                      </div>
                      <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        Izinkan pengunjung umum membuat akun baru secara mandiri.
                      </p>
                    </div>

                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.allowNewRegistration"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>

                  <!-- Switch: Wajibkan Verifikasi Email -->
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800">
                    <div>
                      <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Wajibkan Verifikasi Email
                      </div>
                      <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        Pengguna harus klik tautan verifikasi email sebelum bisa mengajukan naskah.
                      </p>
                    </div>

                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.requireEmailVerification"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>
                </div>

                <!-- Integrated Footer -->
                <div class="p-6 sm:p-8 bg-slate-50/60 dark:bg-neutral-800/40 border-t border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p class="text-xs text-slate-400 dark:text-neutral-500">
                    Perubahan status operasional akan segera diterapkan pada sistem platform.
                  </p>
                  <button
                    type="button"
                    class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm shadow-primary-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    :disabled="isSaving"
                    @click="handleSaveSettings"
                  >
                    <svg
                      v-if="isSaving"
                      class="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
                  </button>
                </div>
              </div>

              <!-- FORM TAB 2: KONTAK & CS -->
              <div
                v-else-if="activeTab === 'contacts'"
                class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden"
              >
                <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80">
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Kontak Layanan & Dukungan
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
                    Informasi kontak resmi yang tertera pada bagian bantuan dan footer aplikasi.
                  </p>
                </div>

                <div class="p-6 sm:p-8 space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                        Email Dukungan Resmi
                      </label>
                      <input
                        v-model="settings.supportEmail"
                        type="email"
                        class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                      >
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                        Nomor WhatsApp Admin
                      </label>
                      <input
                        v-model="settings.supportPhone"
                        type="text"
                        class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                      >
                    </div>
                  </div>
                </div>

                <!-- Integrated Footer -->
                <div class="p-6 sm:p-8 bg-slate-50/60 dark:bg-neutral-800/40 border-t border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p class="text-xs text-slate-400 dark:text-neutral-500">
                    Kontak ini otomatis disinkronkan ke seluruh tautan publik.
                  </p>
                  <button
                    type="button"
                    class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm shadow-primary-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    :disabled="isSaving"
                    @click="handleSaveSettings"
                  >
                    <svg
                      v-if="isSaving"
                      class="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
