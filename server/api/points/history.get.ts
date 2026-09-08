export default defineEventHandler(async (event) => {
  const authUser = await getAuthUser(event)
  const query = getQuery(event)
  const targetUserId = (query.userId as string) || authUser.$id

  // If requesting another user's history, caller must be an admin
  if (targetUserId !== authUser.$id) {
    const labels = authUser.labels || []
    if (!labels.some(l => l.toLowerCase() === 'admin')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Akses ditolak: Anda hanya dapat melihat riwayat poin akun Anda sendiri.'
      })
    }
  }

  const adminAppwrite = useAdminAppwrite()

  try {
    const user = await adminAppwrite.getUser(targetUserId)
    const rawHistory = Array.isArray(user.prefs?.pointHistory)
      ? user.prefs.pointHistory
      : []

    return {
      success: true,
      userId: targetUserId,
      currentPoints: Number(user.prefs?.points) || 0,
      total: rawHistory.length,
      history: rawHistory
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memuat riwayat transaksi poin.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
