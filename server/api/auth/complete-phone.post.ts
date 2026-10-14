interface CompletePhoneBody {
  phone: string
  name?: string
  pekerjaan?: string
  afiliasi?: string
}

export default defineEventHandler(async (event) => {
  // Authenticate user via JWT session
  const authUser = await getAuthUser(event)
  if (!authUser || !authUser.$id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi autentikasi tidak valid atau telah berakhir.'
    })
  }

  const body = await readBody<CompletePhoneBody>(event)
  if (!body || !body.phone || body.phone.trim().length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nomor WhatsApp / telepon wajib diisi dengan minimal 8 digit.'
    })
  }

  const rawPhone = body.phone.trim()
  // Clean characters except numbers and +
  let cleaned = rawPhone.replace(/[\s\-().]/g, '')
  if (cleaned.startsWith('+62')) {
    if (cleaned.startsWith('+620')) {
      cleaned = '+62' + cleaned.slice(4)
    }
    cleaned = '+' + cleaned.slice(1).replace(/\D/g, '')
  } else if (cleaned.startsWith('62')) {
    if (cleaned.startsWith('620')) {
      cleaned = '62' + cleaned.slice(3)
    }
    cleaned = '+' + cleaned.replace(/\D/g, '')
  } else if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.slice(1).replace(/\D/g, '')
  } else if (cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.slice(1).replace(/\D/g, '')
  } else {
    cleaned = '+62' + cleaned.replace(/\D/g, '')
  }

  // Validate E.164 phone regex (+ followed by 8 to 15 digits)
  if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format nomor telepon tidak valid. Pastikan nomor diawali dengan 08 atau +62.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  try {
    // 1. Coba perbarui nomor telepon resmi akun di Appwrite Auth jika belum dipakai
    let updatedUser: AppwriteAdminUser | null = null
    try {
      updatedUser = await adminAppwrite.updateUserPhone(authUser.$id, cleaned)
    } catch (phoneAuthErr) {
      console.warn('[CompletePhone] Appwrite auth updateUserPhone notice (nomor tetap disimpan ke preferensi akun):', phoneAuthErr)
    }

    // 2. Simpan selalu nomor telepon dan data profil ke preferensi akun pengguna (bebas conflict)
    const existingPrefs = authUser.prefs || {}
    const updatedPrefs: Record<string, unknown> = {
      ...existingPrefs,
      phone: cleaned
    }
    if (body.pekerjaan && body.pekerjaan.trim()) {
      updatedPrefs.pekerjaan = body.pekerjaan.trim()
    }
    if (body.afiliasi && body.afiliasi.trim()) {
      updatedPrefs.afiliasi = body.afiliasi.trim()
    }

    await adminAppwrite.updatePrefs(authUser.$id, updatedPrefs)

    // 3. Update name if provided and changed
    if (body.name && body.name.trim() && body.name.trim() !== authUser.name) {
      try {
        await adminAppwrite.updateUserName(authUser.$id, body.name.trim())
      } catch (nameErr) {
        console.warn('Gagal memperbarui nama pengguna:', nameErr)
      }
    }

    const userName = (body.name && body.name.trim()) || authUser.name || 'Sahabat'

    // 4. Kirim notifikasi Telegram untuk pendaftaran Google OAuth (idempotent)
    if (!existingPrefs.telegramRegistrationNotified) {
      updatedPrefs.telegramRegistrationNotified = true
      await adminAppwrite.updatePrefs(authUser.$id, updatedPrefs)

      notifyNewUserRegistration({
        userId: authUser.$id,
        name: userName,
        email: authUser.email || '',
        phone: cleaned,
        method: 'google'
      }).catch((telErr) => {
        console.error('[Telegram] Gagal mengirim notifikasi pendaftaran Google:', telErr)
      })
    }

    // 5. Kirim kata sambutan WhatsApp ke pengguna baru dengan info layanan (idempotent & non-blocking)
    if (!existingPrefs.whatsappWelcomeNotified && cleaned) {
      updatedPrefs.whatsappWelcomeNotified = true
      await adminAppwrite.updatePrefs(authUser.$id, updatedPrefs)

      sendWhatsappWelcomeMessage({
        userName,
        userPhone: cleaned
      }).catch((waErr) => {
        console.warn('[WhatsApp] Gagal mengirim pesan sambutan pendaftaran Google:', waErr)
      })
    }

    return {
      success: true,
      phone: cleaned,
      user: updatedUser || { ...authUser, phone: cleaned }
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : ''

    if (msg.includes('Invalid phone') || msg.includes('phone must be a valid')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format nomor telepon tidak sesuai standar internasional.'
      })
    }

    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }

    console.error('Error completing phone registration:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal menyimpan nomor telepon. Silakan coba lagi beberapa saat.'
    })
  }
})
