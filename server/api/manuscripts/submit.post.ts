interface SubmitManuscriptBody {
  fileId: string
  fileName: string
  fileSize: number
  fileType: string
  title: string
  serviceId: string
  serviceName: string
  price: string
  excludeOptions?: Record<string, unknown>
  userNotes?: string
  language?: string
}

function parsePriceToPoints(priceStr: string | number): number {
  if (typeof priceStr === 'number') {
    return Math.max(0, Math.round(priceStr))
  }
  const digits = String(priceStr).replace(/[^0-9]/g, '')
  const num = parseInt(digits, 10)
  return isNaN(num) || num <= 0 ? 0 : num
}

export default defineEventHandler(async (event) => {
  // 1. Autentikasi Pengguna via JWT
  const authUser = await getAuthUser(event)

  const body = await readBody<SubmitManuscriptBody>(event)
  if (!body || !body.fileId || !body.title || !body.title.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data naskah tidak lengkap: File ID dan Judul naskah wajib diisi.'
    })
  }

  const requiredPoints = parsePriceToPoints(body.price || '0')
  const adminAppwrite = useAdminAppwrite()
  const config = useRuntimeConfig()
  const endpoint = (config.public.appwriteEndpoint as string) || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = (config.public.appwriteProjectId as string) || '6a9e987200268817ec4c'
  const bucketId = process.env.APPWRITE_BUCKET_MANUSCRIPTS || 'naskah-bucket'
  const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${body.fileId}/view?project=${projectId}`

  // 2. Eksekusi transaksi atomik dalam User Lock untuk mencegah partial failure & race conditions
  return await withUserLock(authUser.$id, async () => {
    const user = await adminAppwrite.getUser(authUser.$id)
    const currentPrefs = user.prefs || {}
    const currentPoints = typeof currentPrefs.points === 'number'
      ? currentPrefs.points
      : Number(currentPrefs.points) || 0

    // Validasi saldo mencukupi
    if (currentPoints < requiredPoints) {
      throw createError({
        statusCode: 400,
        statusMessage: `Saldo poin Anda tidak mencukupi (Saldo: ${currentPoints.toLocaleString('id-ID')} Poin, Dibutuhkan: ${requiredPoints.toLocaleString('id-ID')} Poin). Silakan lakukan isi ulang terlebih dahulu.`
      })
    }

    const finalPoints = Math.max(0, currentPoints - requiredPoints)
    const timestamp = new Date().toISOString()
    const txId = 'tx_submit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)

    const txRecord = {
      id: txId,
      userId: authUser.$id,
      userEmail: authUser.email,
      userName: authUser.name || 'Pengguna',
      type: 'deduction',
      amount: -requiredPoints,
      balanceBefore: currentPoints,
      balanceAfter: finalPoints,
      notes: `Pembayaran ${body.serviceName || 'Pemeriksaan Naskah'}: ${body.title.trim()}`,
      createdAt: timestamp
    }

    const existingHistory = Array.isArray(currentPrefs.pointHistory)
      ? currentPrefs.pointHistory
      : []

    // Potong poin akun pengguna terlebih dahulu di preferences
    await adminAppwrite.updatePrefs(authUser.$id, {
      ...currentPrefs,
      points: finalPoints,
      pointHistory: [txRecord, ...existingHistory].slice(0, 100),
      pointsUpdatedAt: timestamp
    })

    // Siapkan data baris naskah
    const userPhone = user.phone || (user.prefs?.phone as string) || ''
    const manuscriptData: Record<string, unknown> = {
      userId: authUser.$id,
      userName: authUser.name || 'Pengguna',
      userEmail: authUser.email || '',
      userPhone,
      title: body.title.trim(),
      serviceId: body.serviceId || 'turnitin-plagiarism',
      serviceName: body.serviceName || 'Cek Plagiarisme',
      price: body.price || 'Rp 0',
      status: 'pending',
      fileId: body.fileId,
      fileName: body.fileName || 'dokumen.docx',
      fileSize: Number(body.fileSize) || 0,
      fileType: body.fileType || 'application/octet-stream',
      fileUrl,
      excludeOptions: JSON.stringify(body.excludeOptions || {}),
      userNotes: (body.userNotes || '').trim(),
      language: body.language || '',
      transactionId: txId,
      similarityScore: '',
      resultFileId: '',
      resultFileName: '',
      resultFileUrl: '',
      adminUploaderId: '',
      adminUploaderName: '',
      adminUploaderEmail: '',
      adminNotes: ''
    }

    let createdManuscript: Record<string, unknown>
    try {
      createdManuscript = await adminAppwrite.createManuscriptRow(manuscriptData)
    } catch (dbErr: unknown) {
      console.error('[Manuscript Submission Error] Gagal membuat dokumen naskah. Membatalkan pemotongan poin (Rollback):', dbErr)

      // ROLLBACK OTOMATIS: Kembalikan saldo pengguna jika penyimpanan naskah gagal
      try {
        await adminAppwrite.updatePrefs(authUser.$id, {
          ...currentPrefs,
          points: currentPoints,
          pointHistory: existingHistory,
          pointsUpdatedAt: new Date().toISOString()
        })
      } catch (rollbackErr) {
        console.error('[Rollback Fatal Error] Gagal mengembalikan saldo poin:', rollbackErr)
      }

      const dbMsg = dbErr && typeof dbErr === 'object' && 'message' in dbErr
        ? String((dbErr as { message: unknown }).message)
        : 'Gagal menyimpan data naskah ke database.'

      throw createError({
        statusCode: 500,
        statusMessage: `Gagal mengirim naskah: ${dbMsg}. Saldo poin Anda telah dikembalikan secara otomatis.`
      })
    }

    // Catat transaksi poin ke tabel riwayat (non-blocking)
    try {
      await adminAppwrite.recordPointTransaction(txRecord)
    } catch {
      // Ignored if table not setup
    }

    // Kirim notifikasi Telegram ke administrator (non-blocking)
    notifyManuscriptSubmission({
      title: body.title.trim(),
      serviceName: body.serviceName || 'Pemeriksaan Naskah',
      price: body.price || 'Rp 0',
      userName: authUser.name || 'Pengguna',
      userEmail: authUser.email || '',
      userPhone,
      fileName: body.fileName || 'dokumen.docx',
      fileSize: Number(body.fileSize) || 0,
      fileUrl,
      language: body.language || '',
      userNotes: (body.userNotes || '').trim(),
      transactionId: txId
    }).catch((telErr) => {
      console.error('[Telegram] Gagal mengirim notifikasi naskah:', telErr)
    })

    return {
      success: true,
      manuscript: createdManuscript,
      deductedPoints: requiredPoints,
      balanceAfter: finalPoints,
      message: 'Naskah berhasil dikirim dan diverifikasi secara atomik.'
    }
  })
})
