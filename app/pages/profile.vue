<script setup lang="ts">
import type { Models } from 'appwrite'

useSeoMeta({
  title: 'Profil Saya — Cek Naskah',
  description: 'Kelola informasi profil, nomor telepon, dan keamanan akun Cek Naskah Anda.',
  ogTitle: 'Profil Saya — Cek Naskah',
  ogDescription: 'Kelola data pribadi, pengaturan keamanan, dan preferensi akun di Cek Naskah.',
  robots: 'noindex, nofollow'
})

const {
  user,
  userPoints,
  fetchUser,
  updateName,
  updatePhone,
  updatePassword,
  updatePrefs,
  updateAvatar,
  sendEmailVerification,
  confirmEmailVerification,
  createMFAAuthenticator,
  verifyAndEnableMFA,
  disableMFA,
  getMFARecoveryCodes,
  listSessions,
  deleteSession,
  deleteOtherSessions,
  deleteAllSessions,
  forgotPassword,
  logout
} = useAuth()

const {
  openTopupModal,
  formatPointsAsRupiah,
  userPointHistory,
  historyList,
  historyLoading,
  fetchHistory,
  formatTransactionType,
  formatTransactionDate
} = usePoints()
const { getWhatsappUrl, settings } = useAppSettings()

const activeTab = ref<'account' | 'security' | 'sessions' | 'points'>('account')

// Point transactions list: prioritize historyList if fetched, otherwise fallback to userPointHistory
const displayPointTransactions = computed(() => {
  if (historyList.value && historyList.value.length > 0) {
    return historyList.value
  }
  return userPointHistory.value || []
})

