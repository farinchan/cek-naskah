<script setup lang="ts">
import { defaultExcludeOptions, type ExcludeOptions, type ManuscriptRow } from '~/composables/useManuscripts'

useSeoMeta({
  title: 'Cek Plagiarisme iThenticate — Cek Naskah Resmi No-Repository',
  description: 'Layanan unggah dan pemeriksaan plagiarisme resmi iThenticate standar jurnal internasional dan perguruan tinggi dengan garansi 100% No-Repository.',
  ogTitle: 'Cek Plagiarisme iThenticate — Cek Naskah Resmi No-Repository',
  ogDescription: 'Pemeriksaan similarity index resmi standar kampus dan jurnal internasional tanpa naskah tersimpan di database.',
  ogType: 'website',
  ogUrl: 'https://cek-naskah.web.id/ithenticate',
  ogImage: 'https://cek-naskah.web.id/logo.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Cek Plagiarisme iThenticate — Cek Naskah',
  twitterDescription: 'Unggah naskah dan dapatkan laporan resmi iThenticate No-Repository cepat dan akurat.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://cek-naskah.web.id/ithenticate' }
  ]
})

useSchemaOrg([
  defineWebPage({
    name: 'Cek Plagiarisme iThenticate — Cek Naskah',
    description: 'Layanan pemeriksaan similarity resmi iThenticate dengan kustomisasi exclude abstract, methods, bibliography, quotes, citations, dan small matches.'
  })
])

// Composables
const { user } = useAuth()
const { userPoints, openTopupModal, deductPoints, rupiahToPoints } = usePoints()
const { services, fetchServices } = useServices()
const {
  manuscripts,
  loading: manuscriptsLoading,
  uploading,
  error: submitError,
  clearFeedback,
  formatFileSize,
  getStatusBadge,
  fetchUserManuscripts,
  submitManuscript
} = useManuscripts()

const isDeductingPoints = ref(false)

// Active Tab: 'upload' | 'history'
const activeTab = ref<'upload' | 'history'>('upload')

// Form State
const form = reactive<{
  title: string
  file: File | null
  userNotes: string
  excludeOptions: ExcludeOptions
}>({
  title: '',
  file: null,
  userNotes: '',
  excludeOptions: { ...defaultExcludeOptions }
})

// File Drag & Drop State
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const fileValidationError = ref<string | null>(null)

// Service Data from database with fallback
const targetServiceId = 'turnitin-plagiarism'
const currentService = computed(() => {
  return services.value.find(s => s.id === targetServiceId) || {
    id: targetServiceId,
    name: 'Cek Plagiarisme iThenticate',
    tag: 'Standar Jurnal & Doktoral',
    price: 'Rp 8.000',
    unit: '/ naskah',
    badgeClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    description: 'Pemeriksaan similarity index resmi standar kampus dan jurnal internasional tanpa naskah tersimpan di database.',
    features: [
      'Garansi 100% No-Repository (Aman)',
      'Laporan PDF Resmi Full Color & Original',
      'Rincian Seluruh Sumber Kemiripan Teks',
      'Waktu Proses Cepat (5 – 25 Menit)',
      'Dukungan File .docx, .pdf, .txt'
    ],
    highlight: true,
    active: true,
    visible: true,
    ctaText: 'Pesan Cek iThenticate',
    ctaLink: '',
    order: 2
  }
})

// Point calculations & balance validation
const requiredPoints = computed(() => {
  const pts = rupiahToPoints(currentService.value.price)
  return pts > 0 ? pts : 8000
})

const hasEnoughPoints = computed(() => {
  return userPoints.value >= requiredPoints.value
})

const pointsDeficit = computed(() => {
  return Math.max(0, requiredPoints.value - userPoints.value)
})

// Submission Success Modal State
const isSuccessModalOpen = ref(false)
const submittedManuscript = ref<ManuscriptRow | null>(null)

// Detail Modal State
const isDetailModalOpen = ref(false)
const selectedManuscript = ref<ManuscriptRow | null>(null)

// Allowed file extensions
const allowedExtensions = ['docx', 'doc', 'pdf', 'txt', 'rtf', 'odt']
const maxFileSizeBytes = 50 * 1024 * 1024 // 50MB

onMounted(async () => {
  await fetchServices()
  if (user.value?.$id) {
    await fetchUserManuscripts(targetServiceId)
  }
})

watch(() => user.value?.$id, async (newVal) => {
  if (newVal) {
    await fetchUserManuscripts(targetServiceId)
  }
})

