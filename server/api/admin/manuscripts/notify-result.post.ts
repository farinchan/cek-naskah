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

  // 2. Ambil nomor telepon pengguna (dari naskah atau preferensi akun)
  let userPhone = (manuscript.userPhone as string) || ''
  const userId = manuscript.userId as string

  if (!userPhone && userId) {
    try {
      const targetUser = await adminAppwrite.getUser(userId)
      userPhone = (targetUser.phone as string) || (targetUser.prefs?.phone as string) || ''
    } catch {
      // Ignored
    }
  }

  if (!userPhone) {
    console.warn(`[Notify Result] Naskah ${body.manuscriptId} tidak memiliki nomor telepon pengguna. Notifikasi WA dilewati.`)
    return {
      success: false,
      message: 'Nomor WhatsApp pengguna tidak tersedia pada data naskah atau profil akun.'
    }
  }

  // 3. Kirim berkas hasil pemeriksaan ke WhatsApp pengguna
  const sent = await notifyUserManuscriptResult({
    userPhone,
    userName: (manuscript.userName as string) || 'Pengguna',
    title: (manuscript.title as string) || 'Naskah',
    serviceName: (manuscript.serviceName as string) || 'Pemeriksaan Naskah',
    similarityScore: body.similarityScore || (manuscript.similarityScore as string) || '',
    resultFileUrl,
    resultFileName: body.resultFileName || (manuscript.resultFileName as string) || 'Laporan_Hasil.pdf',
    adminNotes: body.adminNotes || (manuscript.adminNotes as string) || ''
  })

  return {
    success: sent,
    message: sent
      ? 'Dokumen hasil pemeriksaan berhasil dikirim ke WhatsApp pengguna.'
      : 'Gagal mengirimkan dokumen via WhatsApp gateway.'
  }
})
