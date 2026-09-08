import type { Models } from 'appwrite'
import {
  tablesDB,
  APPWRITE_DATABASE_ID,
  APPWRITE_TABLE_SERVICES
} from '~/utils/appwrite.js'

export interface ServicePlan {
  id: string
  name: string
  tag: string
  price: string
  unit: string
  badgeClass?: string
  description: string
  features: string[]
  highlight: boolean
  active: boolean
  visible: boolean
  ctaText: string
  ctaLink: string
  order: number
}

export interface BundlePlan {
  id: string
  title: string
  price: string
  saving: string
  desc: string
  items: string[]
  active: boolean
  visible: boolean
  ctaLink: string
  order: number
}

export const defaultServicePlans: ServicePlan[] = [
  {
    id: 'turnitin-plagiarism',
    name: 'Cek Plagiarisme iThenticate / Turnitin',
    tag: '100% No-Repository',
    price: 'Rp 15.000',
    unit: '/ naskah',
    badgeClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    description: 'Pemeriksaan similarity index resmi standar kampus dan jurnal internasional tanpa naskah tersimpan di database.',
    features: [
      'Garansi 100% No-Repository (Aman)',
      'Laporan PDF Resmi Full Color & Original',
      'Rincian Seluruh Sumber Kemiripan Teks',
      'Waktu Proses Cepat (5 – 25 Menit)',
      'Dukungan File .docx, .pdf, .txt'
    ],
    highlight: false,
    active: true,
    visible: true,
    ctaText: 'Pesan Cek Plagiarisme',
    ctaLink: 'https://wa.me/6281234567890?text=Halo%20Admin%20Cek%20Naskah%2C%20saya%20ingin%20cek%20plagiarisme%20Turnitin%2FiThenticate',
    order: 1
  },
  {
    id: 'turnitin-ai',
    name: 'AI Writer Detector Turnitin',
    tag: 'Standar Turnitin AI',
    price: 'Rp 20.000',
    unit: '/ naskah',
    badgeClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    description: 'Deteksi akurat persentase teks yang diidentifikasi sebagai hasil generate AI (ChatGPT, Claude, Gemini).',
    features: [
      'Skor Resmi Turnitin AI Writing Score',
      'Highlight Kalimat & Paragraf Terindikasi AI',
      'Deteksi Model ChatGPT 4, Claude, Gemini',
      'Laporan PDF Analisis AI Lengkap',
      'Dukungan Bahasa Indonesia & Inggris'
    ],
    highlight: false,
    active: true,
    visible: true,
    ctaText: 'Pesan AI Detector',
    ctaLink: 'https://wa.me/6281234567890?text=Halo%20Admin%20Cek%20Naskah%2C%20saya%20ingin%20cek%20AI%20Writer%20Detector',
    order: 2
  },
  {
    id: 'scopus-article',
    name: 'Ambil Artikel Scopus',
    tag: 'Scopus Q1 - Q4',
    price: 'Rp 10.000',
    unit: '/ artikel',
    badgeClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    description: 'Bantuan download artikel jurnal internasional bereputasi yang terkunci paywall lengkap dengan file sitasi.',
    features: [
      'Full-Text PDF Original Bersih',
      'Jurnal Scopus Q1, Q2, Q3, Q4',
      'Penerbit Elsevier, Springer, IEEE, Wiley',
      'File Metadata Sitasi (RIS / BibTeX)',
      'Pengiriman Cepat via WhatsApp / Email'
    ],
    highlight: false,
    active: true,
    visible: true,
    ctaText: 'Pesan Artikel Scopus',
    ctaLink: 'https://wa.me/6281234567890?text=Halo%20Admin%20Cek%20Naskah%2C%20saya%20ingin%20bantuan%20ambil%20artikel%20Scopus',
    order: 3
  },
  {
    id: 'manual-paraphrase',
    name: 'Parafrase Manual',
    tag: 'Rekomendasi Utama',
    price: 'Mulai Rp 35.000',
    unit: '/ halaman',
    badgeClass: 'bg-white/20 text-white',
    description: 'Rekonstruksi kalimat oleh tim editor akademik manusia untuk menurunkan similarity index tanpa merusak arti.',
    features: [
      '100% Dikerjakan Editor Manusia (Bukan Bot)',
      'Target Penurunan Similarity (< 15-20%)',
      'Substansi Ilmiah & Istilah Baku Terjaga',
      'Kesesuaian Tata Bahasa & Kaidah EYD V',
      'Garansi Revisi Sampai Lolos Target Kampus'
    ],
    highlight: true,
    active: true,
    visible: true,
    ctaText: 'Konsultasi Parafrase',
    ctaLink: 'https://wa.me/6281234567890?text=Halo%20Admin%20Cek%20Naskah%2C%20saya%20ingin%20konsultasi%20layanan%20parafrase%20manual',
    order: 4
  }
]