// Drag & Drop handlers
const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const validateAndSetFile = (file: File) => {
  fileValidationError.value = null
  const ext = file.name.split('.').pop()?.toLowerCase() || ''

  if (!allowedExtensions.includes(ext)) {
    fileValidationError.value = `Format file .${ext} tidak didukung. Harap unggah file dengan ekstensi: ${allowedExtensions.map(e => '.' + e).join(', ')}`
    return false
  }

  if (file.size > maxFileSizeBytes) {
    fileValidationError.value = `Ukuran file melebihi batas maksimal 50MB (${formatFileSize(file.size)}).`
    return false
  }

  form.file = file

  // Auto-fill title from filename
  const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  form.title = (rawName.charAt(0).toUpperCase() + rawName.slice(1)).trim() || file.name

  return true
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const droppedFile = e.dataTransfer?.files?.[0]
  if (droppedFile) {
    validateAndSetFile(droppedFile)
  }
}

const onFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFile = target.files?.[0]
  if (selectedFile) {
    validateAndSetFile(selectedFile)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const removeSelectedFile = () => {
  form.file = null
  form.title = ''
  fileValidationError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Submit manuscript handler
const handleSubmitManuscript = async () => {
  clearFeedback()
  fileValidationError.value = null

  if (!user.value?.$id) {
    navigateTo('/login?redirect=/ithenticate')
    return
  }

  if (!form.file) {
    fileValidationError.value = 'Silakan pilih atau tarik file naskah Anda ke area upload.'
    return
  }

  // 1. Validasi saldo poin mencukupi
  if (!hasEnoughPoints.value) {
    submitError.value = `Saldo Poin Anda tidak mencukupi (Saldo: 🪙 ${userPoints.value.toLocaleString('id-ID')} Poin, Biaya: 🪙 ${requiredPoints.value.toLocaleString('id-ID')} Poin). Silakan isi ulang (top up) poin terlebih dahulu.`
    openTopupModal()
    return
  }

  // Set title automatically from file name
  if (!form.title.trim()) {
    const rawName = form.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    form.title = (rawName.charAt(0).toUpperCase() + rawName.slice(1)).trim() || form.file.name
  }

  isDeductingPoints.value = true

  // 2. Potong saldo poin seharga biaya layanan
  try {
    await deductPoints(
      requiredPoints.value,
      currentService.value.name,
      `Pemeriksaan iThenticate naskah: ${form.title}`
    )
  } catch (deductErr: unknown) {
    console.error('Point deduction failed:', deductErr)
    const msg = deductErr && typeof deductErr === 'object' && 'message' in deductErr
      ? String((deductErr as { message: unknown }).message)
      : 'Gagal memproses pemotongan saldo poin.'
    submitError.value = msg
    isDeductingPoints.value = false
    return
  }

  // 3. Simpan naskah ke Appwrite Storage & Database
  const res = await submitManuscript({
    title: form.title,
    serviceId: currentService.value.id,
    serviceName: currentService.value.name,
    price: currentService.value.price,
    file: form.file,
    excludeOptions: { ...form.excludeOptions },
    userNotes: form.userNotes
  })

  isDeductingPoints.value = false

  if (res.success && res.manuscript) {
    submittedManuscript.value = res.manuscript
    isSuccessModalOpen.value = true

    // Reset form
    form.title = ''
    form.file = null
    form.userNotes = ''
    form.excludeOptions = { ...defaultExcludeOptions }
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// Open Detail Modal
const openDetailModal = (item: ManuscriptRow) => {
  selectedManuscript.value = item
  isDetailModalOpen.value = true
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

const parseOptions = (raw?: string): ExcludeOptions => {
  if (!raw) return { ...defaultExcludeOptions }
  try {
    return JSON.parse(raw) as ExcludeOptions
  } catch {
    return { ...defaultExcludeOptions }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-primary-500 selection:text-white transition-colors duration-200">
    <LandingHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <!-- Breadcrumb & Header Title -->
        <div class="space-y-4">
          <nav class="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
            <NuxtLink
              to="/"
              class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Beranda
            </NuxtLink>
            <UIcon
              name="i-lucide-chevron-right"
              class="w-3.5 h-3.5"
            />
            <NuxtLink
              to="/charge"
              class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Layanan & Tarif
            </NuxtLink>
            <UIcon
              name="i-lucide-chevron-right"
              class="w-3.5 h-3.5"
            />
            <span class="text-slate-900 dark:text-white font-medium">Cek Plagiarisme iThenticate</span>
          </nav>

          <!-- Service Hero Banner Card -->
          <div class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 via-primary-700 to-indigo-900 text-white p-6 sm:p-10 shadow-xl shadow-primary-950/20">
            <!-- Decorative Background Graphic -->
            <div class="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div class="absolute right-10 top-8 opacity-10 hidden lg:block pointer-events-none">
              <UIcon
                name="i-lucide-file-check-2"
                class="w-56 h-56 text-white"
              />
            </div>

            <div class="relative z-10 max-w-3xl space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <UIcon
                  name="i-lucide-shield-check"
                  class="w-4 h-4 text-emerald-300"
                />
                <span>{{ currentService.tag || 'Standar Jurnal & Doktoral' }}</span>
              </div>

              <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {{ currentService.name }}
              </h1>

              <p class="text-sm sm:text-base text-primary-100 leading-relaxed max-w-2xl">
                {{ currentService.description }}
              </p>

              <!-- Highlights Badges Row -->
              <div class="flex flex-wrap items-center gap-2.5 pt-2">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-medium border border-white/15">
                  <UIcon
                    name="i-lucide-lock"
                    class="w-3.5 h-3.5 text-emerald-300"
                  />
                  <span>100% No-Repository (Aman)</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-medium border border-white/15">
                  <UIcon
                    name="i-lucide-zap"
                    class="w-3.5 h-3.5 text-amber-300"
                  />
                  <span>Hasil 5 – 25 Menit</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-medium border border-white/15">
                  <UIcon
                    name="i-lucide-badge-percent"
                    class="w-3.5 h-3.5 text-cyan-300"
                  />
                  <span>Tarif: {{ currentService.price }} {{ currentService.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs: Upload Form vs Riwayat Naskah -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              :class="activeTab === 'upload'
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/25'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900'"
              @click="activeTab = 'upload'"
            >
              <UIcon
                name="i-lucide-upload"
                class="w-4 h-4"
              />
              <span>Unggah Naskah Baru</span>
            </button>

            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              :class="activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/25'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900'"
              @click="activeTab = 'history'"
            >
              <UIcon
                name="i-lucide-history"
                class="w-4 h-4"
              />
              <span>Riwayat Naskah Anda</span>
              <span
                v-if="user && manuscripts.length > 0"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="activeTab === 'history' ? 'bg-white text-primary-700' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300'"
              >
                {{ manuscripts.length }}
              </span>
            </button>
          </div>

          <!-- User Points Balance Quick Info -->
          <div
            v-if="user"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs shadow-2xs"
          >
            <span class="text-slate-500 dark:text-neutral-400">Saldo:</span>
            <span class="font-bold text-primary-600 dark:text-primary-400">🪙 {{ userPoints.toLocaleString('id-ID') }} Poin</span>
            <button
              type="button"
              class="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer ml-1"
              @click="openTopupModal"
            >
              + Isi Poin
            </button>
          </div>
        </div>

        <!-- AUTHENTICATION CHECK GATE -->
        <div
          v-if="!user"
          class="rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-6 sm:p-8 text-center space-y-4"
        >
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <UIcon
              name="i-lucide-lock"
              class="w-7 h-7"
            />
          </div>
          <div class="max-w-md mx-auto space-y-1.5">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Masuk untuk Mengunggah Naskah
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">
              Demi keamanan privasi naskah dan agar laporan similarity dapat tersimpan di akun Anda, silakan masuk atau daftar akun Cek Naskah terlebih dahulu.
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NuxtLink
              to="/login?redirect=/ithenticate"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-colors"
            >
              <UIcon
                name="i-lucide-log-in"
                class="w-4 h-4"
              />
              <span>Masuk Sekarang</span>
            </NuxtLink>
            <NuxtLink
              to="/register?redirect=/ithenticate"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 font-bold text-xs sm:text-sm border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <span>Daftar Akun Baru</span>
            </NuxtLink>
          </div>
        </div>

        <!-- TAB 1: UPLOAD FORM SECTION (When Authenticated) -->
        <div
          v-else-if="activeTab === 'upload'"
          class="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <!-- Left Column: Form Upload & Exclude Options (2 Columns) -->
          <div class="lg:col-span-2 space-y-6">
            <form
              class="space-y-6"
              @submit.prevent="handleSubmitManuscript"
            >
              <!-- 1. Dropzone Unggah Naskah -->
              <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                      File Naskah <span class="text-rose-500">*</span>
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">
                      Format didukung: Word (.docx, .doc), PDF (.pdf), Teks (.txt, .odt, .rtf)
                    </p>
                  </div>
                  <span class="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                    Maks. 50 MB
                  </span>
                </div>

                <!-- Hidden native input -->
                <input
                  ref="fileInputRef"
                  type="file"
                  class="hidden"
                  accept=".docx,.doc,.pdf,.txt,.odt,.rtf"
                  @change="onFileInputChange"
                >

                <!-- Interactive Dropzone Box -->
                <div
                  v-if="!form.file"
                  class="border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                  :class="isDragging
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/20 scale-[0.99]'
                    : 'border-slate-300 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-950/40 hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-neutral-900'"
                  @dragover="onDragOver"
                  @dragleave="onDragLeave"
                  @drop="onDrop"
                  @click="triggerFileInput"
                >
                  <div
                    class="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform"
                    :class="isDragging
                      ? 'bg-primary-600 text-white scale-110 shadow-lg shadow-primary-500/30'
                      : 'bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400'"
                  >
                    <UIcon
                      name="i-lucide-upload-cloud"
                      class="w-8 h-8"
                    />
                  </div>

                  <div class="space-y-1">
                    <p class="text-sm font-bold text-slate-800 dark:text-white">
                      {{ isDragging ? 'Lepaskan file di sini...' : 'Tarik & lepas file naskah Anda di sini' }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-neutral-400">
                      atau <span class="text-primary-600 dark:text-primary-400 font-bold underline underline-offset-2">Pilih File dari Perangkat</span>
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                    <span
                      v-for="ext in allowedExtensions"
                      :key="ext"
                      class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-200/70 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      .{{ ext }}
                    </span>
                  </div>
                </div>

                <!-- Selected File Card Preview -->
                <div
                  v-else
                  class="rounded-2xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/40 dark:bg-primary-950/20 p-4 sm:p-5 flex items-center justify-between gap-4"
                >
                  <div class="flex items-center gap-3.5 min-w-0">
                    <div class="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/25">
                      <UIcon
                        name="i-lucide-file-text"
                        class="w-6 h-6"
                      />
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {{ form.file.name }}
                      </div>
                      <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        <span>{{ formatFileSize(form.file.size) }}</span>
                        <span>•</span>
                        <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <UIcon
                            name="i-lucide-check-circle"
                            class="w-3.5 h-3.5"
                          />
                          Siap diunggah
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      @click="triggerFileInput"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      class="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus file"
                      @click="removeSelectedFile"
                    >
                      <UIcon
                        name="i-lucide-trash-2"
                        class="w-4 h-4"
                      />
                    </button>
                  </div>
                </div>

                <!-- Validation Error Message -->
                <div
                  v-if="fileValidationError"
                  class="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2"
                >
                  <UIcon
                    name="i-lucide-alert-circle"
                    class="w-4 h-4 shrink-0 mt-0.5"
                  />
                  <span>{{ fileValidationError }}</span>
                </div>
              </div>

              <!-- 3. SECTION: Exclude from Similarity Report -->
              <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-5">
                <div class="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
                  <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                    <UIcon
                      name="i-lucide-sliders-horizontal"
                      class="w-4 h-4"
                    />
                  </div>
                  <div>
                    <h3 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      Exclude from Similarity Report
                    </h3>
                    <p class="text-xs text-slate-500 dark:text-neutral-400">
                      Pilih bagian atau parameter yang ingin dikecualikan dari kalkulasi similarity iThenticate
                    </p>
                  </div>
                </div>

                <!-- Exclude Checkboxes List -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <!-- 1. abstract -->
                  <label
                    class="relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none"
                    :class="form.excludeOptions.abstract
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/40 dark:bg-neutral-950/40'"
                  >
                    <input
                      v-model="form.excludeOptions.abstract"
                      type="checkbox"
                      class="mt-0.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    >
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-900 dark:text-white">
                        abstract
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                        Kecualikan abstrak dari perhitungan kemiripan naskah
                      </div>
                    </div>
                  </label>

                  <!-- 2. methods and Material -->
                  <label
                    class="relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none"
                    :class="form.excludeOptions.methodsAndMaterial
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/40 dark:bg-neutral-950/40'"
                  >
                    <input
                      v-model="form.excludeOptions.methodsAndMaterial"
                      type="checkbox"
                      class="mt-0.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    >
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-900 dark:text-white">
                        methods and Material
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                        Kecualikan bab atau bagian metode & bahan penelitian
                      </div>
                    </div>
                  </label>

                  <!-- 3. bibliography -->
                  <label
                    class="relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none"
                    :class="form.excludeOptions.bibliography
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/40 dark:bg-neutral-950/40'"
                  >
                    <input
                      v-model="form.excludeOptions.bibliography"
                      type="checkbox"
                      class="mt-0.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    >
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-900 dark:text-white">
                        bibliography
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                        Kecualikan daftar pustaka & referensi naskah
                      </div>
                    </div>
                  </label>

                  <!-- 4. quotes -->
                  <label
                    class="relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none"
                    :class="form.excludeOptions.quotes
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/40 dark:bg-neutral-950/40'"
                  >
                    <input
                      v-model="form.excludeOptions.quotes"
                      type="checkbox"
                      class="mt-0.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    >
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-900 dark:text-white">
                        quotes
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                        Kecualikan kutipan yang diapit tanda petik
                      </div>
                    </div>
                  </label>

                  <!-- 5. citations -->
                  <label
                    class="relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none"
                    :class="form.excludeOptions.citations
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/40 dark:bg-neutral-950/40'"
                  >
                    <input
                      v-model="form.excludeOptions.citations"
                      type="checkbox"
                      class="mt-0.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    >
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-900 dark:text-white">
                        citations
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                        Kecualikan sitasi dalam teks (misal: Smith et al., 2024)
                      </div>
                    </div>
                  </label>

                  <!-- 6. small matches -->
                  <div
                    class="relative p-3.5 rounded-2xl border transition-all space-y-3"
                    :class="form.excludeOptions.smallMatches
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/40 dark:bg-neutral-950/40'"
                  >
                    <label class="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        v-model="form.excludeOptions.smallMatches"
                        type="checkbox"
                        class="mt-0.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                      >
                      <div class="min-w-0">
                        <div class="text-xs font-bold text-slate-900 dark:text-white">
                          small matches
                        </div>
                        <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                          Kecualikan kemiripan frasa pendek di bawah batas kata
                        </div>
                      </div>
                    </label>

                    <!-- Conditional Number Input for small matches -->
                    <Transition
                      enter-active-class="transition duration-150 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-100 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                    >
                      <div
                        v-if="form.excludeOptions.smallMatches"
                        class="pt-2 border-t border-primary-200/60 dark:border-primary-900/50 flex items-center justify-between gap-3"
                      >
                        <span class="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                          Batas Kata (Words):
                        </span>
                        <div class="flex items-center gap-1.5">
                          <input
                            v-model.number="form.excludeOptions.smallMatchesValue"
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            class="w-20 px-2.5 py-1.5 text-center text-xs font-bold rounded-xl border border-primary-300 dark:border-primary-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/30"
                          >
                          <span class="text-[11px] font-medium text-slate-500">kata</span>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>

              <!-- 4. Catatan Tambahan (Opsional) -->
              <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-2.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  Catatan atau Instruksi Khusus (Opsional)
                </label>
                <textarea
                  v-model="form.userNotes"
                  rows="3"
                  placeholder="Misal: Mohon prioritaskan bagian Bab 3 & 4, batas deadline hari ini jam 17:00 WIB..."
                  class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
                />
              </div>

              <!-- Error Alert if any -->
              <div
                v-if="submitError"
                class="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="w-5 h-5 shrink-0 mt-0.5"
                />
                <div class="flex-1 font-medium">
                  {{ submitError }}
                </div>
              </div>

              <!-- Peringatan Saldo Poin Kurang jika poin tidak cukup -->
              <div
                v-if="!hasEnoughPoints"
                class="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-start gap-2.5">
                  <UIcon
                    name="i-lucide-alert-triangle"
                    class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <div class="font-bold text-amber-900 dark:text-amber-200">
                      Saldo Poin Tidak Mencukupi
                    </div>
                    <div class="text-amber-700 dark:text-amber-300">
                      Saldo Anda: 🪙 {{ userPoints.toLocaleString('id-ID') }} Poin. Dibutuhkan: 🪙 {{ requiredPoints.toLocaleString('id-ID') }} Poin (Kurang 🪙 {{ pointsDeficit.toLocaleString('id-ID') }} Poin).
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                  @click="openTopupModal"
                >
                  + Isi Ulang Poin
                </button>
              </div>

              <!-- Submit Button -->
              <button
                v-if="hasEnoughPoints"
                type="submit"
                :disabled="uploading || isDeductingPoints"
                class="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UIcon
                  v-if="uploading || isDeductingPoints"
                  name="i-lucide-loader-2"
                  class="w-5 h-5 animate-spin"
                />
                <UIcon
                  v-else
                  name="i-lucide-send"
                  class="w-5 h-5"
                />
                <span>{{ (uploading || isDeductingPoints) ? 'Memotong Poin & Mengunggah Naskah...' : `Kirim & Periksa Naskah (-${requiredPoints.toLocaleString('id-ID')} Poin)` }}</span>
              </button>

              <button
                v-else
                type="button"
                class="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                @click="openTopupModal"
              >
                <UIcon
                  name="i-lucide-plus-circle"
                  class="w-5 h-5"
                />
                <span>Isi Poin Terlebih Dahulu (Kurang 🪙 {{ pointsDeficit.toLocaleString('id-ID') }} Poin)</span>
              </button>
            </form>
          </div>

          <!-- Right Column: Order Summary & Info Card (1 Column) -->
          <div class="space-y-6">
            <!-- Order Summary Card -->
            <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs space-y-5 sticky top-24">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-receipt"
                    class="w-4 h-4"
                  />
                </div>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
                  Ringkasan Layanan
                </h3>
              </div>

              <div class="space-y-3 text-xs">
                <div class="flex justify-between items-center py-1">
                  <span class="text-slate-500 dark:text-neutral-400">Layanan:</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ currentService.name }}</span>
                </div>

                <div class="flex justify-between items-center py-1">
                  <span class="text-slate-500 dark:text-neutral-400">Tarif Per Naskah:</span>
                  <span class="font-extrabold text-primary-600 dark:text-primary-400">{{ currentService.price }}</span>
                </div>

                <div class="flex justify-between items-center py-1">
                  <span class="text-slate-500 dark:text-neutral-400">Biaya Poin:</span>
                  <span class="font-bold text-slate-800 dark:text-neutral-200">🪙 {{ requiredPoints.toLocaleString('id-ID') }} Poin</span>
                </div>

                <div
                  v-if="user"
                  class="flex justify-between items-center py-1"
                >
                  <span class="text-slate-500 dark:text-neutral-400">Saldo Poin Anda:</span>
                  <span
                    class="font-bold"
                    :class="hasEnoughPoints ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
                  >
                    🪙 {{ userPoints.toLocaleString('id-ID') }} Poin
                  </span>
                </div>

                <!-- Status Saldo Poin -->
                <div
                  v-if="user"
                  class="p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2"
                  :class="hasEnoughPoints
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'"
                >
                  <div class="flex items-center gap-1.5 font-medium">
                    <UIcon
                      :name="hasEnoughPoints ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
                      class="w-3.5 h-3.5 shrink-0"
                    />
                    <span>{{ hasEnoughPoints ? `Saldo cukup (Sisa: 🪙 ${(userPoints - requiredPoints).toLocaleString('id-ID')})` : `Kurang 🪙 ${pointsDeficit.toLocaleString('id-ID')} Poin` }}</span>
                  </div>
                  <button
                    v-if="!hasEnoughPoints"
                    type="button"
                    class="font-bold underline cursor-pointer text-amber-900 dark:text-amber-200 hover:text-amber-700 shrink-0"
                    @click="openTopupModal"
                  >
                    Top Up
                  </button>
                </div>

                <div class="flex justify-between items-center py-1">
                  <span class="text-slate-500 dark:text-neutral-400">Garansi:</span>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    No-Repository (Aman)
                  </span>
                </div>

                <div class="flex justify-between items-center py-1">
                  <span class="text-slate-500 dark:text-neutral-400">Estimasi Waktu:</span>
                  <span class="font-medium text-slate-700 dark:text-neutral-300">5 – 25 Menit</span>
                </div>
              </div>

              <!-- Exclude Summary List -->
              <div class="pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  Parameter Exclude Terpilih:
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-if="form.excludeOptions.abstract"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    Abstract
                  </span>
                  <span
                    v-if="form.excludeOptions.methodsAndMaterial"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    Methods & Material
                  </span>
                  <span
                    v-if="form.excludeOptions.bibliography"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    Bibliography
                  </span>
                  <span
                    v-if="form.excludeOptions.quotes"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    Quotes
                  </span>
                  <span
                    v-if="form.excludeOptions.citations"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    Citations
                  </span>
                  <span
                    v-if="form.excludeOptions.smallMatches"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  >
                    Small Matches ({{ form.excludeOptions.smallMatchesValue }} kata)
                  </span>
                  <span
                    v-if="!form.excludeOptions.abstract && !form.excludeOptions.methodsAndMaterial && !form.excludeOptions.bibliography && !form.excludeOptions.quotes && !form.excludeOptions.citations && !form.excludeOptions.smallMatches"
                    class="text-[11px] text-slate-400 italic"
                  >
                    Standar default (tanpa pengecualian)
                  </span>
                </div>
              </div>

              <!-- Security & Policy Guarantee Callout -->
              <div class="rounded-2xl bg-slate-50 dark:bg-neutral-950 p-4 border border-slate-100 dark:border-neutral-800 space-y-2">
                <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <UIcon
                    name="i-lucide-shield-alert"
                    class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  />
                  <span>Jaminan Kerahasiaan 100%</span>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                  Naskah tidak pernah disimpan ke repositori Turnitin maupun database publik. Saat naskah Anda diuji lagi di kampus atau penerbit jurnal, skor similarity index tidak akan bertambah.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: RIWAYAT NASKAH (MANUSCRIPT HISTORY) -->
        <div
          v-else-if="activeTab === 'history'"
          class="space-y-6"
        >
          <!-- Header and Refresh -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Daftar Naskah yang Diajukan
              </h2>
              <p class="text-xs text-slate-500 dark:text-neutral-400">
                Pantau proses verifikasi similarity iThenticate dan unduh laporan PDF resmi Anda di sini.
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              :disabled="manuscriptsLoading"
              @click="fetchUserManuscripts(targetServiceId)"
            >
              <UIcon
                name="i-lucide-refresh-cw"
                class="w-3.5 h-3.5"
                :class="{ 'animate-spin': manuscriptsLoading }"
              />
              <span>Segarkan</span>
            </button>
          </div>

          <!-- Loading State -->
          <div
            v-if="manuscriptsLoading"
            class="py-16 text-center space-y-3"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-8 h-8 animate-spin mx-auto text-primary-600"
            />
            <p class="text-xs text-slate-500 dark:text-neutral-400">
              Memuat riwayat naskah Anda...
            </p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="manuscripts.length === 0"
            class="rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center space-y-4"
          >
            <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 flex items-center justify-center">
              <UIcon
                name="i-lucide-folder-open"
                class="w-8 h-8"
              />
            </div>
            <div class="max-w-sm mx-auto space-y-1">
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                Belum Ada Pengajuan Naskah
              </h4>
              <p class="text-xs text-slate-500 dark:text-neutral-400">
                Anda belum pernah mengunggah naskah untuk layanan Cek Plagiarisme iThenticate.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-colors cursor-pointer"
              @click="activeTab = 'upload'"
            >
              <UIcon
                name="i-lucide-plus"
                class="w-4 h-4"
              />
              <span>Unggah Naskah Pertama</span>
            </button>
          </div>

          <!-- List of Manuscripts Cards -->
          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="item in manuscripts"
              :key="item.$id"
              class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-neutral-700"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5"
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
                      class="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                    >
                      Similarity: {{ item.similarityScore }}
                    </span>

                    <span class="text-xs text-slate-400 dark:text-neutral-500">
                      {{ formatDate(item.$createdAt) }}
                    </span>
                  </div>

                  <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    {{ item.fileName || item.title }}
                  </h3>
                </div>

                <!-- Right Actions: Download & Details -->
                <div class="flex items-center gap-2 shrink-0">
                  <!-- Download Result Report Button (if available) -->
                  <a
                    v-if="item.resultFileUrl"
                    :href="item.resultFileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="w-3.5 h-3.5"
                    />
                    <span>Unduh Laporan PDF</span>
                  </a>

                  <!-- Download Original File -->
                  <a
                    v-if="item.fileUrl"
                    :href="item.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 font-semibold text-xs transition-colors"
                    title="Unduh file naskah asli"
                  >
                    <UIcon
                      name="i-lucide-file-down"
                      class="w-3.5 h-3.5"
                    />
                    <span class="hidden sm:inline">File Asli</span>
                  </a>

                  <!-- Detail Button -->
                  <button
                    type="button"
                    class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Lihat Detail Naskah"
                    @click="openDetailModal(item)"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="w-4 h-4"
                    />
                  </button>
                </div>
              </div>

              <!-- Metadata & Exclude Pills Footer -->
              <div class="pt-3 border-t border-slate-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 text-slate-500 dark:text-neutral-400">
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-paperclip"
                      class="w-3.5 h-3.5"
                    />
                    {{ item.fileName }} ({{ formatFileSize(item.fileSize) }})
                  </span>
                </div>

                <!-- Exclude Pills -->
                <div class="flex flex-wrap items-center gap-1">
                  <span class="text-[11px] text-slate-400 mr-1">Exclude:</span>
                  <template v-if="item.excludeOptions">
                    <span
                      v-if="parseOptions(item.excludeOptions).abstract"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      Abstract
                    </span>
                    <span
                      v-if="parseOptions(item.excludeOptions).methodsAndMaterial"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      Methods
                    </span>
                    <span
                      v-if="parseOptions(item.excludeOptions).bibliography"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      Bibliography
                    </span>
                    <span
                      v-if="parseOptions(item.excludeOptions).quotes"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      Quotes
                    </span>
                    <span
                      v-if="parseOptions(item.excludeOptions).citations"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      Citations
                    </span>
                    <span
                      v-if="parseOptions(item.excludeOptions).smallMatches"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                    >
                      Small Matches ({{ parseOptions(item.excludeOptions).smallMatchesValue }} kata)
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />

    <!-- MODAL: SUCCESS SUBMISSION -->
    <UModal
      v-model:open="isSuccessModalOpen"
      title="Naskah Berhasil Dikirim"
      description="Konfirmasi penerimaan dokumen naskah Anda"
    >
      <template #content>
        <div class="p-6 text-center space-y-4">
          <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <UIcon
              name="i-lucide-check-check"
              class="w-8 h-8"
            />
          </div>

          <div class="space-y-1.5">
            <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
              Naskah Berhasil Dikirim!
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Dokumen Anda telah masuk ke sistem antrean pemeriksaan iThenticate. Tim kami segera memproses pemeriksaan sesuai preferensi exclude yang Anda tentukan.
            </p>
          </div>

          <!-- Document Info Box -->
          <div
            v-if="submittedManuscript"
            class="rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 text-left space-y-2 text-xs"
          >
            <div class="flex justify-between items-center">
              <span class="text-slate-500">ID Naskah:</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">{{ submittedManuscript.$id }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">File Naskah:</span>
              <span class="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{{ submittedManuscript.fileName || submittedManuscript.title }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Poin Terpotong:</span>
              <span class="font-bold text-rose-600 dark:text-rose-400">-🪙 {{ requiredPoints.toLocaleString('id-ID') }} Poin</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Sisa Saldo Poin:</span>
              <span class="font-bold text-primary-600 dark:text-primary-400">🪙 {{ userPoints.toLocaleString('id-ID') }} Poin</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Estimasi Pengerjaan:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">5 – 25 Menit</span>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-colors cursor-pointer"
              @click="isSuccessModalOpen = false; activeTab = 'history'"
            >
              Lihat di Riwayat Naskah
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- MODAL: DETAIL NASKAH -->
    <UModal
      v-model:open="isDetailModalOpen"
      title="Detail Pemeriksaan Naskah"
      description="Rincian informasi pengajuan naskah"
    >
      <template #content>
        <div
          v-if="selectedManuscript"
          class="p-6 space-y-5"
        >
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-neutral-800 pb-4">
            <div class="space-y-1">
              <span
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
                :class="getStatusBadge(selectedManuscript.status).badgeClass"
              >
                {{ getStatusBadge(selectedManuscript.status).label }}
              </span>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                {{ selectedManuscript.fileName || selectedManuscript.title }}
              </h3>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">ID Naskah:</span>
              <span class="font-mono text-slate-900 dark:text-white">{{ selectedManuscript.$id }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Nama File:</span>
              <span class="font-semibold text-slate-900 dark:text-white">{{ selectedManuscript.fileName }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Ukuran File:</span>
              <span class="text-slate-900 dark:text-white">{{ formatFileSize(selectedManuscript.fileSize) }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80">
              <span class="text-slate-500">Waktu Pengajuan:</span>
              <span class="text-slate-900 dark:text-white">{{ formatDate(selectedManuscript.$createdAt) }}</span>
            </div>

            <!-- Similarity Score if finished -->
            <div
              v-if="selectedManuscript.similarityScore"
              class="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-800/80"
            >
              <span class="text-slate-500 font-bold">Skor Similarity:</span>
              <span class="font-extrabold text-primary-600 dark:text-primary-400 text-sm">{{ selectedManuscript.similarityScore }}</span>
            </div>

            <!-- Exclude Options Breakdown -->
            <div class="py-2 space-y-1.5">
              <span class="text-slate-500 font-semibold">Pengaturan Exclude yang Dipilih:</span>
              <div class="rounded-xl bg-slate-50 dark:bg-neutral-950 p-3 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span>Exclude Abstract:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).abstract ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Exclude Methods & Material:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).methodsAndMaterial ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Exclude Bibliography:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).bibliography ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Exclude Quotes:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).quotes ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Exclude Citations:</span>
                  <span class="font-bold">{{ parseOptions(selectedManuscript.excludeOptions).citations ? 'Ya' : 'Tidak' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Exclude Small Matches:</span>
                  <span class="font-bold">
                    {{ parseOptions(selectedManuscript.excludeOptions).smallMatches
                      ? `Ya (${parseOptions(selectedManuscript.excludeOptions).smallMatchesValue} kata)`
                      : 'Tidak' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- User Notes -->
            <div
              v-if="selectedManuscript.userNotes"
              class="py-1"
            >
              <span class="text-slate-500 block mb-1">Catatan Anda:</span>
              <p class="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 italic text-[11px]">
                {{ selectedManuscript.userNotes }}
              </p>
            </div>

            <!-- Admin Notes -->
            <div
              v-if="selectedManuscript.adminNotes"
              class="py-1"
            >
              <span class="text-slate-500 block mb-1">Catatan dari Admin:</span>
              <p class="p-3 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 text-primary-800 dark:text-primary-300 font-medium text-[11px]">
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
  </div>
</template>
