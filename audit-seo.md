# SEO Audit Report — cek-naskah.web.id

- **Tanggal audit:** 12 September 2026, 15:11:02
- **Skor SEO Keseluruhan:** 50/100 (Grade **D** — Perlu Peningkatan)
- **Ringkasan:** Fondasi sudah cukup solid, namun beberapa perbaikan diperlukan untuk mendorong skor lebih tinggi.

## Ringkasan Status Temuan

| Status | Jumlah | Keterangan |
|---|---|---|
| ✅ Passed | 25 | Semua baik |
| ⚠️ Warning | 11 | Perlu perhatian |
| ❌ Failed | 0 | Tidak ada isu kritis |
| ℹ️ Info | 5 | Insight tambahan |

## Skor per Kategori

| Kategori | Skor |
|---|---|
| Technical SEO | 100% |
| On-Page SEO | 71% |
| Performance | 25% |
| Mobile SEO | 100% |
| Security | 25% |
| User Experience | 100% |

## Skor Kesiapan AI & Answer Engine

| Metrik | Skor |
|---|---|
| AEO (Answer Engine Optimization — ChatGPT, Gemini, Perplexity) | 75/100 |
| GEO (Generative Engine Optimization — kesiapan sitasi LLM) | 73/100 |
| Kombinasi | 74/100 |

## Tiga Prioritas Utama (Top Priorities)

1. **Title Tag** — Prioritas Sedang
2. **Meta Description** — Prioritas Sedang
3. **Server Response Time** — Prioritas Sedang

> Catatan: Memperbaiki tiga isu prioritas di atas adalah cara tercepat untuk menaikkan skor.

---

## Detail Hasil Audit

### 1. On-Page SEO

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Title Tag | ⚠️ Warning | "Platform Cek Plagiasi & AI: Turnitin / iThenticate No. 1 di ..." | Terlalu panjang (83 karakter). Berisiko terpotong di hasil pencarian. |
| Meta Description | ⚠️ Warning | "Platform Cek Plagiasi & AI No. 1 di Indonesia dengan garansi..." | Terlalu panjang (205 karakter). Akan terpotong di hasil pencarian. |
| H1 Heading | ✅ Pass | "Solusi Naskah Akademik, Bebas Plagiasi" | Hanya 1 tag H1 — struktur SEO sempurna. |
| H2 Headings | ✅ Pass | 3 ditemukan | Contoh: "4 Solusi Utama Naskah Akademik Anda", "Tarif Ramah Akademisi & Mahasiswa..." |
| H3 Headings | ✅ Pass | 12 ditemukan | Contoh: "Cek Plagiarisme iThenticate / Turnitin", "AI Writer Detector Turnitin..." |
| H4 Headings | ✅ Pass | 4 ditemukan | Contoh: "Garansi Kerahasiaan & 100% No-Repository", "Navigasi & Layanan..." |
| Canonical URL | ✅ Pass | `https://cek-naskah.web.id` | Sudah dikonfigurasi dengan benar. |
| Meta Keywords | ℹ️ Info | "cek plagiasi dan ai, cek plagiasi, cek plagiarisme dan ai, c..." | Google mengabaikan tag ini. |

### 2. Technical SEO

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Character Encoding | ✅ Pass | UTF-8 | Sudah benar. |
| Robots Meta Tag | ✅ Pass | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` | Sudah dikonfigurasi dengan baik. |
| Hreflang Tags | ℹ️ Info | Tidak ditemukan | Jika ada konten multi-bahasa, tambahkan hreflang untuk SEO internasional. |
| Robots.txt | ✅ Pass | Ditemukan & dapat diakses — `https://cek-naskah.web.id/robots.txt` | Tidak memblokir situs. Terdapat referensi sitemap di dalamnya. |
| XML Sitemap | ✅ Pass | Ditemukan (6 URL) — `https://cek-naskah.web.id/sitemap.xml` | Dapat diakses mesin pencari. |
| Server Technology | ℹ️ Info | `swoole-http-server` | Informasi server terekspos; sebaiknya disembunyikan untuk keamanan. |

### 3. Kualitas Konten (Content Quality)

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Word Count | ✅ Pass | 1.790 kata | Jumlah kata baik untuk peringkat SEO. |
| Internal Links | ✅ Pass | 16 tautan | Struktur internal linking baik (16 internal, 7 eksternal). |
| External Links | ℹ️ Info | 7 tautan | Tautan eksternal ke sumber otoritatif dapat meningkatkan kredibilitas. |
| Text-to-HTML Ratio | ✅ Pass | 17,6% | Keseimbangan konten teks vs kode HTML baik. |

### 4. Performance

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Server Response Time | ⚠️ Warning | 2.877 ms | Waktu respons cukup lambat. Target: di bawah 1.000 ms. |
| Page Size | ✅ Pass | 83,4 KB | Ukuran halaman baik, cepat diunduh di semua koneksi. |
| Compression (GZIP/Brotli) | ⚠️ Warning | Tidak aktif | Aktifkan GZIP/Brotli untuk mengurangi ukuran transfer halaman. |
| Browser Caching | ⚠️ Warning | Belum dikonfigurasi | Atur header Cache-Control untuk performa kunjungan berulang. |

