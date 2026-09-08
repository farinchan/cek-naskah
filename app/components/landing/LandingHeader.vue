<script setup lang="ts">
const { user, userAvatar, isAdmin, fetchUser, logout } = useAuth()
const { rawPhone, supportEmail, getWhatsappUrl } = useAppSettings()

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val: boolean) => {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

const toggleColorMode = () => {
  isDark.value = !isDark.value
}

// Mobile menu toggle
const isMobileMenuOpen = ref(false)

// User Dropdown State & Handlers
const isUserDropdownOpen = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)
let closeDropdownTimer: ReturnType<typeof setTimeout> | null = null

const openDropdown = () => {
  if (closeDropdownTimer) {
    clearTimeout(closeDropdownTimer)
    closeDropdownTimer = null
  }
  isUserDropdownOpen.value = true
}

const scheduleCloseDropdown = () => {
  if (closeDropdownTimer) clearTimeout(closeDropdownTimer)
  closeDropdownTimer = setTimeout(() => {
    isUserDropdownOpen.value = false
  }, 200)
}

const toggleUserDropdown = () => {
  if (closeDropdownTimer) {
    clearTimeout(closeDropdownTimer)
    closeDropdownTimer = null
  }
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const closeUserDropdown = () => {
  if (closeDropdownTimer) {
    clearTimeout(closeDropdownTimer)
    closeDropdownTimer = null
  }
  isUserDropdownOpen.value = false
}

const handleLogout = async () => {
  closeUserDropdown()
  await logout()
  navigateTo('/login')
}

// Close dropdown on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    closeUserDropdown()
  }
}

// Close dropdown on Escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeUserDropdown()
  }
}

// Close dropdown on route navigation
const route = useRoute()
watch(() => route.fullPath, () => {
  closeUserDropdown()
  isMobileMenuOpen.value = false
})

onMounted(async () => {
  await fetchUser()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
  if (closeDropdownTimer) clearTimeout(closeDropdownTimer)
})
</script>

