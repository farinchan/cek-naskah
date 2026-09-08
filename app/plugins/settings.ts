export default defineNuxtPlugin(async () => {
  const { fetchSettings } = useAppSettings()
  await fetchSettings()
})
