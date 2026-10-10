<script setup lang="ts">
import type { TestimonialItem } from '~/composables/useTestimonials'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Manajemen Testimoni & Review — Admin Cek Naskah',
  description: 'Kelola ulasan pengguna, verifikasi kelayakan publikasi, dan atur visibilitas testimoni.',
  robots: 'noindex, nofollow'
})

const {
  adminTestimonials,
  loading,
  error,
  fetchAdminTestimonials,
  toggleVisibility,
  deleteTestimonial
} = useTestimonials()

// Filter & Search State
const searchQuery = ref('')
const statusFilter = ref<'all' | 'visible' | 'hidden'>('all')
const ratingFilter = ref<'all' | '5' | '4' | '3' | 'low'>('all')
const actionLoadingId = ref<string | null>(null)

// Modal Detail / Konfirmasi Hapus
const selectedItem = ref<TestimonialItem | null>(null)
const isDetailOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const itemToDelete = ref<TestimonialItem | null>(null)

// Format tanggal
const formatDate = (isoStr?: string): string => {
  if (!isoStr) return '-'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB'
  } catch {
    return isoStr
  }
}

// Filtered List
const filteredTestimonials = computed(() => {
  let list = adminTestimonials.value || []

  // Filter Status
  if (statusFilter.value === 'visible') {
    list = list.filter(item => item.isVisible !== false)
  } else if (statusFilter.value === 'hidden') {
    list = list.filter(item => item.isVisible === false)
  }

  // Filter Rating
  if (ratingFilter.value === '5') {
    list = list.filter(item => item.rating === 5)
  } else if (ratingFilter.value === '4') {
    list = list.filter(item => item.rating === 4)
  } else if (ratingFilter.value === '3') {
    list = list.filter(item => item.rating === 3)
  } else if (ratingFilter.value === 'low') {
    list = list.filter(item => item.rating <= 2)
  }

  // Filter Pencarian
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(item =>
      (item.userName || '').toLowerCase().includes(q)
      || (item.userEmail || '').toLowerCase().includes(q)
      || (item.userOccupation || '').toLowerCase().includes(q)
      || (item.userAffiliation || '').toLowerCase().includes(q)
      || (item.manuscriptTitle || '').toLowerCase().includes(q)
      || (item.comment || '').toLowerCase().includes(q)
    )
  }

  return list
})

// Metrics
const totalReviews = computed(() => adminTestimonials.value.length)
const fiveStarReviews = computed(() => adminTestimonials.value.filter(t => t.rating === 5).length)
const visibleCount = computed(() => adminTestimonials.value.filter(t => t.isVisible !== false).length)
const totalPointsGiven = computed(() => adminTestimonials.value.reduce((acc, t) => acc + (t.pointsAwarded || 0), 0))

// Handle Toggle Visibility
const handleToggleVisibility = async (item: TestimonialItem) => {
  const targetId = item.$id
  if (!targetId) return

  actionLoadingId.value = targetId
  const newStatus = !item.isVisible
  await toggleVisibility(targetId, newStatus)
  actionLoadingId.value = null
}

// Handle Delete
const promptDelete = (item: TestimonialItem) => {
  itemToDelete.value = item
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value?.$id) return
  actionLoadingId.value = itemToDelete.value.$id
  await deleteTestimonial(itemToDelete.value.$id)
  isDeleteConfirmOpen.value = false
  itemToDelete.value = null
  actionLoadingId.value = null
}

// Buka Detail Modal
const openDetail = (item: TestimonialItem) => {
  selectedItem.value = item
  isDetailOpen.value = true
}

