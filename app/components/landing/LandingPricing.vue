<script setup lang="ts">
const { getWhatsappUrl } = useAppSettings()
const { activeServices } = useServices()

const pricingPlans = computed(() => {
  return activeServices.value.map(s => ({
    ...s,
    ctaLink: s.ctaLink || getWhatsappUrl(`Halo Admin Cek Naskah, saya ingin pesan layanan ${s.name}`)
  }))
})
</script>

<template>
  <section
    id="biaya"
    class="py-20 sm:py-24 bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-900"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-3 block">
          Biaya Layanan
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          Tarif Ramah Akademisi & Mahasiswa
        </h2>
        <p class="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed">
          Biaya terjangkau dengan hasil pemeriksaan resmi, cepat, dan bergaransi kerahasiaan 100% No-Repository.
        </p>
      </div>

      <!-- Pricing Cards Grid (4 Products) -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(plan, idx) in pricingPlans"
          :key="idx"
          class="rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative border"
          :class="plan.highlight
            ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-600/20 lg:-translate-y-2'
            : 'bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white border-slate-200/70 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-800'"
        >
          <!-- Popular badge if highlight -->
          <div
            v-if="plan.highlight"
            class="absolute -top-3 left-6 bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm"
          >
            Rekomendasi
          </div>

          <div>
            <!-- Plan Badge & Title -->
            <div class="mb-4">
              <span
                class="text-xs font-bold uppercase tracking-wider mb-2 block"
                :class="plan.highlight ? 'text-primary-200' : 'text-primary-600 dark:text-primary-400'"
              >
                {{ plan.tag }}
              </span>
              <h3
                class="text-lg font-bold"
                :class="plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'"
              >
                {{ plan.name }}
              </h3>
            </div>

            <!-- Price -->
            <div
              class="mb-4 pb-4 border-b"
              :class="plan.highlight ? 'border-white/20' : 'border-slate-200 dark:border-neutral-800'"
            >
              <div class="flex items-baseline gap-1">
                <span class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {{ plan.price }}
                </span>
                <span
                  class="text-xs"
                  :class="plan.highlight ? 'text-primary-100' : 'text-slate-500 dark:text-neutral-400'"
                >
                  {{ plan.unit }}
                </span>
              </div>
              <p
                class="text-xs mt-2 leading-relaxed"
                :class="plan.highlight ? 'text-primary-100' : 'text-slate-600 dark:text-neutral-400'"
              >
                {{ plan.description }}
              </p>
            </div>

            <!-- Feature list -->
            <ul class="space-y-2.5 mb-6 text-xs sm:text-sm">
              <li
                v-for="(feat, fIdx) in plan.features"
                :key="fIdx"
                class="flex items-start gap-2.5"
              >
                <svg
                  class="w-4 h-4 shrink-0 mt-0.5"
                  :class="plan.highlight ? 'text-amber-300' : 'text-primary-600 dark:text-primary-400'"
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
                <span :class="plan.highlight ? 'text-primary-50' : 'text-slate-700 dark:text-neutral-300'">
                  {{ feat }}
                </span>
              </li>
            </ul>
          </div>

          <!-- CTA Button -->
          <button
            v-if="!plan.active"
            type="button"
            disabled
            class="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
            :class="plan.highlight
              ? 'bg-white/30 text-white'
              : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'"
          >
            <span>Tidak Tersedia</span>
            <UIcon
              name="i-lucide-ban"
              class="w-4 h-4"
            />
          </button>
          <NuxtLink
            v-else
            :to="plan.ctaLink"
            :target="plan.ctaLink && plan.ctaLink.startsWith('http') ? '_blank' : undefined"
            :rel="plan.ctaLink && plan.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined"
            class="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-2"
            :class="plan.highlight
              ? 'bg-white text-primary-700 hover:bg-primary-50 shadow-md'
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20'"
          >
            <span>{{ plan.ctaText }}</span>
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Guarantee banner -->
      <div class="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Garansi Kerahasiaan & 100% No-Repository
            </h4>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Naskah Anda tidak pernah disimpan ke repositori database publik mana pun. Draft Anda tetap 100% aman untuk diuji di kampus maupun submit jurnal.
            </p>
          </div>
        </div>
        <a
          :href="getWhatsappUrl('Halo Admin Cek Naskah, saya ingin tanya informasi layanan')"
          target="_blank"
          class="shrink-0 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Tanya CS via WhatsApp
        </a>
      </div>
    </div>
  </section>
</template>