### 5. Security

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| HTTPS / SSL | ✅ Pass | Aktif | Situs menggunakan HTTPS — baik untuk SEO dan kepercayaan pengguna. |
| X-Frame-Options | ⚠️ Warning | Hilang | Situs berisiko terhadap serangan clickjacking. |
| X-Content-Type-Options | ⚠️ Warning | Hilang | Browser dapat salah menafsirkan tipe file. |
| HSTS Header | ⚠️ Warning | Hilang | Tambahkan untuk memaksa HTTPS & mencegah downgrade attack. |
| Content Security Policy | ⚠️ Warning | Hilang | Tidak ada CSP untuk mengontrol resource yang boleh dimuat browser. |
| Referrer-Policy | ⚠️ Warning | Hilang | Perlu untuk mengontrol kebocoran informasi referrer ke pihak ketiga. |
| Permissions-Policy | ⚠️ Warning | Hilang | Perlu untuk membatasi API browser yang dapat diakses skrip pihak ketiga. |
| Mixed Content | ✅ Pass | Tidak terdeteksi | Semua resource dimuat melalui HTTPS. |
| Cookie Security | ℹ️ Info | Tidak ada cookie diset | Jika ada cookie di bagian lain situs, pastikan flag Secure, HttpOnly, SameSite digunakan. |

### 6. Social & Rich Data

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Open Graph Tags | ✅ Pass | 5/5 tag terkonfigurasi | og:title, og:description, og:image, og:url, og:type — sudah lengkap. |
| Twitter Card Tags | ✅ Pass | Tipe: `summary_large_image` | 4/4 tag terkonfigurasi dengan baik. |
| Schema.org Markup | ✅ Pass | 1 blok schema | Data terstruktur ditemukan — berpotensi menghasilkan rich snippet. |
| Favicon | ✅ Pass | Ada (`/logo.png`) | Favicon terkonfigurasi. |

### 7. Accessibility

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Image Alt Text | ✅ Pass | Semua 15 gambar memiliki alt | Sangat baik, semua gambar punya atribut alt deskriptif. |
| ARIA Attributes | ✅ Pass | 11 elemen | Baik untuk aksesibilitas pembaca layar. |
| HTML Lang Attribute | ✅ Pass | `lang="id"` | Membantu mesin pencari & pembaca layar. |

### 8. Mobile Optimization

| Item | Status | Temuan | Catatan |
|---|---|---|---|
| Viewport Meta Tag | ✅ Pass | Terkonfigurasi | Sudah benar untuk perangkat mobile. |
| Mobile-Friendly | ✅ Pass | Kemungkinan besar mobile-friendly | Viewport meta tag sudah benar. |
| Tap Targets | ✅ Pass | 42 elemen interaktif | Pastikan ukuran minimal 44x44px untuk usability mobile. |

---

## Rencana Aksi Prioritas (Priority Action Plan)

1. **Title Tag** — Terlalu panjang (83 karakter). Berisiko terpotong di hasil pencarian.
2. **Meta Description** — Terlalu panjang (205 karakter). Akan terpotong di hasil pencarian.
3. **Server Response Time** — Moderat (2.877 ms). Target di bawah 1.000 ms.
4. **Compression (GZIP/Brotli)** — Aktifkan untuk mengurangi ukuran transfer halaman.
5. **Browser Caching** — Atur header Cache-Control.
6. **X-Frame-Options** — Tambahkan header untuk mencegah clickjacking.
7. **X-Content-Type-Options** — Tambahkan header agar browser tidak salah interpretasi tipe file.
8. **HSTS Header** — Tambahkan untuk memaksa HTTPS & mencegah downgrade attack.
9. **Content Security Policy** — Tambahkan CSP.
10. **Referrer-Policy** — Tambahkan untuk kontrol kebocoran informasi referrer.
11. **Permissions-Policy** — Tambahkan untuk membatasi akses API browser pihak ketiga.

---

## AEO — Answer Engine Optimization
*Agar dikutip oleh ChatGPT, Google AI Overviews, Gemini, dan Perplexity*

### ⚠️ Title Tag
- **Apa yang harus dilakukan:** Tulis ulang sebagai pertanyaan langsung atau jawaban definitif, misalnya "How to Fix X" / "What Is X: Complete Guide 2025". Letakkan kata kunci utama di 3 kata pertama. Batasi di bawah 60 karakter.
- **Langkah-langkah:**
  1. Buka CMS, temukan field judul halaman.
  2. Ubah agar dimulai dengan kata kunci utama.
  3. Tambahkan power word: Complete, Ultimate, Proven, Step-by-Step.
  4. Uji di seotesteronline.com/serp-snippet-generator.
