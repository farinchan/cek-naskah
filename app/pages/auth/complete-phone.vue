<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

useSeoMeta({
  title: 'Lengkapi Nomor WhatsApp — Cek Naskah',
  description: 'Masukkan nomor WhatsApp aktif Anda untuk menyelesaikan pendaftaran akun Cek Naskah.',
  robots: 'noindex, nofollow'
})

const { user, fetchUser, completeOAuthRegistration, loginWithGoogle } = useAuth()

const phone = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const isPhoneValid = computed(() => {
  const cleaned = phone.value.trim().replace(/[\s\-().]/g, '')
  return cleaned.length >= 9 && cleaned.length <= 16
})

onMounted(async () => {
  const currentUser = await fetchUser()
  if (currentUser) {
    const existingPhone = currentUser.phone || (currentUser.prefs?.phone as string)
    if (existingPhone && existingPhone.trim().length > 4) {
      // User already has a phone, go straight to home
      await navigateTo('/', { replace: true })
    }
  }
})

const handleGoogleSignIn = () => {
  loginWithGoogle('/auth/complete-phone')
}

const handleSubmit = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (!user.value) {
    errorMessage.value = 'Silakan masuk dengan akun Google terlebih dahulu.'
    return
  }

  const trimmedPhone = phone.value.trim()
  if (!trimmedPhone) {
    errorMessage.value = 'Nomor WhatsApp / telepon wajib diisi.'
    return
  }

  if (!isPhoneValid.value) {
    errorMessage.value = 'Format nomor telepon tidak valid. Pastikan nomor minimal 9 digit (contoh: 081234567890).'
    return
  }

  loading.value = true
  try {
    const result = await completeOAuthRegistration({
      phone: trimmedPhone
    })

    if (result.success) {
      successMessage.value = 'Nomor WhatsApp berhasil disimpan! Mengalihkan ke dashboard...'
      let destination = '/'
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('oauth_redirect_path')
            || sessionStorage.getItem('oauth_redirect_path')
          destination = sanitizeRedirectPath(raw)
          localStorage.removeItem('oauth_redirect_path')
          sessionStorage.removeItem('oauth_redirect_path')
        } catch {
          destination = '/'
        }
      }

      setTimeout(() => {
        navigateTo(destination, { replace: true })
      }, 1000)
    } else {
      errorMessage.value = result.error || 'Gagal menyimpan nomor telepon. Silakan coba lagi.'
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Terjadi kesalahan sistem saat menyimpan nomor telepon.'
    errorMessage.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors duration-200">
    <!-- Header -->
    <LandingHeader />

    <!-- Main Content -->
    <main class="py-12 sm:py-20 flex-1 flex items-center justify-center px-4 sm:px-6">
      <div class="w-full max-w-md">
        <!-- Card Container -->
        <div class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <!-- Logo in Card -->
          <div class="flex justify-center mb-6">
            <AppLogo />
          </div>

          <!-- Connected Google Identity -->
          <div
            v-if="user"
            class="flex items-center gap-3 p-3.5 mb-6 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50"
          >
            <!-- Google Avatar or Initial -->
            <div class="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 shrink-0 shadow-sm overflow-hidden">
              <span v-if="!user.name">{{ user.email?.charAt(0).toUpperCase() || 'U' }}</span>
              <span v-else>{{ user.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {{ user.name || 'Pengguna Google' }}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Google
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-neutral-400 truncate">
                {{ user.email }}
              </p>
            </div>
          </div>

          <!-- Not Logged In Warning (if testing direct URL) -->
          <div
            v-else
            class="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 space-y-2.5"
          >
            <div class="flex items-start gap-2">
              <svg
                class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
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
              <span>Anda belum masuk dengan Google. Silakan klik tombol di bawah untuk masuk & menghubungkan nomor WhatsApp Anda.</span>
            </div>
            <button
              type="button"
              class="w-full py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2 hover:bg-amber-100/50 transition cursor-pointer shadow-sm"
              @click="handleGoogleSignIn"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google Dulu</span>
            </button>
          </div>

          <!-- Page Heading -->
          <div class="mb-6">
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">
              Masukkan Nomor WhatsApp
            </h1>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Diperlukan untuk menerima konfirmasi hasil pemeriksaan naskah Turnitin / AI dan verifikasi pesanan.
            </p>
          </div>

          <!-- Error Alert -->
          <div
            v-if="errorMessage"
            class="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5"
          >
            <svg
              class="w-4 h-4 text-red-500 shrink-0 mt-0.5"
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
            <div class="leading-relaxed">
              {{ errorMessage }}
            </div>
          </div>

          <!-- Success Alert -->
          <div
            v-if="successMessage"
            class="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5"
          >
            <svg
              class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
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
            <div class="leading-relaxed">
              {{ successMessage }}
            </div>
          </div>

          <!-- Form: ONLY Phone Number Input -->
          <form
            class="space-y-5"
            @submit.prevent="handleSubmit"
          >
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Nomor WhatsApp / HP Aktif <span class="text-red-500">*</span>
              </label>

              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="081234567890"
                  class="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition shadow-inner"
                  autofocus
                  required
                >
              </div>

              <p class="text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
                Format: <span class="font-mono text-slate-700 dark:text-neutral-300">08...</span> atau <span class="font-mono text-slate-700 dark:text-neutral-300">+628...</span>
              </p>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="loading || (!user && !phone)"
                class="w-full py-3.5 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-primary-600/20 hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="loading"
                  class="w-4 h-4 animate-spin"
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
                <span>{{ loading ? 'Menyimpan...' : 'Simpan Nomor & Mulai Gunakan Layanan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>
