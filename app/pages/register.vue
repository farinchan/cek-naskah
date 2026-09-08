<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()
const { user, loading, error, success, clearMessages, register, loginWithGoogle } = useAuth()
const { settings, getWhatsappUrl } = useAppSettings()

useSeoMeta({
  title: 'Daftar Akun — Cek Naskah',
  description: 'Daftar akun Cek Naskah untuk akses Cek Plagiarisme iThenticate/Turnitin No-Repo, AI Writer Detector, Ambil Artikel Scopus, dan Parafrase Manual.',
  robots: 'noindex, follow'
})

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const agreeTerms = ref(true)
const fieldErrors = ref<Record<string, string>>({})

onMounted(() => {
  clearMessages()
  if (route.query.error === 'google_auth_failed') {
    error.value = 'Proses pendaftaran dengan Google dibatalkan atau gagal. Silakan coba lagi.'
  }
})

const handleGoogleRegister = () => {
  if (!settings.value.allowNewRegistration) {
    error.value = 'Pendaftaran pengguna baru sedang dinonaktifkan oleh administrator.'
    return
  }
  loginWithGoogle('/')
}

const handleRegister = async () => {
  fieldErrors.value = {}
  clearMessages()

  if (!settings.value.allowNewRegistration) {
    error.value = 'Pendaftaran pengguna baru sedang dinonaktifkan oleh administrator.'
    return
  }

  const parseResult = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    agreeTerms: agreeTerms.value
  })

  if (!parseResult.success) {
    fieldErrors.value = extractZodErrors(parseResult.error)
    return
  }

  const formattedPhone = formatE164Phone(parseResult.data.phone)
  const result = await register(
    parseResult.data.email,
    parseResult.data.password,
    parseResult.data.name,
    formattedPhone
  )
  if (result.success) {
    const destination = settings.value.requireEmailVerification ? '/profile' : '/'
    setTimeout(() => {
      navigateTo(destination)
    }, 1800)
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
          <!-- Left Column: Value Prop & 4 Products Checklist -->
          <div class="lg:col-span-7 space-y-8">
            <div class="space-y-5">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                <span>Daftar Akun Baru di </span>
                <span class="text-primary-600 dark:text-primary-400">Cek Naskah</span>
              </h1>

              <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Solusi terlengkap naskah akademik Anda: bebas plagiasi dengan garansi No-Repository, deteksi AI akurat, akses jurnal Scopus Q1-Q4, dan layanan parafrase profesional.
              </p>
            </div>

            <!-- Benefits Checklist: 4 Products -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg
                    class="w-4 h-4"
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
                </div>
                <div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white block">Cek Plagiarisme iThenticate / Turnitin (100% No-Repo)</span>
                  <span class="text-xs text-slate-500 dark:text-neutral-400">Pengecekan resmi standar kampus tanpa naskah tersimpan di database sistem.</span>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg
                    class="w-4 h-4"
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
                </div>
                <div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white block">AI Writer Detector Turnitin</span>
                  <span class="text-xs text-slate-500 dark:text-neutral-400">Deteksi akurat teks buatan ChatGPT, Claude, dan LLM lain sesuai kriteria jurnal.</span>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg
                    class="w-4 h-4"
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
                </div>
                <div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white block">Ambil Artikel Scopus (Q1 - Q4)</span>
                  <span class="text-xs text-slate-500 dark:text-neutral-400">Akses dan download artikel jurnal ilmiah bereputasi full-text PDF beserta sitasi.</span>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg
                    class="w-4 h-4"
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
                </div>
                <div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white block">Parafrase Manual oleh Tim Editor Akademik</span>
                  <span class="text-xs text-slate-500 dark:text-neutral-400">Dikerjakan langsung oleh manusia untuk menurunkan similarity index tanpa mengubah substansi.</span>
                </div>
              </div>
            </div>

            <!-- Trust Metrics -->
            <div class="grid grid-cols-3 gap-4 pt-2">
              <div class="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 text-center">
                <span class="text-2xl font-bold text-slate-900 dark:text-white block">25K+</span>
                <span class="text-xs text-slate-500 dark:text-neutral-400">Naskah Diuji</span>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 text-center">
                <span class="text-2xl font-bold text-slate-900 dark:text-white block">100%</span>
                <span class="text-xs text-slate-500 dark:text-neutral-400">Garansi No-Repo</span>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 text-center">
                <span class="text-2xl font-bold text-slate-900 dark:text-white block">&lt; 15 Mnt</span>
                <span class="text-xs text-slate-500 dark:text-neutral-400">Proses Cepat</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Register Card -->
          <div class="lg:col-span-5">
            <div class="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-neutral-800 shadow-xl shadow-primary-500/5">
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Daftar Akun
                  </h2>
                  <NuxtLink
                    to="/login"
                    class="text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                  >
                    Masuk →
                  </NuxtLink>
                </div>
                <p class="text-xs text-slate-500 dark:text-neutral-400">
                  {{ settings.allowNewRegistration ? 'Lengkapi formulir singkat di bawah ini untuk memulai.' : 'Pendaftaran pengguna baru saat ini dinonaktifkan oleh administrator.' }}
                </p>
              </div>

              <!-- Pendaftaran Ditutup Notice -->
              <div
                v-if="!settings.allowNewRegistration"
                class="py-6 text-center space-y-4"
              >
                <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                    Pendaftaran Akun Baru Ditutup
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
                    Mohon maaf, saat ini pendaftaran akun baru sedang dinonaktifkan oleh administrator. Silakan masuk jika Anda sudah memiliki akun atau hubungi Layanan Pelanggan kami.
                  </p>
                </div>
                <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <NuxtLink
                    to="/login"
                    class="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Masuk ke Akun
                  </NuxtLink>
                  <a
                    :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin bertanya seputar pendaftaran akun baru')"
                    target="_blank"
                    class="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-bold rounded-xl transition-colors text-center"
                  >
                    Hubungi CS WhatsApp
                  </a>
                </div>
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
                v-if="!user && settings.allowNewRegistration"
                class="space-y-4 mb-5"
              >
                <button
                  type="button"
                  :disabled="loading"
                  class="w-full py-3 px-4 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  @click="handleGoogleRegister"
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
                  <span>Daftar dengan Google</span>
                </button>

                <div class="relative flex items-center justify-center">
                  <div class="w-full border-t border-slate-200 dark:border-neutral-800" />
                  <span class="absolute bg-white dark:bg-neutral-900 px-3 text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    atau daftar dengan email
                  </span>
                </div>
              </div>

              <!-- Register Form -->
              <form
                v-if="!user && settings.allowNewRegistration"
                class="space-y-4"
                @submit.prevent="handleRegister"
              >
                <!-- Name -->
                <div>
                  <label
                    for="name"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
                  >
                    Nama Lengkap
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="name"
                      v-model="name"
                      type="text"
                      autocomplete="name"
                      placeholder="Nama Kamu"
                      class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                      :class="fieldErrors.name ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                    >
                  </div>
                  <p
                    v-if="fieldErrors.name"
                    class="mt-1 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.name }}
                  </p>
                </div>

                <!-- Email -->
                <div>
                  <label
                    for="email"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
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
                      class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                      :class="fieldErrors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                    >
                  </div>
                  <p
                    v-if="fieldErrors.email"
                    class="mt-1 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.email }}
                  </p>
                </div>

                <!-- Phone -->
                <div>
                  <label
                    for="phone"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
                  >
                    Nomor Telepon / WhatsApp
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      id="phone"
                      v-model="phone"
                      type="tel"
                      autocomplete="tel"
                      placeholder="Contoh: +6281234567890"
                      class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                      :class="fieldErrors.phone ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                    >
                  </div>
                  <p
                    v-if="fieldErrors.phone"
                    class="mt-1 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.phone }}
                  </p>
                  <p
                    v-else
                    class="mt-1 text-xs text-slate-400 dark:text-neutral-500"
                  >
                    Format awalan + tanpa spasi (contoh: +6281234567890)
                  </p>
                </div>

                <!-- Password -->
                <div>
                  <label
                    for="password"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
                  >
                    Kata Sandi
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Minimal 8 karakter"
                      class="block w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
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
                    class="mt-1 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.password }}
                  </p>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label
                    for="confirm-password"
                    class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
                  >
                    Konfirmasi Kata Sandi
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <input
                      id="confirm-password"
                      v-model="confirmPassword"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Ulangi kata sandi"
                      class="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all"
                      :class="fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-700 focus:ring-primary-500/20 focus:border-primary-500'"
                    >
                  </div>
                  <p
                    v-if="fieldErrors.confirmPassword"
                    class="mt-1 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.confirmPassword }}
                  </p>
                </div>

                <!-- Agree Terms -->
                <div class="pt-1">
                  <div class="flex items-start">
                    <input
                      id="terms"
                      v-model="agreeTerms"
                      type="checkbox"
                      class="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    >
                    <label
                      for="terms"
                      class="ml-2 block text-xs text-slate-600 dark:text-neutral-400 cursor-pointer leading-relaxed"
                    >
                      Saya menyetujui <a
                        href="#"
                        class="text-primary-600 dark:text-primary-400 font-semibold"
                      >Syarat & Ketentuan</a> serta Kebijakan Privasi.
                    </label>
                  </div>
                  <p
                    v-if="fieldErrors.agreeTerms"
                    class="mt-1 text-xs text-red-500 font-medium"
                  >
                    {{ fieldErrors.agreeTerms }}
                  </p>
                </div>

                <!-- Submit Button -->
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
                  <span>{{ loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang' }}</span>
                </button>
              </form>

              <div
                v-if="settings.allowNewRegistration"
                class="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800 text-center"
              >
                <p class="text-xs text-slate-500 dark:text-neutral-400">
                  Sudah memiliki akun?
                  <NuxtLink
                    to="/login"
                    class="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-1"
                  >
                    Masuk ke akun
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