<template>
  <header
    id="_header_social_links_h11_001"
    class="relative"
  >
    <!-- Top Social Bar -->
    <div class="bg-slate-900 dark:bg-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-10">
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <a
              :href="`mailto:${supportEmail}`"
              class="hover:text-white transition-colors flex items-center gap-1.5"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {{ supportEmail }}
            </a>
            <span class="hidden sm:inline">|</span>
            <a
              :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin tanya informasi layanan')"
              target="_blank"
              class="hidden sm:flex hover:text-white transition-colors items-center gap-1.5"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {{ rawPhone }}
            </a>
          </div>

          <div class="flex items-center gap-3">
            <a
              href="#"
              aria-label="Twitter"
              class="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              ><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              class="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              ><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              class="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              ><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
            <a
              href="#"
              aria-label="GitHub"
              class="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              ><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <div class="bg-white dark:bg-neutral-950 border-b border-slate-100 dark:border-neutral-900 sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-neutral-950/95">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white"
          >
            <div class="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary-500/20">
              CN
            </div>
            <span class="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Cek Naskah</span>
          </NuxtLink>

          <!-- Navigation Desktop -->
          <nav class="hidden lg:flex items-center gap-8">
            <NuxtLink
              to="/"
              class="text-sm font-medium text-slate-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              Beranda
            </NuxtLink>
            <NuxtLink
              to="/charge"
              class="text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              Charge
            </NuxtLink>
            <NuxtLink
              to="/about-us"
              class="text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              About Us
            </NuxtLink>
            <NuxtLink
              to="/testimony"
              class="text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              Testimoni
            </NuxtLink>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-2">
            <!-- Dark mode toggle -->
            <button
              type="button"
              aria-label="Toggle Color Mode"
              class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              @click="toggleColorMode"
            >
              <svg
                v-if="isDark"
                class="w-5 h-5 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-slate-600 dark:text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>

            <!-- User Profile & Dropdown Menu Desktop -->
            <div
              v-if="user"
              ref="userDropdownRef"
              class="relative"
              @mouseenter="openDropdown"
              @mouseleave="scheduleCloseDropdown"
            >
              <!-- Avatar Trigger Button (Click / Hover) -->
              <button
                type="button"
                aria-label="Menu Akun Pengguna"
                :aria-expanded="isUserDropdownOpen"
                aria-haspopup="true"
                class="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/80 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 transition-all cursor-pointer select-none group"
                :class="{ 'ring-2 ring-primary-500/20 border-primary-500/50 bg-white dark:bg-neutral-800': isUserDropdownOpen }"
                @click="toggleUserDropdown"
              >
                <!-- Avatar -->
                <div class="w-7 h-7 rounded-lg bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden shadow-sm shadow-primary-500/20">
                  <img
                    v-if="userAvatar"
                    :src="userAvatar"
                    :alt="user.name || 'Profil'"
                    class="w-full h-full object-cover"
                  >
                  <span v-else>{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</span>
                </div>

                <!-- Display Name & Chevron -->
                <div class="hidden sm:flex items-center gap-1.5 text-left">
                  <span class="text-xs font-semibold text-slate-800 dark:text-neutral-200 max-w-[110px] md:max-w-[130px] truncate">
                    {{ user.name || user.email }}
                  </span>
                  <svg
                    class="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 transition-transform duration-200"
                    :class="{ 'rotate-180': isUserDropdownOpen }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <!-- Dropdown Menu Content -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="transform scale-95 opacity-0 -translate-y-1"
                enter-to-class="transform scale-100 opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="transform scale-100 opacity-100 translate-y-0"
                leave-to-class="transform scale-95 opacity-0 -translate-y-1"
              >
                <div
                  v-if="isUserDropdownOpen"
                  class="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xl shadow-slate-900/10 dark:shadow-neutral-950/50 overflow-hidden z-50 py-1.5 focus:outline-none"
                  @mouseenter="openDropdown"
                  @mouseleave="scheduleCloseDropdown"
                >
                  <!-- Header: Info Pengguna -->
                  <div class="px-4 py-3 border-b border-slate-100 dark:border-neutral-800/80 bg-slate-50/60 dark:bg-neutral-800/30">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-sm shadow-primary-500/20">
                        <img
                          v-if="userAvatar"
                          :src="userAvatar"
                          :alt="user.name || 'Profil'"
                          class="w-full h-full object-cover"
                        >
                        <span v-else>{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {{ user.name || 'Pengguna' }}
                        </div>
                        <div class="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          {{ user.email }}
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="user.prefs?.pekerjaan || user.prefs?.afiliasi || user.prefs?.affiliasi"
                      class="mt-2 text-[11px] font-medium text-primary-600 dark:text-primary-400 truncate"
                    >
                      {{ [user.prefs?.pekerjaan, user.prefs?.afiliasi || user.prefs?.affiliasi].filter(Boolean).join(' • ') }}
                    </div>
                  </div>

                  <!-- Navigasi Menu Dropdown -->
                  <div class="p-1.5 space-y-0.5">
                    <!-- Menu Profile -->
                    <NuxtLink
                      to="/profile"
                      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      @click="closeUserDropdown"
                    >
                      <svg
                        class="w-4 h-4 text-slate-400 dark:text-neutral-500"
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
                      <div class="flex-1">
                        <span>Profil Saya</span>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
                        Akun
                      </span>
                    </NuxtLink>

                    <!-- Menu Keamanan & Sandi -->
                    <NuxtLink
                      to="/profile"
                      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      @click="closeUserDropdown"
                    >
                      <svg
                        class="w-4 h-4 text-slate-400 dark:text-neutral-500"
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
                      <div class="flex-1">
                        <span>Keamanan & 2FA</span>
                      </div>
                    </NuxtLink>

                    <!-- Menu Admin Panel (Khusus akun dengan label 'admin') -->
                    <NuxtLink
                      v-if="isAdmin"
                      to="/admin/setting"
                      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50/80 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/50 transition-colors"
                      @click="closeUserDropdown"
                    >
                      <svg
                        class="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div class="flex-1">
                        <span>Panel Admin</span>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                        Admin
                      </span>
                    </NuxtLink>

                    <!-- Garis Pemisah -->
                    <div class="my-1 border-t border-slate-100 dark:border-neutral-800" />

                    <!-- Menu Keluar (Logout) -->
                    <button
                      type="button"
                      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                      @click="handleLogout"
                    >
                      <svg
                        class="w-4 h-4 text-red-500 shrink-0"
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
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <div
              v-else
              class="flex items-center gap-2"
            >
              <NuxtLink
                to="/login"
                class="hidden sm:inline-flex text-sm font-semibold text-slate-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 transition-colors"
              >
                Masuk
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="h-10 px-5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center shadow-sm shadow-primary-500/20"
              >
                Daftar Akun
              </NuxtLink>
            </div>

            <!-- Mobile Menu Toggle Button -->
            <button
              type="button"
              aria-label="Open Mobile Menu"
              class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="!isMobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Dropdown Navigation -->
        <div
          v-if="isMobileMenuOpen"
          class="lg:hidden py-4 border-t border-slate-100 dark:border-neutral-900 space-y-2"
        >
          <NuxtLink
            to="/"
            class="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900"
            @click="isMobileMenuOpen = false"
          >
            Beranda
          </NuxtLink>
          <NuxtLink
            to="/charge"
            class="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900"
            @click="isMobileMenuOpen = false"
          >
            Charge
          </NuxtLink>
          <NuxtLink
            to="/about-us"
            class="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900"
            @click="isMobileMenuOpen = false"
          >
            About Us
          </NuxtLink>
          <NuxtLink
            to="/testimony"
            class="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900"
            @click="isMobileMenuOpen = false"
          >
            Testimoni
          </NuxtLink>

          <!-- Mobile Auth Actions -->
          <div
            v-if="user"
            class="pt-2 border-t border-slate-100 dark:border-neutral-900 space-y-2"
          >
            <NuxtLink
              to="/profile"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <div class="w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  :alt="user.name || 'Profil'"
                  class="w-full h-full object-cover"
                >
                <span v-else>{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-800 dark:text-neutral-200 truncate">
                  {{ user.name || 'Profil Pengguna' }}
                </div>
                <div class="text-xs text-slate-500 dark:text-neutral-400 truncate">
                  Buka Pengaturan Profil
                </div>
              </div>
              <svg
                class="w-4 h-4 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </NuxtLink>
            <NuxtLink
              v-if="isAdmin"
              to="/admin/setting"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-sm font-semibold text-primary-700 dark:text-primary-300 transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Panel Admin (Pengaturan)</span>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                Admin
              </span>
            </NuxtLink>
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20"
              @click="logout(); isMobileMenuOpen = false"
            >
              Keluar (Logout)
            </button>
          </div>
          <div
            v-else
            class="pt-2 border-t border-slate-100 dark:border-neutral-900 space-y-1"
          >
            <NuxtLink
              to="/login"
              class="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900"
              @click="isMobileMenuOpen = false"
            >
              Masuk (Login)
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="block px-3 py-2 rounded-lg text-base font-medium text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20"
              @click="isMobileMenuOpen = false"
            >
              Daftar Akun Baru
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
