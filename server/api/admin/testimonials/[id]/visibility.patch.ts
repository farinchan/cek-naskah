export default defineEventHandler(async (event) => {
  await requireAdminUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID testimoni tidak valid.'
    })
  }

  const body = await readBody<{ isVisible?: boolean }>(event)
  const isVisible = Boolean(body?.isVisible)

  const adminAppwrite = useAdminAppwrite()

  try {
    const updated = await adminAppwrite.updateTestimonialRow(id, {
      isVisible
    })

    return {
      success: true,
      id,
      isVisible,
      testimonial: updated,
      message: `Status publik testimoni berhasil diubah menjadi: ${isVisible ? 'Ditampilkan' : 'Disembunyikan'}.`
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memperbarui status visibilitas testimoni.'

    throw createError({
      statusCode: 500,
      statusMessage: msg
    })
  }
})
