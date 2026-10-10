export default defineEventHandler(async (event) => {
  await requireAdminUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID testimoni tidak valid.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  try {
    await adminAppwrite.deleteTestimonialRow(id)

    return {
      success: true,
      id,
      message: 'Testimoni berhasil dihapus dari sistem.'
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal menghapus testimoni.'

    throw createError({
      statusCode: 500,
      statusMessage: msg
    })
  }
})
