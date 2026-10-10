# Laporan Audit Keamanan Komprehensif — Cek Naskah

**Dokumen:** Security Assessment & Remediation Report  
**Tanggal Audit:** 10 Oktober 2026  
**Target:** Repositori `cek-naskah` (`app/`, `server/`, konfigurasi sistem, dan dependensi)  
**Status:** Ditemukan 10 Isu Keamanan (1 Critical, 3 High, 3 Medium, 2 Low, 1 Informational)  

---

## 1. Pendahuluan & Ringkasan Eksekutif

Aplikasi **cek-naskah** dibangun menggunakan tumpukan teknologi modern:
- **Frontend:** Nuxt 4 (`app/`), Vue 3, `@nuxt/ui` v4, Tailwind CSS v4, dan Client SDK Appwrite.
- **Backend:** Nitro Server Engine (`server/api/`), Appwrite Server REST API Wrapper (`server/utils/admin.ts`), dan Integrasi Gateway Pembayaran Sumopod Pay (`server/utils/sumopod.ts`).
- **Database & Storage:** Appwrite Cloud (BaaS) yang mengelola tabel pengguna, transaksi, naskah, layanan, pengaturan, serta berkas dokumen.

### Hasil Penilaian Umum
- **Area Positif:**
  - Kredensial rahasia (`APPWRITE_API_KEY`, `SUMOPOD_API_KEY`, webhook secret) tidak tercatat di dalam riwayat commit Git.
  - Seluruh endpoint administratif (`server/api/admin/users/*`) telah menerapkan validasi token JWT via Appwrite Account endpoint (`getAuthUser`) dan pengecekan hak akses berbasis label `admin` (`requireAdminUser`).
  - Proteksi terhadap self-demotion dan self-deletion akun admin telah diterapkan.
  - Tidak ditemukan penggunaan `v-html` yang berpotensi XSS pada komponen frontend.
- **Area Perhatian Kritis:**
  - Ditemukan celah **fail-open** pada otentikasi webhook pembayaran.
  - Adanya pemisahan transaksi antara pemotongan saldo dan pengunggahan naskah yang berpotensi menyebabkan kerugian saldo pengguna (*point loss*) atau manipulasi pesanan gratis (*free order bypass*).
  - Kerentanan kondisi balapan (*race condition*) pada pengecekan saldo poin pengguna (*double-spending*).
  - Potensi pengalihan URL berbahaya (*Open Redirect*) pada alur login OAuth.
  - Ketiadaan *Security Response Headers* HTTP standar untuk mencegah serangan *Clickjacking*.

---

## 2. Matriks Temuan Keamanan (Vulnerability Matrix)

| ID | Tingkat Keparahan | Judul Temuan | Komponen / File Terkait | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | 🔴 **CRITICAL** | Bypass Otentikasi Webhook (Fail-Open) | `server/api/webhooks/sumopod.post.ts` | ✅ **Selesai Diperbaiki** |
| **SEC-02** | 🟠 **HIGH** | Transaksi Terpisah & Potensi Bypass Saldo Poin | `app/pages/turnitin.vue`, `useManuscripts.ts` | ✅ **Selesai Diperbaiki** |
| **SEC-03** | 🟠 **HIGH** | Race Condition Pemotongan Poin (Double-Spending) | `server/api/points/deduct.post.ts` | ✅ **Selesai Diperbaiki** |
| **SEC-04** | 🟠 **HIGH** | Race Condition Idempotensi & Pemangkasan Riwayat Webhook | `server/api/webhooks/sumopod.post.ts` | ✅ **Selesai Diperbaiki** |
| **SEC-05** | 🟡 **MEDIUM** | Kerentanan Open Redirect pada Alur Login OAuth | `app/pages/auth/callback.vue`, `app/pages/login.vue` | ✅ **Selesai Diperbaiki** |
| **SEC-06** | 🟡 **MEDIUM** | Timing Attack & Ketiadaan Replay Window pada Signature | `server/utils/sumopod.ts` | ✅ **Selesai Diperbaiki** |
| **SEC-07** | 🟡 **MEDIUM** | Ketiadaan HTTP Security Headers (Clickjacking & MIME Sniffing) | `nuxt.config.ts` | ✅ **Selesai Diperbaiki** |
| **SEC-08** | 🔵 **LOW** | Potensi Host Header Injection pada Payment Return URL | `server/api/payments/create.post.ts` | Belum Diperbaiki |
| **SEC-09** | 🔵 **LOW** | Risiko Akses Lintas Dokumen jika Izin Appwrite Terlalu Terbuka | `app/composables/useManuscripts.ts` | Verifikasi BaaS Diperlukan |
| **SEC-10** | ⚪ **INFO** | Kerentanan Dependensi Pihak Ketiga (Transitive) | `package.json`, `pnpm-lock.yaml` | Dalam Pemantauan |

