import { Query } from 'appwrite'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const isPublicOnly = query.publicOnly !== 'false'

  // Jika memanggil dengan publicOnly=false (untuk Admin), pastikan pengguna memiliki peran admin
  if (!isPublicOnly) {
    await requireAdminUser(event)
  }

  const adminAppwrite = useAdminAppwrite()

  try {
    const queries: string[] = []

    if (isPublicOnly) {
      queries.push(Query.equal('isVisible', true))
    }

    queries.push(Query.orderDesc('$createdAt'))
    queries.push(Query.limit(100))

    const res = await adminAppwrite.listTestimonialRows(queries)

    return {
      success: true,
      total: res.total,
      testimonials: res.rows || []
    }
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Gagal memuat daftar testimoni.'

    console.warn('[Testimonials List Error]:', msg)
    return {
      success: true,
      total: 0,
      testimonials: []
    }
  }
})
