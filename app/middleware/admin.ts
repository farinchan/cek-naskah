export default defineNuxtRouteMiddleware(async (to) => {
  // Only evaluate auth state on client where browser Appwrite session exists
  if (import.meta.server) return

  const { user, fetchUser } = useAuth()
  const { settings, fetchSettings } = useAppSettings()

  // Ensure user is loaded
  if (!user.value) {
    await fetchUser()
  }

  // If not authenticated, redirect to login
  if (!user.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Ensure settings are loaded
  await fetchSettings()

  // If email verification is required by platform settings
  if (settings.value.requireEmailVerification && !user.value.emailVerification) {
    return navigateTo('/profile?verify_required=1')
  }
})
