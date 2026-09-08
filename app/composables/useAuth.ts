import type { Models } from 'appwrite'
import { account, avatars, AuthenticatorType, ID, OAuthProvider } from '~/utils/appwrite.js'

export interface UserPreferences extends Models.Preferences {
  pekerjaan?: string
  afiliasi?: string
  affiliasi?: string
  avatarUrl?: string
  photoUrl?: string
  points?: number
  [key: string]: unknown
}

export const useAuth = () => {
  const user = useState<Models.User<UserPreferences> | null>('auth_user', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const userAvatar = computed(() => {
    return (user.value?.prefs?.avatarUrl as string) || (user.value?.prefs?.photoUrl as string) || ''
  })

  // User point balance (points will replace Rupiah for service orders)
  const userPoints = computed(() => {
    const pts = user.value?.prefs?.points
    if (typeof pts === 'number' && !isNaN(pts)) return pts
    const parsed = Number(pts)
    return !isNaN(parsed) && parsed >= 0 ? parsed : 0
  })

  // Check if current user has 'admin' label assigned in Appwrite
  const isAdmin = computed(() => {
    if (!user.value) return false
    const labels = user.value.labels || []
    return labels.some(l => l.toLowerCase() === 'admin')
  })

  const clearMessages = () => {
    error.value = null
    success.value = null
  }

  // Format Appwrite error message to user-friendly Indonesian message
  const formatError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = String((err as { message: unknown }).message)
      if (msg.includes('phone') && (msg.includes('already exists') || msg.includes('user_phone_already_exists'))) {
        return 'Nomor telepon ini sudah terdaftar pada akun lain.'
      }
      if (msg.includes('Invalid phone') || msg.includes('phone must be a valid') || msg.includes('user_phone_invalid')) {
        return 'Format nomor telepon tidak valid. Pastikan nomor diawali dengan tanda + dan kode negara tanpa spasi (contoh: +6281234567890).'
      }
      if (msg.includes('Invalid credentials') || msg.includes('password')) {
        return 'Email atau kata sandi yang Anda masukkan salah.'
      }
      if (msg.includes('already exists') || msg.includes('user_already_exists')) {
        return 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.'
      }
      if (msg.includes('Password must be between 8 and 256 characters')) {
        return 'Kata sandi minimal harus 8 karakter.'
      }
      if (msg.includes('Invalid email') || msg.includes('email must be a valid')) {
        return 'Format email tidak valid.'
      }
      if (msg.includes('user_invalid_token') || msg.includes('token has expired') || msg.includes('Invalid token')) {
        return 'Tautan verifikasi tidak valid atau telah kedaluwarsa. Silakan minta tautan verifikasi baru.'
      }
      if (msg.includes('already verified') || msg.includes('user_already_verified')) {
        return 'Alamat email ini sudah berhasil diverifikasi sebelumnya.'
      }
      if (msg.includes('Rate limit')) {
        return 'Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.'
      }
      if (msg.includes('user_mfa_already_enabled') || msg.includes('already enabled')) {
        return 'Autentikasi dua faktor (2FA) sudah aktif pada akun Anda.'
      }
      if (msg.includes('user_mfa_not_enrolled') || msg.includes('not enrolled')) {
        return 'Harap daftarkan aplikasi autentikator terlebih dahulu sebelum mengaktifkan 2FA.'
      }
      if (msg.includes('user_mfa_invalid_token') || msg.includes('Invalid TOTP') || msg.includes('invalid_otp') || msg.includes('Failed to verify authenticator')) {
        return 'Kode verifikasi 6 digit tidak valid atau telah kedaluwarsa. Pastikan jam di perangkat Anda akurat.'
      }
      if (msg.includes('user_mfa_challenge_required') || msg.includes('mfa_challenge_required') || msg.includes('mfa_required')) {
        return 'Akun Anda dilindungi 2FA. Masukkan kode autentikator untuk melanjutkan.'
      }
      if (msg.includes('Project not found') || msg.includes('Failed to fetch')) {
        return 'Gagal terhubung ke server Appwrite. Pastikan Project ID dan Endpoint sudah benar di konfigurasi.'
      }
      return msg
    }
    return 'Terjadi kesalahan pada sistem. Silakan coba lagi.'
  }

  // Fetch current logged-in user
  const fetchUser = async (): Promise<Models.User<UserPreferences> | null> => {
    try {
      const current = await account.get<UserPreferences>()
      user.value = current
      return current
    } catch {
      user.value = null
      return null
    }
  }

  // Login
  const login = async (emailVal: string, passwordVal: string) => {
    loading.value = true
    clearMessages()
    try {
      await account.createEmailPasswordSession({
        email: emailVal,
        password: passwordVal
      })
      const currentUser = await account.get<UserPreferences>()
      user.value = currentUser
      success.value = 'Berhasil masuk ke akun Anda.'
      return { success: true, user: currentUser }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Register
  const register = async (emailVal: string, passwordVal: string, nameVal?: string, phoneVal?: string) => {
    loading.value = true
    clearMessages()
    try {
      const { settings } = useAppSettings()

      if (!settings.value.allowNewRegistration) {
        throw new Error('Pendaftaran pengguna baru sedang dinonaktifkan oleh administrator.')
      }

      await account.create({
        userId: ID.unique(),
        email: emailVal,
        password: passwordVal,
        name: nameVal || undefined
      })

      // Auto login after registration
      await account.createEmailPasswordSession({
        email: emailVal,
        password: passwordVal
      })

      // Update user's official phone number using account.updatePhone
      if (phoneVal) {
        const formattedPhone = formatE164Phone(phoneVal)
        try {
          await account.updatePhone({
            phone: formattedPhone,
            password: passwordVal
          })
        } catch (phoneErr: unknown) {
          console.warn('Gagal memperbarui nomor telepon akun:', phoneErr)
          const phoneMsg = phoneErr && typeof phoneErr === 'object' && 'message' in phoneErr
            ? String((phoneErr as { message: unknown }).message)
            : ''
          if (phoneMsg.includes('already exists') || phoneMsg.includes('user_phone_already_exists')) {
            throw new Error('Nomor telepon ini sudah digunakan oleh akun lain.', { cause: phoneErr })
          }
          if (phoneMsg.includes('Invalid phone') || phoneMsg.includes('must be a valid') || phoneMsg.includes('user_phone_invalid')) {
            throw new Error('Format nomor telepon tidak valid. Pastikan nomor diawali tanda + tanpa spasi (contoh: +6281234567890).', { cause: phoneErr })
          }
          throw phoneErr
        }
      }

      const currentUser = await account.get<UserPreferences>()
      user.value = currentUser

      if (settings.value.requireEmailVerification) {
        try {
          const origin = typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:3000'
          await account.createEmailVerification({
            url: `${origin}/profile`
          })
        } catch (verifErr) {
          console.warn('Gagal mengirim verifikasi email otomatis:', verifErr)
        }
        success.value = 'Akun berhasil dibuat! Tautan verifikasi telah dikirimkan ke email Anda. Harap verifikasi email Anda.'
      } else {
        success.value = 'Akun berhasil dibuat dan Anda telah masuk.'
      }

      return { success: true, user: currentUser }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Forgot Password (Request Recovery)
  const forgotPassword = async (emailVal: string) => {
    loading.value = true
    clearMessages()
    try {
      // Dynamic origin URL for the redirect
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'http://localhost:3000/reset-password'

      await account.createRecovery({
        email: emailVal,
        url: redirectUrl
      })

      success.value = 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.'
      return { success: true }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Reset Password (Update Recovery with userId and secret token)
  const resetPassword = async (userId: string, secret: string, newPassword: string) => {
    loading.value = true
    clearMessages()
    try {
      await account.updateRecovery({
        userId,
        secret,
        password: newPassword
      })

      success.value = 'Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.'
      return { success: true }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    loading.value = true
    clearMessages()
    try {
      await account.deleteSession({ sessionId: 'current' })
      user.value = null
      success.value = 'Berhasil keluar dari akun.'
      return { success: true }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Google OAuth (Login / Register)
  const loginWithGoogle = (redirectPath = '/') => {
    loading.value = true
    clearMessages()
    try {
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'

      const successUrl = `${origin}${redirectPath}`
      const failureUrl = `${origin}/login?error=google_auth_failed`

      account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: successUrl,
        failure: failureUrl
      })
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      loading.value = false
    }
  }

  // Update Profile Name
  const updateName = async (nameVal: string) => {
    loading.value = true
    clearMessages()
    try {
      const updated = await account.updateName<UserPreferences>({ name: nameVal })
      user.value = updated
      success.value = 'Nama profil berhasil diperbarui.'
      return { success: true, user: updated }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Update Profile Phone
  const updatePhone = async (phoneVal: string, passwordVal: string) => {
    loading.value = true
    clearMessages()
    try {
      const formattedPhone = formatE164Phone(phoneVal)
      const updated = await account.updatePhone<UserPreferences>({
        phone: formattedPhone,
        password: passwordVal
      })
      user.value = updated
      success.value = 'Nomor telepon berhasil diperbarui.'
      return { success: true, user: updated }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Update Password
  const updatePassword = async (newPasswordVal: string, oldPasswordVal: string) => {
    loading.value = true
    clearMessages()
    try {
      const updated = await account.updatePassword<UserPreferences>({
        password: newPasswordVal,
        oldPassword: oldPasswordVal
      })
      user.value = updated
      success.value = 'Kata sandi berhasil diperbarui.'
      return { success: true, user: updated }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Update User Preferences (Key-Value pairs)
  const updatePrefs = async (newPrefs: Record<string, unknown>) => {
    loading.value = true
    clearMessages()
    try {
      const existingPrefs = (user.value?.prefs as Record<string, unknown>) || {}
      const mergedPrefs = {
        ...existingPrefs,
        ...newPrefs
      }
      const updated = await account.updatePrefs<UserPreferences>({ prefs: mergedPrefs as Partial<UserPreferences> })
      user.value = updated
      success.value = 'Preferensi profil berhasil diperbarui.'
      return { success: true, user: updated }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Send Email Verification Link
  const sendEmailVerification = async () => {
    loading.value = true
    clearMessages()
    try {
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'

      const verifyUrl = `${origin}/profile`
      await account.createEmailVerification({
        url: verifyUrl
      })
      success.value = 'Tautan verifikasi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.'
      return { success: true }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Confirm Email Verification with Token
  const confirmEmailVerification = async (userId: string, secret: string) => {
    loading.value = true
    clearMessages()
    try {
      await account.updateEmailVerification({
        userId,
        secret
      })
      const updatedUser = await fetchUser()
      success.value = 'Selamat! Alamat email Anda telah berhasil diverifikasi.'
      return { success: true, user: updatedUser }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // Update Profile Avatar
  const updateAvatar = async (avatarUrlVal: string | null) => {
    loading.value = true
    clearMessages()
    try {
      const res = await updatePrefs({
        avatarUrl: avatarUrlVal || '',
        photoUrl: avatarUrlVal || ''
      })
      if (res.success) {
        success.value = avatarUrlVal ? 'Foto profil berhasil diperbarui.' : 'Foto profil berhasil dihapus.'
      }
      return res
    } finally {
      loading.value = false
    }
  }

  // 1. Create MFA Authenticator (returns TOTP secret & QR code URI)
  const createMFAAuthenticator = async () => {
    loading.value = true
    clearMessages()
    try {
      const auth = await account.createMFAAuthenticator({
        type: AuthenticatorType.Totp
      })
      const qrUrl = avatars.getQR({
        text: auth.uri,
        size: 240
      })
      return {
        success: true,
        secret: auth.secret,
        uri: auth.uri,
        qrUrl
      }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // 2. Verify OTP Code and Enable MFA
  const verifyAndEnableMFA = async (otpVal: string) => {
    loading.value = true
    clearMessages()
    try {
      await account.updateMFAAuthenticator({
        type: AuthenticatorType.Totp,
        otp: otpVal.trim()
      })
      const updatedUser = await account.updateMFA<UserPreferences>({
        mfa: true
      })
      user.value = updatedUser
      success.value = 'Autentikasi Dua Faktor (2FA) berhasil diaktifkan untuk akun Anda.'

      let recoveryCodes: string[] = []
      try {
        const codesRes = await account.createMFARecoveryCodes()
        recoveryCodes = codesRes.recoveryCodes || []
      } catch (codeErr) {
        console.warn('Gagal membuat kode pemulihan otomatis:', codeErr)
      }

      return {
        success: true,
        user: updatedUser,
        recoveryCodes
      }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // 3. Disable MFA on account
  const disableMFA = async () => {
    loading.value = true
    clearMessages()
    try {
      const updatedUser = await account.updateMFA<UserPreferences>({
        mfa: false
      })
      user.value = updatedUser

      try {
        await account.deleteMFAAuthenticator({
          type: AuthenticatorType.Totp
        })
      } catch (delErr) {
        console.warn('Gagal menghapus authenticator app:', delErr)
      }

      success.value = 'Autentikasi Dua Faktor (2FA) berhasil dinonaktifkan.'
      return { success: true, user: updatedUser }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // 4. Get or Generate MFA Recovery Codes
  const getMFARecoveryCodes = async (generateNew = false) => {
    loading.value = true
    clearMessages()
    try {
      const codesRes = generateNew
        ? await account.createMFARecoveryCodes()
        : await account.getMFARecoveryCodes()

      return {
        success: true,
        recoveryCodes: codesRes.recoveryCodes || []
      }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // 5. Session Management: List active sessions
  const listSessions = async () => {
    loading.value = true
    clearMessages()
    try {
      const res = await account.listSessions()
      return { success: true, sessions: res.sessions, total: res.total }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted, sessions: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  // 6. Delete a specific session by ID
  const deleteSession = async (sessionId: string) => {
    loading.value = true
    clearMessages()
    try {
      await account.deleteSession({ sessionId })
      success.value = 'Sesi perangkat berhasil dihentikan.'
      return { success: true }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // 7. Revoke all other sessions except the current active session
  const deleteOtherSessions = async () => {
    loading.value = true
    clearMessages()
    try {
      const res = await account.listSessions()
      const otherSessions = res.sessions.filter(s => !s.current)
      await Promise.all(otherSessions.map(s => account.deleteSession({ sessionId: s.$id })))
      success.value = `Berhasil menghentikan ${otherSessions.length} sesi perangkat lain.`
      return { success: true, count: otherSessions.length }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  // 8. Delete all sessions (global logout)
  const deleteAllSessions = async () => {
    loading.value = true
    clearMessages()
    try {
      await account.deleteSessions()
      user.value = null
      success.value = 'Semua sesi berhasil dihentikan. Anda telah keluar dari semua perangkat.'
      return { success: true }
    } catch (err: unknown) {
      const formatted = formatError(err)
      error.value = formatted
      return { success: false, error: formatted }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    userAvatar,
    userPoints,
    isAdmin,
    loading,
    error,
    success,
    clearMessages,
    fetchUser,
    login,
    register,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    logout,
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
    deleteAllSessions
  }
}
