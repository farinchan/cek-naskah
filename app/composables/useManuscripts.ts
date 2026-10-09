import type { Models } from 'appwrite'
import {
  storage,
  tablesDB,
  APPWRITE_DATABASE_ID,
  APPWRITE_TABLE_NASKAH,
  APPWRITE_BUCKET_NASKAH,
  ID,
  Query
} from '~/utils/appwrite.js'

export interface ExcludeOptions {
  abstract: boolean
  methodsAndMaterial: boolean
  bibliography: boolean
  quotes: boolean
  citations: boolean
  smallMatches: boolean
  smallMatchesValue: number
}

export const defaultExcludeOptions: ExcludeOptions = {
  abstract: false,
  methodsAndMaterial: false,
  bibliography: true,
  quotes: false,
  citations: false,
  smallMatches: false,
  smallMatchesValue: 8
}

export interface ManuscriptRow extends Models.Row {
  userId: string
  userName?: string
  userEmail?: string
  userPhone?: string
  title: string
  serviceId: string
  serviceName?: string
  price?: string
  status: string
  fileId: string
  fileName: string
  fileSize?: number
  fileType?: string
  fileUrl?: string
  resultFileId?: string
  resultFileName?: string
  resultFileUrl?: string
  adminUploaderId?: string
  adminUploaderName?: string
  adminUploaderEmail?: string
  excludeOptions?: string
  similarityScore?: string
  userNotes?: string
  adminNotes?: string
}

export interface ManuscriptSubmissionPayload {
  title: string
  serviceId?: string
  serviceName?: string
  price?: string
  file: File
  excludeOptions?: ExcludeOptions | Record<string, unknown>
  userNotes?: string
}

