import { calculateReviewPoints } from '~/utils/rewards'
import { account } from '~/utils/appwrite.js'

export interface TestimonialItem {
  $id?: string
  manuscriptId: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  userOccupation?: string
  userAffiliation?: string
  rating: number
  comment: string
  charCount: number
  pointsAwarded: number
  isVisible: boolean
  serviceId?: string
  serviceName?: string
  manuscriptTitle?: string
  similarityScore?: string
  createdAt: string
  $createdAt?: string
}

export const useTestimonials = () => {
  const publicTestimonials = useState<TestimonialItem[]>('public_testimonials', () => [])
  const adminTestimonials = useState<TestimonialItem[]>('admin_testimonials', () => [])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const clearFeedback = () => {
    error.value = null
    success.value = null
  }

  const getJwt = async (): Promise<string | null> => {
    try {
      const session = await account.createJWT()
      return session?.jwt || null
    } catch {
      return null
    }
  }

  // Ambil testimoni publik untuk halaman utama & testimoni
  const fetchPublicTestimonials = async (force = false) => {
    if (publicTestimonials.value.length > 0 && !force) {
      return publicTestimonials.value
    }

    loading.value = true
    try {
      const res = await $fetch<{ success: boolean, testimonials: TestimonialItem[] }>('/api/testimonials?publicOnly=true')
      publicTestimonials.value = res.testimonials || []
      return publicTestimonials.value
    } catch (err) {
      console.warn('Gagal memuat testimoni publik:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Ambil semua testimoni (Panel Admin)
  const fetchAdminTestimonials = async () => {
    loading.value = true
    try {
      const jwt = await getJwt()
      const headers: Record<string, string> = {}
      if (jwt) headers['x-appwrite-jwt'] = jwt

      const res = await $fetch<{ success: boolean, testimonials: TestimonialItem[] }>('/api/testimonials?publicOnly=false', {
        headers
      })

      adminTestimonials.value = res.testimonials || []
      return adminTestimonials.value
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: unknown }).statusMessage)
        : 'Gagal memuat daftar testimoni admin.'
      error.value = msg
      return []
    } finally {
      loading.value = false
    }
  }

  // Kirim ulasan dan klaim bonus poin
  const submitReview = async (payload: {
    manuscriptId: string
    rating: number
    comment: string
    occupation?: string
    affiliation?: string
  }) => {
    clearFeedback()
    submitting.value = true

    try {
      const jwt = await getJwt()
      if (!jwt) {
        throw new Error('Sesi autentikasi tidak ditemukan. Silakan login kembali.')
      }

      const res = await $fetch<{
        success: boolean
        pointsAwarded: number
        balanceAfter: number
        testimonial: TestimonialItem
        message: string
      }>('/api/testimonials/submit', {
        method: 'POST',
        headers: {
          'x-appwrite-jwt': jwt
        },
        body: payload
      })

      success.value = res.message
      return {
        success: true,
        pointsAwarded: res.pointsAwarded,
        balanceAfter: res.balanceAfter,
        testimonial: res.testimonial,
        message: res.message
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: unknown }).statusMessage)
        : (err && typeof err === 'object' && 'message' in err)
            ? String((err as { message: unknown }).message)
            : 'Gagal mengirimkan ulasan.'

      error.value = msg
      return {
        success: false,
        pointsAwarded: 0,
        message: msg
      }
    } finally {
      submitting.value = false
    }
  }

  // Ubah status visibilitas testimoni (Admin)
  const toggleVisibility = async (testimonialId: string, isVisible: boolean) => {
    clearFeedback()
    try {
      const jwt = await getJwt()
      if (!jwt) throw new Error('Sesi tidak ditemukan.')

      const res = await $fetch<{ success: boolean, isVisible: boolean, message: string }>(`/api/admin/testimonials/${testimonialId}/visibility`, {
        method: 'PATCH',
        headers: {
          'x-appwrite-jwt': jwt
        },
        body: { isVisible }
      })

      // Update state lokal admin
      const idx = adminTestimonials.value.findIndex(t => t.$id === testimonialId)
      if (idx !== -1 && adminTestimonials.value[idx]) {
        adminTestimonials.value[idx].isVisible = res.isVisible
      }

      return { success: true, message: res.message }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: unknown }).statusMessage)
        : 'Gagal memperbarui status visibilitas.'
      return { success: false, message: msg }
    }
  }

  // Hapus testimoni (Admin)
  const deleteTestimonial = async (testimonialId: string) => {
    clearFeedback()
    try {
      const jwt = await getJwt()
      if (!jwt) throw new Error('Sesi tidak ditemukan.')

      await $fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: 'DELETE',
        headers: {
          'x-appwrite-jwt': jwt
        }
      })

      // Hapus dari state lokal admin
      adminTestimonials.value = adminTestimonials.value.filter(t => t.$id !== testimonialId)
      return { success: true, message: 'Testimoni berhasil dihapus.' }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: unknown }).statusMessage)
        : 'Gagal menghapus testimoni.'
      return { success: false, message: msg }
    }
  }

  return {
    publicTestimonials,
    adminTestimonials,
    loading,
    submitting,
    error,
    success,
    clearFeedback,
    calculateReviewPoints,
    fetchPublicTestimonials,
    fetchAdminTestimonials,
    submitReview,
    toggleVisibility,
    deleteTestimonial
  }
}
