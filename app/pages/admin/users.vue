<script setup lang="ts">
import type { AdminUserItem } from '~/composables/useAdminUsers'
import type { PointTransaction } from '~/composables/usePoints'

definePageMeta({
  middleware: 'admin'
})

useSeoMeta({
  title: 'Pengguna & Akses — Panel Admin Cek Naskah',
  description: 'Manajemen pengguna, penugasan peran (RBAC), dan kontrol hak akses administrator Cek Naskah.',
  ogTitle: 'Pengguna & Akses — Panel Admin Cek Naskah',
  ogDescription: 'Manajemen pengguna, penugasan peran (RBAC), dan kontrol hak akses administrator Cek Naskah.',
  robots: 'noindex, nofollow'
})

const { user: currentUser, fetchUser, isAdmin, userAvatar } = useAuth()
const { formatTransactionType, formatTransactionDate } = usePoints()
const {
  users,
  metrics,
  total,
  loading: isUsersLoading,
  actionLoading,
  error: actionError,
  success: actionSuccess,
  clearFeedback,
  fetchUsers,
  createUser,
  updateRole,
  updateStatus,
  updateVerification,
  updatePoints,
  fetchUserPointHistory,
  deleteUser
} = useAdminUsers()

const isPageLoading = ref(true)
const searchQuery = ref('')
const roleFilter = ref<'all' | 'admin' | 'editor' | 'user'>('all')
const statusFilter = ref<'all' | 'active' | 'disabled'>('all')
const verificationFilter = ref<'all' | 'verified' | 'unverified'>('all')

// Modal: Tambah Pengguna Baru
const isAddUserModalOpen = ref(false)
const newUserName = ref('')
const newUserEmail = ref('')
const newUserPassword = ref('')
const newUserPhone = ref('')
const newUserRole = ref<'admin' | 'editor' | 'user'>('user')
const addUserError = ref<string | null>(null)

// Modal: Kelola Hak Akses / Edit Pengguna
const isEditModalOpen = ref(false)
const selectedUser = ref<AdminUserItem | null>(null)
const editRole = ref<'admin' | 'editor' | 'user'>('user')
const editStatus = ref(true)
const editVerification = ref(false)
const editPoints = ref(0)
const editPointsNotes = ref('')
const selectedUserHistory = ref<PointTransaction[]>([])
const isLoadingHistory = ref(false)

// Modal: Konfirmasi Hapus
const isDeleteModalOpen = ref(false)
const userToDelete = ref<AdminUserItem | null>(null)

// Helper: Tentukan peran user dari labels
const getUserRole = (u: AdminUserItem): 'admin' | 'editor' | 'user' => {
  const labels = u.labels || []
  if (labels.some(l => l.toLowerCase() === 'admin')) return 'admin'
  if (labels.some(l => l.toLowerCase() === 'editor')) return 'editor'
  return 'user'
}

// Client-side filtered list based on search and filters
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = (u.name || '').toLowerCase().includes(q)
      const matchEmail = (u.email || '').toLowerCase().includes(q)
      const matchPhone = (u.phone || '').toLowerCase().includes(q)
      const matchId = (u.$id || '').toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchPhone && !matchId) return false
    }

    // Role filter
    const role = getUserRole(u)
    if (roleFilter.value !== 'all' && role !== roleFilter.value) {
      return false
    }

    // Status filter
    if (statusFilter.value === 'active' && !u.status) return false
    if (statusFilter.value === 'disabled' && u.status) return false

    // Verification filter
    if (verificationFilter.value === 'verified' && !u.emailVerification) return false
    if (verificationFilter.value === 'unverified' && u.emailVerification) return false

    return true
  })
})

const openAddUserModal = () => {
  newUserName.value = ''
  newUserEmail.value = ''
  newUserPassword.value = ''
  newUserPhone.value = ''
  newUserRole.value = 'user'
  addUserError.value = null
  isAddUserModalOpen.value = true
}

const handleCreateUser = async () => {
  addUserError.value = null
  if (!newUserEmail.value.trim() || !newUserEmail.value.includes('@')) {
    addUserError.value = 'Alamat email wajib diisi dengan format yang benar.'
    return
  }

  const res = await createUser({
    name: newUserName.value.trim() || undefined,
    email: newUserEmail.value.trim(),
    password: newUserPassword.value.trim() || undefined,
    phone: newUserPhone.value.trim() || undefined,
    role: newUserRole.value
  })

  if (res.success) {
    isAddUserModalOpen.value = false
  } else {
    addUserError.value = res.error || 'Gagal membuat pengguna baru.'
  }
}

