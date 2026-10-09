<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
    <LandingHeader />

    <main class="flex-1 py-8 sm:py-12 bg-slate-50/70 dark:bg-neutral-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          <!-- Shared Admin Sidebar -->
          <AdminSidebar class="w-full md:w-56 lg:w-60 shrink-0 md:sticky md:top-24" />

          <!-- Page Content -->
          <div class="flex-1 w-full min-w-0 space-y-6">
            <slot />
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