onMounted(async () => {
  await fetchAdminTestimonials()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">
          <UIcon
            name="i-lucide-message-square-quote"
            class="w-4 h-4"
          />
          <span>Panel Administrator</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Manajemen Testimoni & Ulasan
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
          Atur publikasi review pengguna dari naskah yang telah selesai dan pantau pemberian reward poin.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          @click="fetchAdminTestimonials()"
        >
          <UIcon
            name="i-lucide-refresh-cw"
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin': loading }"
          />
          <span>Perbarui Data</span>
        </button>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Total Ulasan</span>
          <div class="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <UIcon
              name="i-lucide-message-square"
              class="w-4 h-4"
            />
          </div>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white">
          {{ totalReviews.toLocaleString('id-ID') }}
        </div>
        <div class="text-[11px] text-slate-400">
          Ulasan masuk dari naskah
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Bintang 5 (Puas)</span>
          <div class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
            <UIcon
              name="i-lucide-star"
              class="w-4 h-4 fill-current"
            />
          </div>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white">
          {{ fiveStarReviews.toLocaleString('id-ID') }}
        </div>
        <div class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          {{ totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 0 }}% dari total ulasan
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Tampil di Publik</span>
          <div class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <UIcon
              name="i-lucide-eye"
              class="w-4 h-4"
            />
          </div>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white">
          {{ visibleCount.toLocaleString('id-ID') }}
        </div>
        <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          Aktif di halaman testimoni
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-neutral-400">Poin Diberikan</span>
          <div class="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
            <UIcon
              name="i-lucide-gift"
              class="w-4 h-4"
            />
          </div>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white">
          +{{ totalPointsGiven.toLocaleString('id-ID') }}
        </div>
        <div class="text-[11px] text-slate-400">
          Reward gamifikasi ulasan
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      <!-- Search Input -->
      <div class="w-full md:w-80 relative">
        <UIcon
          name="i-lucide-search"
          class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pengguna, naskah, ulasan..."
          class="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 dark:text-white"
        >
      </div>

      <!-- Filters -->
      <div class="w-full md:w-auto flex flex-wrap items-center gap-2">
        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-neutral-300 focus:outline-hidden"
        >
          <option value="all">
            Semua Status Publik
          </option>
          <option value="visible">
            Ditampilkan (Publik)
          </option>
          <option value="hidden">
            Disembunyikan
          </option>
        </select>

        <!-- Rating Filter -->
        <select
          v-model="ratingFilter"
          class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-neutral-300 focus:outline-hidden"
        >
          <option value="all">
            Semua Rating Bintang
          </option>
          <option value="5">
            ⭐⭐⭐⭐⭐ Bintang 5
          </option>
          <option value="4">
            ⭐⭐⭐⭐ Bintang 4
          </option>
          <option value="3">
            ⭐⭐⭐ Bintang 3
          </option>
          <option value="low">
            ⭐⭐ / ⭐ Bintang 1-2
          </option>
        </select>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-alert-triangle"
          class="w-4 h-4 shrink-0 text-red-600"
        />
        <span>{{ error }}</span>
      </div>
      <button
        class="text-xs font-bold underline"
        @click="fetchAdminTestimonials()"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Table of Testimonials -->
    <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
      <!-- Loading State -->
      <div
        v-if="loading && adminTestimonials.length === 0"
        class="py-16 text-center space-y-3"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin mx-auto text-primary-600"
        />
        <p class="text-xs font-medium text-slate-500">
          Memuat daftar testimoni pengguna...
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredTestimonials.length === 0"
        class="py-16 text-center space-y-3 px-4"
      >
        <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 flex items-center justify-center mx-auto">
          <UIcon
            name="i-lucide-message-square-off"
            class="w-6 h-6"
          />
        </div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">
          Belum Ada Testimoni
        </h3>
        <p class="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
          Tidak ada testimoni yang sesuai dengan kriteria filter saat ini. Pengguna akan memberikan review setelah hasil pemeriksaan naskah keluar.
        </p>
      </div>

      <!-- Table View -->
      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left text-xs text-slate-700 dark:text-neutral-300">
          <thead class="bg-slate-50/80 dark:bg-neutral-800/50 text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider border-b border-slate-100 dark:border-neutral-800">
            <tr>
              <th class="py-3.5 px-4">
                Pengguna
              </th>
              <th class="py-3.5 px-4">
                Naskah & Layanan
              </th>
              <th class="py-3.5 px-4">
                Rating & Bonus
              </th>
              <th class="py-3.5 px-4 max-w-xs">
                Isi Ulasan
              </th>
              <th class="py-3.5 px-4">
                Status Publik
              </th>
              <th class="py-3.5 px-4 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/80">
            <tr
              v-for="item in filteredTestimonials"
              :key="item.$id || item.manuscriptId"
              class="hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <!-- 1. Pengguna -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {{ item.userName ? item.userName.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">
                      {{ item.userName || 'Pengguna' }}
                    </div>
                    <div class="text-[11px] text-slate-400">
                      {{ item.userEmail }}
                    </div>
                    <div
                      v-if="item.userOccupation || item.userAffiliation"
                      class="text-[10px] text-primary-600 dark:text-primary-400 font-medium truncate max-w-[220px]"
                    >
                      {{ [item.userOccupation, item.userAffiliation].filter(Boolean).join(' • ') }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 2. Naskah & Layanan -->
              <td class="py-4 px-4 max-w-[200px]">
                <div
                  class="font-semibold text-slate-900 dark:text-white truncate"
                  :title="item.manuscriptTitle"
                >
                  {{ item.manuscriptTitle || 'Naskah' }}
                </div>
                <div class="text-[10px] text-primary-600 dark:text-primary-400 font-medium">
                  {{ item.serviceName || 'Layanan' }}
                </div>
              </td>

              <!-- 3. Rating & Bonus Poin -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="flex items-center gap-1 text-amber-500 mb-1">
                  <UIcon
                    v-for="star in 5"
                    :key="star"
                    name="i-lucide-star"
                    class="w-3.5 h-3.5"
                    :class="star <= item.rating ? 'fill-current text-amber-500' : 'text-slate-300 dark:text-neutral-700'"
                  />
                  <span class="ml-1 text-xs font-black text-slate-900 dark:text-white">
                    {{ item.rating }}.0
                  </span>
                </div>
                <span
                  v-if="item.pointsAwarded > 0"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="w-2.5 h-2.5"
                  />
                  <span>{{ item.pointsAwarded.toLocaleString('id-ID') }} Poin</span>
                </span>
                <span
                  v-else
                  class="text-[10px] text-slate-400"
                >
                  Tanpa Poin
                </span>
              </td>

              <!-- 4. Isi Ulasan -->
              <td class="py-4 px-4 max-w-xs">
                <p class="text-xs text-slate-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  "{{ item.comment }}"
                </p>
                <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>{{ item.charCount || item.comment.length }} Karakter</span>
                  <span>•</span>
                  <span>{{ formatDate(item.createdAt || item.$createdAt) }}</span>
                </div>
              </td>

              <!-- 5. Status Publik & Toggle -->
              <td class="py-4 px-4 whitespace-nowrap">
                <button
                  type="button"
                  :disabled="actionLoadingId === item.$id"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  :class="item.isVisible !== false
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700'"
                  :title="item.isVisible !== false ? 'Klik untuk sembunyikan dari publik' : 'Klik untuk tampilkan ke publik'"
                  @click="handleToggleVisibility(item)"
                >
                  <UIcon
                    v-if="actionLoadingId === item.$id"
                    name="i-lucide-loader-2"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <UIcon
                    v-else
                    :name="item.isVisible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                    class="w-3.5 h-3.5"
                  />
                  <span>{{ item.isVisible !== false ? 'Tampil (Publik)' : 'Disembunyikan' }}</span>
                </button>
              </td>

              <!-- 6. Aksi -->
              <td class="py-4 px-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Lihat Rincian Ulasan"
                    @click="openDetail(item)"
                  >
                    <UIcon
                      name="i-lucide-expand"
                      class="w-4 h-4"
                    />
                  </button>
                  <button
                    type="button"
                    class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Hapus Ulasan"
                    @click="promptDelete(item)"
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

    <!-- Modal Detail Ulasan -->
    <UModal
      v-model:open="isDetailOpen"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #content>
        <div
          v-if="selectedItem"
          class="p-6 space-y-5"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600">
                <UIcon
                  name="i-lucide-message-square-quote"
                  class="w-5 h-5"
                />
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Rincian Ulasan Naskah
              </h3>
            </div>
            <button
              class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
              @click="isDetailOpen = false"
            >
              <UIcon
                name="i-lucide-x"
                class="w-4 h-4"
              />
            </button>
          </div>

          <!-- Rating & User Info Card -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-850 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ selectedItem.userName }}
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ selectedItem.userEmail }}
                </div>
                <div
                  v-if="selectedItem.userOccupation || selectedItem.userAffiliation"
                  class="text-[11px] text-primary-600 dark:text-primary-400 font-medium mt-0.5"
                >
                  💼 {{ [selectedItem.userOccupation, selectedItem.userAffiliation].filter(Boolean).join(' — ') }}
                </div>
              </div>
              <div class="flex items-center gap-1 text-amber-500">
                <UIcon
                  v-for="s in 5"
                  :key="s"
                  name="i-lucide-star"
                  class="w-4 h-4"
                  :class="s <= selectedItem.rating ? 'fill-current text-amber-500' : 'text-slate-300 dark:text-neutral-700'"
                />
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200/60 dark:border-neutral-800 text-[11px] flex items-center justify-between">
              <span class="text-slate-500">Naskah: <b>{{ selectedItem.manuscriptTitle }}</b></span>
              <span
                v-if="selectedItem.pointsAwarded > 0"
                class="font-bold text-emerald-600 dark:text-emerald-400"
              >
                +{{ selectedItem.pointsAwarded.toLocaleString('id-ID') }} Poin
              </span>
            </div>
          </div>

          <!-- Komentar Lengkap -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-neutral-300">Teks Ulasan:</label>
            <div class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-200 leading-relaxed italic whitespace-pre-line">
              "{{ selectedItem.comment }}"
            </div>
            <div class="text-[11px] text-slate-400 text-right">
              Total {{ selectedItem.comment.length }} karakter
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              :class="selectedItem.isVisible !== false
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'"
              @click="handleToggleVisibility(selectedItem); isDetailOpen = false"
            >
              {{ selectedItem.isVisible !== false ? 'Sembunyikan dari Publik' : 'Tampilkan ke Publik' }}
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 font-bold text-xs"
              @click="isDetailOpen = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal Konfirmasi Hapus -->
    <UModal
      v-model:open="isDeleteConfirmOpen"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3 text-rose-600">
            <div class="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60">
              <UIcon
                name="i-lucide-alert-triangle"
                class="w-6 h-6"
              />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Hapus Testimoni?
              </h3>
              <p class="text-xs text-slate-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <p class="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus ulasan dari <b>{{ itemToDelete?.userName }}</b>? Testimoni akan dihapus permanen dari sistem.
          </p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold"
              @click="isDeleteConfirmOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="actionLoadingId !== null"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              @click="confirmDelete()"
            >
              <UIcon
                v-if="actionLoadingId"
                name="i-lucide-loader-2"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>Hapus Permanen</span>
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
