interface CreatePaymentBody {
  amount: number
  paymentMethodTypeCode?: string
}

export default defineEventHandler(async (event) => {
  const authUser = await getAuthUser(event)
  const body = await readBody<CreatePaymentBody>(event)

  const amount = Number(body?.amount)
  if (isNaN(amount) || amount < 10000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nominal top up minimal adalah Rp 10.000.'
    })
  }

  // Determine site base URL for return URLs (Sumopod mewajibkan HTTPS pada return URLs)
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || ''
  const proto = getHeader(event, 'x-forwarded-proto') || ''
  const isHttps = proto === 'https' || (host && !host.includes('localhost') && !host.includes('127.0.0.1'))

  const customBase = process.env.SUMOPOD_RETURN_URL_BASE || ''
  const returnBaseUrl = customBase.startsWith('https://')
    ? customBase.replace(/\/$/, '')
    : isHttps
      ? `https://${host}`
      : undefined

  const orderId = generateOrderId(authUser.$id)
  const successReturnUrl = returnBaseUrl
    ? `${returnBaseUrl}/profile?tab=points&payment=success&order_id=${orderId}`
    : undefined
  const cancelReturnUrl = returnBaseUrl
    ? `${returnBaseUrl}/profile?tab=points&payment=cancel&order_id=${orderId}`
    : undefined

  const paymentRes = await createSumopodPayment({
    orderId,
    amount: Math.round(amount),
    currency: 'IDR',
    expiresInHours: 24,
    successReturnUrl,
    cancelReturnUrl,
    paymentMethodTypeCode: body?.paymentMethodTypeCode || 'QRIS'
  })

  return {
    success: true,
    payment_id: paymentRes.payment_id,
    order_id: paymentRes.order_id,
    amount: paymentRes.amount,
    fee: paymentRes.fee,
    net_amount: paymentRes.net_amount,
    payment_link_url: paymentRes.payment_link_url,
    status: paymentRes.status,
    expires_at: paymentRes.expires_at
  }
})
