export default defineEventHandler(async (event) => {
  const authUser = await getAuthUser(event)

  const body = await readBody<{
    manuscriptId?: string
    rating?: number
    comment?: string
    occupation?: string
    affiliation?: string
  }>(event)

  if (!body?.manuscriptId || typeof body.manuscriptId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID naskah wajib disertakan.'
    })
  }

  const rating = Number(body.rating)
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating bintang harus antara 1 sampai 5.'
    })
  }

  const comment = (body.comment || '').trim()
  if (comment.length < 15) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Isi ulasan minimal 15 karakter agar memberikan masukan yang bermanfaat.'
    })
  }

  if (comment.length > 2500) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Isi ulasan maksimal 2.500 karakter.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  // 1. Ambil data naskah dan validasi kepemilikan
  let manuscript: Record<string, unknown>
  try {
    manuscript = await adminAppwrite.getManuscriptRow(body.manuscriptId)
  } catch (err: unknown) {
    console.error('[Testimonial Submit] Gagal mengambil data naskah:', err)
    throw createError({
      statusCode: 404,
      statusMessage: 'Naskah tidak ditemukan.'
    })
  }

  if (manuscript.userId !== authUser.$id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Akses ditolak: Anda hanya dapat mengulas naskah milik akun Anda sendiri.'
    })
  }

  const hasResult = Boolean(manuscript.resultFileUrl) || manuscript.status === 'completed'
  if (!hasResult) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ulasan hanya dapat diberikan setelah hasil pemeriksaan naskah selesai.'
    })
  }

  // 2. Periksa apakah naskah sudah pernah diulas sebelumnya (Mencegah klaim poin ganda)
  let parsedOptions: Record<string, unknown> = {}
  try {
    parsedOptions = typeof manuscript.excludeOptions === 'string'
      ? JSON.parse(manuscript.excludeOptions)
      : (manuscript.excludeOptions as Record<string, unknown>) || {}
  } catch {
    parsedOptions = {}
  }

  if (parsedOptions.isReviewed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Naskah ini sudah pernah Anda berikan ulasan sebelumnya.'
    })
  }

  // 3. Hitung perolehan poin reward berdasarkan bintang dan jumlah karakter
  const reward = calculateReviewPoints(rating, comment.length)
  const earnedPoints = reward.points
  const timestamp = new Date().toISOString()
  const txId = 'tx_review_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)

  // 4. Eksekusi penambahan saldo poin dan pencatatan testimoni dalam User Lock
  return await withUserLock(authUser.$id, async () => {
    const user = await adminAppwrite.getUser(authUser.$id)
    const currentPrefs = user.prefs || {}
    const currentPoints = typeof currentPrefs.points === 'number'
      ? currentPrefs.points
      : Number(currentPrefs.points) || 0
    const finalPoints = currentPoints + earnedPoints

    // Ekstrak pekerjaan, afiliasi, dan avatar dari input pengguna atau preferensi profil
    const finalOccupation = (body.occupation || '').trim() || (currentPrefs.pekerjaan as string) || ''
    const finalAffiliation = (body.affiliation || '').trim() || (currentPrefs.afiliasi as string) || (currentPrefs.affiliasi as string) || ''
    const rawAvatar = (currentPrefs.avatarUrl as string) || (currentPrefs.photoUrl as string) || (currentPrefs.avatar as string) || ''
    // Sanitasi avatar agar tidak melebihi kapasitas kolom 500 karakter dan bukan raw base64 data URI
    const userAvatar = rawAvatar.startsWith('data:') || rawAvatar.length > 500 ? '' : rawAvatar

    const updatedUserPrefs: Record<string, unknown> = { ...currentPrefs }
    let prefsNeedsUpdate = false

    if (finalOccupation && finalOccupation !== currentPrefs.pekerjaan) {
      updatedUserPrefs.pekerjaan = finalOccupation
      prefsNeedsUpdate = true
    }
    if (finalAffiliation && finalAffiliation !== currentPrefs.afiliasi) {
      updatedUserPrefs.afiliasi = finalAffiliation
      prefsNeedsUpdate = true
    }

    // 4. Siapkan data baris ulasan testimoni dengan sanitasi ketat batas kolom Appwrite
    const testimonialPayload = {
      manuscriptId: String(body?.manuscriptId || '').slice(0, 64),
      userId: authUser.$id.slice(0, 64),
      userName: (authUser.name || 'Pengguna Cek Naskah').slice(0, 128),
      userEmail: (authUser.email || '').slice(0, 128),
      userAvatar: userAvatar.slice(0, 500),
      userOccupation: finalOccupation.slice(0, 128),
      userAffiliation: finalAffiliation.slice(0, 255),
      rating: Math.min(5, Math.max(1, Math.round(Number(rating) || 5))),
      comment: comment.slice(0, 3000),
      charCount: Math.round(Number(comment.length) || 0),
      pointsAwarded: Math.round(Number(earnedPoints) || 0),
      isVisible: true,
      serviceId: ((manuscript.serviceId as string) || '').slice(0, 64),
      serviceName: ((manuscript.serviceName as string) || 'Layanan Cek Naskah').slice(0, 128),
      manuscriptTitle: ((manuscript.title as string) || 'Naskah').slice(0, 255),
      similarityScore: ((manuscript.similarityScore as string) || '').slice(0, 32),
      createdAt: timestamp.slice(0, 64)
    }

    // LANGKAH 1: Simpan ke tabel database 'testimonials' TERLEBIH DAHULU!
    // Jika penyimpanan ke database gagal, proses DIBATALKAN dan poin TIDAK DIBERIKAN!
    let createdTestimonial: Record<string, unknown>
    try {
      createdTestimonial = await adminAppwrite.createTestimonialRow(testimonialPayload)
      if (!createdTestimonial?.$id) {
        throw new Error('ID baris ulasan tidak diterima dari database.')
      }
    } catch (dbErr: unknown) {
      const detailedMsg = (dbErr as { data?: { message?: string }, message?: string })?.data?.message
        || (dbErr as { message?: string })?.message
        || 'Database error'
      console.error('[Testimonial Submit] Gagal menyimpan ke tabel database testimonials:', detailedMsg, dbErr)
      throw createError({
        statusCode: 500,
        statusMessage: `Gagal menyimpan ulasan ke database: ${detailedMsg}. Poin ulasan tidak dapat diberikan.`
      })
    }

    const testimonialId = createdTestimonial.$id as string

    // LANGKAH 2: Tambahkan saldo poin ke akun pengguna (jika ada reward)
    if (earnedPoints > 0) {
      const txRecord = {
        id: txId,
        userId: authUser.$id,
        userEmail: authUser.email,
        userName: authUser.name || 'Pengguna',
        type: 'reward',
        amount: earnedPoints,
        balanceBefore: currentPoints,
        balanceAfter: finalPoints,
        notes: `Bonus Ulasan Bintang ${rating} (${manuscript.title || 'Naskah'}): +${earnedPoints.toLocaleString('id-ID')} Poin`,
        createdAt: timestamp
      }

      const existingHistory = Array.isArray(currentPrefs.pointHistory)
        ? currentPrefs.pointHistory
        : []

      updatedUserPrefs.points = finalPoints
      updatedUserPrefs.pointHistory = [txRecord, ...existingHistory].slice(0, 100)
      updatedUserPrefs.pointsUpdatedAt = timestamp

      try {
        await adminAppwrite.updatePrefs(authUser.$id, updatedUserPrefs)
      } catch (ptsErr: unknown) {
        // Rollback: Hapus baris testimoni dari database jika update saldo poin gagal
        console.error('[Testimonial Submit] Gagal menambahkan poin, membatalkan ulasan (rollback):', ptsErr)
        try {
          await adminAppwrite.deleteTestimonialRow(testimonialId)
        } catch {
          // Ignored
        }
        throw createError({
          statusCode: 500,
          statusMessage: 'Gagal memperbarui saldo poin. Pengiriman ulasan dibatalkan.'
        })
      }

      // Catat ke riwayat transaksi database (non-blocking)
      adminAppwrite.recordPointTransaction(txRecord as {
        id: string
        userId: string
        userEmail: string
        userName: string
        type: string
        amount: number
        balanceBefore: number
        balanceAfter: number
        notes: string
        createdAt: string
      }).catch(() => {})
    } else if (prefsNeedsUpdate) {
      await adminAppwrite.updatePrefs(authUser.$id, updatedUserPrefs).catch(() => {})
    }

    // LANGKAH 3: Tandai naskah sebagai sudah diulas
    const updatedExcludeOptions = {
      ...parsedOptions,
      isReviewed: true,
      reviewRating: rating,
      reviewPoints: earnedPoints,
      reviewComment: comment,
      reviewOccupation: finalOccupation,
      reviewAffiliation: finalAffiliation,
      reviewTestimonialId: testimonialId,
      reviewedAt: timestamp
    }

    try {
      await adminAppwrite.updateManuscriptRow(body.manuscriptId!, {
        excludeOptions: JSON.stringify(updatedExcludeOptions)
      })
    } catch (updateErr: unknown) {
      console.error('[Testimonial Submit] Gagal memperbarui metadata naskah, membatalkan poin dan ulasan (rollback):', updateErr)
      // Rollback poin jika tadi bertambah
      if (earnedPoints > 0) {
        try {
          await adminAppwrite.updatePrefs(authUser.$id, {
            ...currentPrefs,
            points: currentPoints
          })
        } catch {
          // Ignored
        }
      }
      // Rollback ulasan di database
      try {
        await adminAppwrite.deleteTestimonialRow(testimonialId)
      } catch {
        // Ignored
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Gagal mencatat status ulasan pada naskah. Transaksi ulasan dibatalkan.'
      })
    }

    // LANGKAH 4: Kirim notifikasi Telegram ke Admin (non-blocking)
    notifyTestimonialSubmitted({
      userName: authUser.name || 'Pengguna',
      userEmail: authUser.email,
      userPhone: (manuscript.userPhone as string) || (authUser.prefs?.phone as string) || '',
      userOccupation: finalOccupation,
      userAffiliation: finalAffiliation,
      rating,
      comment,
      pointsAwarded: earnedPoints,
      manuscriptTitle: (manuscript.title as string) || 'Naskah',
      serviceName: (manuscript.serviceName as string) || 'Layanan Cek Naskah'
    }).catch((telErr) => {
      console.error('[Telegram] Gagal mengirim notifikasi ulasan:', telErr)
    })

    const pointMsg = earnedPoints > 0
      ? ` Anda berhasil mendapatkan bonus +${earnedPoints.toLocaleString('id-ID')} Poin gratis!`
      : ''

    return {
      success: true,
      pointsAwarded: earnedPoints,
      balanceAfter: finalPoints,
      testimonial: createdTestimonial,
      message: `Terima kasih atas ulasan Anda!${pointMsg} Ulasan Anda akan ditampilkan secara publik.`
    }
  })
})
