<script setup lang="ts">
const { user, userPoints } = useAuth()
const { isTopupModalOpen, closeTopupModal, formatPoints, formatPointsAsRupiah, POINT_RATE } = usePoints()
const { getWhatsappUrl } = useAppSettings()

const getTopupWhatsappUrl = () => {
  const email = user.value?.email || 'pengguna'
  const name = user.value?.name || ''
  const message = `Halo Admin Cek Naskah, saya ingin melakukan top up saldo poin akun.\n\n`
    + `Nama: ${name || '-'}\n`
    + `Email: ${email}\n`
    + `Saldo Saat Ini: ${userPoints.value} Poin\n\n`
    + `Mohon info instruksi pembayaran / pengisian poin. Terima kasih.`
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
          class="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 my-auto"
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
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                Segera Hadir
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Poin digunakan sebagai mata uang resmi pengganti Rupiah untuk pembayaran layanan pemeriksaan naskah.
            </p>
          </div>

          <!-- Balance Overview Card -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                Saldo Poin Anda Saat Ini
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

          <!-- Development Notice Box -->
          <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
            <div class="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
              <UIcon
                name="i-lucide-info"
                class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"
              />
              <span>Integrasi Pembayaran Otomatis</span>
            </div>
            <p class="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              Sistem pembayaran otomatis (QRIS / Virtual Account) untuk top up saldo poin sedang dalam tahap integrasi. Untuk saat ini, pengisian saldo poin dapat diproses secara manual melalui konfirmasi Admin.
            </p>
          </div>

          <!-- Actions -->
          <div class="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <a
              :href="getTopupWhatsappUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
            >
              <UIcon
                name="i-simple-icons-whatsapp"
                class="w-4 h-4"
              />
              <span>Hubungi CS via WhatsApp</span>
            </a>
            <button
              type="button"
              class="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
              @click="closeTopupModal"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
