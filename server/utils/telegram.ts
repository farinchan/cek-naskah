/**
 * Telegram Bot Notification Helper for Cek Naskah.
 * Sends real-time notifications to the administrator for new user registrations and manuscript submissions.
 */

function escapeHtml(text?: string | number | null): string {
  if (text === undefined || text === null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatWibDate(date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date) + ' WIB'
}

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
 * Sends a raw HTML-formatted notification message to the configured Telegram chat.
 */
export async function sendTelegramMessage(htmlText: string): Promise<boolean> {
  const config = useRuntimeConfig()
  const botToken = (config.telegramBotToken as string) || process.env.TELEGRAM_BOT_TOKEN || ''
  const chatId = (config.telegramChatId as string) || process.env.TELEGRAM_CHAT_ID || ''

  if (!botToken || !chatId) {
    console.warn('[Telegram Notification] Peringatan: TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diatur di .env. Notifikasi dilewati.')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const res = await $fetch<{ ok: boolean }>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }
    })

    return Boolean(res?.ok)
  } catch (err: unknown) {
    const errMsg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : String(err)
    console.error('[Telegram Notification] Gagal mengirim pesan ke Telegram:', errMsg)
    return false
  }
}

export interface NewUserNotificationData {
  userId?: string
  name: string
  email: string
  phone?: string
  method: 'email' | 'google'
}

/**
 * Sends a formatted Telegram notification for new user registration (Email auth or Google OAuth).
 */
export async function notifyNewUserRegistration(data: NewUserNotificationData): Promise<boolean> {
  const methodLabel = data.method === 'google' ? 'Google OAuth' : 'Email & Password'
  const methodIcon = data.method === 'google' ? '🌐' : '✉️'
  const phoneText = data.phone ? `<code>${escapeHtml(data.phone)}</code>` : '<i>(Belum diisi)</i>'
  const nameText = escapeHtml(data.name || 'Pengguna Baru')
  const emailText = escapeHtml(data.email)
  const timeText = formatWibDate()

  const lines = [
    '🔔 <b>REGISTRASI PENGGUNA BARU</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 <b>Nama:</b> ${nameText}`,
    `📧 <b>Email:</b> ${emailText}`,
    `📱 <b>WhatsApp:</b> ${phoneText}`,
    `${methodIcon} <b>Metode:</b> ${methodLabel}`,
    `⏰ <b>Waktu:</b> ${timeText}`
  ]

  if (data.userId) {
    lines.push(`🆔 <b>ID Pengguna:</b> <code>${escapeHtml(data.userId)}</code>`)
  }

  return await sendTelegramMessage(lines.join('\n'))
}

export interface ManuscriptNotificationData {
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

/**
 * Sends a formatted Telegram notification when a user submits a manuscript for review.
 */
export async function notifyManuscriptSubmission(data: ManuscriptNotificationData): Promise<boolean> {
  const titleText = escapeHtml(data.title)
  const serviceText = escapeHtml(data.serviceName)
  const priceText = escapeHtml(data.price || 'Rp 0')
  const userNameText = escapeHtml(data.userName || 'Pengguna')
  const userEmailText = escapeHtml(data.userEmail || '')
  const phoneText = data.userPhone ? `<code>${escapeHtml(data.userPhone)}</code>` : '<i>(Tidak ada)</i>'
  const fileNameText = escapeHtml(data.fileName || 'dokumen')
  const fileSizeText = data.fileSize ? `(${formatBytes(data.fileSize)})` : ''
  const timeText = formatWibDate()

  const lines = [
    '📄 <b>NASKAH BARU DIUNGGAH</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `📑 <b>Judul:</b> ${titleText}`,
    `🛠 <b>Layanan:</b> ${serviceText}`,
    `💰 <b>Biaya:</b> ${priceText}`,
    '────────────────────',
    `👤 <b>Pengguna:</b> ${userNameText}`,
    `📧 <b>Email:</b> ${userEmailText}`,
    `📱 <b>WhatsApp:</b> ${phoneText}`,
    '────────────────────',
    `📎 <b>File:</b> ${fileNameText} ${fileSizeText}`
  ]

  if (data.language) {
    lines.push(`🌐 <b>Bahasa:</b> ${escapeHtml(data.language)}`)
  }

  if (data.userNotes) {
    lines.push(`📝 <b>Catatan:</b> <i>"${escapeHtml(data.userNotes)}"</i>`)
  }

  if (data.fileUrl) {
    lines.push(`🔗 <b>Tautan Berkas:</b> <a href="${data.fileUrl}">Buka di Storage</a>`)
  }

  lines.push(`⏰ <b>Waktu:</b> ${timeText}`)

  return await sendTelegramMessage(lines.join('\n'))
}
