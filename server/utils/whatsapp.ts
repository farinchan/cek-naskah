/**
 * WhatsApp Gateway Helper (wa.nagastra.org) for Cek Naskah.
 * Handles sending text messages and document files with random typing times.
 */

export interface WhatsappResponse {
  success: boolean
  message?: string
  data?: unknown
}

export interface WhatsappManuscriptData {
  title: string
  serviceName: string
  price: string
  userName: string
  userEmail: string
  userPhone?: string
  fileName: string
  fileSize?: number
  fileUrl?: string
  language?: string
  userNotes?: string
  transactionId?: string
}

export interface WhatsappResultData {
  userPhone: string
  userName: string
  title: string
  serviceName: string
  similarityScore?: string
  resultFileUrl: string
  resultFileName: string
  adminNotes?: string
}

/**
 * Returns a random typing time between min and max milliseconds (defaults: 4000 to 8000 ms).
 */
export function getRandomTypingTime(min = 4000, max = 8000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Sanitizes and normalizes Indonesian phone numbers into standard format (e.g. 6282288358026).
 */
export function formatWhatsappChatId(phone?: string | null): string {
  if (!phone) return ''
  let cleaned = String(phone).replace(/[^\d]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  }
  return cleaned
}

/**
 * Detects common MIME types based on file extension.
 */
export function getMimeType(fileName?: string): string {
  if (!fileName) return 'application/pdf'
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'doc':
      return 'application/msword'
    case 'txt':
      return 'text/plain'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'xls':
      return 'application/vnd.ms-excel'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Formats bytes to human-readable size.
 */
function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/**
 * Formats current date and time in WIB (UTC+7).
 */
function formatWibDate(): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(new Date()) + ' WIB'
  } catch {
    return new Date().toISOString()
  }
}

/**
 * Sends a WhatsApp text message using wa.nagastra.org send-text API.
 */
export async function sendWhatsappText(
  chatId: string,
  message: string,
  typingTime?: number
): Promise<WhatsappResponse> {
  const config = useRuntimeConfig()
  const baseUrl = (config.whatsappApiBaseUrl as string) || 'https://wa.nagastra.org/api/whatsapp'
  const sessionId = (config.whatsappSessionId as string) || 'cek-naskah'
  const apiKey = (config.whatsappApiKey as string) || 'fajri1228'

  const targetChatId = formatWhatsappChatId(chatId)
  if (!targetChatId) {
    return { success: false, message: 'Nomor WhatsApp tujuan tidak valid.' }
  }

  const duration = typeof typingTime === 'number' && typingTime > 0
    ? typingTime
    : getRandomTypingTime(4000, 8000)

  const url = `${baseUrl.replace(/\/+$/, '')}/chats/send-text`
  const payload = {
    sessionId,
    chatId: targetChatId,
    message,
    typingTime: duration
  }

  try {
    const res = await $fetch<WhatsappResponse>(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: payload
    })

    return {
      success: true,
      message: res.message || 'Pesan teks berhasil dikirim.',
      data: res.data
    }
  } catch (err: unknown) {
    const errMsg = (err as { data?: { message?: string }, message?: string })?.data?.message
      || (err as { message?: string })?.message
      || 'Gagal menghubungi server gateway WhatsApp'
    console.error('[WhatsApp Notification] Gagal mengirim pesan teks:', errMsg, err)
    return {
      success: false,
      message: errMsg
    }
  }
}

/**
 * Sends a WhatsApp document with caption using wa.nagastra.org send-document API.
 */
export async function sendWhatsappDocument(
  chatId: string,
  documentUrl: string,
  filename: string,
  mimetype?: string,
  caption?: string,
  typingTime?: number
): Promise<WhatsappResponse> {
  const config = useRuntimeConfig()
  const baseUrl = (config.whatsappApiBaseUrl as string) || 'https://wa.nagastra.org/api/whatsapp'
  const sessionId = (config.whatsappSessionId as string) || 'cek-naskah'
  const apiKey = (config.whatsappApiKey as string) || 'fajri1228'

  const targetChatId = formatWhatsappChatId(chatId)
  if (!targetChatId) {
    return { success: false, message: 'Nomor WhatsApp tujuan tidak valid.' }
  }

  if (!documentUrl) {
    return { success: false, message: 'Tautan dokumen (documentUrl) wajib disertakan.' }
  }

  const safeFilename = filename || 'dokumen.pdf'
  const safeMimetype = mimetype || getMimeType(safeFilename)
  const duration = typeof typingTime === 'number' && typingTime > 0
    ? typingTime
    : getRandomTypingTime(4000, 8000)

  const url = `${baseUrl.replace(/\/+$/, '')}/chats/send-document`
  const payload = {
    sessionId,
    chatId: targetChatId,
    documentUrl,
    filename: safeFilename,
    mimetype: safeMimetype,
    caption: caption || '',
    typingTime: duration
  }

  try {
    const res = await $fetch<WhatsappResponse>(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: payload
    })

    return {
      success: true,
      message: res.message || 'Dokumen berhasil dikirim ke WhatsApp.',
      data: res.data
    }
  } catch (err: unknown) {
    const errMsg = (err as { data?: { message?: string }, message?: string })?.data?.message
      || (err as { message?: string })?.message
      || 'Gagal menghubungi server gateway WhatsApp'
    console.error('[WhatsApp Notification] Gagal mengirim dokumen:', errMsg, err)
    return {
      success: false,
      message: errMsg
    }
  }
}