- **Mengapa penting:** Mesin jawaban AI menggunakan title tag sebagai sinyal topik utama. Judul berformat pertanyaan cocok dengan cara pengguna bertanya ke AI. Halaman dengan H1 gaya pertanyaan muncul 2,3× lebih sering di AI Overviews.
- **Intelijen kompetitor:** Situs yang paling banyak dikutip di Perplexity memakai judul "What Is", "How To", atau "Best [Year]" — bukan nama brand.
- **Platform AI:** Google AI Overviews · ChatGPT · Perplexity · Bing Copilot

### ⚠️ Meta Description
- **Apa yang harus dilakukan:** Tulis meta description 145–155 karakter sebagai jawaban faktual mandiri — bukan teaser. Mulai dengan jawaban, bukan "Learn how to...". Sertakan satu angka atau hasil spesifik.
- **Langkah-langkah:**
  1. Identifikasi pertanyaan #1 yang dijawab halaman.
  2. Tulis jawabannya di kalimat pertama (80 karakter).
  3. Tambahkan konteks/statistik spesifik di kalimat kedua.
  4. Hindari "Click to learn" atau bahasa pemasaran.
- **Mengapa penting:** Perplexity dan ChatGPT web browsing mengekstrak meta description sebagai pratinjau konten. Deskripsi padat fakta dengan data spesifik dikutip hingga 3× lebih banyak. AI Overviews mengambil deskripsi secara verbatim sebagai cuplikan jawaban.
- **Intelijen kompetitor:** Bank of America (32,2% visibilitas AI di sektor perbankan) menggunakan deskripsi faktual dan sarat statistik — bukan copy pemasaran.
- **Platform AI:** Google AI Overviews · Perplexity · ChatGPT web · Bing Copilot

### 💡 Schema.org Markup (Best Practice)
- **Apa yang harus dilakukan:** Tambahkan schema FAQPage untuk konten Q&A, Article + Author dengan kredensial, dan HowTo untuk panduan. Gunakan format JSON-LD, validasi sebelum publikasi.
- **Langkah-langkah:**
  1. Instal Rank Math/Yoast (WordPress) atau tambahkan JSON-LD manual.
  2. Tambahkan FAQPage schema di setiap bagian FAQ — daftar pasangan Q&A persis.
  3. Tambahkan Article schema dengan nama penulis, kredensial, dateModified.
  4. Tambahkan HowTo schema untuk halaman proses/panduan.
- **Mengapa penting:** Schema adalah perubahan AEO dengan ROI tertinggi. Sistem AI menggunakan FAQPage untuk mengekstrak pasangan Q&A langsung, Article+Author untuk verifikasi E-E-A-T, dan HowTo untuk kueri prosedural. Early adopter muncul di jawaban AI 10× lebih cepat.
- **Intelijen kompetitor:** Forbes, Investopedia, dan Healthline — tiga domain paling banyak dikutip lintas platform AI — semuanya memiliki FAQPage + Article + Author schema di setiap halaman.
- **Platform AI:** Google AI Overviews · Bing AI · Semua pipeline indexing LLM

### 💡 HTTPS / SSL (Best Practice)
- **Apa yang harus dilakukan:** Migrasi ke HTTPS segera. Dapatkan SSL dari Let's Encrypt (gratis). Paksa HTTPS via .htaccess. Perbarui semua tautan internal. Implementasikan header HSTS.
- **Langkah-langkah:**
  1. Dapatkan sertifikat SSL via Let's Encrypt atau hosting.
  2. Tambahkan redirect di .htaccess.
  3. Perbarui semua tautan hardcoded `http://` di konten.
  4. Tambahkan header Strict-Transport-Security.
- **Mengapa penting:** HTTPS adalah baseline mutlak untuk sitasi AI apa pun. Dataset pelatihan LLM didominasi HTTPS. Perplexity, Bing Copilot, dan sistem AI Google menyaring halaman HTTP tanpa pengecualian.
- **Intelijen kompetitor:** Nol dari 1.000 domain paling banyak dikutip di platform AI mana pun yang menggunakan HTTP.
- **Platform AI:** Semua platform AI — persyaratan universal non-negotiable

### 💡 FAQ Content Sections (Best Practice)
- **Apa yang harus dilakukan:** Tambahkan bagian FAQ khusus di setiap halaman utama dengan 8–12 Q&A menggunakan pertanyaan persis yang diketik pengguna ke AI. Bungkus dengan schema FAQPage.
- **Langkah-langkah:**
  1. Gunakan "People Also Ask" Google dan AnswerThePublic untuk pertanyaan nyata.
  2. Tambahkan bagian FAQ di bagian bawah setiap halaman utama.
  3. Gunakan pertanyaan sebagai H3, jawaban sebagai paragraf (50–80 kata).
  4. Tambahkan schema JSON-LD FAQPage yang sesuai dengan setiap Q&A.
- **Mengapa penting:** Bagian FAQ adalah format konten yang paling sering dikutip AI. Mesin AI mengekstrak pasangan Q&A individual dan menggunakannya sebagai respons langsung. Halaman dengan schema FAQ 5× lebih mungkin muncul di AI Overviews.
- **Intelijen kompetitor:** NerdWallet menambahkan 10–15 FAQ di setiap halaman — pendorong utama dominasi mereka dalam sitasi AI keuangan.
- **Platform AI:** Google AI Overviews · ChatGPT · Perplexity · Claude