export const useManuscripts = () => {
  const config = useRuntimeConfig()
  const databaseId = (config.public?.appwriteDatabaseId as string) || APPWRITE_DATABASE_ID
  const tableId = (config.public?.appwriteTableNaskah as string) || APPWRITE_TABLE_NASKAH
  const bucketId = (config.public?.appwriteBucketNaskah as string) || APPWRITE_BUCKET_NASKAH

  const { user, isAdmin } = useAuth()

  const manuscripts = useState<ManuscriptRow[]>('app_user_manuscripts', () => [])
  const allManuscripts = useState<ManuscriptRow[]>('app_admin_manuscripts', () => [])
  const loading = ref(false)
  const uploading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const clearFeedback = () => {
    error.value = null
    success.value = null
  }

  const parseExcludeOptions = (raw?: string): ExcludeOptions => {
    if (!raw) return { ...defaultExcludeOptions }
    try {
      const parsed = JSON.parse(raw)
      return {
        abstract: Boolean(parsed.abstract),
        methodsAndMaterial: Boolean(parsed.methodsAndMaterial),
        bibliography: Boolean(parsed.bibliography),
        quotes: Boolean(parsed.quotes),
        citations: Boolean(parsed.citations),
        smallMatches: Boolean(parsed.smallMatches),
        smallMatchesValue: typeof parsed.smallMatchesValue === 'number' ? parsed.smallMatchesValue : 8
      }
    } catch {
      return { ...defaultExcludeOptions }
    }
  }

  const formatFileSize = (bytes?: number): string => {
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

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase()
    switch (s) {
      case 'completed':
        return {
          label: 'Selesai',
          color: 'emerald',
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          icon: 'i-lucide-check-circle-2'
        }
      case 'processing':
        return {
          label: 'Sedang Diperiksa',
          color: 'blue',
          badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
          icon: 'i-lucide-loader-2'
        }
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          color: 'rose',
          badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
          icon: 'i-lucide-x-circle'
        }
      case 'pending':
      default:
        return {
          label: 'Menunggu Antrean',
          color: 'amber',
          badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          icon: 'i-lucide-clock-3'
        }
    }
  }

  // Get download/view URL for a file in the naskah bucket
  const getFileDownloadUrl = (fileId: string): string => {
    if (!fileId) return ''
    try {
      const url = storage.getFileDownload({
        bucketId,
        fileId
      })
      return String(url)
    } catch {
      return ''
    }
  }

  const getFileViewUrl = (fileId: string): string => {
    if (!fileId) return ''
    try {
      const url = storage.getFileView({
        bucketId,
        fileId
      })
      return String(url)
    } catch {
      return ''
    }
  }

  // Fetch manuscripts submitted by the current user
  const fetchUserManuscripts = async (serviceId?: string, limitCount = 100) => {
    if (!user.value?.$id) {
      manuscripts.value = []
      return []
    }
    loading.value = true
    try {
      const queries = [
        Query.equal('userId', user.value.$id),
        Query.orderDesc('$createdAt'),
        Query.limit(limitCount)
      ]
      if (serviceId) {
        queries.push(Query.equal('serviceId', serviceId))
      }

      const res = await tablesDB.listRows<ManuscriptRow>({
        databaseId,
        tableId,
        queries
      })

      const rows: ManuscriptRow[] = res.rows || []
      manuscripts.value = rows
      return rows
    } catch (err) {
      console.error('Failed to fetch user manuscripts:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch all manuscripts (for Admin)
  const fetchAllManuscripts = async (serviceId?: string) => {
    loading.value = true
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
      if (serviceId) {
        queries.push(Query.equal('serviceId', serviceId))
      }

      const res = await tablesDB.listRows<ManuscriptRow>({
        databaseId,
        tableId,
        queries
      })

      const rows: ManuscriptRow[] = res.rows || []
      allManuscripts.value = rows
      return rows
    } catch (err) {
      console.error('Failed to fetch all manuscripts:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Upload manuscript file and create submission record in Appwrite
  const submitManuscript = async (payload: ManuscriptSubmissionPayload): Promise<{ success: boolean, manuscript?: ManuscriptRow, message?: string }> => {
    clearFeedback()
    if (!user.value?.$id) {
      const msg = 'Anda harus masuk ke akun terlebih dahulu untuk mengunggah naskah.'
      error.value = msg
      return { success: false, message: msg }
    }

    if (!payload.title || !payload.title.trim()) {
      const msg = 'Judul naskah wajib diisi.'
      error.value = msg
      return { success: false, message: msg }
    }

    if (!payload.file) {
      const msg = 'Silakan pilih atau unggah file naskah Anda.'
      error.value = msg
      return { success: false, message: msg }
    }

    uploading.value = true
    try {
      // 1. Upload original manuscript to Appwrite Storage
      const uploadedFile = await storage.createFile({
        bucketId,
        fileId: ID.unique(),
        file: payload.file
      })

      const fileUrl = getFileDownloadUrl(uploadedFile.$id)

      // 2. Prepare payload row for naskah table
      const dataPayload = {
        userId: user.value.$id,
        userName: user.value.name || 'Pengguna',
        userEmail: user.value.email || '',
        userPhone: user.value.phone || (user.value.prefs?.phone as string) || '',
        title: payload.title.trim(),
        serviceId: payload.serviceId || 'turnitin-plagiarism',
        serviceName: payload.serviceName || 'Cek Plagiarisme iThenticate',
        price: payload.price || 'Rp 8.000',
        status: 'pending',
        fileId: uploadedFile.$id,
        fileName: payload.file.name,
        fileSize: payload.file.size,
        fileType: payload.file.type || payload.file.name.split('.').pop() || 'application/octet-stream',
        fileUrl,
        excludeOptions: JSON.stringify(payload.excludeOptions),
        userNotes: (payload.userNotes || '').trim(),
        similarityScore: '',
        resultFileId: '',
        resultFileName: '',
        resultFileUrl: '',
        adminUploaderId: '',
        adminUploaderName: '',
        adminUploaderEmail: '',
        adminNotes: ''
      }

      // 3. Create document in database table `naskah`
      const newRow = await tablesDB.createRow<ManuscriptRow>({
        databaseId,
        tableId,
        rowId: ID.unique(),
        data: dataPayload
      })

      // Prepend to current list
      manuscripts.value = [newRow, ...manuscripts.value]
      success.value = 'Naskah berhasil dikirim! Tim pemeriksa segera memproses naskah Anda.'

      return {
        success: true,
        manuscript: newRow,
        message: 'Naskah berhasil dikirim!'
      }
    } catch (err: unknown) {
      console.error('Error submitting manuscript:', err)
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Gagal mengunggah naskah. Silakan coba kembali.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      uploading.value = false
    }
  }

  // Admin: Upload similarity report file and complete manuscript
  const adminUploadResult = async (params: {
    manuscriptId: string
    resultFile: File
    similarityScore: string
    adminNotes?: string
  }): Promise<{ success: boolean, message?: string }> => {
    clearFeedback()
    if (!isAdmin.value) {
      const msg = 'Akses ditolak: Hanya administrator yang dapat mengunggah hasil laporan.'
      error.value = msg
      return { success: false, message: msg }
    }

    uploading.value = true
    try {
      // 1. Upload result report file to Appwrite Storage bucket
      const uploadedResultFile = await storage.createFile({
        bucketId,
        fileId: ID.unique(),
        file: params.resultFile
      })

      const resultFileUrl = getFileDownloadUrl(uploadedResultFile.$id)

      // 2. Update manuscript row
      const updateData = {
        resultFileId: uploadedResultFile.$id,
        resultFileName: params.resultFile.name,
        resultFileUrl,
        adminUploaderId: user.value?.$id || '',
        adminUploaderName: user.value?.name || 'Administrator',
        adminUploaderEmail: user.value?.email || '',
        similarityScore: params.similarityScore ? params.similarityScore.trim() : '',
        adminNotes: (params.adminNotes || '').trim(),
        status: 'completed'
      }

      await tablesDB.updateRow({
        databaseId,
        tableId,
        rowId: params.manuscriptId,
        data: updateData
      })

      // Update local state
      const updateLocal = (list: ManuscriptRow[]) => {
        const item = list.find(m => m.$id === params.manuscriptId)
        if (item) {
          Object.assign(item, updateData)
        }
      }
      updateLocal(manuscripts.value)
      updateLocal(allManuscripts.value)

      success.value = 'Laporan hasil similarity berhasil diunggah!'
      return { success: true, message: 'Laporan berhasil diunggah!' }
    } catch (err: unknown) {
      console.error('Error uploading admin result:', err)
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Gagal mengunggah laporan hasil.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      uploading.value = false
    }
  }

  // Admin: Update manuscript status or notes
  const adminUpdateStatus = async (
    manuscriptId: string,
    status: 'pending' | 'processing' | 'completed' | 'cancelled',
    adminNotes?: string
  ): Promise<{ success: boolean, message?: string }> => {
    clearFeedback()
    if (!isAdmin.value) {
      const msg = 'Akses ditolak: Hanya administrator yang dapat mengubah status naskah.'
      error.value = msg
      return { success: false, message: msg }
    }

    try {
      const updateData: Record<string, string> = { status }
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes.trim()
      }

      await tablesDB.updateRow({
        databaseId,
        tableId,
        rowId: manuscriptId,
        data: updateData
      })

      const updateLocal = (list: ManuscriptRow[]) => {
        const item = list.find(m => m.$id === manuscriptId)
        if (item) {
          Object.assign(item, updateData)
        }
      }
      updateLocal(manuscripts.value)
      updateLocal(allManuscripts.value)

      success.value = `Status naskah berhasil diperbarui menjadi ${getStatusBadge(status).label}.`
      return { success: true }
    } catch (err: unknown) {
      console.error('Error updating status:', err)
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Gagal memperbarui status.'
      error.value = msg
      return { success: false, message: msg }
    }
  }

  // Admin: Delete manuscript and its storage files
  const adminDeleteManuscript = async (manuscript: ManuscriptRow): Promise<{ success: boolean, message?: string }> => {
    clearFeedback()
    if (!isAdmin.value) {
      const msg = 'Akses ditolak: Hanya administrator yang dapat menghapus naskah.'
      error.value = msg
      return { success: false, message: msg }
    }

    try {
      if (manuscript.fileId) {
        try {
          await storage.deleteFile({ bucketId, fileId: manuscript.fileId })
        } catch {
          // Ignore storage delete error
        }
      }
      if (manuscript.resultFileId) {
        try {
          await storage.deleteFile({ bucketId, fileId: manuscript.resultFileId })
        } catch {
          // Ignore storage delete error
        }
      }

      await tablesDB.deleteRow({
        databaseId,
        tableId,
        rowId: manuscript.$id
      })

      allManuscripts.value = allManuscripts.value.filter(m => m.$id !== manuscript.$id)
      manuscripts.value = manuscripts.value.filter(m => m.$id !== manuscript.$id)

      success.value = 'Naskah berhasil dihapus.'
      return { success: true }
    } catch (err: unknown) {
      console.error('Error deleting manuscript:', err)
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Gagal menghapus naskah.'
      error.value = msg
      return { success: false, message: msg }
    }
  }

  return {
    manuscripts,
    allManuscripts,
    loading,
    uploading,
    error,
    success,
    clearFeedback,
    parseExcludeOptions,
    formatFileSize,
    getStatusBadge,
    getFileDownloadUrl,
    getFileViewUrl,
    fetchUserManuscripts,
    fetchAllManuscripts,
    submitManuscript,
    adminUploadResult,
    adminUpdateStatus,
    adminDeleteManuscript
  }
}