---

## 3. Rincian Temuan & Rekomendasi Remediasi

---

### SEC-01 [CRITICAL] — Bypass Otentikasi Webhook (Fail-Open)

#### Lokasi Berkas
- `server/api/webhooks/sumopod.post.ts` (Baris 19–48)

#### Deskripsi & Analisis Teknis
Handler webhook Sumopod Pay memeriksa apakah rahasia tanda tangan (`SUMOPOD_WEBHOOK_SECRET`) atau token webhook (`SUMOPOD_WEBHOOK_TOKEN`) tersedia. Namun, jika kedua konfigurasi tersebut kosong atau belum didefinisikan dalam berkas lingkungan (`.env`):
```ts
if (hasSecret || hasToken) {
  // Verifikasi Svix HMAC SHA-256 atau Token
} else {
  console.warn('[Sumopod Webhook] PERINGATAN: SUMOPOD_WEBHOOK_SECRET atau SUMOPOD_WEBHOOK_TOKEN belum dikonfigurasi di .env. Memproses webhook tanpa verifikasi signature.')
}
```
Blok `else` mencetak peringatan ke konsol tetapi **tetap melanjutkan eksekusi** ke logika bisnis pemrosesan pembayaran.

#### Dampak Bisnis & Keamanan
Jika server dijalankan tanpa variabel rahasia ini (misalnya saat rilis pertama ke server produksi atau variabel `.env` tertinggal), penyerang eksternal dapat mengirimkan payload HTTP `POST` tiruan dengan format:
```json
{
  "event_type": "payment.completed",
  "data": {
    "order_id": "CN_1710000000000_TARGET_USER_ID",
    "amount": 10000000,
    "payment_id": "fake_payment_123"
  }
}
```
Server akan langsung mengkreditkan 10.000.000 poin ke akun target tanpa ada dana sepeser pun yang masuk ke rekening penyedia layanan.

#### Solusi Perbaikan (Fail-Closed)
Ubah penanganan agar server **menolak keras** setiap request jika rahasia webhook belum diset:
```ts
if (!expectedSecret && !expectedToken) {
  console.error('[Sumopod Webhook] Fatal: Webhook signing secret atau token belum dikonfigurasi.')
  throw createError({
    statusCode: 500,
    statusMessage: 'Konfigurasi webhook server tidak valid.'
  })
}
```

---

### SEC-02 [HIGH] — Transaksi Terpisah & Potensi Bypass Saldo Poin

#### Lokasi Berkas
- `app/pages/turnitin.vue` (Baris 243–267)
- `app/pages/ithenticate.vue`
- `app/pages/turnitin-ai.vue`
- `app/composables/useManuscripts.ts` (Baris 268–305)

#### Deskripsi & Analisis Teknis
Alur pemesanan dan pengunggahan naskah saat ini terpisah menjadi 2 tahap asinkron di sisi peramban klien:
1. Klien memanggil endpoint backend `/api/points/deduct` untuk memotong poin akun.
2. Jika pemotongan poin berhasil, klien kemudian mengunggah file ke Appwrite Storage (`storage.createFile`) dan membuat baris baru di database Appwrite (`tablesDB.createRow`).

#### Dampak Bisnis & Keamanan
1. **Risiko Kehilangan Saldo Pengguna (Point Loss):** Jika tahap 1 berhasil tetapi tahap 2 gagal (misalnya koneksi internet pengguna terputus saat upload file berukuran besar, atau penyimpanan Appwrite mencapai batas kuota), saldo poin pengguna telah berkurang permanen tanpa adanya pengembalian (*rollback*) atau naskah yang terdaftar.
2. **Risiko Pemesanan Gratis (Bypass Pembayaran):** Jika hak akses (*Permission*) koleksi `naskah` di Appwrite Console mengizinkan `users` untuk membuat baris (*Create*), seorang pengguna dapat memanggil `storage.createFile` dan `tablesDB.createRow` langsung melalui JavaScript console di browser tanpa memanggil `/api/points/deduct`.

