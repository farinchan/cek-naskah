interface CreateUserBody {
  email: string
  name?: string
  password?: string
  phone?: string
  role?: 'admin' | 'editor' | 'user'
}

export default defineEventHandler(async (event) => {
  await requireAdminUser(event)

  const body = await readBody<CreateUserBody>(event)
  if (!body || !body.email || !body.email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Alamat email wajib diisi dengan format valid.'
    })
  }

  const adminAppwrite = useAdminAppwrite()

  let labels: string[] = []
  if (body.role === 'admin') {
    labels = ['admin']
  } else if (body.role === 'editor') {
    labels = ['editor']
  } else if (body.role === 'user') {
    labels = []
  }

  try {
    const user = await adminAppwrite.createUser({
      email: body.email.trim(),
      password: body.password || undefined,
      name: body.name?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      labels
    })

    return {
      success: true,
      message: 'Pengguna baru berhasil dibuat.',
      user
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal membuat pengguna baru.'

    throw createError({
      statusCode: 400,
      statusMessage: msg
    })
  }
})
