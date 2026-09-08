export default defineNuxtPlugin(async () => {
  const { fetchSettings } = useAppSettings()
  const { fetchServices } = useServices()
  await Promise.allSettled([
    fetchSettings(),
    fetchServices()
  ])
})
