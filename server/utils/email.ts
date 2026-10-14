/**
 * Appwrite Messaging Email Helper for Cek Naskah.
 * Sends transactional email notifications to users using Appwrite Messaging and SMTP provider.
 */

export interface AppwriteEmailResponse {
  success: boolean
  messageId?: string
  message?: string
  data?: unknown
}

export interface AppwriteResultEmailData {
  userId: string
  userEmail?: string
  userName?: string
  title: string
  serviceName?: string
  similarityScore?: string
  resultFileUrl: string
  resultFileName?: string
  resultFileId?: string
  adminNotes?: string
}

/**
 * Formats current date and time in WIB (UTC+7).
 */
function formatWibDate(): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(new Date()) + ' WIB'
  } catch {
    return new Date().toISOString()
  }
}

/**
 * Generates an elegant, responsive HTML email template for manuscript results.
 */
function buildResultEmailHtml(data: AppwriteResultEmailData): string {
  const userName = data.userName || 'Kak'
  const title = data.title || 'Naskah Anda'
  const service = data.serviceName || 'Pemeriksaan Naskah'
  const score = data.similarityScore ? data.similarityScore.trim() : null
  const notes = data.adminNotes ? data.adminNotes.trim() : null
  const resultFileName = data.resultFileName || 'Laporan_Hasil_Pemeriksaan.pdf'
  const timeText = formatWibDate()

  const scoreRowHtml = score
    ? `<tr>
        <td style="padding: 5px 0; color: #64748B; width: 35%;">Skor Hasil</td>
        <td style="padding: 5px 0; color: #0F172A; font-weight: 700;">${score}</td>
      </tr>`
    : ''

  const notesRowHtml = notes
    ? `<tr>
        <td style="padding: 5px 0; color: #64748B; width: 35%; vertical-align: top;">Catatan Analis</td>
        <td style="padding: 5px 0; color: #334155; font-style: italic;">"${notes}"</td>
      </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hasil Pemeriksaan Naskah — Cek Naskah</title>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; line-height: 1.6;">
  <div style="max-width: 540px; margin: 0 auto;">

    <!-- Header Sederhana -->
    <div style="padding-bottom: 14px; border-bottom: 1px solid #E2E8F0; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Cek Naskah
      </h2>
      <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748B;">
        Pemberitahuan Hasil Pemeriksaan Naskah
      </p>
    </div>

    <!-- Pesan -->
    <p style="font-size: 14px; margin: 0 0 14px 0; color: #1E293B;">
      Halo <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; margin: 0 0 18px 0; color: #334155;">
      Naskah Anda telah selesai diperiksa. Laporan hasil resmi telah terlampir pada email ini dan dapat Anda unduh langsung.
    </p>

    <!-- Rincian Sederhana -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
        <tr>
          <td style="padding: 5px 0; color: #64748B; width: 35%;">Judul Naskah</td>
          <td style="padding: 5px 0; color: #0F172A; font-weight: 600;">${title}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748B; width: 35%;">Layanan</td>
          <td style="padding: 5px 0; color: #0F172A; font-weight: 600;">${service}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748B; width: 35%;">Berkas Laporan</td>
          <td style="padding: 5px 0; color: #0F172A; font-family: monospace; font-size: 12px;">${resultFileName}</td>
        </tr>
        ${scoreRowHtml}
        ${notesRowHtml}
        <tr>
          <td style="padding: 5px 0; color: #64748B; width: 35%;">Waktu Selesai</td>
          <td style="padding: 5px 0; color: #64748B;">${timeText}</td>
        </tr>
      </table>
    </div>

    <!-- Tombol Unduh & Tautan Riwayat -->
    <div style="margin-bottom: 22px;">
      <a href="${data.resultFileUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px;">
        Unduh Laporan Hasil
      </a>
      <span style="display: inline-block; margin-left: 12px; font-size: 13px;">
        <a href="https://cek-naskah.web.id/riwayat-naskah" target="_blank" rel="noopener noreferrer" style="color: #4F46E5; text-decoration: underline;">
          Lihat di Riwayat Naskah
        </a>
      </span>
    </div>

    <p style="font-size: 13px; color: #64748B; margin: 0 0 18px 0;">
      Anda juga dapat memberikan ulasan pada naskah ini di halaman Riwayat Naskah untuk mendapatkan bonus poin.
    </p>

    <!-- Penutup Sederhana -->
    <div style="padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
      <p style="margin: 0;">Salam hangat,</p>
      <p style="margin: 2px 0 0 0; font-weight: 600; color: #475569;">Tim Cek Naskah</p>
      <p style="margin: 2px 0 0 0;"><a href="https://cek-naskah.web.id" style="color: #94A3B8; text-decoration: none;">cek-naskah.web.id</a> &bull; Bantuan WA: +62 877-5343-6305</p>
    </div>

  </div>
</body>
</html>`
}