#### Solusi Perbaikan
Pindahkan seluruh proses transaksi naskah ke sisi server melalui endpoint terpusat:
1. Buat endpoint baru `server/api/manuscripts/submit.post.ts`.
2. Klien mengirim data formulir beserta file sebagai `multipart/form-data`.
3. Server memverifikasi JWT, memeriksa saldo, memotong saldo, mengunggah file ke Appwrite Storage via Server SDK, dan mencatat data naskah secara atomik.
4. Kunci hak akses tabel `naskah` di Appwrite Console sehingga peran `users` tidak memiliki hak *Create* langsung dari browser klien.

---

### SEC-03 [HIGH] — Race Condition Pemotongan Poin (Double-Spending)

#### Lokasi Berkas
- `server/api/points/deduct.post.ts` (Baris 23–65)

#### Deskripsi & Analisis Teknis
Logika pemotongan poin dilakukan dengan pola `Read -> Check -> Write`:
```ts
const user = await adminAppwrite.getUser(authUser.$id)
const currentPoints = user.prefs.points || 0

if (currentPoints < amount) {
  throw createError(...)
}

const finalPoints = Math.max(0, currentPoints - Math.round(amount))
await adminAppwrite.updatePrefs(authUser.$id, {
  ...currentPrefs,
  points: finalPoints
})
```
Appwrite User Preferences tidak mendukung operasi pengurangan atomik (*atomic decrement*).

#### Dampak Bisnis & Keamanan
Jika pengguna mengirimkan beberapa request pemotongan poin secara serentak dalam jendela milidetik yang sama (misalnya melalui klik cepat berulang kali atau skrip otomatis), seluruh request akan membaca nilai `currentPoints` yang sama sebelum salah satu proses berhasil menulis ke database. Hal ini memungkinkan pengguna memesan layanan melebihi batas saldo yang mereka miliki (*double-spending*).

#### Solusi Perbaikan
1. Terapkan mekanisme *Optimistic Concurrency Control* (OCC) dengan menambahkan kolom versi `version` atau stempel waktu `lastUpdated` pada preferensi pengguna. Jika versi saat commit berbeda dengan versi saat pembacaan, proses dibatalkan dan diminta untuk mencoba kembali (*retry*).
2. Alternatif jangka panjang: Simpan saldo dalam buku besar terpisah (*ledger table*) di database Appwrite yang divalidasi dengan constraint unik per transaksi.

---

### SEC-04 [HIGH] — Race Condition Idempotensi & Pemangkasan Riwayat Webhook

#### Lokasi Berkas
- `server/api/webhooks/sumopod.post.ts` (Baris 108–147)

#### Deskripsi & Analisis Teknis
Pengecekan idempotensi webhook dilakukan dengan membaca preferensi akun pengguna:
```ts
const rawHistory = Array.isArray(currentPrefs.pointHistory) ? currentPrefs.pointHistory : []
const isAlreadyProcessed = rawHistory.some(tx => tx.id === data.payment_id || tx.orderId === data.order_id)
...
const updatedHistory = [txRecord, ...rawHistory].slice(0, 50)
await adminAppwrite.updatePrefs(userId, { points: newPoints, pointHistory: updatedHistory })
```

#### Masalah:
1. **Pemangkasan Riwayat (`slice(0, 50)`):** Hanya 50 transaksi terakhir yang disimpan dalam preferensi. Jika webhook pengulangan diterima setelah akun tersebut memiliki lebih dari 50 transaksi berikutnya, sistem akan gagal mengenali bahwa transaksi tersebut telah diproses.
2. **Kondisi Balapan Webhook Serentak:** Jika webhook pengulangan dikirim oleh gateway secara paralel karena latensi, kedua request membaca `rawHistory` yang belum diperbarui, melewati pengecekan idempotensi, dan menambahkan poin dua kali.

#### Solusi Perbaikan
Lakukan verifikasi idempotensi dengan melakukan query langsung ke tabel database `transaksi_poin` menggunakan `orderId` atau `paymentId`:
```ts
const existingTx = await adminAppwrite.findPointTransaction(data.payment_id, data.order_id)
if (existingTx) {
  return { success: true, message: 'Transaksi telah diproses sebelumnya.' }
}
```

---

### SEC-05 [MEDIUM] — Kerentanan Open Redirect pada Alur Login OAuth

#### Lokasi Berkas
- `app/pages/login.vue` (Baris 48)
- `app/pages/register.vue` (Baris 53)
- `app/pages/auth/callback.vue` (Baris 64–74)
- `app/pages/auth/complete-phone.vue` (Baris 68–75)

