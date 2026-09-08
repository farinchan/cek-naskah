interface UpdateVerificationBody {
  emailVerification: boolean
}

export default defineEventHandler(async (event) => {
  await requireAdminUser(event)
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID pengguna tidak valid.'
    })
  }

  const body = await readBody<UpdateVerificationBody>(event)
  if (typeof body?.emailVerification !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Status verifikasi harus bertipe boolean.'
    })
  }

  const adminAppwrite = useAdminAppwrite()
  try {
    const updated = await adminAppwrite.updateVerification(userId, body.emailVerification)
    return {
      success: true,
      message: `Status verifikasi email berhasil ${body.emailVerification ? 'dikonfirmasi' : 'dibatalkan'}.`,
      user: updated
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memperbarui status verifikasi email pengguna.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
