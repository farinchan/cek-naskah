<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { loading, error, success, clearMessages, forgotPassword } = useAuth()

const email = ref('')
const emailSent = ref(false)
const fieldErrors = ref<Record<string, string>>({})

onMounted(() => {
  clearMessages()
})

const handleForgotPassword = async () => {
  fieldErrors.value = {}
  clearMessages()

  const parseResult = forgotPasswordSchema.safeParse({
    email: email.value
  })

  if (!parseResult.success) {
    fieldErrors.value = extractZodErrors(parseResult.error)
    return
  }

  const result = await forgotPassword(parseResult.data.email)
  if (result.success) {
    emailSent.value = true
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
          <!-- Left Column: Security & Guidance -->
          <div class="lg:col-span-7 space-y-8">
            <div class="space-y-5">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                <span>Lupa Kata Sandi </span>
                <span class="text-primary-600 dark:text-primary-400">Akun Anda?</span>
              </h1>

              <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Jangan khawatir. Cukup masukkan email terdaftar Anda dan kami akan mengirimkan tautan verifikasi aman untuk membuat kata sandi baru.
              </p>
            </div>

            <!-- Security Features -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div class="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white text-sm">
                    Tautan Pemulihan Enkripsi Aman
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-neutral-400">
                    Tautan diverifikasi langsung oleh Appwrite Auth Engine dan hanya berlaku untuk waktu terbatas.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div class="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white text-sm">
                    Konfirmasi Instan ke Email
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-neutral-400">
                    Periksa folder kotak masuk atau folder spam jika email konfirmasi belum tiba dalam 1 menit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Forgot Password Card -->
          <div class="lg:col-span-5">
            <div class="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-neutral-800 shadow-xl shadow-primary-500/5">
              <!-- Error Alert -->
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
                v-if="emailSent && success"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Periksa Email Anda
                </h2>
                <p class="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mb-6">
                  {{ success }}
                </p>
                <div class="space-y-3">
                  <button
                    type="button"
                    class="w-full py-3 px-4 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    @click="emailSent = false; clearMessages()"
                  >
                    Kirim Ulang Tautan
                  </button>
                  <NuxtLink
                    to="/login"
                    class="block w-full py-3 px-4 text-center text-primary-600 dark:text-primary-400 text-xs font-semibold hover:underline"
                  >
                    Kembali ke Halaman Masuk
                  </NuxtLink>
                </div>
              </div>

              <!-- Form State -->
              <div v-else>
                <div class="mb-6">
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    Pemulihan Sandi
                  </h2>
                  <p class="text-xs text-slate-500 dark:text-neutral-400">
                    Masukkan alamat email akun Cek Naskah Anda.
                  </p>
                </div>

                <form
                  class="space-y-4"
                  @submit.prevent="handleForgotPassword"
                >
                  <div>
                    <label
                      for="email"
                      class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5"
                    >
                      Alamat Email
                    </label>
                    <div class="relative">
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
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                      <input
                        id="email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        placeholder="nama@email.com"
                        class="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                        :class="fieldErrors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                      >
                    </div>
                    <p
                      v-if="fieldErrors.email"
                      class="mt-1.5 text-xs text-red-500 font-medium"
                    >
                      {{ fieldErrors.email }}
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
                    <span>{{ loading ? 'Mengirim Tautan...' : 'Kirim Tautan Pemulihan' }}</span>
                  </button>
                </form>

                <div class="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800 text-center">
                  <NuxtLink
                    to="/login"
                    class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Kembali ke Halaman Masuk
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
