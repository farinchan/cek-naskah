export default defineEventHandler(async (event) => {
  // Hanya administrator yang diizinkan memanggil API WhatsApp langsung
  await requireAdminUser(event)

  const body = await readBody<{
    chatId?: string
    message?: string
    typingTime?: number
  }>(event)

  if (!body?.chatId || typeof body.chatId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nomor WhatsApp (chatId) wajib disertakan.'
    })
  }

  if (!body?.message || typeof body.message !== 'string' || !body.message.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pesan (message) tidak boleh kosong.'
    })
  }

  const result = await sendWhatsappText(body.chatId, body.message, body.typingTime)

  if (!result.success) {
    throw createError({
      statusCode: 502,
      statusMessage: result.message || 'Gagal mengirim pesan WhatsApp.'
    })
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
})