/**
 * Trigger 1: Notifies the administrator via WhatsApp when a user submits a manuscript for checking.
 */
export async function notifyAdminNewManuscript(data: WhatsappManuscriptData): Promise<boolean> {
  const config = useRuntimeConfig()
  const adminPhone = (config.whatsappAdminPhone as string) || '6282288358026'

  const titleText = data.title || 'Naskah'
  const serviceText = data.serviceName || 'Pemeriksaan Naskah'
  const priceText = data.price || 'Rp 0'
  const userNameText = data.userName || 'Pengguna'
  const userEmailText = data.userEmail || '-'
  const phoneText = data.userPhone ? formatWhatsappChatId(data.userPhone) : '-'
  const fileNameText = data.fileName || 'dokumen'
  const fileSizeText = data.fileSize ? `(${formatBytes(data.fileSize)})` : ''
  const timeText = formatWibDate()

  const lines = [
    '📄 *NASKAH BARU DIAJUKAN*',
    '',
    `*Judul:* ${titleText}`,
    `*Layanan:* ${serviceText}`,
    `*Biaya:* ${priceText}`,
    '',
    `*Pengguna:* ${userNameText}`,
    `*Email:* ${userEmailText}`,
    `*WhatsApp Pengguna:* ${phoneText}`,
    '',
    `*Berkas:* ${fileNameText} ${fileSizeText}`
  ]

  if (data.language) {
    lines.push(`*Bahasa:* ${data.language}`)
  }

  if (data.userNotes) {
    lines.push(`*Catatan Pengguna:* "${data.userNotes}"`)
  }

  if (data.fileUrl) {
    lines.push(`🔗 *Tautan Berkas:* ${data.fileUrl}`)
  }

  lines.push(`*Waktu:* ${timeText}`)
  lines.push('')
  lines.push('_Pemberitahuan otomatis sistem Cek Naskah_')

  const res = await sendWhatsappText(adminPhone, lines.join('\n'))
  return res.success
}

/**
 * Trigger 2: Sends the check result document file directly to the user via WhatsApp when admin uploads the result.
 */
export async function notifyUserManuscriptResult(data: WhatsappResultData): Promise<boolean> {
  const targetPhone = formatWhatsappChatId(data.userPhone)
  if (!targetPhone) {
    console.warn('[WhatsApp Result] Nomor telepon pengguna tidak tersedia, pengiriman dokumen WA dilewati.')
    return false
  }

  const userName = data.userName || 'Kak'
  const title = data.title || 'Naskah Anda'
  const service = data.serviceName || 'Pemeriksaan Naskah'
  const timeText = formatWibDate()

  const captionLines = [
    `Halo Kak *${userName}*! 👋`,
    '',
    'Laporan hasil pemeriksaan naskah Anda telah selesai diproses. Dokumen hasil resmi terlampir pada pesan ini.',
    '',
    '📋 *Rincian Pemeriksaan:*',
    `• *Judul:* ${title}`,
    `• *Layanan:* ${service}`
  ]

  if (data.similarityScore) {
    captionLines.push(`• *Skor Hasil:* ${data.similarityScore}`)
  }

  if (data.adminNotes) {
    captionLines.push(`• *Catatan Analis:* ${data.adminNotes}`)
  }

  captionLines.push(`• *Waktu Selesai:* ${timeText}`)
  captionLines.push('')
  captionLines.push('Anda juga dapat mengunduh kembali dokumen atau memberikan ulasan untuk mendapatkan bonus poin di dashboard:')
  captionLines.push('🌐 https://cek-naskah.web.id/riwayat-naskah')
  captionLines.push('')
  captionLines.push('Terima kasih telah mempercayakan naskah Anda pada Cek Naskah! 🙏')

  const res = await sendWhatsappDocument(
    targetPhone,
    data.resultFileUrl,
    data.resultFileName || 'Laporan_Hasil_CekNaskah.pdf',
    getMimeType(data.resultFileName),
    captionLines.join('\n')
  )

  return res.success
}
