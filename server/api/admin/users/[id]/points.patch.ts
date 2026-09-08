interface UpdatePointsBody {
  points: number
  mode?: 'set' | 'add' | 'subtract'
  notes?: string
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminUser(event)
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID pengguna tidak valid.'
    })
  }

  const body = await readBody<UpdatePointsBody>(event)
  const inputPoints = Number(body?.points)

  if (isNaN(inputPoints) || inputPoints < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Jumlah poin harus berupa bilangan bulat positif atau nol.'
    })
  }

  const mode = body?.mode || 'set'
  const adminAppwrite = useAdminAppwrite()
  const jwt = getHeader(event, 'x-appwrite-jwt')

  try {
    const user = await adminAppwrite.getUser(userId)
    const currentPrefs = user.prefs || {}
    const currentPoints = typeof currentPrefs.points === 'number'
      ? currentPrefs.points
      : Number(currentPrefs.points) || 0

    let finalPoints = 0
    let amount = 0
    let type: 'topup' | 'deduction' | 'adjustment' = 'adjustment'

    if (mode === 'add') {
      amount = Math.round(inputPoints)
      finalPoints = currentPoints + amount
      type = 'topup'
    } else if (mode === 'subtract') {
      amount = -Math.round(inputPoints)
      finalPoints = Math.max(0, currentPoints - Math.round(inputPoints))
      type = 'deduction'
    } else {
      finalPoints = Math.max(0, Math.round(inputPoints))
      amount = finalPoints - currentPoints
      if (amount > 0) {
        type = 'topup'
      } else if (amount < 0) {
        type = 'deduction'
      } else {
        type = 'adjustment'
      }
    }

    // Construct transaction record
    const txId = `ptx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const defaultNotes = type === 'topup'
      ? 'Top up saldo poin oleh admin'
      : (type === 'deduction' ? 'Pengurangan saldo poin oleh admin' : 'Penyesuaian saldo poin oleh admin')

    const txRecord = {
      id: txId,
      userId,
      userEmail: user.email || '',
      userName: user.name || '',
      adminId: adminUser.$id,
      adminName: adminUser.name || 'Admin',
      adminEmail: adminUser.email || '',
      type,
      amount,
      balanceBefore: currentPoints,
      balanceAfter: finalPoints,
      notes: body?.notes?.trim() || defaultNotes,
      createdAt: new Date().toISOString()
    }

    // Save to user.prefs.pointHistory (keep latest 50 records)
    const rawHistory = Array.isArray(currentPrefs.pointHistory)
      ? currentPrefs.pointHistory
      : []
    const updatedHistory = [txRecord, ...rawHistory].slice(0, 50)

    const updatedPrefs = {
      ...currentPrefs,
      points: finalPoints,
      pointHistory: updatedHistory
    }

    await adminAppwrite.updatePrefs(userId, updatedPrefs)

    // Also attempt saving to database table point_transactions
    await adminAppwrite.recordPointTransaction(txRecord, jwt)

    const updatedUser = await adminAppwrite.getUser(userId)

    return {
      success: true,
      message: `Saldo poin ${updatedUser.name || updatedUser.email} berhasil diperbarui menjadi ${finalPoints.toLocaleString('id-ID')} Poin.`,
      points: finalPoints,
      transaction: txRecord,
      user: updatedUser
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memperbarui saldo poin pengguna.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
