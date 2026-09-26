<script setup lang="ts">
import { onMounted } from 'vue'

useSeoMeta({
  title: 'Autentikasi — Cek Naskah',
  robots: 'noindex, nofollow'
})

onMounted(async () => {
  const { fetchUser } = useAuth()
  const currentUser = await fetchUser()
  if (currentUser) {
    const existingPhone = currentUser.phone || (currentUser.prefs?.phone as string)
    if (!existingPhone || existingPhone.trim().length <= 4) {
      navigateTo('/auth/complete-phone', { replace: true })
    } else {
      navigateTo('/', { replace: true })
    }
  } else {
    navigateTo('/login', { replace: true })
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
    <div class="w-8 h-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
  </div>
</template>