### 💡 H1 Heading (Best Practice)
- **Apa yang harus dilakukan:** Jadikan H1 sebagai pertanyaan persis yang akan diketik pengguna target ke ChatGPT. Format: "How to [Action] [Topic]" atau "[Topic]: The Complete [Year] Guide". Maksimal 70 karakter.
- **Langkah-langkah:**
  1. Cari topik target di Perplexity — catat bagaimana AI menuliskan ulang pertanyaannya.
  2. Gunakan frasa itu sebagai H1.
  3. Letakkan kata kunci utama di 4 kata pertama.
  4. Pastikan hanya ada SATU H1 per halaman.
- **Mengapa penting:** Sistem RAG (Retrieval-Augmented Generation) memecah dokumen berdasarkan batas heading. H1 menjadi pemahaman AI secara keseluruhan tentang topik halaman. H1 yang tidak sesuai menyebabkan AI salah mengklasifikasikan konten.
- **Intelijen kompetitor:** Setiap sitasi teratas di Perplexity menggunakan H1 berupa pertanyaan atau mencantumkan tahun. Tidak ada sitasi teratas yang memakai nama brand sebagai H1.
- **Platform AI:** ChatGPT · Claude · Gemini · Perplexity · Google AI Overviews

### 💡 Answer-First Structure (Best Practice)
- **Apa yang harus dilakukan:** Tambahkan blok "Quick Answer" di paling atas setiap halaman — 2–3 kalimat yang langsung menjawab pertanyaan utama halaman. Gunakan kotak bergaya visual berbeda.
- **Langkah-langkah:**
  1. Identifikasi pertanyaan #1 yang dijawab halaman.
  2. Tambahkan kotak berlabel "Quick Answer" atau "TL;DR" di bagian atas.
  3. Tulis 40–60 kata yang langsung menjawab pertanyaan.
  4. Gunakan bahasa sederhana dan faktual — tanpa nada pemasaran.
- **Mengapa penting:** Mesin jawaban AI mengekstrak jawaban paling langsung dan di depan. Struktur piramida terbalik (jawaban → bukti → konteks) adalah format yang dikenali sistem AI. Halaman dengan struktur ini muncul di featured snippet dan AI Overviews.
- **Intelijen kompetitor:** Setiap artikel teratas Healthline, Mayo Clinic, dan WebMD dibuka dengan kotak jawaban cepat — alasan utama mereka memimpin sitasi AI medis.
- **Platform AI:** Google AI Overviews · Perplexity · ChatGPT

### 💡 Original Data & Statistics (Best Practice)
- **Apa yang harus dilakukan:** Sertakan 3–5 statistik proprietary, temuan riset asli, atau data unik di setiap halaman utama. Kutip semua sumber eksternal dengan penulis + publikasi + tanggal.
- **Langkah-langkah:**
  1. Lakukan survei, analisis data sendiri, atau kompilasi data industri.
  2. Tambahkan kotak "Key Statistics" dekat bagian atas halaman utama.
  3. Buat infografis yang dapat dibagikan dari data tersebut.
  4. Format: "X% dari [audiens] mengatakan [temuan] — Survei [Brand Anda], [Tahun]".
- **Mengapa penting:** LLM sangat menyukai konten dengan data asli. Statistik proprietary dikutip di seluruh web — setiap sitasi memperkuat otoritas entitas Anda.
- **Intelijen kompetitor:** Semrush, Ahrefs, dan Hubspot memproduksi laporan riset tahunan khusus untuk menghasilkan statistik yang dikutip AI — data proprietary mereka adalah sumber #1 visibilitas AI mereka.
- **Platform AI:** ChatGPT · Perplexity · Claude — preferensi sitasi faktual

### 💡 H2–H4 Headings (Best Practice)
- **Apa yang harus dilakukan:** Restrukturisasi SEMUA subjudul H2/H3 sebagai pertanyaan mandiri. Setiap bagian harus menjawab headingnya sendiri secara independen dalam 75–200 kata. Gunakan pembuka "What", "How", "Why", "When".
- **Langkah-langkah:**
  1. Ekspor daftar tag H2/H3 saat ini.
  2. Ubah setiap tag menjadi format pertanyaan.
  3. Tulis jawaban langsung 75 kata tepat di bawah setiap heading.
  4. Tambahkan tabel atau daftar bullet di setiap bagian utama.
- **Mengapa penting:** Sistem sitasi AI mengekstrak konten dalam potongan yang dibatasi oleh heading. Bagian yang mandiri 4× lebih mungkin digunakan sebagai sitasi AI.
- **Intelijen kompetitor:** Healthline — salah satu domain paling banyak dikutip AI — menggunakan format H2 pertanyaan + jawaban 2 kalimat + detail yang bisa diperluas di setiap bagian.
- **Platform AI:** Google AI Overviews · ChatGPT · Perplexity · Claude

