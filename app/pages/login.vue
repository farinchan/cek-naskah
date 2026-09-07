<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()
const { user, loading, error, success, clearMessages, fetchUser, login, logout, loginWithGoogle } = useAuth()

useSeoMeta({
  title: 'Masuk Akun — Cek Naskah',
  description: 'Masuk ke Cek Naskah untuk Cek Plagiarisme iThenticate/Turnitin No-Repo, AI Writer Detector, Ambil Artikel Scopus, dan Parafrase Manual.'
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const fieldErrors = ref<Record<string, string>>({})

onMounted(async () => {
  clearMessages()
  if (route.query.error === 'google_auth_failed') {
    error.value = 'Proses autentikasi dengan Google dibatalkan atau gagal. Silakan coba lagi.'
  }
  await fetchUser()
})

const handleGoogleLogin = () => {
  loginWithGoogle('/')
}

const handleLogin = async () => {
  fieldErrors.value = {}
  clearMessages()

  const parseResult = loginSchema.safeParse({
    email: email.value,
    password: password.value
  })

  if (!parseResult.success) {
    fieldErrors.value = extractZodErrors(parseResult.error)
    return
  }

  const result = await login(parseResult.data.email, parseResult.data.password)
  if (result.success) {
    setTimeout(() => {
      navigateTo('/')
    }, 1200)
  }
}

const handleLogout = async () => {
  await logout()
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
          <!-- Left Column: Branding, Value Proposition & 4 Products -->
          <div class="lg:col-span-7 space-y-8">
            <div class="space-y-5">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                <span>Masuk & Kelola </span>
                <span class="text-primary-600 dark:text-primary-400">Naskah Ilmiah Anda</span>
              </h1>

              <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Satu akun untuk seluruh kebutuhan publikasi ilmiah Anda: Cek Plagiarisme iThenticate/Turnitin No-Repository, AI Writer Detector, Ambil Artikel Scopus, dan Parafrase Manual.
              </p>
            </div>

            <!-- Features Highlights: 4 Products -->
            <div class="grid sm:grid-cols-2 gap-4 pt-2">
              <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 class="font-semibold text-slate-900 dark:text-white text-base mb-1">
                  Turnitin No-Repository
                </h2>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Cek similarity iThenticate & Turnitin resmi tanpa naskah tersimpan di database.
                </p>
              </div>

              <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 class="font-semibold text-slate-900 dark:text-white text-base mb-1">
                  AI Writer Detector
                </h2>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Deteksi skor ChatGPT, Claude, dan AI generator berstandar algoritma Turnitin.
                </p>
              </div>

              <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 class="font-semibold text-slate-900 dark:text-white text-base mb-1">
                  Ambil Artikel Scopus
                </h2>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Unduh full PDF artikel jurnal ilmiah Scopus (Q1-Q4) lengkap dengan metadata sitasi.
                </p>
              </div>

              <div class="p-5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 class="font-semibold text-slate-900 dark:text-white text-base mb-1">
                  Parafrase Manual
                </h2>
                <p class="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Dikerjakan manual oleh tim editor akademik manusia untuk menurunkan similarity.
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Login Card -->
          <div class="lg:col-span-5">
            <div class="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-neutral-800 shadow-xl shadow-primary-500/5">
              <!-- Active User Banner -->
              <div
                v-if="user"
                class="text-center py-4"
              >
                <div class="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                </div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Selamat Datang Kembali!
                </h2>
                <p class="text-xs text-slate-500 dark:text-neutral-400 mb-1">
                  Anda sedang masuk sebagai:
                </p>
                <p class="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-6">
                  {{ user.name || user.email }}
                </p>

                <div class="space-y-3">
                  <NuxtLink
                    to="/"
                    class="block w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl text-center shadow-lg shadow-primary-600/25 transition-all"
                  >
                    Buka Beranda & Layanan
                  </NuxtLink>
                  <button
                    type="button"
                    :disabled="loading"
                    class="w-full py-3 px-4 bg-slate-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    @click="handleLogout"
                  >
                    Keluar (Logout)
                  </button>
                </div>
              </div>

              <!-- Form Header -->
              <div
                v-else
                class="mb-6"
              >
                <div class="flex items-center justify-between mb-2">
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Masuk Akun
                  </h2>
                  <NuxtLink
                    to="/register"
                    class="text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                  >
                    Daftar Baru →
                  </NuxtLink>
                </div>
                <p class="text-xs text-slate-500 dark:text-neutral-400">
                  Masukkan email dan kata sandi yang telah terdaftar.
                </p>
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

              <div
                v-if="success"
                class="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5"
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
                  {{ success }}
                </div>
              </div>

              <!-- Google OAuth Button -->
              <div
                v-if="!user"
                class="space-y-4 mb-5"
              >
                <button
                  type="button"
                  :disabled="loading"
                  class="w-full py-3 px-4 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  @click="handleGoogleLogin"
                >
                  <svg
                    class="w-5 h-5"
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
                  <span>Masuk dengan Google</span>
                </button>

                <div class="relative flex items-center justify-center">
                  <div class="w-full border-t border-slate-200 dark:border-neutral-800" />
                  <span class="absolute bg-white dark:bg-neutral-900 px-3 text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    atau masuk dengan email
                  </span>
                </div>
              </div>

              <!-- Login Form -->
              <form
                v-if="!user"
                class="space-y-4"
                @submit.prevent="handleLogin"
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

                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label
                      for="password"
                      class="block text-xs font-semibold text-slate-700 dark:text-neutral-300"
                    >
                      Kata Sandi
                    </label>
                    <NuxtLink
                      to="/forgot-password"
                      class="text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                    >
                      Lupa sandi?
                    </NuxtLink>
                  </div>
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      placeholder="••••••••"
                      class="block w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                      :class="fieldErrors.password ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                    >
                    <button
                      type="button"
                      aria-label="Tampilkan sandi"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                      @click="showPassword = !showPassword"
                    >
                      <svg
                        v-if="!showPassword"
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    </button>
                  </div>
                  <p
                    v-if="fieldErrors.password"
                    class="mt-1.5 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.password }}
                  </p>
                </div>

                <div class="flex items-center pt-1">
                  <input
                    id="remember"
                    v-model="rememberMe"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  >
                  <label
                    for="remember"
                    class="ml-2 block text-xs text-slate-600 dark:text-neutral-400 cursor-pointer"
                  >
                    Ingat sesi saya
                  </label>
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
                  <span>{{ loading ? 'Memproses...' : 'Masuk Sekarang' }}</span>
                </button>
              </form>

              <div class="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800 text-center">
                <p class="text-xs text-slate-500 dark:text-neutral-400">
                  Belum punya akun?
                  <NuxtLink
                    to="/register"
                    class="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-1"
                  >
                    Daftar gratis
                  </NuxtLink>
                </p>
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
