export default defineEventHandler(async (event) => {
  // Hanya administrator yang diizinkan memanggil API WhatsApp langsung
  await requireAdminUser(event)

  const body = await readBody<{
    chatId?: string
    documentUrl?: string
    filename?: string
    mimetype?: string
    caption?: string
    typingTime?: number
  }>(event)

  if (!body?.chatId || typeof body.chatId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nomor WhatsApp (chatId) wajib disertakan.'
    })
  }

  if (!body?.documentUrl || typeof body.documentUrl !== 'string' || !body.documentUrl.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tautan dokumen (documentUrl) wajib disertakan.'
    })
  }

  const filename = body.filename || 'dokumen.pdf'
  const result = await sendWhatsappDocument(
    body.chatId,
    body.documentUrl,
    filename,
    body.mimetype,
    body.caption,
    body.typingTime
  )

  if (!result.success) {
    throw createError({
      statusCode: 502,
      statusMessage: result.message || 'Gagal mengirim dokumen WhatsApp.'
    })
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
})