### 💡 AI Bot Access / robots.txt (Best Practice)
- **Apa yang harus dilakukan:** Verifikasi robots.txt mengizinkan: GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended, Gemini, BingBot. Memblokir bot ini menghilangkan Anda dari pelatihan dan pengindeksan AI.
- **Langkah-langkah:**
  1. Kunjungi yourdomain.com/robots.txt.
  2. Cari "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended".
  3. Jika ada di aturan Disallow, hapus.
  4. (Opsional) Tambahkan aturan Allow eksplisit untuk setiap bot.
- **Mengapa penting:** Memblokir crawler AI mencegah konten pernah diindeks atau dikutip. GPTBot dan ClaudeBot bersifat opt-out secara default. Banyak situs tanpa sengaja memblokirnya lewat aturan Disallow wildcard yang terlalu luas.
- **Intelijen kompetitor:** Semua domain teratas yang dikutip AI mengonfirmasi akses GPTBot dan ClaudeBot. Perplexity menerbitkan panduan bahwa memblokir bot mereka menghilangkan situs dari sitasi Perplexity secara permanen.
- **Platform AI:** ChatGPT · Claude · Perplexity · Google AI — akses pengindeksan

### 💡 Author E-E-A-T Signals (Best Practice)
- **Apa yang harus dilakukan:** Tambahkan bio penulis bernama dengan kredensial, URL LinkedIn, dan halaman penulis khusus di setiap konten. Tambahkan Person schema dengan jobTitle, knowsAbout, dan sameAs.
- **Langkah-langkah:**
  1. Buat halaman penulis untuk setiap penulis: nama, foto, kredensial, bio.
  2. Tautkan setiap byline artikel ke halaman penulis.
  3. Tambahkan Person schema: name, jobTitle, knowsAbout, sameAs (URL LinkedIn).
  4. Dorong penulis untuk dipublikasikan/dikutip di situs otoritatif eksternal.
- **Mengapa penting:** Sistem AI menggunakan sinyal E-E-A-T (Experience, Expertise, Authoritativeness, Trust). Pakar bernama dengan kredensial terverifikasi dikutip 4× lebih banyak dibanding konten anonim.
- **Intelijen kompetitor:** Investopedia mewajibkan setiap artikel ditinjau pakar bersertifikat — badge "Reviewed By" adalah alasan utama mereka memimpin sitasi AI finansial.
- **Platform AI:** Google AI Overviews · Bing AI · Perplexity — verifikasi E-E-A-T

### 💡 Word Count (Best Practice — AEO)
- **Apa yang harus dilakukan:** Tambahkan kotak "Quick Answer" (40–60 kata) di paling atas, lalu perluas ke 1.500–2.500 kata di bawahnya. Gunakan struktur piramida terbalik: jawaban dulu, konteks kedua, detail ketiga.
- **Langkah-langkah:**
  1. Tambahkan kotak "Quick Answer:"/"TL;DR:" di atas setiap halaman utama.
  2. Tulis 2–3 kalimat jawaban langsung untuk topik utama.
  3. Susun sisa halaman dalam bagian-bagian di bawahnya.
  4. Target 1.500+ kata untuk topik kompetitif.
- **Mengapa penting:** Mesin AI mengekstrak jawaban ringkas paling awal. Halaman dengan blok jawaban-di-depan tampil di AI Overviews 3× lebih sering.
- **Intelijen kompetitor:** Setiap halaman NerdWallet dan Bankrate dimulai dengan kotak "Quick Answer" — alasan mereka mendominasi sitasi AI keuangan.
- **Platform AI:** ChatGPT · Perplexity · Google AI Overviews

### 💡 Canonical URL (Best Practice — AEO)
- **Apa yang harus dilakukan:** Setel canonical self-referencing di setiap halaman menunjuk versi HTTPS dengan kebijakan trailing-slash yang konsisten. Redirect semua varian (HTTP, www/non-www, trailing slash) ke canonical.
- **Langkah-langkah:**
  1. Tambahkan `<link rel="canonical" href="https://yourdomain.com/page/">` di setiap halaman.
  2. Pilih kebijakan trailing-slash — konsisten 100%.
  3. Siapkan 301 redirect untuk semua varian non-canonical.
  4. Verifikasi dengan Screaming Frog atau Ahrefs.
- **Mengapa penting:** Crawler AI mengonsolidasikan sinyal peringkat di URL canonical. Tanpa canonical, otoritas konten terpecah di versi duplikat.
- **Platform AI:** Google AI Overviews · Bing AI · Semua crawler AI

### 💡 Open Graph Tags (Best Practice — AEO)
- **Apa yang harus dilakukan:** Setel og:description sebagai ringkasan faktual mandiri (bukan teaser). Tambahkan og:type="article", og:article:author, og:article:published_time, og:article:modified_time.
- **Mengapa penting:** Perplexity dan ChatGPT web browsing mem-parsing metadata OG sebagai abstraksi konten cepat. Atribusi penulis membangun E-E-A-T. Waktu modifikasi menandakan kesegaran konten.
- **Intelijen kompetitor:** Sumber paling banyak dikutip Perplexity memiliki metadata og:article lengkap termasuk penulis, tanggal publikasi, dan timestamp modifikasi.
- **Platform AI:** Perplexity · ChatGPT web · Bing Copilot

