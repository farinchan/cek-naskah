import crypto from 'node:crypto'

export interface SumopodCreatePaymentParams {
  orderId: string
  amount: number
  currency?: string
  expiresInHours?: number
  successReturnUrl?: string
  cancelReturnUrl?: string
  paymentMethodTypeCode?: string
}

export interface SumopodPaymentResponse {
  payment_id: string
  order_id: string
  amount: number
  fee: number
  net_amount: number
  payment_link_url: string
  status: string
  expires_at: string
}

export interface SumopodWebhookPayload {
  event_type: 'payment.completed' | 'payment.failed' | 'payment.expired' | 'payment.test' | string
  data: {
    payment_id: string
    order_id: string
    amount: number
    fee?: number
    net_amount?: number
    status: 'completed' | 'failed' | 'expired' | 'pending' | string
    payment_method?: string
    completed_at?: string
  }
}

/**
 * Encodes orderId to include userId safely
 * Format: CN_<timestamp>_<userId>
 */
export function generateOrderId(userId: string): string {
  const timestamp = Date.now()
  return `CN_${timestamp}_${userId}`
}

/**
 * Extracts userId from orderId
 * Returns userId if valid, otherwise null
 */
export function extractUserIdFromOrderId(orderId: string): string | null {
  if (!orderId || typeof orderId !== 'string') return null
  const parts = orderId.split('_')
  if (parts.length >= 3 && parts[0] === 'CN') {
    return parts.slice(2).join('_')
  }
  return null
}

/**
 * Calls Sumopod API to create a payment link
 */
export async function createSumopodPayment(params: SumopodCreatePaymentParams): Promise<SumopodPaymentResponse> {
  const config = useRuntimeConfig()
  const apiKey = (config.sumopodApiKey as string) || process.env.SUMOPOD_API_KEY || ''
  const endpoint = (config.sumopodPayEndpoint as string) || process.env.SUMOPOD_PAY_ENDPOINT || 'https://api-pay-sandbox.sumopod.com/api/v1/payments'

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SUMOPOD_API_KEY belum dikonfigurasi di server environment.'
    })
  }

  const payload: Record<string, unknown> = {
    order_id: params.orderId,
    amount: Math.round(params.amount),
    currency: params.currency || 'IDR',
    expires_in_hours: params.expiresInHours || 24,
    payment_method_type_code: params.paymentMethodTypeCode || 'QRIS'
  }

  if (params.successReturnUrl && params.successReturnUrl.startsWith('https://')) {
    payload.success_return_url = params.successReturnUrl
  }
  if (params.cancelReturnUrl && params.cancelReturnUrl.startsWith('https://')) {
    payload.cancel_return_url = params.cancelReturnUrl
  }

  try {
    const res = await $fetch<SumopodPaymentResponse>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: payload
    })

    return res
  } catch (err: unknown) {
    const errorData = err && typeof err === 'object' && 'data' in err
      ? (err as { data: unknown }).data
      : null

    console.error('[Sumopod API Error]', JSON.stringify(errorData || err, null, 2))

    let errorMsg = 'Gagal membuat tautan pembayaran Sumopod Pay.'
    if (errorData && typeof errorData === 'object') {
      const dataObj = errorData as Record<string, unknown>
      if (dataObj.details) {
        errorMsg = String(dataObj.details)
      } else if (dataObj.error) {
        errorMsg = String(dataObj.error)
      } else if (dataObj.message) {
        errorMsg = String(dataObj.message)
      }
    } else if (err && typeof err === 'object' && 'message' in err) {
      errorMsg = String((err as { message: unknown }).message)
    }

    throw createError({
      statusCode: 400,
      statusMessage: errorMsg
    })
  }
}

/**
 * Verifies the Svix webhook signature sent by Sumopod Pay
 * @param secret - The signing secret (whsec_...)
 * @param svixId - The svix-id header
 * @param svixTimestamp - The svix-timestamp header
 * @param svixSignature - The svix-signature header
 * @param rawBody - The unparsed request body string
 */
export function verifySvixSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  rawBody: string
): boolean {
  if (!secret || !svixId || !svixTimestamp || !svixSignature || rawBody === undefined) {
    return false
  }

  try {
    const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64')
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`

    const expectedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    // svix-signature may contain multiple space-separated "v1,<sig>" values
    // (this happens for ~24h after rotating the secret)
    const signatures = svixSignature.split(' ').map(s => s.split(',')[1])
    return signatures.includes(expectedSignature)
  } catch (err) {
    console.error('[Sumopod Webhook] Error verifying signature:', err)
    return false
  }
}
