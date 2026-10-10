<script setup lang="ts">
const route = useRoute()
const { user, userAvatar, isAdmin } = useAuth()

interface NavItem {
  id: string
  label: string
  to?: string
  icon: string
  badge?: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  {
    id: 'setting',
    label: 'Setting',
    to: '/admin/setting',
    icon: 'i-lucide-settings'
  },
  {
    id: 'users',
    label: 'Pengguna & Akses',
    to: '/admin/users',
    icon: 'i-lucide-users'
  },
  {
    id: 'services',
    label: 'Layanan & Tarif',
    to: '/admin/services',
    icon: 'i-lucide-banknote'
  },
  {
    id: 'manuscripts',
    label: 'Kelola Naskah',
    to: '/admin/naskah',
    icon: 'i-lucide-file-text'
  },
  {
    id: 'testimonials',
    label: 'Testimoni & Review',
    to: '/admin/testimonials',
    icon: 'i-lucide-message-square-quote'
  },
  {
    id: 'stats',
    label: 'Statistik & Log',
    icon: 'i-lucide-bar-chart-3',
    badge: 'Segera',
    disabled: true
  }
]

const isActive = (itemTo?: string): boolean => {
  if (!itemTo) return false
  if (route.path === itemTo) return true
  if (itemTo !== '/' && route.path.startsWith(itemTo + '/')) return true
  return false
}

// Mobile expanded menu toggle
const isMobileExpanded = ref(false)
</script>

<template>
  <aside>
    <!-- MOBILE VIEW (Screens < md): Sleek Horizontal Tabs + Expandable Card -->
    <div class="block md:hidden mb-6 space-y-3">
      <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs p-2">
        <div class="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold text-slate-500 dark:text-neutral-400">
          <div class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-shield-alert"
              class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400"
            />
            <span>Panel Admin</span>
          </div>
          <button
            type="button"
            class="text-[11px] font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 cursor-pointer"
            @click="isMobileExpanded = !isMobileExpanded"
          >
            <span>{{ isMobileExpanded ? 'Sembunyikan Menu' : 'Menu Lengkap' }}</span>
            <UIcon
              :name="isMobileExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-3.5 h-3.5"
            />
          </button>
        </div>

        <!-- Horizontal scrollable quick nav -->
        <div class="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <template
            v-for="item in navItems"
            :key="item.id"
          >
            <NuxtLink
              v-if="item.to && !item.disabled"
              :to="item.to"
              class="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              :class="isActive(item.to)
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/25'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'"
            >
              <UIcon
                :name="item.icon"
                class="w-3.5 h-3.5"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </template>
        </div>

        <!-- Mobile Expanded Drawer -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="isMobileExpanded"
            class="pt-3 mt-2 border-t border-slate-100 dark:border-neutral-800/80 space-y-2"
          >
            <!-- User Status Card in Mobile -->
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-primary-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    v-if="userAvatar"
                    :src="userAvatar"
                    :alt="user?.name || 'Admin'"
                    class="w-full h-full object-cover"
                  >
                  <span v-else>{{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}</span>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ user?.name || 'Administrator' }}
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                    {{ user?.email }}
                  </div>
                </div>
              </div>
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0"
                :class="isAdmin
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
              >
                {{ isAdmin ? 'Admin' : 'Tamu' }}
              </span>
            </div>

            <!-- Quick External Links in Mobile -->
            <div class="grid grid-cols-2 gap-2 pt-1">
              <NuxtLink
                to="/profile"
                class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <UIcon
                  name="i-lucide-user"
                  class="w-3.5 h-3.5"
                />
                <span>Profil</span>
              </NuxtLink>
              <NuxtLink
                to="/"
                class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <UIcon
                  name="i-lucide-arrow-left"
                  class="w-3.5 h-3.5"
                />
                <span>Ke Beranda</span>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- DESKTOP VIEW (Screens >= md): Sticky Vertical Navigation Cards -->
    <div class="hidden md:block space-y-4">
      <!-- Card Navigasi Menu Admin -->
      <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 space-y-1.5">
        <div class="px-2.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center justify-between">
          <span>Menu Admin</span>
          <span
            class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
            :class="isAdmin
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
          >
            {{ isAdmin ? 'Admin' : 'Tamu' }}
          </span>
        </div>

        <!-- Loop Menu Navigasi -->
        <template
          v-for="item in navItems"
          :key="item.id"
        >
          <!-- Active / Inactive Nav Link -->
          <NuxtLink
            v-if="item.to && !item.disabled"
            :to="item.to"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            :class="isActive(item.to)
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
              : 'font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <UIcon
                :name="item.icon"
                class="w-4 h-4 shrink-0"
                :class="isActive(item.to) ? 'text-white' : 'text-slate-400 dark:text-neutral-500'"
              />
              <span class="truncate">{{ item.label }}</span>
            </div>
            <span
              v-if="isActive(item.to)"
              class="w-2 h-2 rounded-full bg-white shadow-xs shrink-0"
            />
          </NuxtLink>

          <!-- Disabled Menu Item (Segera) -->
          <div
            v-else
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-400 dark:text-neutral-500 cursor-not-allowed select-none opacity-80"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <UIcon
                :name="item.icon"
                class="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-600"
              />
              <span class="truncate">{{ item.label }}</span>
            </div>
            <span
              v-if="item.badge"
              class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 font-medium shrink-0"
            >
              {{ item.badge }}
            </span>
          </div>
        </template>

        <!-- Garis Pemisah & Navigasi Luar -->
        <div class="pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800/80 space-y-1">
          <NuxtLink
            to="/profile"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <UIcon
              name="i-lucide-user"
              class="w-3.5 h-3.5"
            />
            <span>Profil Pengguna</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="w-3.5 h-3.5"
            />
            <span>Kembali ke Beranda</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Card Informasi Status Akun Admin -->
      <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-sm shadow-primary-500/20">
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="user?.name || 'Profil'"
              class="w-full h-full object-cover"
            >
            <span v-else>{{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ user?.name || 'Administrator' }}
            </div>
            <div class="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
              {{ user?.email }}
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
          <span class="text-slate-500 dark:text-neutral-400">Hak Akses:</span>
          <span
            class="px-2 py-0.5 rounded-md font-bold text-[10px]"
            :class="isAdmin
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
          >
            {{ isAdmin ? 'Label admin (Aktif)' : 'Akses Dibatasi' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>