const openEditModal = (u: AdminUserItem) => {
  selectedUser.value = u
  editRole.value = getUserRole(u)
  editStatus.value = u.status
  editVerification.value = u.emailVerification
  editPoints.value = Number(u.prefs?.points) || 0
  editPointsNotes.value = ''
  selectedUserHistory.value = Array.isArray(u.prefs?.pointHistory) ? (u.prefs.pointHistory as PointTransaction[]) : []
  isLoadingHistory.value = true
  fetchUserPointHistory(u.$id).then((h) => {
    if (h && Array.isArray(h) && h.length > 0) {
      selectedUserHistory.value = h as PointTransaction[]
    }
  }).finally(() => {
    isLoadingHistory.value = false
  })
  isEditModalOpen.value = true
}

const handleSaveUserAccess = async () => {
  if (!selectedUser.value) return

  const targetId = selectedUser.value.$id
  clearFeedback()

  // 1. Update role if changed
  const currentRole = getUserRole(selectedUser.value)
  if (editRole.value !== currentRole) {
    await updateRole(targetId, editRole.value)
  }

  // 2. Update status if changed
  if (editStatus.value !== selectedUser.value.status) {
    await updateStatus(targetId, editStatus.value)
  }

  // 3. Update verification if changed
  if (editVerification.value !== selectedUser.value.emailVerification) {
    await updateVerification(targetId, editVerification.value)
  }

  // 4. Update points if changed
  const currentPoints = Number(selectedUser.value.prefs?.points) || 0
  if (editPoints.value !== currentPoints) {
    await updatePoints(targetId, editPoints.value, 'set', editPointsNotes.value.trim() || undefined)
  }

  isEditModalOpen.value = false
}

const promptDeleteUser = (u: AdminUserItem) => {
  userToDelete.value = u
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!userToDelete.value) return
  await deleteUser(userToDelete.value.$id)
  isDeleteModalOpen.value = false
  userToDelete.value = null
}

const handleQuickToggleStatus = async (u: AdminUserItem) => {
  if (u.$id === currentUser.value?.$id) return
  await updateStatus(u.$id, !u.status)
}