### 💡 Internal Links (Best Practice — AEO)
- **Apa yang harus dilakukan:** Bangun topic cluster: satu pillar page + 6–12 cluster page pendukung. Semua cluster page tautan balik ke pillar dengan anchor text kaya kata kunci.
- **Mengapa penting:** LLM memetakan otoritas topikal melalui link graph. Klaster yang padat dan saling terhubung menandakan keahlian domain. Brand dengan topic cluster kuat dikutip 3–5× lebih sering.
- **Intelijen kompetitor:** Model topic cluster Hubspot membantu mereka meraih sitasi AI teratas untuk topik marketing, CRM, dan sales.
- **Platform AI:** ChatGPT · Gemini · Google AI Overviews — sinyal otoritas topikal

### 💡 HTML Lang Attribute (Best Practice — AEO)
- **Apa yang harus dilakukan:** Tambahkan `lang="en"` (atau lokal Anda) ke tag `<html>`. Untuk situs multibahasa: tambahkan hreflang untuk setiap bahasa/region. Submit sitemap hreflang ke Search Console.
- **Mengapa penting:** Metadata bahasa membantu mesin AI merutekan kueri ke versi bahasa yang benar.
- **Platform AI:** Google AI Overviews · Gemini — perutean bahasa

### 💡 Image Alt Text (Best Practice — AEO)
- **Apa yang harus dilakukan:** Tulis ulang semua alt text sebagai kalimat deskriptif. Untuk data: "Grafik menunjukkan peningkatan konversi 35% setelah implementasi FAQ schema". Untuk tangkapan layar: jelaskan apa yang terjadi di layar.
- **Mengapa penting:** Sistem AI multimodal (Gemini, GPT-4o) memproses alt text saat pengindeksan untuk memahami gambar dan mengaitkannya dengan konten sekitar.
- **Platform AI:** Google AI Overviews · Gemini · GPT-4o — pengindeksan multimodal

---

## GEO — Generative Engine Optimization
*Membangun kesiapan sitasi LLM di ChatGPT, Claude, Gemini & Perplexity*

### ⚠️ Meta Description (GEO)
- **Apa yang harus dilakukan:** Tulis meta description sebagai pratinjau sitasi faktual — bayangkan bagaimana Perplexity menampilkan cuplikan Anda. Sertakan angka, tanggal, atau hasil yang dapat diverifikasi.
- **Mengapa penting:** Pipeline retrieval GenAI menggunakan meta description sebagai ringkasan konten terkompresi. Deskripsi padat fakta dikutip 2–3× lebih sering.
- **Platform AI:** Perplexity · ChatGPT web · Bing Copilot

### ⚠️ Server Response Time (GEO)
- **Apa yang harus dilakukan:** Capai TTFB <200ms. Aktifkan server-side caching. Gunakan CDN. Optimalkan query database. Bot AI memiliki batas waktu crawl yang ketat — halaman lambat hanya sebagian terindeks.
- **Langkah-langkah:**
  1. Ukur TTFB di web.dev/measure atau gtmetrix.com.
  2. Aktifkan server caching: Redis atau Memcached untuk situs dinamis.
  3. Tambahkan Cloudflare (tier gratis) sebagai CDN.
  4. Optimalkan query database paling lambat.
- **Mengapa penting:** Crawler AI punya budget waktu ketat. Halaman dengan TTFB >500ms hanya sebagian ter-crawl — konten penting (biasanya di bawah lipatan halaman) mungkin tidak pernah terindeks.
- **Platform AI:** Semua crawler AI — kelengkapan pengindeksan

### 💡 Word Count (Best Practice — GEO)
- **Apa yang harus dilakukan:** Buat konten cornerstone 2.000–4.000 kata dengan data asli, kutipan pakar, sumber yang dikutip, dan statistik kunci. Struktur: intro → jawaban → bukti → konteks → kesimpulan.
- **Mengapa penting:** LLM (ChatGPT, Claude, Gemini) dilatih pada konten komprehensif dan bersumber baik. Halaman panjang dengan sitasi dimasukkan ke data pelatihan AI 3× lebih sering.
- **Intelijen kompetitor:** Wikipedia — sumber paling banyak dikutip lintas LLM — menggunakan sitasi mendalam, bagian terstruktur, dan pembaruan berkala.
- **Platform AI:** ChatGPT · Claude · Gemini · Perplexity — inklusi data pelatihan