export const defaultBundlePlans: BundlePlan[] = [
  {
    id: 'bundle-turnitin-ai',
    title: 'Paket Bundling Cek Turnitin + AI Detector',
    price: 'Rp 30.000',
    saving: 'Hemat Rp 5.000',
    desc: 'Pilihan terfavorit mahasiswa akhir dan dosen untuk memastikan naskah bebas dari kesamaan teks sekaligus bebas dari skor AI tinggi.',
    items: [
      '1x Cek Similarity Turnitin No-Repository',
      '1x Uji AI Writer Detector Turnitin',
      '2 Laporan PDF Resmi Terpisah',
      'Proses Cepat (5 – 25 Menit)'
    ],
    active: true,
    visible: true,
    ctaLink: 'https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20pesan%20Paket%20Bundling%20Turnitin%20%2B%20AI%20Detector',
    order: 1
  },
  {
    id: 'bundle-scopus-5',
    title: 'Paket Riset Scopus (5 Artikel)',
    price: 'Rp 45.000',
    saving: 'Hemat Rp 5.000',
    desc: 'Layanan lengkap pencarian dan pengunduhan 5 artikel jurnal internasional Scopus Q1-Q4 beserta referensi sitasi riset Anda.',
    items: [
      '5 Artikel Jurnal Internasional Full-Text PDF',
      'Akses Database Elsevier, Springer, IEEE',
      '5 File Sitasi Lengkap (Mendeley/Zotero)',
      'Bantuan Pencarian Berdasarkan Topik / DOI'
    ],
    active: true,
    visible: true,
    ctaLink: 'https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20pesan%20Paket%20Riset%20Scopus%205%20Artikel',
    order: 2
  }
]

interface ServiceRow extends Models.Row {
  name: string
  tag?: string
  price: string
  unit?: string
  badgeClass?: string
  description?: string
  features?: string
  highlight?: boolean
  active?: boolean
  visible?: boolean
  ctaText?: string
  ctaLink?: string
  order?: number
  type?: string
}

