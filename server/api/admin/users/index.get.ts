export default defineEventHandler(async (event) => {
  await requireAdminUser(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search : undefined
  const limit = query.limit ? Number(query.limit) : 100
  const offset = query.offset ? Number(query.offset) : 0

  const adminAppwrite = useAdminAppwrite()
  const data = await adminAppwrite.listUsers(search, limit, offset)

  return {
    success: true,
    ...data
  }
})
