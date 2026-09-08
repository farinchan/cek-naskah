<script setup lang="ts">
const { rawPhone, supportEmail, getWhatsappUrl } = useAppSettings()

const emailSubscribe = ref('')
const subscribeSuccess = ref(false)
const subscribeError = ref<string | null>(null)

const handleSubscribe = () => {
  subscribeError.value = null
  subscribeSuccess.value = false

  const parseResult = subscribeSchema.safeParse({
    email: emailSubscribe.value
  })

  if (!parseResult.success) {
    subscribeError.value = parseResult.error.issues[0]?.message || 'Alamat email tidak valid'
    return
  }

  subscribeSuccess.value = true
  emailSubscribe.value = ''
  setTimeout(() => {
    subscribeSuccess.value = false
  }, 4000)
}
</script>

<template>
  <footer
    id="_footer_subscribe_contact_v6_001"
    class="bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-900"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-16 grid lg:grid-cols-2 gap-12 border-b border-slate-200 dark:border-neutral-800">
        <!-- Left: Brand + Subscribe -->
        <div>
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white mb-6"
          >
            <div class="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary-500/20">
              CN
            </div>
            <span class="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent text-2xl font-bold">Cek Naskah</span>
          </NuxtLink>
          <p class="text-slate-600 dark:text-neutral-400 mb-8 max-w-sm leading-relaxed text-sm">
            Platform pemeriksaan naskah akademik terpercaya di Indonesia: Cek Plagiarisme iThenticate & Turnitin No-Repository, AI Writer Detector, Ambil Artikel Scopus, dan Parafrase Manual.
          </p>

          <!-- Subscribe Form -->
          <form
            class="flex gap-2 mb-2"
            @submit.prevent="handleSubscribe"
          >
            <input
              v-model="emailSubscribe"
              type="email"
              placeholder="Masukkan email Anda"
              class="flex-1 max-w-xs px-4 py-3 bg-slate-50 dark:bg-neutral-900 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors text-sm"
              :class="subscribeError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-neutral-800 focus:border-primary-500'"
            >
            <button
              type="submit"
              class="px-5 py-3 bg-primary-500 hover:bg-primary-600 transition-colors rounded-xl text-white font-semibold cursor-pointer shadow-sm shadow-primary-500/20 text-sm"
            >
              Langganan
            </button>
          </form>
          <div
            v-if="subscribeError"
            class="text-xs text-red-500 font-medium mb-4"
          >
            {{ subscribeError }}
          </div>
          <div
            v-if="subscribeSuccess"
            class="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-4"
          >
            ✓ Terima kasih telah berlangganan info & tips publikasi!
          </div>

          <!-- Social Proof -->
          <div class="flex items-center gap-4">
            <div class="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&amp;auto=format&amp;fit=crop&amp;q=80"
                alt="Client"
                class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-900 shadow-sm"
              >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&amp;auto=format&amp;fit=crop&amp;q=80"
                alt="Client"
                class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-900 shadow-sm"
              >
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&amp;auto=format&amp;fit=crop&amp;q=80"
                alt="Client"
                class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-900 shadow-sm"
              >
            </div>
            <span class="text-slate-600 dark:text-neutral-400 text-sm">
              <span class="text-slate-900 dark:text-white font-semibold">15K+</span> Akademisi Puas
            </span>
          </div>
        </div>

        <!-- Right: Services & Contact Info -->
        <div class="grid sm:grid-cols-3 gap-8">
          <div>
            <h4 class="text-slate-900 dark:text-white font-semibold mb-4 text-sm">
              Navigasi & Layanan
            </h4>
            <ul class="space-y-2 text-sm text-slate-600 dark:text-neutral-400">
              <li>
                <NuxtLink
                  to="/charge"
                  class="hover:text-primary-500 transition-colors"
                >Charge & Biaya Layanan</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/about-us"
                  class="hover:text-primary-500 transition-colors"
                >About Us (Tentang Kami)</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/testimony"
                  class="hover:text-primary-500 transition-colors"
                >Testimoni & Review</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/charge"
                  class="hover:text-primary-500 transition-colors"
                >Cek Plagiarisme Turnitin</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/charge"
                  class="hover:text-primary-500 transition-colors"
                >AI Writer Detector</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/charge"
                  class="hover:text-primary-500 transition-colors"
                >Ambil Artikel Scopus</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/charge"
                  class="hover:text-primary-500 transition-colors"
                >Parafrase Manual</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-slate-900 dark:text-white font-semibold mb-4 text-sm">
              Kontak & Bantuan
            </h4>
            <p class="text-slate-600 dark:text-neutral-400 mb-2 text-sm">
              <a
                :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin tanya informasi layanan')"
                target="_blank"
                class="hover:text-primary-500 transition-colors"
              >{{ rawPhone }}</a>
            </p>
            <p class="text-slate-600 dark:text-neutral-400 text-sm mb-2">
              <a
                :href="`mailto:${supportEmail}`"
                class="hover:text-primary-500 transition-colors"
              >{{ supportEmail }}</a>
            </p>
            <p class="text-slate-500 dark:text-neutral-500 text-xs">
              Garansi 100% No-Repository
            </p>
          </div>
          <div>
            <h4 class="text-slate-900 dark:text-white font-semibold mb-4 text-sm">
              Jam Operasional
            </h4>
            <p class="text-slate-600 dark:text-neutral-400 mb-1 text-sm font-medium">
              24 Jam Non-Stop
            </p>
            <p class="text-slate-600 dark:text-neutral-400 text-xs">
              Fast Response: 08:00 - 21:00 WIB
            </p>
            <p class="text-slate-500 dark:text-neutral-500 text-xs mt-2">
              Layanan Cepat & Online
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p class="text-slate-500 text-sm">
          © {{ new Date().getFullYear() }} Cek Naskah. Seluruh hak cipta dilindungi.
        </p>
        <div class="flex items-center gap-6">
          <a
            href="#"
            class="text-slate-500 hover:text-primary-500 text-sm transition-colors"
          >Syarat & Ketentuan</a>
          <a
            href="#"
            class="text-slate-500 hover:text-primary-500 text-sm transition-colors"
          >Kebijakan Privasi</a>
          <a
            href="#"
            class="text-slate-500 hover:text-primary-500 text-sm transition-colors"
          >Jaminan Keamanan Naskah</a>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="#"
            aria-label="Twitter"
            class="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-neutral-700 rounded-full hover:bg-primary-500 hover:border-primary-500 hover:text-white text-slate-500 transition-all"
          >
            <svg
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            ><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            class="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-neutral-700 rounded-full hover:bg-primary-500 hover:border-primary-500 hover:text-white text-slate-500 transition-all"
          >
            <svg
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            ><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </a>
          <a
            href="#"
            aria-label="Facebook"
            class="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-neutral-700 rounded-full hover:bg-primary-500 hover:border-primary-500 hover:text-white text-slate-500 transition-all"
          >
            <svg
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            ><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
