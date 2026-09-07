<template>
  <section
    id="_hero_workflow_platform_v6_001"
    class="py-20 sm:py-24 bg-white dark:bg-neutral-950"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Asymmetric Split Layout -->
      <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        <!-- Left Content - Wider -->
        <div class="lg:col-span-7 space-y-8">
          <div class="space-y-6">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              <span>Ship </span>
              <span class="text-primary-600 dark:text-primary-400">Faster</span>,
              <span> Build </span>
              <span class="text-primary-600 dark:text-primary-400">Smarter</span>
            </h1>

            <p class="text-lg text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              Automate your development workflow with intelligent tools. From code to production in minutes, not hours.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <NuxtLink
                to="/login"
                class="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary-600/25 hover:gap-3"
              >
                Start Building Free
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </NuxtLink>
              <a
                href="#_features_split_panel_v6_001"
                class="px-8 py-3.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-900 dark:text-white font-semibold rounded-full transition-colors"
              >
                View Documentation
              </a>
            </div>
          </div>

          <!-- Dashboard Preview -->
          <div class="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 p-2 border border-slate-200/60 dark:border-neutral-800 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1528747008803-f9f5cc8f1a64?ixid=M3wzOTQxMzN8MHwxfHNlYXJjaHwxfHxsYXd5ZXIlMjBhdHRvcm5leSUyMGxlZ2FsJTIwYnVzaW5lc3N8ZW58MXwwfHx8MTc2OTMxOTk0OHww&amp;ixlib=rb-4.1.0&amp;w=1200&amp;auto=format&amp;fit=crop&amp;q=80"
              alt="Analytics dashboard"
              class="w-full h-64 sm:h-80 object-cover rounded-xl"
            >

            <!-- Floating Metrics -->
            <div class="absolute top-6 right-6 p-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 dark:border-neutral-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <svg
                    class="w-5 h-5 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <span class="text-lg font-bold text-slate-900 dark:text-white block">+127%</span>
                  <span class="text-xs text-slate-500 dark:text-neutral-400">Deploy Speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Feature Cards -->
        <div class="lg:col-span-5 space-y-5">
          <!-- Feature Card 1 -->
          <div class="p-6 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Instant Deploy
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                  Push to production in seconds with zero-config deployments and automatic rollbacks.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature Card 2 -->
          <div class="p-6 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Smart Integrations
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                  Connect with 200+ tools your team already uses, from GitHub to Slack.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature Card 3 -->
          <div class="p-6 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Live Analytics
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                  Real-time insights to track performance, errors, and user behavior.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature Card 4 -->
          <div class="p-6 bg-slate-50 dark:bg-neutral-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <svg
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Auto Scaling
                </h3>
                <p class="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                  Infrastructure that grows with your traffic automatically, pay only for what you use.
                </p>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-3 gap-4 pt-4">
            <div class="text-center p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span class="text-2xl font-bold text-slate-900 dark:text-white block">10K+</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400">Teams</span>
            </div>
            <div class="text-center p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span class="text-2xl font-bold text-slate-900 dark:text-white block">99.9%</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400">Uptime</span>
            </div>
            <div class="text-center p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
              <span class="text-2xl font-bold text-slate-900 dark:text-white block">50ms</span>
              <span class="text-xs text-slate-500 dark:text-neutral-400">Avg Deploy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
