import { account } from '~/utils/appwrite.js'

export interface AdminUserItem {
  $id: string
  $createdAt: string
  $updatedAt: string
  name: string
  registration: string
  status: boolean
  labels: string[]
  email: string
  phone: string
  emailVerification: boolean
  phoneVerification: boolean
  mfa: boolean
  accessedAt: string
}

export interface AdminUserMetrics {
  total: number
  verified: number
  unverified: number
  admins: number
  editors: number
  active: number
  disabled: number
}

const defaultMetrics: AdminUserMetrics = {
  total: 0,
  verified: 0,
  unverified: 0,
  admins: 0,
  editors: 0,
  active: 0,
  disabled: 0
}

export const useAdminUsers = () => {
  const users = useState<AdminUserItem[]>('admin_users_list', () => [])
  const metrics = useState<AdminUserMetrics>('admin_users_metrics', () => ({ ...defaultMetrics }))
  const total = useState<number>('admin_users_total', () => 0)

  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const clearFeedback = () => {
    error.value = null
    success.value = null
  }

  // Generate dynamic Appwrite JWT for authenticating admin server calls
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { jwt } = await account.createJWT()
      return {
        'x-appwrite-jwt': jwt
      }
    } catch (jwtErr: unknown) {
      console.warn('Gagal membuat JWT sesi admin:', jwtErr)
      throw new Error('Sesi autentikasi admin tidak valid. Harap masuk ulang ke akun Anda.', { cause: jwtErr })
    }
  }

  // Fetch all users with optional search filter
  const fetchUsers = async (search?: string) => {
    loading.value = true
    error.value = null
    try {
      const headers = await getAuthHeaders()
      const query: Record<string, string> = {}
      if (search && search.trim()) {
        query.search = search.trim()
      }

      const res = await $fetch<{
        success: boolean
        total: number
        users: AdminUserItem[]
        metrics: AdminUserMetrics
      }>('/api/admin/users', {
        headers,
        query
      })

      if (res.success) {
        users.value = res.users || []
        metrics.value = res.metrics || { ...defaultMetrics }
        total.value = res.total || 0
      }
      return res
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data: { statusMessage?: string } }).data?.statusMessage
        ? (err as { data: { statusMessage: string } }).data.statusMessage
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal memuat daftar pengguna.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  // Create new user account
  const createUser = async (payload: {
    email: string
    name?: string
    password?: string
    phone?: string
    role?: 'admin' | 'editor' | 'user'
  }) => {
    actionLoading.value = true
    clearFeedback()
    try {
      const headers = await getAuthHeaders()
      const res = await $fetch<{ success: boolean, message: string, user: AdminUserItem }>('/api/admin/users', {
        method: 'POST',
        headers,
        body: payload
      })

      if (res.success) {
        success.value = res.message || 'Pengguna berhasil dibuat.'
        await fetchUsers()
      }
      return { success: true, user: res.user }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data: { statusMessage?: string } }).data?.statusMessage
        ? (err as { data: { statusMessage: string } }).data.statusMessage
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal membuat pengguna baru.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      actionLoading.value = false
    }
  }

  // Update user role / labels
  const updateRole = async (userId: string, role: 'admin' | 'editor' | 'user') => {
    actionLoading.value = true
    clearFeedback()
    try {
      const headers = await getAuthHeaders()
      const res = await $fetch<{ success: boolean, message: string, user: AdminUserItem }>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers,
        body: { role }
      })

      if (res.success) {
        success.value = res.message
        // Update item in local list directly for instant reactive UI
        const index = users.value.findIndex(u => u.$id === userId)
        const target = users.value[index]
        if (target && res.user) {
          target.labels = res.user.labels
        }
        await fetchUsers()
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data: { statusMessage?: string } }).data?.statusMessage
        ? (err as { data: { statusMessage: string } }).data.statusMessage
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal mengubah peran pengguna.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      actionLoading.value = false
    }
  }

  // Update account status (active / disabled)
  const updateStatus = async (userId: string, active: boolean) => {
    actionLoading.value = true
    clearFeedback()
    try {
      const headers = await getAuthHeaders()
      const res = await $fetch<{ success: boolean, message: string, user: AdminUserItem }>(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers,
        body: { status: active }
      })

      if (res.success) {
        success.value = res.message
        const index = users.value.findIndex(u => u.$id === userId)
        const target = users.value[index]
        if (target && res.user) {
          target.status = res.user.status
        }
        await fetchUsers()
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data: { statusMessage?: string } }).data?.statusMessage
        ? (err as { data: { statusMessage: string } }).data.statusMessage
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal mengubah status pengguna.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      actionLoading.value = false
    }
  }

  // Update email verification status
  const updateVerification = async (userId: string, emailVerification: boolean) => {
    actionLoading.value = true
    clearFeedback()
    try {
      const headers = await getAuthHeaders()
      const res = await $fetch<{ success: boolean, message: string, user: AdminUserItem }>(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers,
        body: { emailVerification }
      })

      if (res.success) {
        success.value = res.message
        const index = users.value.findIndex(u => u.$id === userId)
        const target = users.value[index]
        if (target && res.user) {
          target.emailVerification = res.user.emailVerification
        }
        await fetchUsers()
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data: { statusMessage?: string } }).data?.statusMessage
        ? (err as { data: { statusMessage: string } }).data.statusMessage
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal memperbarui verifikasi email pengguna.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      actionLoading.value = false
    }
  }

  // Delete user account
  const deleteUser = async (userId: string) => {
    actionLoading.value = true
    clearFeedback()
    try {
      const headers = await getAuthHeaders()
      const res = await $fetch<{ success: boolean, message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers
      })

      if (res.success) {
        success.value = res.message
        users.value = users.value.filter(u => u.$id !== userId)
        await fetchUsers()
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data: { statusMessage?: string } }).data?.statusMessage
        ? (err as { data: { statusMessage: string } }).data.statusMessage
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal menghapus pengguna.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      actionLoading.value = false
    }
  }

  return {
    users,
    metrics,
    total,
    loading,
    actionLoading,
    error,
    success,
    clearFeedback,
    fetchUsers,
    createUser,
    updateRole,
    updateStatus,
    updateVerification,
    deleteUser
  }
}
