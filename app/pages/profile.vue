<script setup lang="ts">
useSeoMeta({
  title: 'Profil Saya — Cek Naskah',
  description: 'Kelola informasi profil, nomor telepon, dan keamanan akun Cek Naskah Anda.',
  ogTitle: 'Profil Saya — Cek Naskah',
  ogDescription: 'Kelola data pribadi, pengaturan keamanan, dan preferensi akun di Cek Naskah.'
})

const {
  user,
  fetchUser,
  updateName,
  updatePhone,
  updatePassword,
  updatePrefs,
  updateAvatar,
  sendEmailVerification,
  confirmEmailVerification,
  forgotPassword,
  logout
} = useAuth()

const activeTab = ref<'account' | 'security'>('account')

// Feedback messages for profile page actions
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)
const actionLoading = ref(false)

// Form States for Account Profile
const nameInput = ref('')
const phoneInput = ref('')
const phoneConfirmPassword = ref('')
const showPhonePassword = ref(false)

// Email Verification State
const isSendingVerification = ref(false)
const verificationSent = ref(false)

// Occupation Options
const OCCUPATION_OPTIONS = [
  'Mahasiswa S1 (Sarjana)',
  'Mahasiswa S2 (Magister)',
  'Mahasiswa S3 (Doktoral)',
  'Mahasiswa D3 / D4 (Vokasi)',
  'Dosen / Tenaga Pengajar',
  'Peneliti / Perekayasa (BRIN / Riset)',
  'Guru / Tenaga Pendidik',
  'Tenaga Kependidikan / Staf Kampus',
  'Praktisi / Profesional Industri',
  'Penulis / Editor Naskah',
  'Dokter / Tenaga Medis',
  'Lainnya'
]

// Occupation & Affiliation States
const occupationInput = ref('')
const customOccupationInput = ref('')
const affiliationInput = ref('')