### 💡 Schema.org Markup (Best Practice — GEO)
- **Apa yang harus dilakukan:** Tambahkan Organization schema dengan tautan sameAs ke Wikipedia, LinkedIn, Crunchbase, Twitter/X. Tambahkan Person schema untuk semua penulis dengan jobTitle, knowsAbout, dan sameAs ke LinkedIn.
- **Mengapa penting:** LLM membangun entity knowledge graph dari tautan sameAs. Semakin banyak situs otoritatif yang mengonfirmasi entitas Anda, semakin kuat brand Anda dalam "memori" AI.
- **Intelijen kompetitor:** Setiap brand besar yang dikutip ChatGPT memiliki entity graph terverifikasi: halaman Wikipedia, profil Crunchbase, LinkedIn Company, dan schema sameAs yang menautkan semuanya.
- **Platform AI:** ChatGPT · Gemini · Claude — pengenalan entitas & knowledge graph

### 💡 HTTPS / SSL (Best Practice — GEO)
- **Apa yang harus dilakukan:** HTTPS wajib. Implementasikan header HSTS. Pastikan sertifikat dari CA terpercaya. Perbaiki mixed content. Target rating A+ di SSL Labs.
- **Mengapa penting:** Benchmark Conductor terhadap 3,3 miliar sesi menemukan nol domain HTTP di sitasi AI teratas di 10 industri yang diukur.
- **Platform AI:** Semua platform AI — persyaratan baseline absolut

### 💡 Cross-Web Entity Mentions (Best Practice — GEO)
- **Apa yang harus dilakukan:** Dapatkan brand Anda disebut dan ditautkan dari: Wikipedia, Crunchbase, LinkedIn Company, direktori industri, dan 10+ publikasi otoritatif di niche Anda.
- **Mengapa penting:** LLM membangun entity knowledge graph dari penyebutan lintas web. Semakin banyak situs otoritatif yang menyebut & menautkan Anda, semakin kuat entitas Anda.
- **Intelijen kompetitor:** Relixir, Profound, dan AthenaHQ — tools GEO paling banyak dikutip AI — semuanya memiliki penyebutan Wikipedia, profil Crunchbase, kehadiran LinkedIn, dan 100+ liputan pers.
- **Platform AI:** ChatGPT · Gemini · Claude — entity knowledge graph

### 💡 H2–H4 Headings (Best Practice — GEO)
- **Apa yang harus dilakukan:** Struktur setiap artikel dengan bagian H2 sebagai blok jawaban: H2 (pertanyaan) → paragraf jawaban 75 kata → bukti pendukung → tabel/daftar. Setiap H2 harus dapat dikutip secara independen.
- **Mengapa penting:** Laporan Conductor 2025 menunjukkan arsitektur heading terstruktur berkorelasi dengan tingkat sitasi AI 67% lebih tinggi.
- **Intelijen kompetitor:** Healthline menggunakan arsitektur heading Q&A paling konsisten di antara domain kesehatan.
- **Platform AI:** Google AI Overviews · ChatGPT · Perplexity

### 💡 Topical Authority & Coverage Gaps (Best Practice — GEO)
- **Apa yang harus dilakukan:** Cari topik utama Anda di Perplexity dan ChatGPT — catat kompetitor mana yang dikutip. Identifikasi konten yang mereka miliki tapi Anda tidak. Buat konten tersebut.
- **Langkah-langkah:**
  1. Cari 10–20 kueri kunci di Perplexity dan ChatGPT.
  2. Catat domain mana yang dikutip untuk setiap kueri.
  3. Kunjungi domain tersebut — identifikasi format/halaman yang mereka pakai.
  4. Daftar jenis konten yang belum Anda miliki: panduan, FAQ, halaman data, perbandingan.
- **Mengapa penting:** Sistem AI lebih suka mengutip domain yang mencakup topik secara komprehensif. Ini adalah proses persis yang dijual Relixir, Profound, dan AthenaHQ seharga $250–$400/bulan.
- **Platform AI:** Semua platform AI — otoritas domain komprehensif

### 💡 H1 Heading (Best Practice — GEO)
- **Apa yang harus dilakukan:** Gunakan H1 otoritatif dan definitif yang menandakan kelengkapan: "The Complete Guide to [Topic] ([Year])" atau "Everything You Need to Know About [Topic]".
- **Mengapa penting:** H1 "Complete Guide" 60% lebih mungkin dikutip sebagai sumber utama.
- **Intelijen kompetitor:** Investopedia menggunakan format H1 "[Term]: Definition, Examples, and [Year] Guide" di setiap artikel.
- **Platform AI:** ChatGPT · Perplexity · Claude · Gemini

### 💡 Internal Links (Best Practice — GEO)
- **Apa yang harus dilakukan:** Bangun klaster hub-and-spoke: pillar page + 8–12 cluster page + tautan lateral cluster-ke-cluster. Gunakan anchor text deskriptif. Kedalaman tautan: halaman penting terjangkau dalam 2 klik.
- **Platform AI:** Semua platform AI — sinyal otoritas topikal domain

### 💡 Content Freshness & Updates (Best Practice — GEO)
- **Apa yang harus dilakukan:** Perbarui halaman utama setiap 30–60 hari dengan data, statistik, atau perkembangan baru. Tambahkan stempel tanggal "Last Updated: [Bulan Tahun]" yang terlihat. Perbarui og:article:modified_time setiap kali diperbarui.
- **Mengapa penting:** Perplexity dan Bing Copilot sangat memprioritaskan konten terbaru. Halaman dengan tanggal modifikasi 30–90 hari terakhir mendapat prioritas sitasi.
- **Platform AI:** Perplexity · Bing Copilot · Google AI Overviews — kesegaran konten