/**
 * Sends an email message through Appwrite Messaging REST API using the configured SMTP provider.
 */
export async function sendAppwriteEmail(options: {
  userId: string
  subject: string
  content: string
  html?: boolean
  attachments?: string[]
}): Promise<AppwriteEmailResponse> {
  const config = useRuntimeConfig()
  const endpoint = (config.public.appwriteEndpoint as string) || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = (config.public.appwriteProjectId as string) || '6a9e987200268817ec4c'
  const apiKey = (config.appwriteApiKey as string) || process.env.APPWRITE_API_KEY || ''

  if (!apiKey) {
    console.error('[Appwrite Email] APPWRITE_API_KEY belum disetel.')
    return { success: false, message: 'Server configuration error: APPWRITE_API_KEY is missing.' }
  }

  if (!options.userId) {
    return { success: false, message: 'ID pengguna (userId) wajib disertakan.' }
  }

  const url = `${endpoint}/messaging/messages/email`
  const requestHeaders = {
    'x-appwrite-project': projectId,
    'x-appwrite-key': apiKey,
    'content-type': 'application/json'
  }

  const payload: Record<string, unknown> = {
    messageId: 'unique()',
    subject: options.subject,
    content: options.content,
    users: [options.userId],
    draft: false,
    html: options.html ?? true
  }

  if (Array.isArray(options.attachments) && options.attachments.length > 0) {
    payload.attachments = options.attachments
  }

  try {
    const res = await $fetch<{ $id: string, status?: string }>(url, {
      method: 'POST',
      headers: requestHeaders,
      body: payload
    })

    return {
      success: true,
      messageId: res.$id,
      message: 'Email notifikasi berhasil dikirim melalui Appwrite Messaging.',
      data: res
    }
  } catch (err: unknown) {
    // If delivery failed with attachments, retry once without attachments to guarantee delivery
    if (options.attachments && options.attachments.length > 0) {
      console.warn('[Appwrite Email] Gagal mengirim dengan lampiran, mencoba kembali tanpa lampiran:', (err as { message?: string })?.message || err)
      try {
        const retryPayload = { ...payload }
        delete retryPayload.attachments
        const retryRes = await $fetch<{ $id: string, status?: string }>(url, {
          method: 'POST',
          headers: requestHeaders,
          body: retryPayload
        })
        return {
          success: true,
          messageId: retryRes.$id,
          message: 'Email notifikasi berhasil dikirim (tanpa lampiran berkas).',
          data: retryRes
        }
      } catch (retryErr: unknown) {
        const retryMsg = (retryErr as { message?: string })?.message || 'Gagal mengirim email via Appwrite'
        console.error('[Appwrite Email Retry] Gagal mengirim email:', retryMsg, retryErr)
        return { success: false, message: retryMsg }
      }
    }

    const errMsg = (err as { data?: { message?: string }, message?: string })?.data?.message
      || (err as { message?: string })?.message
      || 'Gagal mengirim email notifikasi via Appwrite Messaging'
    console.error('[Appwrite Email] Gagal mengirim email:', errMsg, err)
    return { success: false, message: errMsg }
  }
}

/**
 * Notifies the manuscript owner via email when the admin uploads check results.
 * Strictly called only upon manuscript result upload.
 */
export async function notifyUserResultViaEmail(data: AppwriteResultEmailData): Promise<boolean> {
  if (!data.userId) {
    console.warn('[Appwrite Email Result] Tidak ada userId pada data naskah. Pengiriman email dilewati.')
    return false
  }

  const config = useRuntimeConfig()
  const bucketId = (config.public?.appwriteBucketNaskah as string) || process.env.APPWRITE_BUCKET_NASKAH || 'naskah'
  const title = data.title || 'Naskah Anda'
  const subject = `[Cek Naskah] Hasil Pemeriksaan Selesai: ${title}`
  const htmlContent = buildResultEmailHtml(data)

  const attachments: string[] = []
  if (data.resultFileId) {
    attachments.push(`${bucketId}:${data.resultFileId}`)
  }

  const res = await sendAppwriteEmail({
    userId: data.userId,
    subject,
    content: htmlContent,
    html: true,
    attachments: attachments.length > 0 ? attachments : undefined
  })

  return res.success
}
