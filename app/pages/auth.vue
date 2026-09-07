<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Models } from 'appwrite'
import { account, ID, OAuthProvider } from '~/utils/appwrite.js'

useSeoMeta({
  title: 'Appwrite Auth — Cek Naskah',
  description: 'Appwrite Authentication (Login, Register, Logout) for Cek Naskah'
})

const route = useRoute()
const loggedInUser = ref<Models.User<Models.Preferences> | null>(null)
const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const clearMessages = () => {
  errorMessage.value = null
  successMessage.value = null
  fieldErrors.value = {}
}

const checkCurrentUser = async () => {
  try {
    loggedInUser.value = await account.get()
  } catch {
    loggedInUser.value = null
  }
}

const loginGoogle = () => {
  clearMessages()
  try {
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'
    account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: `${origin}/auth`,
      failure: `${origin}/auth?error=google_auth_failed`
    })
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  }
}

onMounted(() => {
  if (route.query.error === 'google_auth_failed') {
    errorMessage.value = 'Proses autentikasi dengan Google dibatalkan atau gagal.'
  }
  checkCurrentUser()
})

const login = async (emailVal: string, passwordVal: string) => {
  clearMessages()

  const parseResult = authTestLoginSchema.safeParse({
    email: emailVal,
    password: passwordVal
  })

  if (!parseResult.success) {
    fieldErrors.value = extractZodErrors(parseResult.error)
    return
  }

  loading.value = true
  try {
    await account.createEmailPasswordSession({
      email: parseResult.data.email,
      password: parseResult.data.password
    })
    loggedInUser.value = await account.get()
    successMessage.value = `Berhasil masuk sebagai ${loggedInUser.value.name || loggedInUser.value.email}`
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

const register = async () => {
  clearMessages()

  const parseResult = authTestRegisterSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value
  })

  if (!parseResult.success) {
    fieldErrors.value = extractZodErrors(parseResult.error)
    return
  }

  loading.value = true
  try {
    await account.create({
      userId: ID.unique(),
      email: parseResult.data.email,
      password: parseResult.data.password,
      name: parseResult.data.name
    })
    await login(parseResult.data.email, parseResult.data.password)
    successMessage.value = 'Registrasi berhasil dan Anda telah masuk.'
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  clearMessages()
  loading.value = true
  try {
    await account.deleteSession({ sessionId: 'current' })
    loggedInUser.value = null
    successMessage.value = 'Berhasil keluar dari sesi.'
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1 max-w-lg mx-auto w-full px-4 py-12 flex flex-col justify-center">
      <div class="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-4 mb-6">
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">
              Appwrite Auth Test
            </h1>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Testing module login, register, dan logout
            </p>
          </div>
          <span
            class="px-2.5 py-1 text-xs font-semibold rounded-full"
            :class="loggedInUser ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-slate-200 text-slate-700 dark:bg-neutral-800 dark:text-neutral-400'"
          >
            {{ loggedInUser ? 'Active Session' : 'No Session' }}
          </span>
        </div>

        <!-- Status display matching specification -->
        <div class="mb-6 p-4 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
          <p class="text-xs font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Status Autentikasi:
          </p>
          <p class="text-sm font-semibold text-slate-900 dark:text-white">
            {{ loggedInUser ? `Logged in as ${loggedInUser.name || loggedInUser.email}` : 'Not logged in' }}
          </p>
          <p
            v-if="loggedInUser?.email"
            class="text-xs text-slate-500 dark:text-neutral-400 mt-1"
          >
            Email: {{ loggedInUser.email }}
          </p>
        </div>

        <!-- Alert messages -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-600 dark:text-emerald-300"
        >
          {{ successMessage }}
        </div>

        <!-- Auth Form -->
        <form
          class="space-y-4"
          @submit.prevent
        >
          <div>
            <label
              for="auth-name"
              class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
            >
              Name (untuk pendaftaran)
            </label>
            <input
              id="auth-name"
              v-model="name"
              type="text"
              placeholder="Name"
              class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white transition-all"
              :class="fieldErrors.name ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-800 focus:ring-primary-500'"
            >
            <p
              v-if="fieldErrors.name"
              class="mt-1 text-xs text-red-500 font-medium"
            >
              {{ fieldErrors.name }}
            </p>
          </div>

          <div>
            <label
              for="auth-email"
              class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
            >
              Email
            </label>
            <input
              id="auth-email"
              v-model="email"
              type="email"
              placeholder="Email"
              class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white transition-all"
              :class="fieldErrors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-800 focus:ring-primary-500'"
            >
            <p
              v-if="fieldErrors.email"
              class="mt-1 text-xs text-red-500 font-medium"
            >
              {{ fieldErrors.email }}
            </p>
          </div>

          <div>
            <label
              for="auth-password"
              class="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1"
            >
              Password
            </label>
            <input
              id="auth-password"
              v-model="password"
              type="password"
              placeholder="Password"
              class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white transition-all"
              :class="fieldErrors.password ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-slate-200 dark:border-neutral-800 focus:ring-primary-500'"
            >
            <p
              v-if="fieldErrors.password"
              class="mt-1 text-xs text-red-500 font-medium"
            >
              {{ fieldErrors.password }}
            </p>
          </div>

          <!-- Google OAuth Button -->
          <button
            type="button"
            :disabled="loading"
            class="w-full py-2.5 px-3 bg-white dark:bg-neutral-950 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            @click="loginGoogle"
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
            <span>Lanjutkan dengan Google</span>
          </button>

          <!-- Buttons: Login, Register, Logout -->
          <div class="grid grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              :disabled="loading"
              class="w-full py-2.5 px-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-primary-600/30 cursor-pointer"
              @click="login(email, password)"
            >
              {{ loading ? '...' : 'Login' }}
            </button>

            <button
              type="button"
              :disabled="loading"
              class="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 disabled:opacity-50 text-white dark:text-slate-900 text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
              @click="register"
            >
              Register
            </button>

            <button
              type="button"
              :disabled="loading"
              class="w-full py-2.5 px-3 bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 dark:bg-neutral-800 dark:hover:bg-red-950/50 dark:text-neutral-300 dark:hover:text-red-400 disabled:opacity-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </form>

        <div class="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800 flex justify-between text-xs text-slate-500 dark:text-neutral-400">
          <NuxtLink
            to="/login"
            class="hover:text-primary-600 dark:hover:text-primary-400 underline underline-offset-2"
          >
            Halaman Login Lengkap
          </NuxtLink>
          <NuxtLink
            to="/"
            class="hover:text-primary-600 dark:hover:text-primary-400 underline underline-offset-2"
          >
            Kembali ke Beranda
          </NuxtLink>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
