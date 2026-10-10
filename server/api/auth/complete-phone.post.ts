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
    // 1. Update official phone number in Appwrite Auth
    const updatedUser = await adminAppwrite.updateUserPhone(authUser.$id, cleaned)

    // 2. Update user preferences with phone and additional details
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

    // 4. Kirim notifikasi Telegram untuk pendaftaran Google OAuth (idempotent)
    if (!existingPrefs.telegramRegistrationNotified) {
      updatedPrefs.telegramRegistrationNotified = true
      await adminAppwrite.updatePrefs(authUser.$id, updatedPrefs)

      notifyNewUserRegistration({
        userId: authUser.$id,
        name: (body.name && body.name.trim()) || authUser.name || 'Pengguna Google',
        email: authUser.email || '',
        phone: cleaned,
        method: 'google'
      }).catch((telErr) => {
        console.error('[Telegram] Gagal mengirim notifikasi pendaftaran Google:', telErr)
      })
    }

    return {
      success: true,
      phone: cleaned,
      user: updatedUser
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : ''

    if (msg.includes('already exists') || msg.includes('user_phone_already_exists')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Nomor telepon / WhatsApp ini sudah terdaftar pada akun lain. Silakan gunakan nomor lain.'
      })
    }

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
