export default defineEventHandler(async (event) => {
  const authUser = await getAuthUser(event)

  const body = await readBody<{
    amount: number
    serviceId?: string
    serviceName?: string
    notes?: string
  }>(event)

  const amount = Number(body?.amount)

  if (isNaN(amount) || amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Jumlah poin yang akan dipotong tidak valid.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  try {
    return await withUserLock(authUser.$id, async () => {
      const user = await adminAppwrite.getUser(authUser.$id)
      const currentPrefs = user.prefs || {}
      const currentPoints = typeof currentPrefs.points === 'number'
        ? currentPrefs.points
        : Number(currentPrefs.points) || 0

      if (currentPoints < amount) {
        throw createError({
          statusCode: 400,
          statusMessage: `Saldo poin Anda tidak mencukupi. Saldo saat ini: ${currentPoints.toLocaleString('id-ID')} Poin, Dibutuhkan: ${amount.toLocaleString('id-ID')} Poin. Silakan lakukan isi ulang (top up) terlebih dahulu.`
        })
      }

      const finalPoints = Math.max(0, currentPoints - Math.round(amount))
      const timestamp = new Date().toISOString()
      const txId = 'tx_deduct_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)

      const transaction = {
        id: txId,
        userId: authUser.$id,
        userEmail: authUser.email,
        userName: authUser.name || 'Pengguna',
        type: 'deduction',
        amount: -Math.round(amount),
        balanceBefore: currentPoints,
        balanceAfter: finalPoints,
        notes: (body.notes || `Pembayaran ${body.serviceName || 'Layanan Cek Naskah'}`).trim(),
        createdAt: timestamp
      }

      const existingHistory = Array.isArray(currentPrefs.pointHistory)
        ? currentPrefs.pointHistory
        : []

      const newHistory = [transaction, ...existingHistory].slice(0, 100)

      // 1. Update user preferences with new points balance and history
      await adminAppwrite.updatePrefs(authUser.$id, {
        ...currentPrefs,
        points: finalPoints,
        pointHistory: newHistory,
        pointsUpdatedAt: timestamp
      })

      // 2. Record to point_transactions table (non-blocking)
      try {
        await adminAppwrite.recordPointTransaction(transaction)
      } catch {
        // Ignored if table not setup
      }

      return {
        success: true,
        userId: authUser.$id,
        deducted: Math.round(amount),
        balanceBefore: currentPoints,
        balanceAfter: finalPoints,
        transaction
      }
    })
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'statusMessage' in err
      ? String((err as { statusMessage: unknown }).statusMessage)
      : (err && typeof err === 'object' && 'message' in err)
          ? String((err as { message: unknown }).message)
          : 'Gagal memproses pemotongan saldo poin.'

    const statusCode = err && typeof err === 'object' && 'statusCode' in err
      ? Number((err as { statusCode: unknown }).statusCode) || 400
      : 400

    throw createError({
      statusCode,
      statusMessage: msg
    })
  }
})