export const useServices = () => {
  const config = useRuntimeConfig()
  const databaseId = (config.public?.appwriteDatabaseId as string) || APPWRITE_DATABASE_ID
  const tableId = (config.public?.appwriteTableServices as string) || APPWRITE_TABLE_SERVICES

  const services = useState<ServicePlan[]>('app_pricing_services', () => [...defaultServicePlans])
  const bundles = useState<BundlePlan[]>('app_pricing_bundles', () => [...defaultBundlePlans])
  const hasLoaded = useState<boolean>('app_services_has_loaded', () => false)

  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  // Filtered visible plans for public consumption (Landing page & Charge page)
  const visibleServices = computed(() => {
    return [...services.value]
      .filter(s => s.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const visibleBundles = computed(() => {
    return [...bundles.value]
      .filter(b => b.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  // Aliases for backward compatibility
  const activeServices = visibleServices
  const activeBundles = visibleBundles

  const metrics = computed(() => {
    const list = services.value || []
    const bList = bundles.value || []
    return {
      totalServices: list.length,
      visibleServices: list.filter(s => s.visible !== false).length,
      hiddenServices: list.filter(s => s.visible === false).length,
      activeServices: list.filter(s => s.active).length,
      inactiveServices: list.filter(s => !s.active).length,
      highlightedServices: list.filter(s => s.highlight).length,
      totalBundles: bList.length,
      visibleBundles: bList.filter(b => b.visible !== false).length,
      hiddenBundles: bList.filter(b => b.visible === false).length,
      activeBundles: bList.filter(b => b.active).length,
      inactiveBundles: bList.filter(b => !b.active).length
    }
  })

  const clearFeedback = () => {
    error.value = null
    success.value = null
  }

  const parseFeatures = (featuresVal: unknown): string[] => {
    if (!featuresVal) return []
    if (Array.isArray(featuresVal)) return featuresVal.map(String)
    if (typeof featuresVal === 'string') {
      try {
        const parsed = JSON.parse(featuresVal)
        if (Array.isArray(parsed)) return parsed.map(String)
      } catch {
        return featuresVal.split('\n').map(s => s.trim()).filter(Boolean)
      }
    }
    return []
  }

  const fetchServices = async (force = false): Promise<{ services: ServicePlan[], bundles: BundlePlan[] }> => {
    if (hasLoaded.value && !force) {
      return {
        services: services.value,
        bundles: bundles.value
      }
    }

    loading.value = true
    error.value = null
    try {
      const res = await tablesDB.listRows<ServiceRow>({
        databaseId,
        tableId
      })

      const rows = res.rows || []
      if (rows.length > 0) {
        const parsedServices: ServicePlan[] = []
        const parsedBundles: BundlePlan[] = []

        for (const r of rows) {
          const isBundle = r.type === 'bundle'
          const features = parseFeatures(r.features)

          if (isBundle) {
            parsedBundles.push({
              id: r.$id,
              title: r.name,
              price: r.price,
              saving: r.tag || 'Hemat',
              desc: r.description || '',
              items: features,
              active: r.active ?? true,
              visible: r.visible ?? true,
              ctaLink: r.ctaLink || '',
              order: r.order ?? 1
            })
          } else {
            parsedServices.push({
              id: r.$id,
              name: r.name,
              tag: r.tag || '',
              price: r.price,
              unit: r.unit || '/ naskah',
              badgeClass: r.badgeClass || '',
              description: r.description || '',
              features,
              highlight: Boolean(r.highlight),
              active: r.active ?? true,
              visible: r.visible ?? true,
              ctaText: r.ctaText || 'Pesan Layanan',
              ctaLink: r.ctaLink || '',
              order: r.order ?? 1
            })
          }
        }

        services.value = parsedServices.sort((a, b) => (a.order || 0) - (b.order || 0))
        bundles.value = parsedBundles.sort((a, b) => (a.order || 0) - (b.order || 0))
      }

      hasLoaded.value = true
      return {
        services: services.value,
        bundles: bundles.value
      }
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || `Gagal memuat layanan dari tabel '${tableId}'.`
      return {
        services: services.value,
        bundles: bundles.value
      }
    } finally {
      loading.value = false
    }
  }

  // --- CRUD: Services ---

  const addService = async (item: Omit<ServicePlan, 'id'>): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    const rowId = `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const order = item.order || (services.value.length + 1)
    const newService: ServicePlan = { ...item, id: rowId, order }

    try {
      await tablesDB.createRow({
        databaseId,
        tableId,
        rowId,
        data: {
          name: item.name,
          tag: item.tag || '',
          price: item.price,
          unit: item.unit || '/ naskah',
          badgeClass: item.badgeClass || '',
          description: item.description || '',
          features: JSON.stringify(item.features || []),
          highlight: Boolean(item.highlight),
          active: Boolean(item.active),
          visible: item.visible ?? true,
          ctaText: item.ctaText || 'Pesan Layanan',
          ctaLink: item.ctaLink || '',
          order,
          type: 'service'
        }
      })

      services.value = [...services.value, newService].sort((a, b) => (a.order || 0) - (b.order || 0))
      success.value = `Layanan "${item.name}" berhasil ditambahkan ke tabel '${tableId}'.`
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal menambahkan layanan ke database.'
      return false
    } finally {
      saving.value = false
    }
  }

  const updateService = async (id: string, updates: Partial<ServicePlan>): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    const idx = services.value.findIndex(s => s.id === id)
    const current = services.value[idx]
    if (idx === -1 || !current) {
      error.value = 'Layanan tidak ditemukan.'
      saving.value = false
      return false
    }

    const updated: ServicePlan = { ...current, ...updates, id }
    try {
      const dataPayload: Record<string, unknown> = {}
      if (updates.name !== undefined) dataPayload.name = updates.name
      if (updates.tag !== undefined) dataPayload.tag = updates.tag
      if (updates.price !== undefined) dataPayload.price = updates.price
      if (updates.unit !== undefined) dataPayload.unit = updates.unit
      if (updates.badgeClass !== undefined) dataPayload.badgeClass = updates.badgeClass
      if (updates.description !== undefined) dataPayload.description = updates.description
      if (updates.features !== undefined) dataPayload.features = JSON.stringify(updates.features)
      if (updates.highlight !== undefined) dataPayload.highlight = Boolean(updates.highlight)
      if (updates.active !== undefined) dataPayload.active = Boolean(updates.active)
      if (updates.visible !== undefined) dataPayload.visible = Boolean(updates.visible)
      if (updates.ctaText !== undefined) dataPayload.ctaText = updates.ctaText
      if (updates.ctaLink !== undefined) dataPayload.ctaLink = updates.ctaLink
      if (updates.order !== undefined) dataPayload.order = updates.order

      await tablesDB.updateRow({
        databaseId,
        tableId,
        rowId: id,
        data: dataPayload
      })

      const next = [...services.value]
      next[idx] = updated
      services.value = next.sort((a, b) => (a.order || 0) - (b.order || 0))
      success.value = `Layanan "${updated.name}" berhasil diperbarui di tabel '${tableId}'.`
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal memperbarui layanan di database.'
      return false
    } finally {
      saving.value = false
    }
  }

  const deleteService = async (id: string): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    const target = services.value.find(s => s.id === id)
    try {
      await tablesDB.deleteRow({
        databaseId,
        tableId,
        rowId: id
      })
      services.value = services.value.filter(s => s.id !== id)
      success.value = `Layanan "${target?.name || id}" berhasil dihapus dari tabel '${tableId}'.`
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal menghapus layanan dari database.'
      return false
    } finally {
      saving.value = false
    }
  }

  const toggleServiceStatus = async (id: string): Promise<boolean> => {
    const target = services.value.find(s => s.id === id)
    if (!target) return false
    return await updateService(id, { active: !target.active })
  }

  const toggleServiceVisibility = async (id: string): Promise<boolean> => {
    const target = services.value.find(s => s.id === id)
    if (!target) return false
    return await updateService(id, { visible: !(target.visible ?? true) })
  }

  const toggleServiceHighlight = async (id: string): Promise<boolean> => {
    const target = services.value.find(s => s.id === id)
    if (!target) return false
    return await updateService(id, { highlight: !target.highlight })
  }

  // --- CRUD: Bundles ---

  const addBundle = async (item: Omit<BundlePlan, 'id'>): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    const rowId = `bdl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const order = item.order || (bundles.value.length + 1)
    const newBundle: BundlePlan = { ...item, id: rowId, order }

    try {
      await tablesDB.createRow({
        databaseId,
        tableId,
        rowId,
        data: {
          name: item.title,
          tag: item.saving || 'Hemat',
          price: item.price,
          unit: '/ paket',
          description: item.desc || '',
          features: JSON.stringify(item.items || []),
          active: Boolean(item.active),
          visible: item.visible ?? true,
          ctaLink: item.ctaLink || '',
          order,
          type: 'bundle'
        }
      })

      bundles.value = [...bundles.value, newBundle].sort((a, b) => (a.order || 0) - (b.order || 0))
      success.value = `Paket bundling "${item.title}" berhasil ditambahkan ke tabel '${tableId}'.`
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal menambahkan paket bundling ke database.'
      return false
    } finally {
      saving.value = false
    }
  }

  const updateBundle = async (id: string, updates: Partial<BundlePlan>): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    const idx = bundles.value.findIndex(b => b.id === id)
    const current = bundles.value[idx]
    if (idx === -1 || !current) {
      error.value = 'Paket bundling tidak ditemukan.'
      saving.value = false
      return false
    }

    const updated: BundlePlan = { ...current, ...updates, id }
    try {
      const dataPayload: Record<string, unknown> = {}
      if (updates.title !== undefined) dataPayload.name = updates.title
      if (updates.saving !== undefined) dataPayload.tag = updates.saving
      if (updates.price !== undefined) dataPayload.price = updates.price
      if (updates.desc !== undefined) dataPayload.description = updates.desc
      if (updates.items !== undefined) dataPayload.features = JSON.stringify(updates.items)
      if (updates.active !== undefined) dataPayload.active = Boolean(updates.active)
      if (updates.visible !== undefined) dataPayload.visible = Boolean(updates.visible)
      if (updates.ctaLink !== undefined) dataPayload.ctaLink = updates.ctaLink
      if (updates.order !== undefined) dataPayload.order = updates.order

      await tablesDB.updateRow({
        databaseId,
        tableId,
        rowId: id,
        data: dataPayload
      })

      const next = [...bundles.value]
      next[idx] = updated
      bundles.value = next.sort((a, b) => (a.order || 0) - (b.order || 0))
      success.value = `Paket bundling "${updated.title}" berhasil diperbarui di tabel '${tableId}'.`
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal memperbarui paket bundling di database.'
      return false
    } finally {
      saving.value = false
    }
  }

  const deleteBundle = async (id: string): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    const target = bundles.value.find(b => b.id === id)
    try {
      await tablesDB.deleteRow({
        databaseId,
        tableId,
        rowId: id
      })
      bundles.value = bundles.value.filter(b => b.id !== id)
      success.value = `Paket bundling "${target?.title || id}" berhasil dihapus dari tabel '${tableId}'.`
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal menghapus paket bundling dari database.'
      return false
    } finally {
      saving.value = false
    }
  }

  const toggleBundleStatus = async (id: string): Promise<boolean> => {
    const target = bundles.value.find(b => b.id === id)
    if (!target) return false
    return await updateBundle(id, { active: !target.active })
  }

  const toggleBundleVisibility = async (id: string): Promise<boolean> => {
    const target = bundles.value.find(b => b.id === id)
    if (!target) return false
    return await updateBundle(id, { visible: !(target.visible ?? true) })
  }

  const resetToDefaults = async (): Promise<boolean> => {
    saving.value = true
    clearFeedback()
    try {
      // 1. Fetch all existing rows in table
      const res = await tablesDB.listRows<ServiceRow>({ databaseId, tableId })
      const existing = res.rows || []

      // 2. Delete existing rows
      for (const row of existing) {
        await tablesDB.deleteRow({ databaseId, tableId, rowId: row.$id })
      }

      // 3. Re-seed default services
      for (const s of defaultServicePlans) {
        await tablesDB.createRow({
          databaseId,
          tableId,
          rowId: s.id,
          data: {
            name: s.name,
            tag: s.tag,
            price: s.price,
            unit: s.unit,
            badgeClass: s.badgeClass || '',
            description: s.description,
            features: JSON.stringify(s.features),
            highlight: s.highlight,
            active: s.active,
            visible: s.visible ?? true,
            ctaText: s.ctaText,
            ctaLink: s.ctaLink,
            order: s.order,
            type: 'service'
          }
        })
      }

      // 4. Re-seed default bundles
      for (const b of defaultBundlePlans) {
        await tablesDB.createRow({
          databaseId,
          tableId,
          rowId: b.id,
          data: {
            name: b.title,
            tag: b.saving,
            price: b.price,
            unit: '/ paket',
            description: b.desc,
            features: JSON.stringify(b.items),
            active: b.active,
            visible: b.visible ?? true,
            ctaLink: b.ctaLink,
            order: b.order,
            type: 'bundle'
          }
        })
      }

      services.value = [...defaultServicePlans]
      bundles.value = [...defaultBundlePlans]
      hasLoaded.value = true
      success.value = 'Katalog layanan dan bundling berhasil direset ke pengaturan standar di tabel services.'
      return true
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      error.value = errMsg || 'Gagal mereset katalog layanan.'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    services,
    bundles,
    activeServices,
    activeBundles,
    visibleServices,
    visibleBundles,
    metrics,
    loading,
    saving,
    error,
    success,
    tableId,
    databaseId,
    clearFeedback,
    fetchServices,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    toggleServiceVisibility,
    toggleServiceHighlight,
    addBundle,
    updateBundle,
    deleteBundle,
    toggleBundleStatus,
    toggleBundleVisibility,
    resetToDefaults
  }
}