### 💡 Open Graph Tags (Best Practice — GEO)
- **Apa yang harus dilakukan:** Setel og:description sebagai jawaban faktual. Tambahkan og:article:published_time + og:article:modified_time. Sinyal kesegaran meningkatkan prioritas sitasi AI untuk kueri sensitif waktu.
- **Platform AI:** Perplexity · ChatGPT web · Bing Copilot — kesegaran konten

### 💡 Canonical URL (Best Practice — GEO)
- **Apa yang harus dilakukan:** Canonical self-referencing di setiap halaman menunjuk versi HTTPS. Kebijakan trailing-slash konsisten di seluruh situs. Semua varian duplikat 301-redirect ke canonical.
- **Platform AI:** Google AI Overviews · Bing AI — konsolidasi otoritas

### 💡 Citation & Source Network (Best Practice — GEO)
- **Apa yang harus dilakukan:** Tautkan ke sumber eksternal otoritatif (.gov, .edu, riset peer-reviewed) untuk setiap klaim. Format sitasi: Penulis, Publikasi, Tahun.
- **Mengapa penting:** Riset menunjukkan halaman yang mengutip sumber .gov dan .edu dimasukkan ke data pelatihan AI 2,5× lebih sering dibanding halaman tanpa sumber.
- **Intelijen kompetitor:** Setiap artikel Wikipedia menggunakan sitasi inline yang ketat dengan sumber primer.
- **Platform AI:** ChatGPT · Perplexity · Claude — sinyal kepercayaan & otoritas

### 💡 HowTo / Structured Steps Schema (Best Practice — GEO)
- **Apa yang harus dilakukan:** Untuk halaman tutorial/panduan/proses: tambahkan schema JSON-LD HowTo dengan langkah bernomor. Setiap langkah: name, text, gambar opsional.
- **Mengapa penting:** Schema HowTo diekstrak langsung oleh Google AI Overviews dan Perplexity untuk kueri prosedural. Konten langkah-demi-langkah terstruktur ditampilkan di jawaban AI 3× lebih sering.
- **Intelijen kompetitor:** WikiHow — sumber how-to paling banyak dikutip di semua platform AI — menggunakan schema langkah terstruktur di setiap artikel.
- **Platform AI:** Google AI Overviews · Bing AI · Perplexity

### 💡 Image Alt Text (Best Practice — GEO)
- **Apa yang harus dilakukan:** Tulis alt text sebagai kalimat yang dapat diekstrak sebagai data. Untuk grafik: "[Jenis grafik] menunjukkan [metrik kunci]: [temuan spesifik dengan angka]".
- **Mengapa penting:** LLM multimodal (Gemini, GPT-4o) mengindeks alt text sebagai data yang dapat dibaca mesin.
- **Platform AI:** Gemini · GPT-4o · Google AI Overviews — pengindeksan multimodal

---

## Kesimpulan & Ringkasan Strategis

**Kekuatan situs saat ini:**
- Technical SEO, Mobile SEO, dan User Experience sudah sempurna (100%).
- Struktur heading (H1–H4), canonical URL, sitemap, robots.txt, alt text gambar, ARIA, Open Graph, Twitter Card, dan Schema.org dasar semuanya sudah baik.

**Titik lemah utama:**
- **Security (25%)** — 6 dari 7 header keamanan penting hilang (X-Frame-Options, X-Content-Type-Options, HSTS, CSP, Referrer-Policy, Permissions-Policy).
- **Performance (25%)** — Server response time lambat (2.877 ms), kompresi belum aktif, browser caching belum dikonfigurasi.
- **Title tag & meta description** kepanjangan sehingga berisiko terpotong di hasil pencarian.

**Peluang terbesar untuk kesiapan AI (AEO/GEO):**
1. Perpendek & format ulang title tag dan meta description menjadi jawaban faktual langsung.
2. Tambahkan blok "Quick Answer"/TL;DR di setiap halaman utama.
3. Perluas schema.org: FAQPage, Article+Author, HowTo, Organization dengan sameAs.
4. Tambahkan bagian FAQ 8–12 Q&A di halaman-halaman kunci.
5. Bangun sinyal E-E-A-T: bio penulis, kredensial, Person schema.
6. Perkuat entitas lintas web: Wikipedia, Crunchbase, LinkedIn Company.
7. Percepat server response time dan aktifkan compression + caching (berdampak ganda: SEO tradisional dan crawl budget AI bot).
8. Verifikasi robots.txt tidak memblokir GPTBot, ClaudeBot, PerplexityBot, Google-Extended.

---

*Dokumen ini adalah hasil konversi lengkap dari laporan SEO Audit PDF untuk cek-naskah.web.id (digenerate 12 September 2026) ke format Markdown, disusun agar mudah dibaca dan diproses oleh AI/LLM.*