#### Deskripsi & Analisis Teknis
Parameter query `redirect` pada halaman login disimpan langsung ke `localStorage`/`sessionStorage` tanpa sanitasi:
```ts
// login.vue
const redirect = (route.query.redirect as string) || '/'
loginWithGoogle(redirect)

// callback.vue
let destination = localStorage.getItem('oauth_redirect_path') || '/'
await navigateTo(destination, { replace: true })
```

#### Dampak Bisnis & Keamanan
Penyerang dapat membuat tautan phising:
`https://cek-naskah.web.id/login?redirect=https://evil-phishing-site.com`  
atau variasi protocol-relative:
`https://cek-naskah.web.id/login?redirect=//evil-phishing-site.com`  
Pengguna mengira mereka sedang masuk ke platform resmi Cek Naskah dengan akun Google mereka. Setelah login sukses, peramban akan mengarahkan pengguna ke situs penyerang yang dapat mencuri kredensial lanjutan atau menyebarkan malware.

#### Solusi Perbaikan
Buat fungsi utilitas pembersih tautan yang membatasi pengalihan hanya ke jalur internal yang aman:
```ts
export function sanitizeRedirectPath(path?: string | null): string {
  if (!path || typeof path !== 'string') return '/'
  const clean = path.trim()
  // Pastikan dimulai dengan satu garis miring '/' dan bukan '//' atau '/\'
  if (clean.startsWith('/') && !clean.startsWith('//') && !clean.startsWith('/\\')) {
    return clean
  }
  return '/'
}
```

---

### SEC-06 [MEDIUM] — Timing Attack & Ketiadaan Replay Window pada Signature

#### Lokasi Berkas
- `server/utils/sumopod.ts` (Baris 140–165)

#### Deskripsi & Analisis Teknis
Fungsi `verifySvixSignature` menggunakan operator `.includes()` untuk mencocokkan signature:
```ts
const signatures = svixSignature.split(' ').map(s => s.split(',')[1])
return signatures.includes(expectedSignature)
```
Selain itu, header `svixTimestamp` tidak diperiksa selisih waktunya terhadap jam server saat ini.

#### Dampak Bisnis & Keamanan
1. **Timing Side-Channel:** Perbandingan string standar berhenti pada karakter pertama yang tidak cocok, memungkinkan analisis waktu untuk merekonstruksi signature.
2. **Replay Attack:** Paket webhook yang berhasil disadap dapat dikirim ulang berulang kali tanpa batas waktu karena ketiadaan validasi jendela toleransi kedaluwarsa.

#### Solusi Perbaikan
Gunakan `crypto.timingSafeEqual` dan tetapkan jendela kedaluwarsa 5 menit (300 detik) sesuai spesifikasi Svix:
```ts
// 1. Verifikasi batas waktu replay (5 menit)
const timestampMs = parseInt(svixTimestamp, 10) * 1000
const now = Date.now()
if (isNaN(timestampMs) || Math.abs(now - timestampMs) > 5 * 60 * 1000) {
  return false
}

// 2. Verifikasi tanda tangan dengan waktu konstan
const expectedBuf = Buffer.from(expectedSignature, 'utf-8')
const isValid = signatures.some((sig) => {
  if (!sig) return false
  const candidateBuf = Buffer.from(sig, 'utf-8')
  return candidateBuf.length === expectedBuf.length && crypto.timingSafeEqual(candidateBuf, expectedBuf)
})
```

---

### SEC-07 [MEDIUM] — Ketiadaan HTTP Security Headers

#### Lokasi Berkas
- `nuxt.config.ts`

#### Deskripsi & Analisis Teknis
Konfigurasi Nuxt saat ini belum mendefinisikan header keamanan HTTP pada respon server.

#### Dampak Bisnis & Keamanan
- Ketiadaan `X-Frame-Options` dan `frame-ancestors` memungkinkan situs disematkan ke dalam `<iframe>` di situs eksternal (*Clickjacking*), berpotensi memanipulasi klik pengguna pada antarmuka top up pembayaran atau konfirmasi pemotongan poin.
- Ketiadaan `X-Content-Type-Options: nosniff` memungkinkan peramban mengeksekusi file berbahaya yang disamarkan tipe kontennya.
- Ketiadaan `Referrer-Policy` berisiko membocorkan URL internal dan parameter sesi ke situs pihak ketiga.

#### Solusi Perbaikan
Tambahkan konfigurasi `routeRules` pada `nuxt.config.ts`:
```ts
routeRules: {
  '/**': {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  }
}
```

---

### SEC-08 [LOW] — Potensi Host Header Injection pada Payment Return URL

#### Lokasi Berkas
- `server/api/payments/create.post.ts` (Baris 19–28)

