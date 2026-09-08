export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminUser(event)
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID pengguna tidak valid.'
    })
  }

  // Safety safeguard: Cannot delete your own admin account
  if (userId === adminUser.$id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anda tidak dapat menghapus akun administrator Anda sendiri demi keamanan sistem.'
    })
  }

  const adminAppwrite = useAdminAppwrite()
  try {
    await adminAppwrite.deleteUser(userId)
    return {
      success: true,
      message: 'Akun pengguna berhasil dihapus dari sistem.'
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal menghapus pengguna.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
