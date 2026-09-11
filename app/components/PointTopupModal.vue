<script setup lang="ts">
const { user, userPoints } = useAuth()
const {
  isTopupModalOpen,
  closeTopupModal,
  formatPoints,
  formatPointsAsRupiah,
  POINT_RATE,
  isPaying,
  paymentError,
  createTopupPayment
} = usePoints()
const { getWhatsappUrl } = useAppSettings()

const PRESET_AMOUNTS = [
  { amount: 10000, label: '10.000', popular: false },
  { amount: 25000, label: '25.000', popular: false },
  { amount: 50000, label: '50.000', popular: true },
  { amount: 100000, label: '100.000', popular: false },
  { amount: 250000, label: '250.000', popular: false }
]

const selectedAmount = ref(50000)
const isCustom = ref(false)
const customAmount = ref<number | null>(null)
const localError = ref<string | null>(null)

const effectiveAmount = computed(() => {
  if (isCustom.value) {
    return customAmount.value || 0
  }
  return selectedAmount.value
})

const selectPreset = (amt: number) => {
  isCustom.value = false
  selectedAmount.value = amt
  localError.value = null
}

const enableCustom = () => {
  isCustom.value = true
  if (!customAmount.value) {
    customAmount.value = selectedAmount.value
  }
}

const handlePay = async () => {
  localError.value = null

  if (!user.value) {
    closeTopupModal()
    navigateTo('/login?redirect=/profile?tab=points')
    return
  }

  const amt = effectiveAmount.value
  if (amt < 10000) {
    localError.value = 'Nominal top up minimal adalah Rp 10.000 (10.000 Poin).'
    return
  }

  try {
    const res = await createTopupPayment(amt, 'QRIS')
    if (res.payment_link_url) {
      window.location.href = res.payment_link_url
    } else {
      localError.value = 'Tautan pembayaran tidak ditemukan dari sistem gateway.'
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pembayaran.'
    localError.value = msg
  }
}

const getTopupWhatsappUrl = () => {
  const email = user.value?.email || 'pengguna'
  const name = user.value?.name || ''
  const message = `Halo Admin Cek Naskah, saya ingin melakukan top up saldo poin akun.\n\n`
    + `Nama: ${name || '-'}\n`
    + `Email: ${email}\n`
    + `Nominal: Rp ${effectiveAmount.value.toLocaleString('id-ID')}\n`
    + `Saldo Saat Ini: ${userPoints.value} Poin\n\n`
    + `Mohon info instruksi pembayaran / pengisian poin manual. Terima kasih.`
  return getWhatsappUrl(message)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isTopupModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        @click.self="closeTopupModal"
      >
        <div
          class="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Modal Top Icon & Close Button -->
          <div class="flex items-start justify-between">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-sm">
              🪙
            </div>
            <button
              type="button"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              @click="closeTopupModal"
            >
              ✕
            </button>
          </div>

          <!-- Header Titles -->
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                Top Up Saldo Poin
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                QRIS Otomatis
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Poin digunakan untuk pembayaran otomatis semua layanan Cek Naskah (1 Poin = Rp 1).
            </p>
          </div>

          <!-- Current Balance Card -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                Saldo Akun Saat Ini
              </div>
              <div class="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 flex items-baseline gap-1.5">
                <span>{{ formatPoints(userPoints) }}</span>
                <span class="text-xs font-normal text-slate-400 dark:text-neutral-500">
                  ({{ formatPointsAsRupiah(userPoints) }})
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                Nilai Kurs
              </div>
              <div class="text-xs font-bold text-slate-700 dark:text-neutral-300 mt-0.5">
                1 Poin = Rp {{ POINT_RATE.toLocaleString('id-ID') }}
              </div>
            </div>
          </div>

          <!-- Preset Amounts Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-neutral-300">
              Pilih Nominal Top Up
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                v-for="item in PRESET_AMOUNTS"
                :key="item.amount"
                type="button"
                class="relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between"
                :class="(!isCustom && selectedAmount === item.amount)
                  ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/20'
                  : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 text-slate-800 dark:text-neutral-200 bg-white dark:bg-neutral-900'"
                @click="selectPreset(item.amount)"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">{{ item.label }} Poin</span>
                  <span
                    v-if="item.popular"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900"
                  >
                    Favorit
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                  Rp {{ item.label }}
                </div>
              </button>

              <!-- Custom Amount Button -->
              <button
                type="button"
                class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between"
                :class="isCustom
                  ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/20'
                  : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 text-slate-800 dark:text-neutral-200 bg-white dark:bg-neutral-900'"
                @click="enableCustom"
              >
                <span class="text-xs font-bold">Nominal Lain</span>
                <span class="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                  Input Manual
                </span>
              </button>
            </div>

            <!-- Custom Input Field -->
            <div
              v-if="isCustom"
              class="pt-1"
            >
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  v-model.number="customAmount"
                  type="number"
                  min="10000"
                  step="1000"
                  placeholder="Masukkan nominal (min. 10.000)"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
              </div>
            </div>
          </div>

          <!-- Payment Method: QRIS -->
          <div class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-10 px-2.5 rounded-xl bg-white border border-slate-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  src="/qris.png"
                  alt="QRIS"
                  class="h-5 w-auto object-contain"
                >
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>QRIS Instant</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Otomatis
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-neutral-400">
                  BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay
                </div>
              </div>
            </div>
            <UIcon
              name="i-lucide-check-circle-2"
              class="w-5 h-5 text-emerald-500 shrink-0"
            />
          </div>

          <!-- Total Calculation -->
          <div class="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-neutral-300 font-medium">Total Pembayaran:</span>
            <span class="text-base font-black text-slate-900 dark:text-white">
              Rp {{ effectiveAmount.toLocaleString('id-ID') }}
            </span>
          </div>

          <!-- Error Alert -->
          <div
            v-if="localError || paymentError"
            class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-alert-triangle"
              class="w-4 h-4 shrink-0 text-rose-500"
            />
            <span class="min-w-0">{{ localError || paymentError }}</span>
          </div>

          <!-- Primary Actions -->
          <div class="space-y-2 pt-1">
            <button
              v-if="user"
              type="button"
              class="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-primary-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isPaying || effectiveAmount < 10000"
              @click="handlePay"
            >
              <UIcon
                v-if="isPaying"
                name="i-lucide-loader-2"
                class="w-4 h-4 animate-spin"
              />
              <UIcon
                v-else
                name="i-lucide-qr-code"
                class="w-4 h-4"
              />
              <span>{{ isPaying ? 'Menghubungkan ke Gateway...' : `Bayar Rp ${effectiveAmount.toLocaleString('id-ID')} via QRIS` }}</span>
            </button>

            <NuxtLink
              v-else
              to="/login?redirect=/profile?tab=points"
              class="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-primary-600/25 cursor-pointer"
              @click="closeTopupModal"
            >
              <UIcon
                name="i-lucide-log-in"
                class="w-4 h-4"
              />
              <span>Masuk untuk Melanjutkan Top Up</span>
            </NuxtLink>

            <!-- Secondary Action: WhatsApp CS Fallback -->
            <div class="flex items-center justify-between pt-1">
              <a
                :href="getTopupWhatsappUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[11px] text-slate-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <UIcon
                  name="i-simple-icons-whatsapp"
                  class="w-3.5 h-3.5"
                />
                <span>Butuh Bantuan / Top Up Manual?</span>
              </a>
              <button
                type="button"
                class="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer"
                @click="closeTopupModal"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
