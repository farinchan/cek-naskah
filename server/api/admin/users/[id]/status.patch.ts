interface UpdateStatusBody {
  status: boolean
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

  const body = await readBody<UpdateStatusBody>(event)
  if (typeof body?.status !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Status akun harus bertipe boolean (aktif / nonaktif).'
    })
  }

  // Safety safeguard: Cannot disable yourself
  if (userId === adminUser.$id && !body.status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anda tidak dapat menonaktifkan akun administrator Anda sendiri.'
    })
  }

  const adminAppwrite = useAdminAppwrite()
  try {
    const updated = await adminAppwrite.updateStatus(userId, body.status)
    return {
      success: true,
      message: `Status akun pengguna berhasil ${body.status ? 'diaktifkan' : 'dinonaktifkan'}.`,
      user: updated
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal mengubah status akun pengguna.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
