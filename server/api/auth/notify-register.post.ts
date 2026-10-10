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

    // Cek apakah notifikasi registrasi sudah pernah dikirimkan sebelumnya
    if (currentPrefs.telegramRegistrationNotified) {
      return {
        success: true,
        alreadyNotified: true
      }
    }

    // Tandai agar tidak dikirim ganda
    await adminAppwrite.updatePrefs(authUser.$id, {
      ...currentPrefs,
      telegramRegistrationNotified: true
    })

    const phone = (body?.phone || user.phone || (currentPrefs.phone as string) || '').trim()

    // Kirim notifikasi Telegram ke admin
    await notifyNewUserRegistration({
      userId: authUser.$id,
      name: authUser.name || user.name || 'Pengguna Baru',
      email: authUser.email || user.email || '',
      phone,
      method: body?.method === 'google' ? 'google' : 'email'
    })

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
