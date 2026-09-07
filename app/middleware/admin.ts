export default defineNuxtRouteMiddleware(async (to) => {
  // Only evaluate auth state on client where browser Appwrite session exists
  if (import.meta.server) return

  const { user, fetchUser } = useAuth()

  // Ensure user is loaded
  if (!user.value) {
    await fetchUser()
  }

  // If not authenticated, redirect to login
  if (!user.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
