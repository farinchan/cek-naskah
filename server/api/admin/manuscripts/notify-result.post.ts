export default defineEventHandler(async (event) => {
  await requireAdminUser(event)

  const body = await readBody<{
    manuscriptId?: string
    resultFileUrl?: string
    resultFileName?: string
    similarityScore?: string
    adminNotes?: string
  }>(event)

  if (!body?.manuscriptId || typeof body.manuscriptId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID naskah wajib disertakan.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  // 1. Ambil data naskah
  let manuscript: Record<string, unknown>
  try {
    manuscript = await adminAppwrite.getManuscriptRow(body.manuscriptId)
  } catch (err: unknown) {
    console.error('[Notify Result] Gagal mengambil data naskah:', err)
    throw createError({
      statusCode: 404,
      statusMessage: 'Naskah tidak ditemukan.'
    })
  }

  const resultFileUrl = body?.resultFileUrl || (manuscript.resultFileUrl as string) || ''
  if (!resultFileUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tautan berkas hasil (resultFileUrl) tidak ditemukan pada naskah ini.'
    })
  }

  const userId = (manuscript.userId as string) || ''
  const userName = (manuscript.userName as string) || 'Pengguna'
  const userEmail = (manuscript.userEmail as string) || ''
  const title = (manuscript.title as string) || 'Naskah'
  const serviceName = (manuscript.serviceName as string) || 'Pemeriksaan Naskah'
  const similarityScore = body.similarityScore || (manuscript.similarityScore as string) || ''
  const resultFileName = body.resultFileName || (manuscript.resultFileName as string) || 'Laporan_Hasil.pdf'
  const resultFileId = (body as { resultFileId?: string })?.resultFileId || (manuscript.resultFileId as string) || ''
  const adminNotes = body.adminNotes || (manuscript.adminNotes as string) || ''

  // 2. Ambil nomor telepon pengguna (dari naskah atau preferensi akun)
  let userPhone = (manuscript.userPhone as string) || ''
  if (!userPhone && userId) {
    try {
      const targetUser = await adminAppwrite.getUser(userId)
      userPhone = (targetUser.phone as string) || (targetUser.prefs?.phone as string) || ''
    } catch {
      // Ignored
    }
  }

  // 3. Jalankan pengiriman WhatsApp dan Appwrite Email secara paralel
  const [waSent, emailSent] = await Promise.all([
    userPhone
      ? notifyUserManuscriptResult({
          userPhone,
          userName,
          title,
          serviceName,
          similarityScore,
          resultFileUrl,
          resultFileName,
          adminNotes
        }).catch((err) => {
          console.error('[Notify Result] Gagal kirim WA:', err)
          return false
        })
      : Promise.resolve(false),
    userId
      ? notifyUserResultViaEmail({
          userId,
          userEmail,
          userName,
          title,
          serviceName,
          similarityScore,
          resultFileUrl,
          resultFileName,
          resultFileId,
          adminNotes
        }).catch((err) => {
          console.error('[Notify Result] Gagal kirim Email Appwrite:', err)
          return false
        })
      : Promise.resolve(false)
  ])

  let message: string
  if (waSent && emailSent) {
    message = 'Dokumen hasil pemeriksaan berhasil dikirim ke WhatsApp dan Email pengguna.'
  } else if (emailSent) {
    message = 'Laporan hasil berhasil dikirim ke Email pengguna via Appwrite.' + (!userPhone ? ' (Nomor WhatsApp tidak tersedia).' : ' (Gagal mengirim ke WhatsApp).')
  } else if (waSent) {
    message = 'Dokumen hasil berhasil dikirim ke WhatsApp pengguna (Gagal mengirimkan notifikasi Email).'
  } else {
    message = 'Gagal mengirimkan notifikasi ke WhatsApp maupun Email pengguna.'
  }

  return {
    success: waSent || emailSent,
    whatsappSent: waSent,
    emailSent,
    message
  }
})