watch(activeTab, (newTab) => {
  if (newTab === 'points') {
    fetchHistory()
  }
})

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
  { id: 'p1', name: 'Akademisi Pria', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=mbnxc' },
  { id: 'p2', name: 'Akademisi Wanita', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=profe' },
  { id: 'p3', name: 'Peneliti Muda', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=mahasss' },
  { id: 'p4', name: 'Penulis Buku', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Cendekia' },
  { id: 'p5', name: 'Mahasiswa Kreatif', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mahasiswa' },
  { id: 'p6', name: 'Robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NaskahBot' }
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
  loadSessions()

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

  // If redirected due to email verification requirement
  if (route.query.verify_required === '1' && !user.value?.emailVerification) {
    actionError.value = 'Halaman atau fitur yang Anda tuju memerlukan verifikasi email aktif. Harap verifikasi email Anda.'
  }

  // Handle return from Payment Gateway (Sumopod Pay)
  if (route.query.tab === 'points') {
    activeTab.value = 'points'
    fetchHistory()
  }

  if (route.query.payment === 'success') {
    activeTab.value = 'points'
    actionSuccess.value = 'Pembayaran berhasil! Saldo poin Anda sedang disinkronkan secara otomatis.'
    await Promise.allSettled([
      fetchUser(),
      fetchHistory()
    ])
  } else if (route.query.payment === 'cancel') {
    activeTab.value = 'points'
    actionError.value = 'Pembayaran dibatalkan. Anda dapat mengulangi transaksi kapan saja.'
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

// Multi-Factor Authentication (MFA / 2FA) States
const isSettingUpMfa = ref(false)
const mfaQrUrl = ref('')
const mfaOtpInput = ref('')
const mfaLoading = ref(false)
const recoveryCodes = ref<string[]>([])
const showRecoveryCodesModal = ref(false)
const areCodesCopied = ref(false)
const showDisableMfaConfirm = ref(false)

// Start MFA Setup: request authenticator creation from Appwrite
const startMfaSetup = async () => {
  clearActionFeedback()
  mfaLoading.value = true
  mfaOtpInput.value = ''
  try {
    const res = await createMFAAuthenticator()
    if (res.success && res.qrUrl) {
      mfaQrUrl.value = res.qrUrl
      isSettingUpMfa.value = true
    } else {
      actionError.value = res.error || 'Gagal memulai konfigurasi 2FA. Silakan coba lagi.'
    }
  } finally {
    mfaLoading.value = false
  }
}

// Cancel MFA Setup
const cancelMfaSetup = () => {
  isSettingUpMfa.value = false
  mfaQrUrl.value = ''
  mfaOtpInput.value = ''
}

// Verify OTP & Activate 2FA
const confirmEnableMfa = async () => {
  clearActionFeedback()
  const code = mfaOtpInput.value.replace(/\D/g, '').trim()
  if (code.length !== 6) {
    actionError.value = 'Masukkan 6 digit kode verifikasi dari aplikasi autentikator.'
    return
  }
  mfaLoading.value = true
  try {
    const res = await verifyAndEnableMFA(code)
    if (res.success) {
      actionSuccess.value = 'Autentikasi Dua Faktor (2FA) berhasil diaktifkan untuk akun Anda!'
      isSettingUpMfa.value = false
      if (res.recoveryCodes && res.recoveryCodes.length > 0) {
        recoveryCodes.value = res.recoveryCodes
        showRecoveryCodesModal.value = true
      }
    } else {
      actionError.value = res.error || 'Verifikasi gagal. Pastikan kode 6 digit sudah tepat.'
    }
  } finally {
    mfaLoading.value = false
  }
}

// Disable 2FA
const handleDisableMfa = async () => {
  clearActionFeedback()
  mfaLoading.value = true
  try {
    const res = await disableMFA()
    if (res.success) {
      actionSuccess.value = 'Autentikasi Dua Faktor (2FA) berhasil dinonaktifkan.'
      showDisableMfaConfirm.value = false
      recoveryCodes.value = []
    } else {
      actionError.value = res.error || 'Gagal menonaktifkan 2FA.'
    }
  } finally {
    mfaLoading.value = false
  }
}

// View or Regenerate Recovery Codes
const handleViewRecoveryCodes = async () => {
  clearActionFeedback()
  mfaLoading.value = true
  try {
    const res = await getMFARecoveryCodes(false)
    if (res.success && res.recoveryCodes) {
      recoveryCodes.value = res.recoveryCodes
      showRecoveryCodesModal.value = true
    } else {
      actionError.value = res.error || 'Tidak dapat memuat kode pemulihan cadangan.'
    }
  } finally {
    mfaLoading.value = false
  }
}

// Copy All Recovery Codes
const copyAllRecoveryCodes = async () => {
  if (!recoveryCodes.value.length) return
  try {
    await navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
    areCodesCopied.value = true
    setTimeout(() => {
      areCodesCopied.value = false
    }, 2500)
  } catch {
    // clipboard error
  }
}

// Session Management States
const sessionList = ref<Models.Session[]>([])
const sessionsLoading = ref(false)
const revokingSessionId = ref<string | null>(null)
const isRevokingOthers = ref(false)
const showRevokeOthersConfirm = ref(false)

const currentSession = computed(() => sessionList.value.find(s => s.current))
const otherSessions = computed(() => sessionList.value.filter(s => !s.current))

const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await listSessions()
    if (res.success && res.sessions) {
      sessionList.value = res.sessions
    }
  } finally {
    sessionsLoading.value = false
  }
}

const handleRevokeSession = async (sessionId: string) => {
  clearActionFeedback()
  revokingSessionId.value = sessionId
  try {
    const res = await deleteSession(sessionId)
    if (res.success) {
      actionSuccess.value = 'Sesi perangkat berhasil dihentikan.'
      sessionList.value = sessionList.value.filter(s => s.$id !== sessionId)
    } else {
      actionError.value = res.error || 'Gagal menghentikan sesi perangkat.'
    }
  } finally {
    revokingSessionId.value = null
  }
}

const handleRevokeOtherSessions = async () => {
  clearActionFeedback()
  isRevokingOthers.value = true
  try {
    const res = await deleteOtherSessions()
    if (res.success) {
      actionSuccess.value = `Berhasil menghentikan ${res.count || 0} sesi perangkat lain.`
      showRevokeOthersConfirm.value = false
      await loadSessions()
    } else {
      actionError.value = res.error || 'Gagal menghentikan sesi perangkat lain.'
    }
  } finally {
    isRevokingOthers.value = false
  }
}

const handleRevokeAllAndLogout = async () => {
  clearActionFeedback()
  sessionsLoading.value = true
  try {
    await deleteAllSessions()
    navigateTo('/login')
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal menghentikan semua sesi.'
    actionError.value = msg
  } finally {
    sessionsLoading.value = false
  }
}

const formatSessionDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const getDeviceType = (session: Models.Session): 'mobile' | 'tablet' | 'desktop' => {
  const os = (session.osName || '').toLowerCase()
  const clientType = (session.clientType || '').toLowerCase()
  if (os.includes('ios') || os.includes('android')) {
    if (os.includes('ipad') || clientType.includes('tablet')) {
      return 'tablet'
    }
    return 'mobile'
  }
  return 'desktop'
}

const getDeviceTitle = (session: Models.Session) => {
  const client = session.clientName || 'Browser'
  const os = session.osName || 'Perangkat'
  return `${client} di ${os}`
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

        <!-- Mandatory Email Verification Warning Card -->
        <div
          v-if="settings.requireEmailVerification && !user?.emailVerification"
          class="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold">
                Verifikasi Email Diwajibkan
              </h4>
              <p class="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                Kebijakan platform mewajibkan verifikasi email aktif. Harap konfirmasi tautan verifikasi yang kami kirimkan ke alamat email Anda (<span class="font-semibold">{{ user?.email }}</span>).
              </p>
            </div>
          </div>
          <button
            type="button"
            :disabled="isSendingVerification || verificationSent"
            class="shrink-0 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            @click="handleSendVerification"
          >
            {{ isSendingVerification ? 'Mengirim...' : (verificationSent ? 'Tautan Terkirim' : 'Kirim Ulang Verifikasi') }}
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
            <!-- Saldo Poin Quick Info & Modal Button -->
            <button
              type="button"
              class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
              title="Klik untuk membuka rincian poin dan cara isi ulang"
              @click="activeTab = 'points'"
            >
              <span class="text-base group-hover:scale-110 transition-transform">🪙</span>
              <span>{{ (userPoints || 0).toLocaleString('id-ID') }} Poin</span>
              <span class="px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-800/70 text-[10px] text-amber-900 dark:text-amber-100 font-extrabold">+ Top Up</span>
            </button>
            <a
              :href="getWhatsappUrl('Halo Admin Cek Naskah, saya butuh bantuan')"
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
          <button
            type="button"
            class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
            :class="activeTab === 'sessions'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
            @click="activeTab = 'sessions'; clearActionFeedback(); loadSessions()"
          >
            <span>Manajemen Sesi</span>
            <span
              v-if="sessionList.length"
              class="px-2 py-0.5 rounded-md text-[11px] font-bold"
              :class="activeTab === 'sessions'
                ? 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'"
            >
              {{ sessionList.length }}
            </span>
          </button>
          <button
            type="button"
            class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
            :class="activeTab === 'points'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'"
            @click="activeTab = 'points'; clearActionFeedback()"
          >
            <span>Saldo Poin & Tarif Layanan</span>
            <span
              class="px-2 py-0.5 rounded-md text-[11px] font-bold"
              :class="activeTab === 'points'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'"
            >
              🪙 {{ (userPoints || 0).toLocaleString('id-ID') }} Poin
            </span>
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

          <!-- Card 2: Autentikasi Dua Faktor (MFA / 2FA) -->
          <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <!-- Card Header -->
            <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start sm:items-center gap-3.5">
                <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2.5">
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      Autentikasi Dua Faktor (2FA / MFA)
                    </h2>
                    <span
                      class="px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      :class="user?.mfa
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="user?.mfa ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"
                      />
                      {{ user?.mfa ? '2FA Aktif' : 'Belum Aktif' }}
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
                    Lindungi akun dengan verifikasi 6 digit dari aplikasi autentikator (TOTP) seperti Google Authenticator.
                  </p>
                </div>
              </div>

              <!-- Top Action if inactive and not currently in setup mode -->
              <div v-if="!user?.mfa && !isSettingUpMfa">
                <button
                  type="button"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-indigo-600/20"
                  :disabled="mfaLoading"
                  @click="startMfaSetup"
                >
                  <svg
                    v-if="mfaLoading"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Konfigurasi 2FA</span>
                </button>
              </div>
            </div>

            <!-- Case 1: MFA is ACTIVE -->
            <div
              v-if="user?.mfa"
              class="p-6 sm:p-8 space-y-6"
            >
              <div class="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-4">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Akun Anda Dilindungi dengan Lapisan Keamanan Tambahan
                  </h4>
                  <p class="text-xs text-emerald-700 dark:text-emerald-300/90 mt-1 leading-relaxed">
                    Setiap kali Anda masuk menggunakan email dan kata sandi, sistem akan meminta 6 digit kode OTP yang dibuat oleh aplikasi autentikator terdaftar.
                  </p>
                </div>
              </div>

              <!-- Active Actions -->
              <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div class="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                    :disabled="mfaLoading"
                    @click="handleViewRecoveryCodes"
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
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    <span>Kode Cadangan Pemulihan</span>
                  </button>
                </div>

                <div v-if="!showDisableMfaConfirm">
                  <button
                    type="button"
                    class="px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
                    @click="showDisableMfaConfirm = true"
                  >
                    Nonaktifkan 2FA
                  </button>
                </div>

                <!-- Confirmation Box to Disable -->
                <div
                  v-else
                  class="flex items-center gap-2.5 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl"
                >
                  <span class="text-xs text-red-700 dark:text-red-300 font-medium pl-1">
                    Yakin ingin menonaktifkan?
                  </span>
                  <button
                    type="button"
                    class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    :disabled="mfaLoading"
                    @click="handleDisableMfa"
                  >
                    {{ mfaLoading ? 'Memproses...' : 'Ya, Matikan' }}
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1.5 text-xs text-slate-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                    @click="showDisableMfaConfirm = false"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>

            <!-- Case 2: MFA SETUP FLOW -->
            <div
              v-else-if="isSettingUpMfa"
              class="p-6 sm:p-8 space-y-6"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <!-- QR Code Box -->
                <div class="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 flex flex-col items-center text-center">
                  <div class="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 flex items-center justify-center mb-4">
                    <img
                      v-if="mfaQrUrl"
                      :src="mfaQrUrl"
                      alt="Kode QR Autentikator"
                      class="w-full h-full object-contain"
                    >
                    <div
                      v-else
                      class="text-xs text-slate-400"
                    >
                      Memuat QR Code...
                    </div>
                  </div>

                  <span class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Langkah 1: Pindai Kode QR
                  </span>
                  <p class="text-[11px] text-slate-500 dark:text-neutral-400 max-w-xs">
                    Buka aplikasi autentikator di ponsel Anda (Google Authenticator, Microsoft Authenticator, atau 1Password), lalu pindai kode di atas.
                  </p>
                </div>

                <!-- OTP Input Form -->
                <div class="space-y-4">
                  <div>
                    <span class="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                      Langkah 2: Masukkan 6 Digit Kode OTP
                    </span>
                    <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-4">
                      Setelah berhasil dipindai, aplikasi autentikator Anda akan menampilkan 6 digit angka yang berganti secara berkala. Masukkan kode tersebut untuk verifikasi.
                    </p>
                  </div>

                  <div>
                    <label
                      for="mfaOtpCode"
                      class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                    >
                      Kode Verifikasi (6 Digit) <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="mfaOtpCode"
                      v-model="mfaOtpInput"
                      type="text"
                      inputmode="numeric"
                      maxlength="6"
                      placeholder="Contoh: 123456"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white text-lg font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500 transition-colors"
                      @keydown.enter.prevent="confirmEnableMfa"
                    >
                  </div>

                  <div class="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-neutral-800 text-white disabled:text-slate-400 dark:disabled:text-neutral-500 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 disabled:cursor-not-allowed"
                      :disabled="mfaLoading || mfaOtpInput.replace(/\D/g, '').length !== 6"
                      @click="confirmEnableMfa"
                    >
                      <svg
                        v-if="mfaLoading"
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
                      <span>{{ mfaLoading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan 2FA' }}</span>
                    </button>
                    <button
                      type="button"
                      class="px-4 py-2.5 border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                      @click="cancelMfaSetup"
                    >
                      Batalkan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Case 3: Inactive Overview & Educational Benefits -->
            <div
              v-else
              class="p-6 sm:p-8 space-y-6"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                  <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
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
                    Cegah Peretasan Sandi
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    Meskipun kata sandi Anda diketahui pihak ketiga, akun tetap terlindungi karena membutuhkan ponsel Anda.
                  </p>
                </div>

                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                  <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2.5">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Kode Berganti Tiap 30 Detik
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    Standar algoritma TOTP industri memastikan kode verifikasi selalu baru dan hanya dapat digunakan satu kali.
                  </p>
                </div>

                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
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
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Kompatibel Luas
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    Mendukung Google Authenticator, Microsoft Authenticator, Apple Passwords, Bitwarden, atau 1Password.
                  </p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <span class="font-bold block mb-0.5">Siap mengamankan akun naskah Anda?</span>
                  Proses konfigurasi hanya membutuhkan waktu kurang dari 1 menit dengan memindai kode QR.
                </div>
                <button
                  type="button"
                  class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-indigo-600/20 whitespace-nowrap flex items-center gap-1.5"
                  :disabled="mfaLoading"
                  @click="startMfaSetup"
                >
                  <svg
                    v-if="mfaLoading"
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
                  <span>Aktifkan 2FA Sekarang</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Card 3: Informasi Keamanan Akun & Tips -->
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

        <!-- TAB 3: MANAJEMEN SESI -->
        <div
          v-else-if="activeTab === 'sessions'"
          class="space-y-8"
        >
          <!-- Card Utama: Ringkasan Sesi & Tombol Aksi Cepat -->
          <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <svg
                    class="w-5 h-5 text-primary-600 dark:text-primary-400"
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
                  <span>Manajemen Sesi & Perangkat Terhubung</span>
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
                  Pantau dan kelola seluruh perangkat atau peramban yang sedang aktif masuk ke akun Cek Naskah Anda.
                </p>
              </div>

              <!-- Quick Action Toolbar -->
              <div class="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  :disabled="sessionsLoading"
                  @click="loadSessions"
                >
                  <svg
                    class="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400"
                    :class="{ 'animate-spin': sessionsLoading }"
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
                  <span>{{ sessionsLoading ? 'Memperbarui...' : 'Segarkan' }}</span>
                </button>

                <button
                  v-if="otherSessions.length > 0"
                  type="button"
                  class="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer border border-red-200 dark:border-red-900/60 flex items-center gap-1.5"
                  @click="showRevokeOthersConfirm = true"
                >
                  <svg
                    class="w-3.5 h-3.5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Keluarkan Sesi Lain ({{ otherSessions.length }})</span>
                </button>
              </div>
            </div>

            <!-- Stats Metric Highlights -->
            <div class="p-6 sm:p-8 bg-slate-50/50 dark:bg-neutral-800/20 border-b border-slate-100 dark:border-neutral-800/80">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 shadow-sm">
                  <div class="text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1">
                    Total Sesi Aktif
                  </div>
                  <div class="text-2xl font-black text-slate-900 dark:text-white">
                    {{ sessionList.length }}
                  </div>
                  <div class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                    Terdaftar di sistem Appwrite
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                  <div class="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Perangkat Saat Ini</span>
                  </div>
                  <div class="text-2xl font-black text-slate-900 dark:text-white">
                    1
                  </div>
                  <div class="text-[11px] text-emerald-600 dark:text-emerald-400/90 mt-1">
                    {{ currentSession ? getDeviceTitle(currentSession) : 'Browser ini' }}
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 shadow-sm">
                  <div class="text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1">
                    Perangkat Lain
                  </div>
                  <div class="text-2xl font-black text-slate-900 dark:text-white">
                    {{ otherSessions.length }}
                  </div>
                  <div class="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                    {{ otherSessions.length > 0 ? 'Perangkat terhubung lain' : 'Tidak ada perangkat lain' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div
              v-if="sessionsLoading && !sessionList.length"
              class="p-12 text-center"
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
                Memuat daftar sesi aktif Anda...
              </p>
            </div>

            <div
              v-else
              class="p-6 sm:p-8 space-y-8"
            >
              <!-- PERANGKAT SAAT INI (HIGHLIGHTED) -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Perangkat yang Sedang Anda Gunakan
                  </h3>
                  <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Sesi Aktif Sekarang
                  </span>
                </div>

                <div
                  v-if="currentSession"
                  class="p-5 sm:p-6 rounded-2xl bg-primary-50/40 dark:bg-primary-950/20 border-2 border-primary-500/40 dark:border-primary-600/40 transition-colors"
                >
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                      <!-- Icon Device -->
                      <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                        <!-- Desktop / Laptop -->
                        <svg
                          v-if="getDeviceType(currentSession) === 'desktop'"
                          class="w-6 h-6"
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
                        <!-- Mobile -->
                        <svg
                          v-else-if="getDeviceType(currentSession) === 'mobile'"
                          class="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <!-- Tablet -->
                        <svg
                          v-else
                          class="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <div>
                        <div class="flex items-center gap-2.5 flex-wrap">
                          <h4 class="text-base font-bold text-slate-900 dark:text-white">
                            {{ getDeviceTitle(currentSession) }}
                          </h4>
                          <span class="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-[11px] font-semibold">
                            Perangkat Ini
                          </span>
                        </div>

                        <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-neutral-400">
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
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                            <span>IP: <code class="font-mono font-medium text-slate-700 dark:text-neutral-300">{{ currentSession.ip || '127.0.0.1' }}</code></span>
                          </div>

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
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{{ currentSession.countryName || 'Indonesia' }}</span>
                          </div>

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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Login sejak: {{ formatSessionDate(currentSession.$createdAt) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="self-stretch sm:self-center flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <button
                        type="button"
                        class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-slate-600 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                        @click="handleLogout"
                      >
                        Keluar Akun
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- DAFTAR PERANGKAT LAIN -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Perangkat Terhubung Lainnya ({{ otherSessions.length }})
                  </h3>
                </div>

                <!-- Empty State jika tidak ada sesi lain -->
                <div
                  v-if="otherSessions.length === 0"
                  class="p-8 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800 text-center"
                >
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-700 text-slate-400 dark:text-neutral-400 flex items-center justify-center mx-auto mb-3">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h4 class="text-sm font-bold text-slate-800 dark:text-neutral-200 mb-1">
                    Tidak Ada Sesi di Perangkat Lain
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
                    Akun Anda hanya aktif pada peramban ini saat ini. Jika Anda pernah masuk di laptop kantor, ponsel lain, atau komputer umum, semua sesi tersebut telah terputus.
                  </p>
                </div>

                <!-- List Sesi Lain -->
                <div
                  v-else
                  class="space-y-3"
                >
                  <div
                    v-for="session in otherSessions"
                    :key="session.$id"
                    class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div class="flex items-start gap-3.5">
                      <!-- Icon Device -->
                      <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <svg
                          v-if="getDeviceType(session) === 'desktop'"
                          class="w-5 h-5"
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
                        <svg
                          v-else-if="getDeviceType(session) === 'mobile'"
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <svg
                          v-else
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                            {{ getDeviceTitle(session) }}
                          </h4>
                        </div>

                        <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-neutral-400">
                          <span>IP: <code class="font-mono text-slate-700 dark:text-neutral-300">{{ session.ip || '-' }}</code></span>
                          <span class="text-slate-300 dark:text-neutral-600">•</span>
                          <span>{{ session.countryName || 'Lokasi tidak diketahui' }}</span>
                          <span class="text-slate-300 dark:text-neutral-600">•</span>
                          <span>Masuk: {{ formatSessionDate(session.$createdAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="self-end sm:self-center">
                      <button
                        type="button"
                        class="px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        :disabled="revokingSessionId === session.$id"
                        @click="handleRevokeSession(session.$id)"
                      >
                        <svg
                          v-if="revokingSessionId === session.$id"
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
                        <span>{{ revokingSessionId === session.$id ? 'Memutuskan...' : 'Putus Sesi' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Zona Tindakan Global / Keluar Semua Sesi -->
              <div class="pt-6 border-t border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                    Keluar dari Semua Perangkat (Termasuk Ini)
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Hentikan seluruh sesi akun secara global dan kembali ke halaman login.
                  </p>
                </div>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-neutral-800 dark:hover:bg-red-950/40 text-slate-700 hover:text-red-600 dark:text-neutral-300 dark:hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-neutral-700 shrink-0"
                  :disabled="sessionsLoading"
                  @click="handleRevokeAllAndLogout"
                >
                  Keluar dari Semua Sesi
                </button>
              </div>
            </div>
          </div>

          <!-- Card 2: Panduan & Keamanan Akses Akun -->
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Tips Keamanan Sesi & Perangkat</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mb-6">
              Langkah proaktif untuk mencegah penyalahgunaan akses akun Anda oleh pihak ketiga.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800">
                <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Perangkat Asing?
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Jika terdapat peramban atau lokasi yang tidak Anda kenali, segera tekan <strong>Putus Sesi</strong> dan ubah kata sandi akun Anda.
                </p>
              </div>

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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Aktifkan Autentikasi 2FA
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Autentikasi dua faktor memastikan tidak ada yang dapat masuk ke akun Anda tanpa kode TOTP dari ponsel pribadi Anda.
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Komputer Publik / Kampus
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Selalu biasakan keluar akun setelah selesai mengoreksi naskah di laboratorium kampus, perpustakaan, atau perangkat bersama.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: SALDO POIN & TARIF LAYANAN -->
        <div
          v-else-if="activeTab === 'points'"
          class="space-y-8"
        >
          <!-- 1. Hero Saldo Poin Card -->
          <div class="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
            <!-- Background Decorative Rings -->
            <div class="absolute -right-8 -bottom-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div class="absolute right-12 top-6 text-7xl sm:text-8xl opacity-15 select-none pointer-events-none">
              🪙
            </div>

            <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
                  <span>🪙 Sistem Mata Uang Naskah</span>
                  <span>•</span>
                  <span>1 Poin = Rp 1</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black tracking-tight">
                  Saldo Poin Akun Anda
                </h2>
                <div class="flex items-baseline gap-2 mt-2">
                  <span class="text-4xl sm:text-5xl font-black tracking-tight">
                    {{ (userPoints || 0).toLocaleString('id-ID') }}
                  </span>
                  <span class="text-xl font-bold text-amber-100">
                    Poin
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-amber-100 mt-2 font-medium">
                  Setara dengan <strong class="text-white font-bold">{{ formatPointsAsRupiah(userPoints) }}</strong>
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  class="px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-sm shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                  @click="openTopupModal"
                >
                  <span class="text-base">🪙</span>
                  <span>Isi Ulang (Top Up)</span>
                </button>
                <NuxtLink
                  to="/charge"
                  class="px-5 py-3.5 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-sm border border-white/30 transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Pesan Layanan</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- 2. Keuntungan Sistem Poin -->
          <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>💡</span>
                <span>Mengapa Menggunakan Sistem Poin?</span>
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
                Poin menggantikan mata uang Rupiah untuk memberikan kemudahan, kecepatan verifikasi, dan diskon paket di Cek Naskah.
              </p>
            </div>

            <div class="grid sm:grid-cols-3 gap-4">
              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 space-y-2">
                <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center text-lg">
                  🪙
                </div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                  1 Poin = Rp 1
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Nilai tukar tetap dan transparan. Tidak ada biaya admin tersembunyi ataupun pembulatan harga merugikan.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 space-y-2">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg">
                  ⚡
                </div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                  Tanpa Transfer Berulang
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Cukup isi saldo sekali untuk memesan uji berkali-kali: similarity Turnitin, skor AI, revisi bab naskah, atau unduh referensi.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 space-y-2">
                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center text-lg">
                  🛡️
                </div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                  Masa Berlaku Selamanya
                </h4>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Saldo poin Anda tidak pernah hangus. Poin tersimpan aman di akun Anda dan dapat dipakai kapan pun naskah Anda siap.
                </p>
              </div>
            </div>
          </div>

          <!-- 4. Riwayat Transaksi Saldo Poin -->
          <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div class="p-6 sm:p-8 border-b border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📜</span>
                  <span>Riwayat Transaksi Poin Anda</span>
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
                  Catatan lengkap transaksi penambahan (top up), penggunaan layanan, serta penyesuaian saldo poin akun Anda.
                </p>
              </div>

              <div class="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  :disabled="historyLoading"
                  class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  @click="fetchHistory"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    :class="{ 'animate-spin': historyLoading }"
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
                  <span>{{ historyLoading ? 'Memperbarui...' : 'Segarkan Riwayat' }}</span>
                </button>
              </div>
            </div>

            <!-- Table of Transactions -->
            <div
              v-if="displayPointTransactions.length > 0"
              class="overflow-x-auto"
            >
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50/80 dark:bg-neutral-800/40 text-slate-500 dark:text-neutral-400 border-b border-slate-100 dark:border-neutral-800 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th class="py-3.5 px-6">
                      Waktu Transaksi
                    </th>
                    <th class="py-3.5 px-6">
                      Jenis Aktivitas
                    </th>
                    <th class="py-3.5 px-6 text-right">
                      Nominal Poin
                    </th>
                    <th class="py-3.5 px-6 text-right">
                      Saldo Akhir
                    </th>
                    <th class="py-3.5 px-6">
                      Status
                    </th>
                    <th class="py-3.5 px-6">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-neutral-800/80 font-medium">
                  <tr
                    v-for="tx in displayPointTransactions"
                    :key="tx.id"
                    class="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td class="py-4 px-6 text-slate-600 dark:text-neutral-300 whitespace-nowrap">
                      {{ formatTransactionDate(tx.createdAt) }}
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap">
                      <span
                        class="px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                        :class="{
                          'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300': tx.type === 'topup',
                          'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300': tx.type === 'deduction',
                          'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300': tx.type === 'adjustment'
                        }"
                      >
                        <span v-if="tx.type === 'topup'">🟢</span>
                        <span v-else-if="tx.type === 'deduction'">🔴</span>
                        <span v-else>🟡</span>
                        <span>{{ formatTransactionType(tx.type) }}</span>
                      </span>
                    </td>
                    <td
                      class="py-4 px-6 text-right font-mono font-bold whitespace-nowrap text-sm"
                      :class="tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : (tx.amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-neutral-300')"
                    >
                      {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toLocaleString('id-ID') }} Poin
                    </td>
                    <td class="py-4 px-6 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {{ (tx.balanceAfter || 0).toLocaleString('id-ID') }} Poin
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Berhasil</span>
                      </span>
                    </td>
                    <td class="py-4 px-6 text-slate-600 dark:text-neutral-300 max-w-xs">
                      <p
                        class="truncate"
                        :title="tx.notes"
                      >
                        {{ tx.notes || '-' }}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div
              v-else
              class="p-12 text-center space-y-4"
            >
              <div class="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
                🪙
              </div>
              <div class="space-y-1">
                <h4 class="text-base font-bold text-slate-900 dark:text-white">
                  Belum Ada Riwayat Transaksi Poin
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
                  Riwayat penambahan saldo (top up) atau pemesanan layanan menggunakan poin akan secara otomatis tercatat di sini.
                </p>
              </div>
              <div class="pt-2">
                <button
                  type="button"
                  class="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
                  @click="openTopupModal"
                >
                  <span>🪙</span>
                  <span>Isi Ulang Saldo Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Kode Pemulihan Cadangan 2FA -->
    <div
      v-if="showRecoveryCodesModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Kode Cadangan Pemulihan 2FA
              </h3>
              <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Simpan kode ini di tempat yang aman dan rahasia.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
            @click="showRecoveryCodesModal = false"
          >
            ✕
          </button>
        </div>

        <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          Setiap kode cadangan hanya dapat digunakan <strong>satu kali</strong> jika Anda kehilangan akses ke aplikasi autentikator di ponsel Anda.
        </div>

        <div class="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-neutral-800/80 rounded-2xl border border-slate-200 dark:border-neutral-700">
          <code
            v-for="(code, idx) in recoveryCodes"
            :key="idx"
            class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-center font-mono text-xs font-bold text-slate-800 dark:text-neutral-200 select-all"
          >
            {{ code }}
          </code>
        </div>

        <div class="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            @click="copyAllRecoveryCodes"
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>{{ areCodesCopied ? 'Semua Kode Tersalin!' : 'Salin Semua Kode' }}</span>
          </button>

          <button
            type="button"
            class="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            @click="showRecoveryCodesModal = false"
          >
            Saya Sudah Menyimpan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Keluarkan Semua Perangkat Lain -->
    <div
      v-if="showRevokeOthersConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
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
              Keluarkan Semua Perangkat Lain?
            </h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Tindakan ini akan memutuskan akses akun pada seluruh perangkat dan peramban lain (<strong>{{ otherSessions.length }} sesi</strong>). Sesi di peramban saat ini akan tetap aktif.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            :disabled="isRevokingOthers"
            @click="showRevokeOthersConfirm = false"
          >
            Batal
          </button>

          <button
            type="button"
            class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            :disabled="isRevokingOthers"
            @click="handleRevokeOtherSessions"
          >
            <svg
              v-if="isRevokingOthers"
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
            <span>{{ isRevokingOthers ? 'Mengeluarkan...' : 'Ya, Keluarkan Semua' }}</span>
          </button>
        </div>
      </div>
    </div>

    <LandingFooter />
  </div>
</template>
