import { ref } from 'vue'
import type { Models } from 'appwrite'
import { account, ID, OAuthProvider } from '~/utils/appwrite.js'

export const useAuth = () => {
  const user = useState<Models.User<Models.Preferences> | null>('auth_user', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

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
      if (msg.includes('Rate limit')) {
        return 'Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.'
      }
      if (msg.includes('Project not found') || msg.includes('Failed to fetch')) {
        return 'Gagal terhubung ke server Appwrite. Pastikan Project ID dan Endpoint sudah benar di konfigurasi.'
      }
      return msg
    }
    return 'Terjadi kesalahan pada sistem. Silakan coba lagi.'
  }

  // Fetch current logged-in user
  const fetchUser = async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
      const current = await account.get()
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
      const currentUser = await account.get()
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

      const currentUser = await account.get()
      user.value = currentUser
      success.value = 'Akun berhasil dibuat dan Anda telah masuk.'
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

  return {
    user,
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
    logout
  }
}