const handleQuickToggleVerification = async (u: AdminUserItem) => {
  await updateVerification(u.$id, !u.emailVerification)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

onMounted(async () => {
  isPageLoading.value = true
  try {
    const userRes = await fetchUser()
    if (!userRes) {
      navigateTo('/login?redirect=/admin/users')
      return
    }
    await fetchUsers()
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
                Manajemen Pengguna & Akses (RBAC)
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Pengguna & Hak Akses
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Kelola direktori pengguna, tetapkan peran administrator/editor, verifikasi akun, dan kontrol status akses platform.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              class="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              :disabled="isUsersLoading || actionLoading"
              title="Sinkronkan data dari Appwrite Auth"
              @click="fetchUsers(searchQuery)"
            >
              <svg
                class="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400"
                :class="{ 'animate-spin': isUsersLoading }"
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
              <span>{{ isUsersLoading ? 'Memuat...' : 'Sinkronkan' }}</span>
            </button>

            <button
              type="button"
              class="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-primary-500/25 cursor-pointer"
              @click="openAddUserModal"
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>

        <!-- Alerts -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="actionSuccess"
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
              <span>{{ actionSuccess }}</span>
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

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="actionError"
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
              <span>{{ actionError }}</span>
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

              <!-- Tombol 2: Pengguna & Akses (/admin/users) -> AKTIF -->
              <NuxtLink
                to="/admin/users"
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span class="truncate">Pengguna & Akses</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-white shadow-sm" />
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

              <!-- Tombol 4: Layanan & Tarif (/admin/services) -->
              <NuxtLink
                to="/admin/services"
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span class="truncate">Layanan & Tarif</span>
                </div>
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

          <!-- KONTEN UTAMA: METRICS, DAFTAR PENGGUNA & FILTER (KANAN) -->
          <section class="flex-1 w-full min-w-0 space-y-6">
            <!-- Metric KPI Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- KPI 1: Total Pengguna -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Total Pengguna</span>
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.total || total }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  Terdaftar di Auth
                </p>
              </div>

              <!-- KPI 2: Pengguna Terverifikasi -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Email Terverifikasi</span>
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
                  {{ metrics.verified }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  {{ metrics.unverified }} belum verifikasi
                </p>
              </div>

              <!-- KPI 3: Tim Pengelola (Admin & Editor) -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Admin & Editor</span>
                  <div class="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.admins + metrics.editors }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  {{ metrics.admins }} Admin • {{ metrics.editors }} Editor
                </p>
              </div>

              <!-- KPI 4: Akun Aktif -->
              <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Akun Aktif</span>
                  <div class="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
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
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {{ metrics.active }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  {{ metrics.disabled }} dinonaktifkan
                </p>
              </div>

              <!-- KPI 5: Total Poin Beredar -->
              <div class="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Total Poin Beredar</span>
                  <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                    🪙
                  </div>
                </div>
                <div class="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {{ (metrics.totalPoints || users.reduce((acc, u) => acc + (Number(u.prefs?.points) || 0), 0)).toLocaleString('id-ID') }}
                </div>
                <p class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                  Saldo poin semua akun
                </p>
              </div>
            </div>

            <!-- Search & Filters Container -->
            <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-5">
              <div class="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                <!-- Search Input -->
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
                    placeholder="Cari berdasarkan nama, email, atau ID pengguna..."
                    class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  >
                  <button
                    v-if="searchQuery"
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer text-xs"
                    @click="searchQuery = ''"
                  >
                    ✕
                  </button>
                </div>

                <!-- Dropdown Filters -->
                <div class="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <!-- Role Filter -->
                  <select
                    v-model="roleFilter"
                    class="px-3 py-2 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="all">
                      Semua Peran
                    </option>
                    <option value="admin">
                      Administrator
                    </option>
                    <option value="editor">
                      Editor / Reviewer
                    </option>
                    <option value="user">
                      Pengguna Biasa
                    </option>
                  </select>

                  <!-- Verification Filter -->
                  <select
                    v-model="verificationFilter"
                    class="px-3 py-2 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="all">
                      Semua Verifikasi
                    </option>
                    <option value="verified">
                      Terverifikasi
                    </option>
                    <option value="unverified">
                      Belum Verifikasi
                    </option>
                  </select>

                  <!-- Status Filter -->
                  <select
                    v-model="statusFilter"
                    class="px-3 py-2 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="all">
                      Semua Status
                    </option>
                    <option value="active">
                      Aktif
                    </option>
                    <option value="disabled">
                      Nonaktif
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Akun Pengguna
                  </h3>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                    {{ filteredUsers.length }} dari {{ users.length }}
                  </span>
                </div>
                <span class="text-xs text-slate-400 dark:text-neutral-500">
                  Data langsung dari Appwrite Server
                </span>
              </div>

              <!-- Loading State -->
              <div
                v-if="isUsersLoading"
                class="py-16 text-center space-y-3"
              >
                <div class="w-8 h-8 mx-auto border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <p class="text-xs text-slate-400 dark:text-neutral-500">
                  Memuat data pengguna...
                </p>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="filteredUsers.length === 0"
                class="py-16 text-center space-y-3"
              >
                <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 flex items-center justify-center">
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                    Tidak ada pengguna ditemukan
                  </h4>
                  <p class="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                    Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
                  </p>
                </div>
              </div>

              <!-- Users Table -->
              <div
                v-else
                class="overflow-x-auto"
              >
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50/80 dark:bg-neutral-800/40 text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-neutral-800">
                    <tr>
                      <th class="px-6 py-3.5">
                        Pengguna
                      </th>
                      <th class="px-4 py-3.5">
                        Kontak
                      </th>
                      <th class="px-4 py-3.5">
                        Peran / Akses
                      </th>
                      <th class="px-4 py-3.5">
                        Saldo Poin
                      </th>
                      <th class="px-4 py-3.5">
                        Verifikasi
                      </th>
                      <th class="px-4 py-3.5">
                        Status Akun
                      </th>
                      <th class="px-4 py-3.5">
                        Terdaftar
                      </th>
                      <th class="px-6 py-3.5 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/80">
                    <tr
                      v-for="u in filteredUsers"
                      :key="u.$id"
                      class="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <!-- User Info -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0">
                            {{ u.name ? u.name.charAt(0).toUpperCase() : 'U' }}
                          </div>
                          <div class="min-w-0">
                            <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span class="truncate">{{ u.name || 'Tanpa Nama' }}</span>
                              <span
                                v-if="u.$id === currentUser?.$id"
                                class="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold"
                              >
                                Anda
                              </span>
                            </div>
                            <div class="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
                              ID: {{ u.$id.slice(0, 8) }}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <!-- Contact Info -->
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-slate-700 dark:text-neutral-300 font-medium">
                          {{ u.email }}
                        </div>
                        <div class="text-[11px] text-slate-400 dark:text-neutral-500">
                          {{ u.phone || '-' }}
                        </div>
                      </td>

                      <!-- Role / Access Badge -->
                      <td class="px-4 py-4 whitespace-nowrap">
                        <span
                          v-if="getUserRole(u) === 'admin'"
                          class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 inline-flex items-center gap-1"
                        >
                          <svg
                            class="w-3 h-3"
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
                          Administrator
                        </span>
                        <span
                          v-else-if="getUserRole(u) === 'editor'"
                          class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 inline-flex items-center gap-1"
                        >
                          <svg
                            class="w-3 h-3"
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
                          Editor
                        </span>
                        <span
                          v-else
                          class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        >
                          Pengguna
                        </span>
                      </td>

                      <!-- Saldo Poin Badge -->
                      <td class="px-4 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                          title="Klik untuk ubah saldo poin pengguna"
                          @click="openEditModal(u)"
                        >
                          <span>🪙</span>
                          <span>{{ (Number(u.prefs?.points) || 0).toLocaleString('id-ID') }}</span>
                          <span class="text-[10px] font-normal opacity-80">Poin</span>
                        </button>
                      </td>

                      <!-- Email Verification Badge -->
                      <td class="px-4 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          :class="u.emailVerification
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'"
                          title="Klik untuk mengubah status verifikasi"
                          @click="handleQuickToggleVerification(u)"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="u.emailVerification ? 'bg-emerald-500' : 'bg-amber-500'"
                          />
                          {{ u.emailVerification ? 'Terverifikasi' : 'Belum' }}
                        </button>
                      </td>

                      <!-- Account Status Badge -->
                      <td class="px-4 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:cursor-not-allowed"
                          :disabled="u.$id === currentUser?.$id"
                          :class="u.status
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-200'"
                          :title="u.$id === currentUser?.$id ? 'Tidak dapat menonaktifkan akun sendiri' : 'Klik untuk mengubah status aktif/nonaktif'"
                          @click="handleQuickToggleStatus(u)"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="u.status ? 'bg-emerald-500' : 'bg-red-500'"
                          />
                          {{ u.status ? 'Aktif' : 'Nonaktif' }}
                        </button>
                      </td>

                      <!-- Registration Date -->
                      <td class="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-neutral-400">
                        <div>{{ formatDate(u.registration) }}</div>
                        <div class="text-[10px] text-slate-400 dark:text-neutral-500">
                          Akses: {{ formatDate(u.accessedAt) }}
                        </div>
                      </td>

                      <!-- Actions -->
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <!-- Kelola Akses Button -->
                          <button
                            type="button"
                            class="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
                            title="Kelola Hak Akses & Peran"
                            @click="openEditModal(u)"
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>

                          <!-- Hapus User Button -->
                          <button
                            type="button"
                            class="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            :disabled="u.$id === currentUser?.$id"
                            :title="u.$id === currentUser?.$id ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Akun Pengguna'"
                            @click="promptDeleteUser(u)"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- MODAL: TAMBAH PENGGUNA BARU -->
    <div
      v-if="isAddUserModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5"
        @click.stop
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Tambah Pengguna Baru
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Daftarkan pengguna baru secara langsung melalui sistem admin.
            </p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
            @click="isAddUserModalOpen = false"
          >
            ✕
          </button>
        </div>

        <div
          v-if="addUserError"
          class="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs leading-relaxed"
        >
          {{ addUserError }}
        </div>

        <form
          class="space-y-4"
          @submit.prevent="handleCreateUser"
        >
          <!-- Nama -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Nama Lengkap
            </label>
            <input
              v-model="newUserName"
              type="text"
              placeholder="Contoh: Budi Santoso"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Alamat Email <span class="text-red-500">*</span>
            </label>
            <input
              v-model="newUserEmail"
              type="email"
              required
              placeholder="nama@email.com"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Kata Sandi Awal
            </label>
            <input
              v-model="newUserPassword"
              type="password"
              placeholder="Minimal 8 karakter (acak jika kosong)"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
          </div>

          <!-- Telepon -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Nomor Telepon / WhatsApp (Opsional)
            </label>
            <input
              v-model="newUserPhone"
              type="tel"
              placeholder="+6281234567890"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
          </div>

          <!-- Peran -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Peran & Hak Akses
            </label>
            <select
              v-model="newUserRole"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
            >
              <option value="user">
                Pengguna Biasa (Akses Standar)
              </option>
              <option value="editor">
                Editor / Reviewer Naskah
              </option>
              <option value="admin">
                Administrator (Akses Penuh)
              </option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
              @click="isAddUserModalOpen = false"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="actionLoading"
              class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {{ actionLoading ? 'Membuat...' : 'Buat Pengguna' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: KELOLA HAK AKSES PENGGUNA -->
    <div
      v-if="isEditModalOpen && selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 p-6 pb-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-base shrink-0">
              {{ selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Kelola Hak Akses Pengguna
              </h3>
              <p class="text-xs text-slate-500 dark:text-neutral-400">
                {{ selectedUser.email }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            @click="isEditModalOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 pt-4 space-y-4 overflow-y-auto flex-1">
          <!-- Role Selector -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700/60 space-y-2">
            <label class="block text-xs font-bold text-slate-900 dark:text-white">
              Peran Utama Akun (RBAC)
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                class="p-3 rounded-xl border text-center transition-all cursor-pointer"
                :class="editRole === 'user'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                  : 'border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'"
                @click="editRole = 'user'"
              >
                <div class="text-xs font-bold">
                  Pengguna
                </div>
                <div class="text-[10px] opacity-75 mt-0.5">
                  Akses Biasa
                </div>
              </button>

              <button
                type="button"
                class="p-3 rounded-xl border text-center transition-all cursor-pointer"
                :class="editRole === 'editor'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                  : 'border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'"
                @click="editRole = 'editor'"
              >
                <div class="text-xs font-bold">
                  Editor
                </div>
                <div class="text-[10px] opacity-75 mt-0.5">
                  Reviewer
                </div>
              </button>

              <button
                type="button"
                class="p-3 rounded-xl border text-center transition-all cursor-pointer"
                :class="editRole === 'admin'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                  : 'border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'"
                @click="editRole = 'admin'"
              >
                <div class="text-xs font-bold">
                  Admin
                </div>
                <div class="text-[10px] opacity-75 mt-0.5">
                  Penuh
                </div>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
              Administrator dapat mengakses seluruh fitur panel admin, konfigurasi sistem, dan data pengguna.
            </p>
          </div>

          <!-- Switch Status Akun -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700/60">
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">
                Status Operasional Akun
              </div>
              <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                Nonaktifkan akun untuk memblokir login sementara tanpa menghapus data.
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="editStatus"
                type="checkbox"
                class="sr-only peer"
                :disabled="selectedUser.$id === currentUser?.$id"
              >
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>

          <!-- Switch Verifikasi Email -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700/60">
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">
                Verifikasi Email Akun
              </div>
              <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                Tandai email pengguna sebagai telah terverifikasi secara manual.
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="editVerification"
                type="checkbox"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <!-- Saldo Poin Akun (Pengganti Rupiah) -->
          <div class="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🪙</span>
                  <span>Saldo Poin Pengguna (Pengganti Rupiah)</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  1 Poin = Rp 1. Digunakan untuk pembayaran layanan pemeriksaan naskah.
                </p>
              </div>
              <span class="text-xs font-black text-amber-700 dark:text-amber-300 font-mono">
                {{ (Number(editPoints) || 0).toLocaleString('id-ID') }} Poin
              </span>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model.number="editPoints"
                type="number"
                min="0"
                class="w-full px-3.5 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="Jumlah saldo poin..."
              >
            </div>

            <!-- Quick Add Points Buttons -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors cursor-pointer"
                @click="editPoints = (Number(editPoints) || 0) + 10000"
              >
                +10.000 Poin
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors cursor-pointer"
                @click="editPoints = (Number(editPoints) || 0) + 25000"
              >
                +25.000 Poin
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors cursor-pointer"
                @click="editPoints = (Number(editPoints) || 0) + 50000"
              >
                +50.000 Poin
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors cursor-pointer"
                @click="editPoints = (Number(editPoints) || 0) + 100000"
              >
                +100.000 Poin
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
                @click="editPoints = 0"
              >
                Reset 0
              </button>
            </div>

            <!-- Catatan Transaksi -->
            <div class="space-y-1 pt-2 border-t border-amber-200/50 dark:border-amber-900/40">
              <label class="block text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                Catatan / Alasan Transaksi (Opsional)
              </label>
              <input
                v-model="editPointsNotes"
                type="text"
                maxlength="150"
                class="w-full px-3.5 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="Contoh: Top up manual via transfer bank, Bonus sambutan, Pengurangan dsb."
              >
              <p class="text-[10px] text-slate-400 dark:text-neutral-500">
                Catatan ini dicatat ke riwayat transaksi poin pengguna dan database sistem.
              </p>
            </div>
          </div>

          <!-- Riwayat Transaksi Poin Pengguna -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700/60 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📜</span>
                  <span>Riwayat Transaksi Poin Pengguna</span>
                </span>
                <span
                  v-if="selectedUserHistory.length > 0"
                  class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                >
                  {{ selectedUserHistory.length }} Catatan
                </span>
              </div>
              <span
                v-if="isLoadingHistory"
                class="text-[10px] text-slate-400 animate-pulse flex items-center gap-1 font-medium"
              >
                <svg
                  class="animate-spin h-3 w-3 text-amber-500"
                  xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Sinkronisasi...</span>
              </span>
            </div>

            <!-- Table Riwayat -->
            <div
              v-if="selectedUserHistory.length > 0"
              class="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 max-h-56 overflow-y-auto"
            >
              <table class="w-full text-left text-[11px]">
                <thead class="bg-slate-50 dark:bg-neutral-800/60 text-slate-500 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-700/80 uppercase font-bold text-[9px] tracking-wider sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th class="py-2 px-3">
                      Waktu
                    </th>
                    <th class="py-2 px-3">
                      Tipe
                    </th>
                    <th class="py-2 px-3 text-right">
                      Nominal
                    </th>
                    <th class="py-2 px-3 text-right">
                      Saldo Akhir
                    </th>
                    <th class="py-2 px-3">
                      Admin / Catatan
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
                  <tr
                    v-for="tx in selectedUserHistory"
                    :key="tx.id"
                    class="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td class="py-2.5 px-3 text-slate-600 dark:text-neutral-300 whitespace-nowrap">
                      {{ formatTransactionDate(tx.createdAt) }}
                    </td>
                    <td class="py-2.5 px-3 whitespace-nowrap">
                      <span
                        class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        :class="{
                          'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300': tx.type === 'topup',
                          'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300': tx.type === 'deduction',
                          'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300': tx.type === 'adjustment'
                        }"
                      >
                        {{ formatTransactionType(tx.type) }}
                      </span>
                    </td>
                    <td
                      class="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap"
                      :class="tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : (tx.amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-neutral-300')"
                    >
                      {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toLocaleString('id-ID') }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {{ (tx.balanceAfter || 0).toLocaleString('id-ID') }}
                    </td>
                    <td class="py-2.5 px-3 text-slate-600 dark:text-neutral-300">
                      <div class="font-semibold text-slate-800 dark:text-neutral-200">
                        {{ tx.adminName || tx.adminEmail || 'Admin' }}
                      </div>
                      <div
                        class="text-[10px] text-slate-400 dark:text-neutral-500 italic truncate max-w-[160px]"
                        :title="tx.notes"
                      >
                        {{ tx.notes || '-' }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State Riwayat -->
            <div
              v-else-if="!isLoadingHistory"
              class="py-5 text-center text-xs text-slate-400 dark:text-neutral-500 rounded-xl border border-dashed border-slate-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50"
            >
              Belum ada riwayat transaksi poin untuk pengguna ini.
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 pt-4 border-t border-slate-100 dark:border-neutral-800 shrink-0 bg-slate-50/50 dark:bg-neutral-900/50">
          <div class="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
            ID: {{ selectedUser.$id }}
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
              @click="isEditModalOpen = false"
            >
              Tutup
            </button>
            <button
              type="button"
              :disabled="actionLoading"
              class="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              @click="handleSaveUserAccess"
            >
              {{ actionLoading ? 'Menyimpan...' : 'Simpan Hak Akses' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: KONFIRMASI HAPUS PENGGUNA -->
    <div
      v-if="isDeleteModalOpen && userToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4"
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div class="text-center">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Konfirmasi Hapus Akun
          </h3>
          <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Apakah Anda yakin ingin menghapus akun <span class="font-bold text-slate-800 dark:text-neutral-200">{{ userToDelete.name || userToDelete.email }}</span>? Tindakan ini permanen dan tidak dapat dibatalkan.
          </p>
        </div>

        <div class="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            class="w-full py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
            @click="isDeleteModalOpen = false"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="actionLoading"
            class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            @click="handleConfirmDelete"
          >
            {{ actionLoading ? 'Menghapus...' : 'Hapus Permanen' }}
          </button>
        </div>
      </div>
    </div>

    <LandingFooter />
  </div>
</template>
