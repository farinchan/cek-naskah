<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
  }>(),
  {
    size: 'md',
    showText: true
  }
)
</script>

<template>
  <div class="inline-flex items-center gap-2.5 font-bold tracking-tight select-none">
    <img
      src="/logo.png"
      alt="Logo Cek Naskah"
      class="object-contain shrink-0"
      :class="{
        'w-7 h-7': size === 'sm',
        'w-9 h-9': size === 'md',
        'w-12 h-12': size === 'lg'
      }"
    >
    <span
      v-if="showText"
      class="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent font-black"
      :class="{
        'text-lg': size === 'sm',
        'text-xl': size === 'md',
        'text-2xl sm:text-3xl': size === 'lg'
      }"
    >
      Cek Naskah
    </span>
  </div>
</template>
