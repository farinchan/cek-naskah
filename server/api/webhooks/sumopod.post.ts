export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedSecret = (config.sumopodWebhookSecret as string) || process.env.SUMOPOD_WEBHOOK_SECRET || ''
  const expectedToken = (config.sumopodWebhookToken as string) || process.env.SUMOPOD_WEBHOOK_TOKEN || ''

  // 1. Dapatkan raw unparsed request body string (wajib untuk HMAC signature matching)
  const rawBody = (await readRawBody(event, 'utf-8')) || ''

  // 2. Dapatkan header verifikasi dari Sumopod
  const svixId = (getHeader(event, 'svix-id') || '').trim()
  const svixTimestamp = (getHeader(event, 'svix-timestamp') || '').trim()
  const svixSignature = (getHeader(event, 'svix-signature') || '').trim()
  const receivedToken = (getHeader(event, 'x-webhook-token') || '').trim()

  const hasSecret = Boolean(expectedSecret)
  const hasToken = Boolean(expectedToken)

  // 3. Verifikasi Keaslian Webhook jika Secret atau Token dikonfigurasi
  if (hasSecret || hasToken) {
    let isVerified = false

    // Metode A: Svix Signature Verification (HMAC SHA-256)
    if (hasSecret && svixId && svixTimestamp && svixSignature) {
      isVerified = verifySvixSignature(expectedSecret, svixId, svixTimestamp, svixSignature, rawBody)
      if (!isVerified) {
        console.warn(`[Sumopod Webhook] Verifikasi Svix signature gagal untuk svix-id: "${svixId}"`)
      }
    }

    // Metode B: Direct Webhook Token Verification (X-Webhook-Token)
    if (!isVerified && receivedToken) {
      if (hasToken && receivedToken === expectedToken) {
        isVerified = true
      } else if (hasSecret && receivedToken === expectedSecret) {
        isVerified = true
      }
    }

    if (!isVerified) {
      console.error('[Sumopod Webhook] Akses ditolak: Webhook signature atau token tidak valid.')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid signature or webhook token'
      })
    }
  } else {
    console.warn('[Sumopod Webhook] PERINGATAN: SUMOPOD_WEBHOOK_SECRET atau SUMOPOD_WEBHOOK_TOKEN belum dikonfigurasi di .env. Memproses webhook tanpa verifikasi signature.')
  }

  // 4. Parse payload JSON dari rawBody
  let body: SumopodWebhookPayload
  try {
    body = JSON.parse(rawBody) as SumopodWebhookPayload
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload webhook tidak valid: Raw body bukan JSON yang valid.'
    })
  }

  if (!body || !body.event_type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload webhook tidak valid: event_type tidak ditemukan.'
    })
  }

  const eventType = body.event_type
  const data = body.data

  console.log(`[Sumopod Webhook] Verified event: "${eventType}" for order: "${data?.order_id || '-'}"`)

  // 1. Handle Test Event
  if (eventType === 'payment.test') {
    return {
      success: true,
      message: 'Test event received successfully'
    }
  }

  // 2. Handle Payment Completed Event
  if (eventType === 'payment.completed') {
    if (!data || !data.order_id || !data.amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payload data payment.completed tidak lengkap.'
      })
    }

    const userId = extractUserIdFromOrderId(data.order_id)
    if (!userId) {
      console.error(`[Sumopod Webhook] Failed to extract userId from order_id: "${data.order_id}"`)
      throw createError({
        statusCode: 400,
        statusMessage: `Format order_id "${data.order_id}" tidak valid atau tidak memiliki ID pengguna.`
      })
    }

    const adminAppwrite = useAdminAppwrite()

    try {
      const user = await adminAppwrite.getUser(userId)
      const currentPrefs = user.prefs || {}
      const currentPoints = typeof currentPrefs.points === 'number'
        ? currentPrefs.points
        : Number(currentPrefs.points) || 0

      // Check for Idempotency (prevent duplicate credit if webhook is retried)
      const rawHistory = Array.isArray(currentPrefs.pointHistory)
        ? currentPrefs.pointHistory
        : []

      const isAlreadyProcessed = rawHistory.some((tx: Record<string, unknown>) => {
        return tx.id === data.payment_id || tx.orderId === data.order_id
      })

      if (isAlreadyProcessed) {
        console.log(`[Sumopod Webhook] Payment "${data.payment_id}" / order "${data.order_id}" already processed. Skipping duplicate.`)
        return {
          success: true,
          message: 'Transaksi sudah pernah diproses sebelumnya (Idempotent).'
        }
      }

      const addPoints = Math.round(Number(data.amount))
      const newPoints = currentPoints + addPoints

      const methodLabel = (data.payment_method || 'QRIS').toUpperCase()
      const txRecord = {
        id: data.payment_id,
        orderId: data.order_id,
        userId,
        userEmail: user.email || '',
        userName: user.name || '',
        type: 'topup',
        amount: addPoints,
        balanceBefore: currentPoints,
        balanceAfter: newPoints,
        notes: `Top up otomatis via ${methodLabel} (${data.order_id})`,
        createdAt: data.completed_at || new Date().toISOString()
      }

      const updatedHistory = [txRecord, ...rawHistory].slice(0, 50)
      const updatedPrefs = {
        ...currentPrefs,
        points: newPoints,
        pointHistory: updatedHistory
      }

      await adminAppwrite.updatePrefs(userId, updatedPrefs)
      await adminAppwrite.recordPointTransaction(txRecord)

      console.log(`[Sumopod Webhook] Successfully added ${addPoints} points to user ${userId} (${user.email}). New points: ${newPoints}`)

      return {
        success: true,
        message: `Saldo ${addPoints} poin berhasil ditambahkan ke akun pengguna.`,
        points: newPoints,
        order_id: data.order_id
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Gagal memperbarui saldo poin pengguna di database.'

      console.error(`[Sumopod Webhook] Error processing payment.completed for user ${userId}:`, msg)
      throw createError({
        statusCode: 500,
        statusMessage: msg
      })
    }
  }

  // 3. Handle Other Events (failed, expired)
  if (eventType === 'payment.failed' || eventType === 'payment.expired') {
    console.log(`[Sumopod Webhook] Payment order "${data?.order_id}" status: ${eventType}`)
    return {
      success: true,
      message: `Event "${eventType}" acknowledged.`
    }
  }

  return {
    success: true,
    message: `Event "${eventType}" received.`
  }
})