#### Deskripsi & Analisis Teknis
Pembuatan URL balik (*return URL*) pembayaran mengambil nama host dari header HTTP:
```ts
const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || ''
```
Jika proksi terbalik (*reverse proxy*) di depan server tidak membersihkan header `x-forwarded-host` yang dikirim dari klien luar, penyerang dapat memanipulasi URL sukses/batal pembayaran ke domain berbahaya.

#### Solusi Perbaikan
Gunakan URL situs resmi yang terkonfigurasi pada `runtimeConfig` atau environment:
```ts
const config = useRuntimeConfig()
const baseUrl = (config.public.siteUrl as string) || process.env.NUXT_PUBLIC_SITE_URL || 'https://cek-naskah.web.id'
```

---

### SEC-09 [LOW / AUDIT] — Risiko Akses Lintas Dokumen jika Izin Appwrite Terlalu Terbuka

#### Lokasi Berkas
- `app/composables/useManuscripts.ts` (Baris 227)
- Appwrite Console: Koleksi `naskah` dan Bucket `naskah-bucket`

#### Deskripsi & Analisis Teknis
Fungsi `fetchAllManuscripts` melakukan pembacaan langsung dari peramban klien:
```ts
const res = await tablesDB.listRows<ManuscriptRow>({ databaseId, tableId, queries })
```
Jika perizinan pada koleksi `naskah` di Appwrite Console memiliki role `users` dengan hak `Read`, setiap pengguna yang memiliki sesi aktif dapat membaca naskah ilmiah, skor similaritas, nama lengkap, alamat email, dan nomor telepon milik pengguna lain dengan memanggil fungsi tersebut di konsol peramban.

#### Tindakan yang Diperlukan
1. Buka Appwrite Console > Databases > `naskah`.
2. Pastikan opsi **Document Level Security (DLS)** aktif.
3. Pastikan izin baca (*Read*) per dokumen dibatasi ke `user:[USER_ID]` dokumen bersangkutan.
4. Akses pembacaan seluruh dokumen untuk admin wajib dialihkan melalui endpoint server Nitro yang menggunakan `APPWRITE_API_KEY`.

---

### SEC-10 [INFO] — Kerentanan Dependensi Pihak Ketiga (Transitive)

#### Deskripsi & Analisis
Hasil pemeriksaan `pnpm audit` menunjukkan 60 peringatan audit pada dependensi transitive (seperti `tar`, `simple-git`, `undici`, `shell-quote`, dan `brace-expansion`). Sebagian besar berasal dari peralatan pengembangan seperti `@nuxt/devtools`, `@vercel/nft`, dan `launch-editor`.

#### Rekomendasi
1. Pastikan modul DevTools hanya aktif di lingkungan lokal:
   ```ts
   devtools: {
     enabled: process.env.NODE_ENV !== 'production'
   }
   ```
2. Jalankan pembaruan dependensi berkala melalui `pnpm update`.

---

## 4. Jadwal & Rekomendasi Prioritas Remediasi

### Fase 1: Perbaikan Segera (Urgent / Hotfix)
- [x] **SEC-01:** Ubah webhook Sumopod menjadi mode *fail-closed* di `server/api/webhooks/sumopod.post.ts`. *(Selesai)*
- [x] **SEC-05:** Terapkan pembersih `sanitizeRedirectPath` pada seluruh alur login di `app/pages/login.vue` dan `app/pages/auth/callback.vue`. *(Selesai)*
- [x] **SEC-06:** Terapkan `crypto.timingSafeEqual` dan jendela waktu 5 menit di `server/utils/sumopod.ts`. *(Selesai)*
- [x] **SEC-07:** Pasang header keamanan HTTP standar di `nuxt.config.ts`. *(Selesai)*
- [ ] **SEC-08:** Ganti pengambilan host mentah dengan domain resmi di `server/api/payments/create.post.ts`.

### Fase 2: Penguatan Arsitektur Transaksional
- [x] **SEC-04:** Pindahkan validasi idempotensi pembayaran ke tabel database `transaksi_poin` & concurrency lock. *(Selesai)*
- [x] **SEC-03:** Tambahkan validasi versi konkurensi (*withUserLock*) pada saldo poin. *(Selesai)*
- [x] **SEC-02:** Buat endpoint server terintegrasi `/api/manuscripts/submit` untuk menggabungkan upload file dan pemotongan saldo secara atomik. *(Selesai)*
- [ ] **SEC-09:** Verifikasi dan kunci perizinan koleksi Appwrite agar menerapkan Document Level Security.
