interface UpdateRoleBody {
  role?: 'admin' | 'editor' | 'user'
  labels?: string[]
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminUser(event)
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID pengguna tidak valid.'
    })
  }

  const body = await readBody<UpdateRoleBody>(event)
  let newLabels: string[] = []

  if (Array.isArray(body?.labels)) {
    newLabels = body.labels
  } else if (body?.role === 'admin') {
    newLabels = ['admin']
  } else if (body?.role === 'editor') {
    newLabels = ['editor']
  } else if (body?.role === 'user') {
    newLabels = []
  }

  // Safety safeguard: Cannot demote yourself from admin
  if (userId === adminUser.$id && !newLabels.includes('admin')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anda tidak dapat menghapus hak akses administrator dari akun Anda sendiri.'
    })
  }

  const adminAppwrite = useAdminAppwrite()
  try {
    const updated = await adminAppwrite.updateLabels(userId, newLabels)
    return {
      success: true,
      message: 'Peran dan hak akses pengguna berhasil diperbarui.',
      user: updated
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memperbarui peran pengguna.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
