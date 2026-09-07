<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()
const { loading, error, success, clearMessages, resetPassword } = useAuth()

const userId = ref('')
const secret = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const isResetComplete = ref(false)

onMounted(() => {
  clearMessages()
  userId.value = String(route.query.userId || '')
  secret.value = String(route.query.secret || '')
  if (!userId.value || !secret.value) {
    error.value = 'Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa.'
  }
})

const handleResetPassword = async () => {
  fieldErrors.value = {}
  clearMessages()

  if (!userId.value || !secret.value) {
    error.value = 'Token atau tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa.'
    return
  }

  const parseResult = resetPasswordSchema.safeParse({
    userId: userId.value,
    secret: secret.value,
    password: newPassword.value,
    confirmPassword: confirmPassword.value
  })

  if (!parseResult.success) {
    fieldErrors.value = extractZodErrors(parseResult.error)
    return
  }

  const result = await resetPassword(parseResult.data.userId, parseResult.data.secret, parseResult.data.password)
  if (result.success) {
    isResetComplete.value = true
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <!-- Landing Header -->
    <LandingHeader />

    <!-- Main Content with Landing Split Layout -->
    <main class="py-12 sm:py-20 flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <!-- Left Column: Information -->
          <div class="lg:col-span-7 space-y-8">
            <div class="space-y-5">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                <span>Atur Ulang </span>
                <span class="text-primary-600 dark:text-primary-400">Kata Sandi Anda</span>
              </h1>

              <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Buat kata sandi baru yang kuat untuk melindungi akun dan seluruh berkas naskah Anda.
              </p>
            </div>

            <!-- Password Guidelines -->
            <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 space-y-3">
              <h2 class="font-semibold text-slate-900 dark:text-white text-sm">
                Panduan Kata Sandi yang Kuat:
              </h2>
              <ul class="text-xs text-slate-600 dark:text-neutral-400 space-y-2 list-disc list-inside">
                <li>Minimal 8 karakter huruf & angka</li>
                <li>Gunakan perpaduan huruf besar dan kecil</li>
                <li>Hindari tanggal lahir atau kata yang mudah ditebak</li>
              </ul>
            </div>
          </div>

          <!-- Right Column: Reset Password Card -->
          <div class="lg:col-span-5">
            <div class="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-neutral-800 shadow-xl shadow-primary-500/5">
              <!-- Invalid Link Warning -->
              <div
                v-if="!userId || !secret"
                class="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300"
              >
                <p class="font-bold text-sm mb-1.5">
                  Tautan Pemulihan Tidak Lengkap
                </p>
                <p class="leading-relaxed mb-4">
                  Parameter pemulihan tidak ditemukan di tautan ini. Silakan buka tautan langsung dari email yang Anda terima, atau ajukan ulang.
                </p>
                <NuxtLink
                  to="/forgot-password"
                  class="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Minta Tautan Baru →
                </NuxtLink>
              </div>

              <!-- Alerts -->
              <div
                v-if="error"
                class="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5"
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
                  {{ error }}
                </div>
              </div>

              <!-- Success State -->
              <div
                v-if="isResetComplete && success"
                class="text-center py-4"
              >
                <div class="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Kata Sandi Berhasil Diperbarui
                </h2>
                <p class="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mb-6">
                  {{ success }}
                </p>
                <NuxtLink
                  to="/login"
                  class="block w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl text-center shadow-lg shadow-primary-600/25 transition-all"
                >
                  Masuk Sekarang
                </NuxtLink>
              </div>

              <!-- Form State -->
              <div v-else-if="userId && secret">
                <div class="mb-6">
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    Kata Sandi Baru
                  </h2>
                  <p class="text-xs text-slate-500 dark:text-neutral-400">
                    Masukkan kata sandi baru untuk akun Anda.
                  </p>
                </div>

                <form
                  class="space-y-4"
                  @submit.prevent="handleResetPassword"
                >
                  <div>
                    <label
                      for="new-password"
                      class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5"
                    >
                      Kata Sandi Baru
                    </label>
                    <div class="relative">
                      <input
                        id="new-password"
                        v-model="newPassword"
                        :type="showPassword ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="Minimal 8 karakter"
                        class="block w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                        :class="fieldErrors.password ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                      >
                    </div>
                    <p
                      v-if="fieldErrors.password"
                      class="mt-1.5 text-xs text-red-500 font-medium"
                    >
                      {{ fieldErrors.password }}
                    </p>
                  </div>

                  <div>
                    <label
                      for="confirm-new-password"
                      class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5"
                    >
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div class="relative">
                      <input
                        id="confirm-new-password"
                        v-model="confirmPassword"
                        :type="showPassword ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="Ulangi kata sandi baru"
                        class="block w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                        :class="fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                      >
                    </div>
                    <p
                      v-if="fieldErrors.confirmPassword"
                      class="mt-1.5 text-xs text-red-500 font-medium"
                    >
                      {{ fieldErrors.confirmPassword }}
                    </p>
                  </div>

                  <button
                    type="submit"
                    :disabled="loading"
                    class="w-full mt-2 py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg
                      v-if="loading"
                      class="animate-spin h-4 w-4 text-white"
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
                    <span>{{ loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru' }}</span>
                  </button>
                </form>

                <div class="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800 text-center">
                  <NuxtLink
                    to="/login"
                    class="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    ← Batal & Kembali ke Halaman Masuk
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Landing Footer -->
    <LandingFooter />
  </div>
</template>
