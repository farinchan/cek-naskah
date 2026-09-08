import type { H3Event } from 'h3'

export interface AppwriteAdminUser {
  $id: string
  $createdAt: string
  $updatedAt: string
  name: string
  registration: string
  status: boolean
  labels: string[]
  passwordUpdate: string
  email: string
  phone: string
  emailVerification: boolean
  phoneVerification: boolean
  mfa: boolean
  prefs: Record<string, unknown>
  targets: Array<{
    $id: string
    providerType: string
    identifier: string
  }>
  accessedAt: string
}

export interface AdminUserListResponse {
  total: number
  users: AppwriteAdminUser[]
  metrics: {
    total: number
    verified: number
    unverified: number
    admins: number
    editors: number
    active: number
    disabled: number
    totalPoints: number
  }
}

/**
 * Validates that the request is authenticated via Appwrite JWT and returns the user account.
 */
export async function getAuthUser(event: H3Event) {
  const jwt = getHeader(event, 'x-appwrite-jwt')
  if (!jwt) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Autentikasi gagal: Sesi (JWT) tidak ditemukan.'
    })
  }

  const config = useRuntimeConfig()
  const endpoint = (config.public.appwriteEndpoint as string) || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = (config.public.appwriteProjectId as string) || '6a9e987200268817ec4c'

  try {
    const userRes = await $fetch<{ $id: string, name: string, email: string, labels?: string[], prefs?: Record<string, unknown> }>(`${endpoint}/account`, {
      headers: {
        'x-appwrite-project': projectId,
        'x-appwrite-jwt': jwt
      }
    })
    return userRes
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi pengguna tidak valid atau telah kedaluwarsa.'
    })
  }
}

/**
 * Validates that the request is authenticated and comes from a user with the 'admin' label.
 */
export async function requireAdminUser(event: H3Event) {
  const userRes = await getAuthUser(event)
  const labels = userRes.labels || []
  const isAdmin = labels.some(l => l.toLowerCase() === 'admin')

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Akses ditolak: Anda tidak memiliki hak akses administrator.'
    })
  }

  return userRes
}

/**
 * Administrative Appwrite client helper utilizing the server-side API Key.
 */
export function useAdminAppwrite() {
  const config = useRuntimeConfig()
  const endpoint = (config.public.appwriteEndpoint as string) || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = (config.public.appwriteProjectId as string) || '6a9e987200268817ec4c'
  const apiKey = (config.appwriteApiKey as string) || process.env.APPWRITE_API_KEY || ''

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi server bermasalah: APPWRITE_API_KEY belum disetel.'
    })
  }

  const headers: Record<string, string> = {
    'x-appwrite-project': projectId,
    'x-appwrite-key': apiKey,
    'content-type': 'application/json'
  }

  return {
    endpoint,
    projectId,
    headers,

    async listUsers(search?: string, limit = 100, offset = 0) {
      const query: Record<string, string | number> = {
        limit,
        offset
      }
      if (search && search.trim()) {
        query.search = search.trim()
      }

      const res = await $fetch<{ total: number, users: AppwriteAdminUser[] }>(`${endpoint}/users`, {
        headers,
        query
      })

      // Calculate operational metrics
      const users = res.users || []
      const metrics = {
        total: res.total,
        verified: users.filter(u => u.emailVerification).length,
        unverified: users.filter(u => !u.emailVerification).length,
        admins: users.filter(u => (u.labels || []).some(l => l.toLowerCase() === 'admin')).length,
        editors: users.filter(u => (u.labels || []).some(l => l.toLowerCase() === 'editor')).length,
        active: users.filter(u => u.status).length,
        disabled: users.filter(u => !u.status).length,
        totalPoints: users.reduce((acc, u) => acc + (Number(u.prefs?.points) || 0), 0)
      }

      return {
        total: res.total,
        users,
        metrics
      }
    },

    async getUser(userId: string) {
      return await $fetch<AppwriteAdminUser>(`${endpoint}/users/${userId}`, {
        headers
      })
    },

    async createUser(payload: { email: string, password?: string, name?: string, phone?: string, labels?: string[] }) {
      const createData: Record<string, string | undefined> = {
        userId: 'unique()',
        email: payload.email,
        password: payload.password || Math.random().toString(36).slice(-10) + 'A1!',
        name: payload.name || undefined,
        phone: payload.phone || undefined
      }

      const created = await $fetch<AppwriteAdminUser>(`${endpoint}/users`, {
        method: 'POST',
        headers,
        body: createData
      })

      if (payload.labels && payload.labels.length > 0) {
        return await $fetch<AppwriteAdminUser>(`${endpoint}/users/${created.$id}/labels`, {
          method: 'PUT',
          headers,
          body: { labels: payload.labels }
        })
      }

      return created
    },

    async updateLabels(userId: string, labels: string[]) {
      return await $fetch<AppwriteAdminUser>(`${endpoint}/users/${userId}/labels`, {
        method: 'PUT',
        headers,
        body: { labels }
      })
    },

    async updateStatus(userId: string, status: boolean) {
      return await $fetch<AppwriteAdminUser>(`${endpoint}/users/${userId}/status`, {
        method: 'PATCH',
        headers,
        body: { status }
      })
    },

    async updateVerification(userId: string, emailVerification: boolean) {
      return await $fetch<AppwriteAdminUser>(`${endpoint}/users/${userId}/verification`, {
        method: 'PATCH',
        headers,
        body: { emailVerification }
      })
    },

    async updatePrefs(userId: string, prefs: Record<string, unknown>) {
      return await $fetch<Record<string, unknown>>(`${endpoint}/users/${userId}/prefs`, {
        method: 'PATCH',
        headers,
        body: { prefs }
      })
    },

    async deleteUser(userId: string) {
      return await $fetch(`${endpoint}/users/${userId}`, {
        method: 'DELETE',
        headers
      })
    },

    async deleteSessions(userId: string) {
      return await $fetch(`${endpoint}/users/${userId}/sessions`, {
        method: 'DELETE',
        headers
      })
    },

    async recordPointTransaction(tx: {
      userId: string
      userEmail: string
      userName?: string
      adminId?: string
      adminName?: string
      adminEmail?: string
      type: string
      amount: number
      balanceBefore: number
      balanceAfter: number
      notes: string
      createdAt: string
    }, jwt?: string) {
      const config = useRuntimeConfig()
      const databaseId = (config.public?.appwriteDatabaseId as string) || '6a9f5bfb00026954d579'
      const tableId = process.env.APPWRITE_TABLE_POINT_TRANSACTIONS || 'point_transactions'

      const requestHeaders: Record<string, string> = {
        'x-appwrite-project': projectId,
        'content-type': 'application/json'
      }

      if (jwt) {
        requestHeaders['x-appwrite-jwt'] = jwt
      } else {
        requestHeaders['x-appwrite-key'] = apiKey
      }

      try {
        return await $fetch(`${endpoint}/databases/${databaseId}/collections/${tableId}/documents`, {
          method: 'POST',
          headers: requestHeaders,
          body: {
            documentId: 'unique()',
            data: tx
          }
        })
      } catch (err: unknown) {
        console.warn(`[PointHistory] Database table '${tableId}' row creation notice:`, (err as { message?: string })?.message || err)
        return null
      }
    }
  }
}