// Preset Avatars
const PRESET_AVATARS = [
  { id: 'p1', name: 'Akademisi Pria', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Profesor' },
  { id: 'p2', name: 'Akademisi Wanita', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Cendekia' },
  { id: 'p3', name: 'Peneliti Muda', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Akademisi' },
  { id: 'p4', name: 'Penulis Buku', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Peneliti' },
  { id: 'p5', name: 'Mahasiswa Kreatif', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mahasiswa' },
  { id: 'p6', name: 'Robot Cek Naskah', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NaskahBot' }
]

// User Photo / Avatar States
const avatarInput = ref('')
const avatarImageError = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)
const showPresetPicker = ref(false)
const showUrlInput = ref(false)
const customUrlValue = ref('')

const savedAvatarUrl = computed(() => {
  return (user.value?.prefs?.avatarUrl as string) || (user.value?.prefs?.photoUrl as string) || ''
})

const isAvatarChanged = computed(() => {
  return avatarInput.value !== savedAvatarUrl.value
})

const activeAvatarDisplay = computed(() => {
  return avatarInput.value || savedAvatarUrl.value || ''
})

// Compress selected image file to small WebP/JPEG dataURL (<20KB) for fast Appwrite storage
const compressImageFile = (file: File, maxSize = 256, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Ukuran file maksimal adalah 5 MB.'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const { width, height } = img

          const minDim = Math.min(width, height)
          const sx = (width - minDim) / 2
          const sy = (height - minDim) / 2

          canvas.width = maxSize
          canvas.height = maxSize
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context tidak tersedia.'))
            return
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize)

          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(dataUrl)
        } catch (canvasErr) {
          reject(canvasErr)
        }
      }
      img.onerror = () => reject(new Error('Format gambar tidak dapat dibaca.'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (event: Event) => {
  clearActionFeedback()
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingAvatar.value = true
  try {
    const compressed = await compressImageFile(file)
    avatarInput.value = compressed
    avatarImageError.value = false
    actionSuccess.value = 'Foto berhasil dipilih. Klik "Terapkan Foto" atau "Simpan Semua Perubahan" untuk menyimpan.'
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memproses gambar.'
    actionError.value = msg
  } finally {
    isUploadingAvatar.value = false
    if (target) target.value = ''
  }
}

const selectPresetAvatar = (url: string) => {
  clearActionFeedback()
  avatarInput.value = url
  avatarImageError.value = false
  showPresetPicker.value = false
  actionSuccess.value = 'Avatar preset dipilih. Klik "Terapkan Foto" atau "Simpan Semua Perubahan" untuk menyimpan.'
}

const applyCustomUrl = () => {
  clearActionFeedback()
  const trimmed = customUrlValue.value.trim()
  if (!trimmed) {
    actionError.value = 'Alamat URL gambar tidak boleh kosong.'
    return
  }
  if (!/^https?:\/\/.+/i.test(trimmed)) {
    actionError.value = 'URL gambar harus diawali dengan http:// atau https://'
    return
  }
  avatarInput.value = trimmed
  avatarImageError.value = false
  customUrlValue.value = ''
  showUrlInput.value = false
  actionSuccess.value = 'URL gambar diterapkan. Klik "Terapkan Foto" atau "Simpan Semua Perubahan" untuk menyimpan.'
}

const removeAvatar = () => {
  clearActionFeedback()
  avatarInput.value = ''
  avatarImageError.value = false
  showPresetPicker.value = false
  showUrlInput.value = false
  actionSuccess.value = 'Foto profil dihapus. Klik "Terapkan Foto" atau "Simpan Semua Perubahan" untuk menyimpan.'
}

const quickSaveAvatar = async () => {
  clearActionFeedback()
  actionLoading.value = true
  try {
    const res = await updateAvatar(avatarInput.value || null)
    if (res.success) {
      actionSuccess.value = avatarInput.value
        ? 'Foto profil Anda berhasil disimpan dan diperbarui.'
        : 'Foto profil berhasil dihapus, menggunakan inisial default.'
    } else {
      actionError.value = res.error || 'Gagal menyimpan foto profil.'
    }
  } finally {
    actionLoading.value = false
  }
}

const focusAvatarSection = () => {
  activeTab.value = 'account'
  nextTick(() => {
    const el = document.getElementById('avatarSection')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// Change Password State
const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isResettingViaEmail = ref(false)

// Password validation indicators
const isPasswordLongEnough = computed(() => newPassword.value.length >= 8)
const isPasswordMatch = computed(() => {
  return newPassword.value.length > 0 && newPassword.value === confirmNewPassword.value
})
const canSubmitPassword = computed(() => {
  return (
    oldPassword.value.length > 0
    && isPasswordLongEnough.value
    && isPasswordMatch.value
  )
})

// Reset Password form fields
const resetPasswordForm = () => {
  oldPassword.value = ''
  newPassword.value = ''
  confirmNewPassword.value = ''
  showOldPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// Copy User ID feedback
const isCopied = ref(false)

const clearActionFeedback = () => {
  actionError.value = null
  actionSuccess.value = null
}

// Check if phone number is changed from the saved user phone
const isPhoneChanged = computed(() => {
  const currentPhone = user.value?.phone || ''
  const trimmed = phoneInput.value.trim()
  if (!trimmed && !currentPhone) return false
  const formatted = formatE164Phone(trimmed)
  return formatted !== currentPhone
})

// Check if any form field is changed
const hasChanges = computed(() => {
  if (!user.value) return false
  const currentName = user.value.name || ''
  const currentPhone = user.value.phone || ''
  const currentOccupation = (user.value.prefs?.pekerjaan as string) || ''
  const currentAffiliation = (user.value.prefs?.afiliasi as string) || (user.value.prefs?.affiliasi as string) || ''
  const currentAvatar = savedAvatarUrl.value

  let activeOccupation = occupationInput.value.trim()
  if (activeOccupation === 'Lainnya' && customOccupationInput.value.trim()) {
    activeOccupation = customOccupationInput.value.trim()
  }

  const nameChanged = nameInput.value.trim() !== currentName
  const phoneChanged = formatE164Phone(phoneInput.value.trim()) !== currentPhone
  const occupationChanged = activeOccupation !== currentOccupation
  const affiliationChanged = affiliationInput.value.trim() !== currentAffiliation
  const avatarChanged = avatarInput.value !== currentAvatar

  return nameChanged || phoneChanged || occupationChanged || affiliationChanged || avatarChanged
})

// Reset form to current user values
const resetFormToUser = () => {
  clearActionFeedback()
  if (!user.value) return
  nameInput.value = user.value.name || ''
  phoneInput.value = user.value.phone || ''
  phoneConfirmPassword.value = ''

  const currentOccupation = (user.value.prefs?.pekerjaan as string) || ''
  if (OCCUPATION_OPTIONS.includes(currentOccupation)) {
    occupationInput.value = currentOccupation
    customOccupationInput.value = ''
  } else if (currentOccupation) {
    occupationInput.value = 'Lainnya'
    customOccupationInput.value = currentOccupation
  } else {
    occupationInput.value = ''
    customOccupationInput.value = ''
  }

  affiliationInput.value = (user.value.prefs?.afiliasi as string) || (user.value.prefs?.affiliasi as string) || ''
  avatarInput.value = savedAvatarUrl.value
  avatarImageError.value = false
  showPresetPicker.value = false
  showUrlInput.value = false
  customUrlValue.value = ''
}

onMounted(async () => {
  clearActionFeedback()
  const currentUser = await fetchUser()
  if (!currentUser) {
    navigateTo('/login?redirect=/profile')
    return
  }

  resetFormToUser()

  // Check if landing with email verification callback (userId & secret)
  const route = useRoute()
  const router = useRouter()
  if (route.query.userId && route.query.secret) {
    const userId = String(route.query.userId)
    const secret = String(route.query.secret)
    actionLoading.value = true
    const res = await confirmEmailVerification(userId, secret)
    actionLoading.value = false
    if (res.success) {
      actionSuccess.value = 'Selamat! Alamat email Anda telah berhasil diverifikasi.'
      router.replace({ query: {} })
    } else {
      actionError.value = res.error || 'Gagal memverifikasi email. Tautan mungkin telah kedaluwarsa.'
    }
  }
})

// Format created date
const formattedJoinDate = computed(() => {
  if (!user.value?.$createdAt) return '-'
  try {
    const date = new Date(user.value.$createdAt)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
})

// Copy User ID
const copyUserId = async () => {
  if (!user.value?.$id) return
  try {
    await navigator.clipboard.writeText(user.value.$id)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch {
    // clipboard failed
  }
}

// Handle Save Name
// Handle Save All Profile Changes
const handleSaveProfile = async () => {
  clearActionFeedback()
  if (!user.value) return

  const trimmedName = nameInput.value.trim()
  if (!trimmedName) {
    actionError.value = 'Nama lengkap tidak boleh kosong.'
    return
  }
  if (trimmedName.length < 2) {
    actionError.value = 'Nama lengkap minimal 2 karakter.'
    return
  }

  // Validate phone if changed
  if (isPhoneChanged.value) {
    const trimmedPhone = phoneInput.value.trim()
    if (!trimmedPhone) {
      actionError.value = 'Nomor telepon tidak boleh kosong jika ingin diubah.'
      return
    }
    const formatted = formatE164Phone(trimmedPhone)
    if (!/^\+[1-9]\d{7,14}$/.test(formatted)) {
      actionError.value = 'Format nomor telepon tidak valid (contoh: 081234567890 atau +6281234567890).'
      return
    }
    if (!phoneConfirmPassword.value) {
      actionError.value = 'Masukkan kata sandi akun Anda untuk mengonfirmasi perubahan nomor telepon resmi.'
      return
    }
  }

  let finalOccupation = occupationInput.value.trim()
  if (finalOccupation === 'Lainnya' && customOccupationInput.value.trim()) {
    finalOccupation = customOccupationInput.value.trim()
  }
  const trimmedAffiliation = affiliationInput.value.trim()

  actionLoading.value = true
  try {
    // 1. Update Name if changed
    if (trimmedName !== (user.value.name || '')) {
      const nameRes = await updateName(trimmedName)
      if (!nameRes.success) {
        actionError.value = nameRes.error || 'Gagal memperbarui nama.'
        return
      }
    }

    // 2. Update Phone if changed
    if (isPhoneChanged.value) {
      const formatted = formatE164Phone(phoneInput.value.trim())
      const phoneRes = await updatePhone(formatted, phoneConfirmPassword.value)
      if (!phoneRes.success) {
        actionError.value = phoneRes.error || 'Gagal memperbarui nomor telepon.'
        return
      }
      phoneConfirmPassword.value = ''
    }

    // 3. Update Preferences (Pekerjaan, Afiliasi, Avatar) if changed
    const currentOccupation = (user.value.prefs?.pekerjaan as string) || ''
    const currentAffiliation = (user.value.prefs?.afiliasi as string) || (user.value.prefs?.affiliasi as string) || ''
    const currentAvatar = savedAvatarUrl.value
    if (
      finalOccupation !== currentOccupation
      || trimmedAffiliation !== currentAffiliation
      || avatarInput.value !== currentAvatar
    ) {
      const prefsRes = await updatePrefs({
        pekerjaan: finalOccupation,
        afiliasi: trimmedAffiliation,
        affiliasi: trimmedAffiliation,
        avatarUrl: avatarInput.value,
        photoUrl: avatarInput.value
      })
      if (!prefsRes.success) {
        actionError.value = prefsRes.error || 'Gagal memperbarui preferensi akun.'
        return
      }
    }

    actionSuccess.value = 'Informasi profil Anda berhasil diperbarui.'
  } finally {
    actionLoading.value = false
  }
}

// Handle Send Email Verification
const handleSendVerification = async () => {
  clearActionFeedback()
  if (user.value?.emailVerification) {
    actionSuccess.value = 'Alamat email Anda sudah terverifikasi.'
    return
  }

  isSendingVerification.value = true
  const res = await sendEmailVerification()
  isSendingVerification.value = false

  if (res.success) {
    verificationSent.value = true
    actionSuccess.value = `Tautan verifikasi telah dikirim ke ${user.value?.email || 'email Anda'}. Silakan periksa kotak masuk atau spam.`
    setTimeout(() => {
      verificationSent.value = false
    }, 60000)
  } else {
    actionError.value = res.error || 'Gagal mengirim tautan verifikasi email.'
  }
}

// Handle Change Password
const handleChangePassword = async () => {
  clearActionFeedback()
  if (!oldPassword.value) {
    actionError.value = 'Kata sandi saat ini wajib diisi.'
    return
  }
  if (!newPassword.value) {
    actionError.value = 'Kata sandi baru wajib diisi.'
    return
  }
  if (newPassword.value.length < 8) {
    actionError.value = 'Kata sandi baru minimal harus 8 karakter.'
    return
  }
  if (newPassword.value !== confirmNewPassword.value) {
    actionError.value = 'Konfirmasi kata sandi baru tidak cocok.'
    return
  }

  actionLoading.value = true
  const res = await updatePassword(newPassword.value, oldPassword.value)
  actionLoading.value = false

  if (res.success) {
    actionSuccess.value = 'Kata sandi akun Anda berhasil diperbarui.'
    resetPasswordForm()
  } else {
    actionError.value = res.error || 'Gagal memperbarui kata sandi.'
  }
}

// Handle Request Password Reset via Email
const handleRequestPasswordReset = async () => {
  clearActionFeedback()
  if (!user.value?.email) return

  isResettingViaEmail.value = true
  const res = await forgotPassword(user.value.email)
  isResettingViaEmail.value = false

  if (res.success) {
    actionSuccess.value = `Tautan pemulihan kata sandi telah dikirim ke ${user.value.email}. Silakan periksa kotak masuk atau spam email Anda.`
  } else {
    actionError.value = res.error || 'Gagal mengirim email reset kata sandi.'
  }
}

// Handle Logout
const handleLogout = async () => {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1 py-12 sm:py-16 bg-slate-50/70 dark:bg-neutral-900/30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Notification Alerts -->
        <div
          v-if="actionSuccess"
          class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm flex items-start justify-between gap-3 shadow-sm"
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
            class="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
            @click="actionSuccess = null"
          >
            ✕
          </button>
        </div>

        <div
          v-if="actionError"
          class="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-2xl text-red-800 dark:text-red-200 text-sm flex items-start justify-between gap-3 shadow-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg
              class="w-5 h-5 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ actionError }}</span>
          </div>
          <button
            type="button"
            class="text-red-600 hover:text-red-800 dark:hover:text-red-300 cursor-pointer"
            @click="actionError = null"
          >
            ✕
          </button>
        </div>

        <!-- User Hero Profile Card -->
        <div class="mb-8 p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <!-- Avatar with photo display and camera edit button -->
            <div class="relative group shrink-0">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shadow-primary-500/20 overflow-hidden border-2 border-white dark:border-neutral-800">
                <img
                  v-if="activeAvatarDisplay && !avatarImageError"
                  :src="activeAvatarDisplay"
                  :alt="user?.name || 'Foto Profil'"
                  class="w-full h-full object-cover"
                  @error="avatarImageError = true"
                >
                <span v-else>
                  {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                </span>
              </div>

              <!-- Quick Edit Avatar Trigger -->
              <button
                type="button"
                class="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-900/90 hover:bg-primary-600 dark:bg-neutral-700 dark:hover:bg-primary-600 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                title="Ubah atau atur foto profil"
                @click="focusAvatarSection"
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {{ user?.name || 'Pengguna Cek Naskah' }}
                </h1>
                <span
                  class="px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  :class="user?.emailVerification
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="user?.emailVerification ? 'bg-emerald-500' : 'bg-amber-500'"
                  />
                  {{ user?.emailVerification ? 'Email Terverifikasi' : 'Belum Verifikasi' }}
                </span>
              </div>

              <p
                v-if="user?.prefs?.pekerjaan || user?.prefs?.afiliasi || user?.prefs?.affiliasi"
                class="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 mb-1"
              >
                {{ [user?.prefs?.pekerjaan, user?.prefs?.afiliasi || user?.prefs?.affiliasi].filter(Boolean).join(' • ') }}
              </p>

              <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mb-2">
                {{ user?.email }}
              </p>

              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-neutral-400">
                <div class="flex items-center gap-1.5">
                  <svg
                    class="w-3.5 h-3.5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Bergabung {{ formattedJoinDate }}</span>
                </div>

                <span>•</span>

                <!-- User ID Copy -->
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  title="Klik untuk menyalin User ID"
                  @click="copyUserId"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>ID: {{ user?.$id ? `${user.$id.slice(0, 8)}...` : '-' }}</span>
                  <span
                    v-if="isCopied"
                    class="text-emerald-500 font-medium"
                  >(Tersalin!)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2.5 w-full md:w-auto">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Cek%20Naskah,%20saya%20butuh%20bantuan"
              target="_blank"
              class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Hubungi CS</span>
            </a>
            <button
              type="button"
              class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer border border-red-100 dark:border-red-900/50"
              @click="handleLogout"
            >
              Keluar Akun
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-slate-200 dark:border-neutral-800 mb-8 overflow-x-auto gap-2">
          <button
            type="button"
            class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            :class="activeTab === 'account'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
            @click="activeTab = 'account'; clearActionFeedback()"
          >
            Informasi Pribadi
          </button>
          <button
            type="button"
            class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            :class="activeTab === 'security'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
            @click="activeTab = 'security'; clearActionFeedback()"
          >
            Keamanan & Kata Sandi
          </button>
        </div>

        <!-- TAB 1: INFORMASI PRIBADI -->
        <div
          v-if="activeTab === 'account'"
          class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden"
        >
          <!-- Card Header -->
          <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Informasi Pribadi & Kontak
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Kelola data profil akademik, kontak resmi, dan preferensi akun Anda dalam satu tempat.
            </p>
          </div>

          <!-- Card Form -->
          <form
            class="p-6 sm:p-8 space-y-6"
            @submit.prevent="handleSaveProfile"
          >
            <!-- FOTO PROFIL PENGGUNA -->
            <div
              id="avatarSection"
              class="p-5 sm:p-6 bg-slate-50/70 dark:bg-neutral-800/40 rounded-2xl border border-slate-200/80 dark:border-neutral-800 transition-colors"
            >
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Foto Profil Pengguna</span>
                    <span
                      v-if="isAvatarChanged"
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    >
                      Belum Disimpan
                    </span>
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Unggah foto asli Anda, gunakan avatar ilustrasi akademisi, atau tautan gambar eksternal.
                  </p>
                </div>

                <!-- Quick Save Avatar Button if changed -->
                <div
                  v-if="isAvatarChanged"
                  class="flex items-center gap-2"
                >
                  <button
                    type="button"
                    class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-primary-600/20 transition-colors cursor-pointer flex items-center gap-1.5"
                    :disabled="actionLoading"
                    @click="quickSaveAvatar"
                  >
                    <svg
                      v-if="actionLoading"
                      class="animate-spin w-3.5 h-3.5"
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
                    <span>Terapkan Foto</span>
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    @click="avatarInput = savedAvatarUrl; avatarImageError = false"
                  >
                    Batalkan
                  </button>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <!-- Avatar Preview -->
                <div class="flex flex-col items-center gap-2 shrink-0">
                  <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-md shadow-primary-500/20 overflow-hidden border-4 border-white dark:border-neutral-800 shrink-0">
                    <img
                      v-if="activeAvatarDisplay && !avatarImageError"
                      :src="activeAvatarDisplay"
                      :alt="user?.name || 'Foto Profil'"
                      class="w-full h-full object-cover"
                      @error="avatarImageError = true"
                    >
                    <span v-else>
                      {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                    </span>
                  </div>
                  <span class="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                    {{ activeAvatarDisplay ? 'Pratinjau Foto' : 'Inisial Standar' }}
                  </span>
                </div>

                <!-- Actions & Tools -->
                <div class="flex-1 w-full space-y-4">
                  <div class="flex flex-wrap items-center gap-2.5">
                    <!-- Hidden file input -->
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      class="hidden"
                      @change="handleFileUpload"
                    >

                    <!-- Button Upload from Device -->
                    <button
                      type="button"
                      class="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-primary-600/20 flex items-center gap-2 cursor-pointer"
                      :disabled="isUploadingAvatar"
                      @click="triggerFileInput"
                    >
                      <svg
                        v-if="isUploadingAvatar"
                        class="animate-spin w-3.5 h-3.5"
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
                      <svg
                        v-else
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span>{{ isUploadingAvatar ? 'Memproses...' : 'Unggah Foto dari Perangkat' }}</span>
                    </button>

                    <!-- Button Preset Toggle -->
                    <button
                      type="button"
                      class="px-3.5 py-2 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                      @click="showPresetPicker = !showPresetPicker; showUrlInput = false"
                    >
                      <svg
                        class="w-4 h-4 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Pilih Avatar Preset</span>
                    </button>

                    <!-- Button URL Toggle -->
                    <button
                      type="button"
                      class="px-3.5 py-2 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                      @click="showUrlInput = !showUrlInput; showPresetPicker = false"
                    >
                      <svg
                        class="w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span>Gunakan URL</span>
                    </button>

                    <!-- Button Remove Avatar -->
                    <button
                      v-if="activeAvatarDisplay"
                      type="button"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Hapus foto profil dan gunakan inisial default"
                      @click="removeAvatar"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Hapus Foto</span>
                    </button>
                  </div>

                  <!-- Presets Panel -->
                  <div
                    v-if="showPresetPicker"
                    class="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-sm"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-bold text-slate-800 dark:text-neutral-200">
                        Karakter Avatar Cek Naskah:
                      </span>
                      <button
                        type="button"
                        class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer"
                        @click="showPresetPicker = false"
                      >
                        ✕ Tutup
                      </button>
                    </div>
                    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      <button
                        v-for="preset in PRESET_AVATARS"
                        :key="preset.id"
                        type="button"
                        class="p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer hover:border-primary-500 hover:scale-105"
                        :class="avatarInput === preset.url
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                          : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800'"
                        @click="selectPresetAvatar(preset.url)"
                      >
                        <img
                          :src="preset.url"
                          :alt="preset.name"
                          class="w-12 h-12 rounded-lg object-contain bg-white dark:bg-neutral-900"
                        >
                        <span class="text-[10px] font-medium text-slate-700 dark:text-neutral-300 truncate max-w-full">
                          {{ preset.name }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <!-- URL Input Panel -->
                  <div
                    v-if="showUrlInput"
                    class="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-sm"
                  >
                    <label
                      for="customAvatarUrl"
                      class="block text-xs font-semibold text-slate-800 dark:text-neutral-200 mb-2"
                    >
                      Masukkan Tautan (URL) Gambar Publik:
                    </label>
                    <div class="flex items-center gap-2">
                      <input
                        id="customAvatarUrl"
                        v-model="customUrlValue"
                        type="url"
                        class="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                        placeholder="https://contoh.com/foto-profil.jpg"
                        @keydown.enter.prevent="applyCustomUrl"
                      >
                      <button
                        type="button"
                        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        @click="applyCustomUrl"
                      >
                        Terapkan
                      </button>
                      <button
                        type="button"
                        class="px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-neutral-300 rounded-xl text-xs cursor-pointer"
                        @click="showUrlInput = false"
                      >
                        Batal
                      </button>
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-400 dark:text-neutral-500">
                    Mendukung berkas JPG, PNG, WEBP, atau GIF (maksimal 5 MB). Gambar akan dipotong persegi dan dioptimasi secara otomatis.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nama Lengkap -->
              <div>
                <label
                  for="profileName"
                  class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                >
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input
                  id="profileName"
                  v-model="nameInput"
                  type="text"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                >
                <p class="text-xs text-slate-400 dark:text-neutral-500 mt-1.5">
                  Nama Lengkap Beserta Gelar.
                </p>
              </div>

              <!-- Alamat Email (Read-Only dengan verifikasi) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label
                    for="profileEmail"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300"
                  >
                    Alamat Email Terdaftar
                  </label>
                  <span
                    class="px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1"
                    :class="user?.emailVerification
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="user?.emailVerification ? 'bg-emerald-500' : 'bg-amber-500'"
                    />
                    {{ user?.emailVerification ? 'Terverifikasi' : 'Belum Verifikasi' }}
                  </span>
                </div>
                <div class="relative">
                  <input
                    id="profileEmail"
                    :value="user?.email"
                    type="email"
                    readonly
                    disabled
                    class="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-500 dark:text-neutral-400 text-sm cursor-not-allowed"
                  >
                </div>
                <div class="flex items-center justify-between mt-1.5">
                  <p class="text-xs text-slate-400 dark:text-neutral-500">
                    Email akun untuk login & pengiriman hasil dokumen.
                  </p>
                  <button
                    v-if="!user?.emailVerification"
                    type="button"
                    :disabled="isSendingVerification || verificationSent"
                    class="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    @click="handleSendVerification"
                  >
                    <svg
                      v-if="isSendingVerification"
                      class="animate-spin h-3 w-3"
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
                    <span>{{ verificationSent ? 'Tautan Terkirim ✓' : (isSendingVerification ? 'Mengirim...' : 'Verifikasi Email') }}</span>
                  </button>
                </div>
              </div>

              <!-- Pekerjaan / Status Akademik -->
              <div>
                <label
                  for="profileOccupation"
                  class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                >
                  Pekerjaan / Status Akademik
                </label>
                <select
                  id="profileOccupation"
                  v-model="occupationInput"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 cursor-pointer transition-colors"
                >
                  <option
                    value=""
                    disabled
                  >
                    -- Pilih status akademik / profesi Anda --
                  </option>
                  <option
                    v-for="opt in OCCUPATION_OPTIONS"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>
                <!-- Input tambahan jika memilih Lainnya -->
                <div
                  v-if="occupationInput === 'Lainnya'"
                  class="mt-2"
                >
                  <input
                    v-model="customOccupationInput"
                    type="text"
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                    placeholder="Sebutkan pekerjaan / profesi spesifik Anda"
                  >
                </div>
                <p class="text-xs text-slate-400 dark:text-neutral-500 mt-1.5">
                  Isi dengan pekerjaan atau status akademik yang paling sesuai dengan Anda.
                </p>
              </div>

              <!-- Afiliasi / Institusi -->
              <div>
                <label
                  for="profileAffiliation"
                  class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                >
                  Afiliasi / Institusi
                </label>
                <input
                  id="profileAffiliation"
                  v-model="affiliationInput"
                  type="text"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Contoh: Universitas Indonesia, ITB, BRIN, dll."
                >
                <p class="text-xs text-slate-400 dark:text-neutral-500 mt-1.5">
                  Nama kampus, universitas, fakultas, atau lembaga riset tempat bernaung.
                </p>
              </div>

              <!-- Nomor Telepon / WhatsApp & Konfirmasi Password jika nomor berubah -->
              <div class="md:col-span-2 pt-4 border-t border-slate-100 dark:border-neutral-800/80">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      for="profilePhone"
                      class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                    >
                      Nomor Telepon / WhatsApp Resmi (E.164)
                    </label>
                    <input
                      id="profilePhone"
                      v-model="phoneInput"
                      type="tel"
                      class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="Contoh: 081234567890 atau +6281234567890"
                    >
                    <p class="text-xs text-slate-400 dark:text-neutral-500 mt-1.5">
                      Nomor kontak express untuk pengiriman laporan kilat (5–25 menit).
                    </p>
                  </div>

                  <!-- Kata Sandi untuk konfirmasi jika no. telepon diubah -->
                  <div v-if="isPhoneChanged">
                    <label
                      for="phonePasswordConfirm"
                      class="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1"
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>Konfirmasi Kata Sandi Akun</span>
                    </label>
                    <div class="relative">
                      <input
                        id="phonePasswordConfirm"
                        v-model="phoneConfirmPassword"
                        :type="showPhonePassword ? 'text' : 'password'"
                        class="w-full px-4 py-2.5 bg-amber-50/50 dark:bg-neutral-800 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                        placeholder="Masukkan kata sandi saat ini"
                        required
                      >
                      <button
                        type="button"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                        @click="showPhonePassword = !showPhonePassword"
                      >
                        {{ showPhonePassword ? 'Sembunyikan' : 'Lihat' }}
                      </button>
                    </div>
                    <p class="text-xs text-amber-600 dark:text-amber-400/90 mt-1.5">
                      Diperlukan oleh sistem keamanan Appwrite saat mengganti nomor telepon akun.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Action Footer -->
            <div class="pt-6 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
              <p class="text-xs text-slate-400 dark:text-neutral-500">
                Perubahan pada nama, nomor telepon, dan preferensi akan diperbarui secara bersamaan.
              </p>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  :disabled="actionLoading || !hasChanges"
                  class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="resetFormToUser"
                >
                  Batal / Reset
                </button>
                <button
                  type="submit"
                  :disabled="actionLoading || !hasChanges"
                  class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-neutral-800 text-white disabled:text-slate-400 dark:disabled:text-neutral-500 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  <svg
                    v-if="actionLoading"
                    class="animate-spin h-3.5 w-3.5 text-white"
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
                  <span>{{ actionLoading ? 'Menyimpan...' : 'Simpan Semua Perubahan' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- TAB 2: KEAMANAN & KATA SANDI -->
        <div
          v-else-if="activeTab === 'security'"
          class="space-y-8"
        >
          <!-- Card 1: Form Ganti Kata Sandi -->
          <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <!-- Card Header -->
            <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80">
              <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Perbarui Kata Sandi Akun
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
                Gunakan kombinasi minimal 8 karakter dengan variasi huruf dan angka agar akun Anda tetap aman.
              </p>
            </div>

            <!-- Form -->
            <form
              class="p-6 sm:p-8 space-y-6"
              @submit.prevent="handleChangePassword"
            >
              <!-- Kata Sandi Saat Ini -->
              <div class="max-w-xl">
                <label
                  for="oldPassword"
                  class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                >
                  Kata Sandi Saat Ini <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="oldPassword"
                    v-model="oldPassword"
                    :type="showOldPassword ? 'text' : 'password'"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-colors pr-10"
                    placeholder="Masukkan kata sandi saat ini"
                    required
                  >
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                    :title="showOldPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'"
                    @click="showOldPassword = !showOldPassword"
                  >
                    <svg
                      v-if="showOldPassword"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
                <!-- Bantuan jika lupa kata sandi -->
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-slate-400 dark:text-neutral-500">
                    Lupa kata sandi saat ini?
                  </span>
                  <button
                    type="button"
                    :disabled="isResettingViaEmail"
                    class="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    @click="handleRequestPasswordReset"
                  >
                    {{ isResettingViaEmail ? 'Mengirim email...' : 'Kirim Tautan Reset Kata Sandi' }}
                  </button>
                </div>
              </div>

              <!-- Kata Sandi Baru & Konfirmasi Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-neutral-800/80">
                <!-- Kata Sandi Baru -->
                <div>
                  <label
                    for="newPassword"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                  >
                    Kata Sandi Baru <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="newPassword"
                      v-model="newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-colors pr-10"
                      placeholder="Minimal 8 karakter"
                      required
                    >
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                      :title="showNewPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <svg
                        v-if="showNewPassword"
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Konfirmasi Kata Sandi Baru -->
                <div>
                  <label
                    for="confirmNewPassword"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                  >
                    Konfirmasi Kata Sandi Baru <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="confirmNewPassword"
                      v-model="confirmNewPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-colors pr-10"
                      placeholder="Ketik ulang kata sandi baru"
                      required
                    >
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                      :title="showConfirmPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <svg
                        v-if="showConfirmPassword"
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Indikator Validasi Kata Sandi -->
              <div class="flex flex-wrap items-center gap-4 pt-1">
                <div class="flex items-center gap-1.5 text-xs">
                  <svg
                    class="w-4 h-4 transition-colors"
                    :class="isPasswordLongEnough ? 'text-emerald-500' : 'text-slate-300 dark:text-neutral-600'"
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
                  <span :class="isPasswordLongEnough ? 'text-slate-700 dark:text-neutral-200 font-medium' : 'text-slate-400 dark:text-neutral-500'">
                    Minimal 8 karakter
                  </span>
                </div>

                <div class="flex items-center gap-1.5 text-xs">
                  <svg
                    class="w-4 h-4 transition-colors"
                    :class="isPasswordMatch ? 'text-emerald-500' : 'text-slate-300 dark:text-neutral-600'"
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
                  <span :class="isPasswordMatch ? 'text-slate-700 dark:text-neutral-200 font-medium' : 'text-slate-400 dark:text-neutral-500'">
                    Konfirmasi kata sandi cocok
                  </span>
                </div>
              </div>

              <!-- Action Footer -->
              <div class="pt-6 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
                <p class="text-xs text-slate-400 dark:text-neutral-500">
                  Setelah kata sandi diperbarui, sesi Anda akan tetap aktif di perangkat ini.
                </p>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    :disabled="actionLoading || (!oldPassword && !newPassword && !confirmNewPassword)"
                    class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="resetPasswordForm"
                  >
                    Bersihkan
                  </button>
                  <button
                    type="submit"
                    :disabled="actionLoading || !canSubmitPassword"
                    class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-neutral-800 text-white disabled:text-slate-400 dark:disabled:text-neutral-500 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    <svg
                      v-if="actionLoading"
                      class="animate-spin h-3.5 w-3.5 text-white"
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
                    <span>{{ actionLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi' }}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Card 2: Informasi Keamanan Akun & Tips -->
          <div class="p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <svg
                class="w-4 h-4 text-primary-600 dark:text-primary-400"
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
              <span>Ikhtisar Keamanan & Perlindungan Akun</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mb-6">
              Sistem Cek Naskah menerapkan standar keamanan modern untuk melindungi identitas dan privasi dokumen Anda.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800">
                <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Enkripsi Kredensial
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Kata sandi Anda di-hash dengan algoritma kriptografi modern dan tidak pernah disimpan dalam bentuk teks biasa.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
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
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Pemulihan Terjamin
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Alamat email terverifikasi menjamin Anda selalu dapat memulihkan kata sandi jika sewaktu-waktu lupa akses.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Sesi TLS / SSL 256-bit
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Seluruh pertukaran data antara peramban Anda dan server diamankan dengan protokol enkripsi jaringan tingkat tinggi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
