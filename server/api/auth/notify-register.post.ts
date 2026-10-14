interface NotifyRegisterBody {
  method?: 'email' | 'google'
  phone?: string
}

export default defineEventHandler(async (event) => {
  // Autentikasi sesi pendaftaran via JWT
  const authUser = await getAuthUser(event)

  const body = await readBody<NotifyRegisterBody>(event)
  const adminAppwrite = useAdminAppwrite()

  try {
    const user = await adminAppwrite.getUser(authUser.$id)
    const currentPrefs = user.prefs || {}
    const phone = (body?.phone || user.phone || (currentPrefs.phone as string) || '').trim()

    // Cek apakah notifikasi registrasi sudah pernah dikirimkan sebelumnya
    const shouldSendTelegram = !currentPrefs.telegramRegistrationNotified
    const shouldSendWhatsapp = !currentPrefs.whatsappWelcomeNotified && !!phone

    if (!shouldSendTelegram && !shouldSendWhatsapp) {
      return {
        success: true,
        alreadyNotified: true
      }
    }

    const userName = authUser.name || user.name || 'Sahabat'

    // Tandai agar tidak dikirim ganda
    await adminAppwrite.updatePrefs(authUser.$id, {
      ...currentPrefs,
      ...(shouldSendTelegram ? { telegramRegistrationNotified: true } : {}),
      ...(shouldSendWhatsapp ? { whatsappWelcomeNotified: true } : {})
    })

    // Kirim notifikasi Telegram ke admin
    if (shouldSendTelegram) {
      await notifyNewUserRegistration({
        userId: authUser.$id,
        name: userName,
        email: authUser.email || user.email || '',
        phone,
        method: body?.method === 'google' ? 'google' : 'email'
      }).catch((telErr) => {
        console.error('[Telegram] Gagal mengirim notifikasi registrasi:', telErr)
      })
    }

    // Kirim pesan sambutan WhatsApp ke pengguna baru dengan info layanan (non-blocking)
    if (shouldSendWhatsapp) {
      sendWhatsappWelcomeMessage({
        userName,
        userPhone: phone
      }).catch((waErr) => {
        console.warn('[WhatsApp] Gagal mengirim pesan sambutan registrasi:', waErr)
      })
    }

    return {
      success: true,
      notified: true
    }
  } catch (err: unknown) {
    console.error('[Notify Register Error]', err)
    return {
      success: false,
      error: 'Gagal memproses notifikasi pendaftaran'
    }
  }
})
