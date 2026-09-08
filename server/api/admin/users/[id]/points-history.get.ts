export default defineEventHandler(async (event) => {
  await requireAdminUser(event)
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID pengguna tidak valid.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  try {
    const user = await adminAppwrite.getUser(userId)
    const rawHistory = Array.isArray(user.prefs?.pointHistory)
      ? user.prefs.pointHistory
      : []

    return {
      success: true,
      userId,
      currentPoints: Number(user.prefs?.points) || 0,
      total: rawHistory.length,
      history: rawHistory
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memuat riwayat transaksi poin pengguna.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
