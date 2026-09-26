<script setup lang="ts">
import { ref, onMounted } from 'vue'

useSeoMeta({
  title: 'Memproses Autentikasi Google — Cek Naskah',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const { handleOAuthCallback, logout } = useAuth()
const { settings } = useAppSettings()

const loading = ref(true)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  const userId = route.query.userId as string | undefined
  const secret = route.query.secret as string | undefined
  const errorParam = route.query.error as string | undefined

  if (errorParam) {
    errorMessage.value = 'Proses autentikasi dengan Google dibatalkan atau tidak disetujui.'
    loading.value = false
    setTimeout(() => {
      navigateTo('/login?error=google_auth_failed')
    }, 1500)
    return
  }

  if (!userId || !secret) {
    errorMessage.value = 'Data autentikasi Google tidak lengkap atau telah kedaluwarsa.'
    loading.value = false
    setTimeout(() => {
      navigateTo('/login?error=google_auth_failed')
    }, 1500)
    return
  }

  try {
    const result = await handleOAuthCallback(userId, secret)

    if (result.success && result.user) {
      // Check if user is newly registered and registration is disabled
      const isNewUser = result.user.$createdAt
        && (Date.now() - new Date(result.user.$createdAt).getTime()) < 60000

      if (!settings.value.allowNewRegistration && isNewUser) {
        await logout()
        await navigateTo('/login?error=registration_disabled&message=' + encodeURIComponent('Pendaftaran akun baru sedang dinonaktifkan oleh administrator.'))
        return
      }

      // Retrieve intended destination
      let destination = '/'
      if (typeof window !== 'undefined') {
        try {
          destination = localStorage.getItem('oauth_redirect_path')
            || sessionStorage.getItem('oauth_redirect_path')
            || '/'
          localStorage.removeItem('oauth_redirect_path')
          sessionStorage.removeItem('oauth_redirect_path')
        } catch {
          destination = '/'
        }
      }

      await navigateTo(destination, { replace: true })
    } else {
      errorMessage.value = result.error || 'Gagal memproses sesi login Google.'
      loading.value = false
      setTimeout(() => {
        navigateTo(`/login?error=google_auth_failed&message=${encodeURIComponent(result.error || '')}`)
      }, 2000)
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Terjadi kesalahan saat memverifikasi sesi akun Google Anda.'
    errorMessage.value = msg
    loading.value = false
    setTimeout(() => {
      navigateTo(`/login?error=google_auth_failed&message=${encodeURIComponent(msg)}`)
    }, 2000)
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-8 shadow-sm text-center">
      <div class="flex justify-center mb-6">
        <AppLogo />
      </div>

      <div
        v-if="loading"
        class="space-y-4"
      >
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <svg
              class="w-6 h-6 animate-spin"
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
          </div>
        </div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Menghubungkan Akun Google...
        </h2>
        <p class="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
          Mohon tunggu sebentar, kami sedang memverifikasi dan menyiapkan sesi login Anda.
        </p>
      </div>

      <div
        v-else-if="errorMessage"
        class="space-y-4"
      >
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Login Google Gagal
        </h2>
        <p class="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
          {{ errorMessage }}
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition shadow-sm"
        >
          Kembali ke Halaman Masuk
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
