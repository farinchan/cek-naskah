# AGENTS.md — AI Development Guidelines for `cek-naskah`

Welcome to **cek-naskah** (`farinchan/cek-naskah`). This document provides comprehensive context, architectural principles, code conventions, and workflows for AI assistants (and human contributors) working on this codebase.

---

## 1. Project Overview & Vision

- **Project Name:** `cek-naskah` (Indonesian: *Pemeriksa / Pengoreksi Naskah*)
- **Purpose:** An intelligent web application for analyzing, proofreading, and reviewing Indonesian manuscripts, academic papers, articles, and essays (grammar, spelling/EYD V, sentence structure, typography, formatting, and readability).
- **Current State:** Initialized from the official `@nuxt/ui` starter template (`v4.5.2` / Nuxt UI `v4.11.0` / Tailwind CSS `v4.3.3`) and integrated with **Appwrite** for authentication and backend services.
- **Repository:** `https://github.com/farinchan/cek-naskah`
- **Package Manager:** `pnpm@11.24.0`

---

## 2. Tech Stack & Architecture

| Layer | Technology | Version / Spec |
| :--- | :--- | :--- |
| **Framework** | [Nuxt 4](https://nuxt.com) | `^4.5.2` (Nuxt 4 directory layout with `app/`) |
| **Backend / BaaS** | [Appwrite](https://appwrite.io) | `^26.2.0` (Auth, Sessions, Database, Storage) |
| **Language** | [TypeScript](https://www.typescriptlang.org) | `^6.0.3` (Strict checking via `vue-tsc ^3.3.11`) |
| **UI Library** | [@nuxt/ui](https://ui.nuxt.com) | `^4.11.0` (Nuxt UI v3/v4 on Reka UI) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | `^4.3.3` (CSS-first config via `@theme static` in `main.css`) |
| **Icons** | [@iconify-json/lucide](https://lucide.dev), `simple-icons` | `i-lucide-*`, `i-simple-icons-*` |
| **Linter / Formatter** | [@nuxt/eslint](https://eslint.nuxt.com) | `^1.17.0`, ESLint flat config |
| **CI / Automation** | GitHub Actions & Renovate | Node 22, `lint` + `typecheck` on push |

---

## 3. Directory Structure & Nuxt 4 Conventions

This repository follows the **Nuxt 4 directory structure**:

```
cek-naskah/

├── .github/
│   └── workflows/
│       └── ci.yml             # CI: Node 22, pnpm lint & typecheck
├── app/                       # Nuxt 4 frontend application root
│   ├── assets/
│   │   └── css/
│   │       └── main.css       # Tailwind v4 theme & color definitions
│   ├── components/            # Auto-imported Vue components
│   │   ├── AppLogo.vue
│   │   └── TemplateMenu.vue
│   ├── pages/                 # File-based routing
│   │   └── index.vue          # Landing / editor page
│   ├── utils/
│   │   └── appwrite.js        # Re-export Appwrite client for app/
│   ├── app.config.ts          # App theme configuration (primary/neutral colors)
│   └── app.vue                # Top-level shell & Auth UI
├── public/                    # Static assets served at root (favicon, icons)
├── server/                    # Nitro server routes & APIs
│   ├── api/                   # /api/* endpoints (e.g., check-naskah, grammar, upload)
│   ├── middleware/            # Nitro server middleware
│   └── utils/                 # Server-side helper utilities
├── utils/
│   └── appwrite.js            # Appwrite Client & Account initialization
├── .editorconfig              # 2 spaces, UTF-8, LF
├── eslint.config.mjs          # Flat ESLint config extending withNuxt
├── nuxt.config.ts             # Nuxt configuration
├── package.json               # Scripts & dependencies
├── pnpm-lock.yaml             # Lockfile
├── pnpm-workspace.yaml        # Build permission config
├── renovate.json              # Renovate bot configuration
└── tsconfig.json              # TypeScript references to .nuxt/tsconfig.*
```

> **Nuxt 4 Rule:** All frontend application code (components, pages, layouts, composables, assets) belongs inside `app/`, **not** in the project root. The `server/` directory sits at the root alongside `app/`.

---

## 4. Appwrite Integration & Authentication

The project uses **Appwrite** as its Backend-as-a-Service (BaaS) provider.

### 4.1. Client Initialization
- The Appwrite client is initialized in `utils/appwrite.js` (and available to `app/` via `app/utils/appwrite.js`):
  ```js
  import { Client, Account } from 'appwrite'

  export const client = new Client()

  client
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')

  export const account = new Account(client)
  export { ID } from 'appwrite'
  ```

### 4.2. Core Authentication Operations
- **Login:**
  ```js
  await account.createEmailPasswordSession({ email, password })
  const user = await account.get()
  ```
- **Registration:**
  ```js
  await account.create({ userId: ID.unique(), email, password, name })
  await account.createEmailPasswordSession({ email, password })
  ```
- **Logout:**
  ```js
  await account.deleteSession({ sessionId: 'current' })
  ```
- **Session Verification:**
  ```js
  try {
    const user = await account.get()
  } catch {
    // No active session
  }
  ```

### 4.3. Console & CORS Requirements
- Ensure a **Web App** platform is registered in the Appwrite Console under **Project Settings > Platforms**.
- The platform **Hostname** must be set to `localhost` for local development.

### 4.4. Future Appwrite Scope in `cek-naskah`
- **Databases:** Storing analyzed documents, user checking history, custom vocabulary, and user glossaries.
- **Storage:** Storing uploaded manuscript files (`.docx`, `.pdf`, `.txt`) for analysis.
- **Functions:** Running heavy asynchronous NLP tasks or document conversion pipelines if needed.

---

## 5. Key Configuration Details

### 5.1. `nuxt.config.ts`
- **Modules:** `@nuxt/eslint`, `@nuxt/ui`.
- **CSS:** `~/assets/css/main.css`.
- **Compatibility Date:** `2026-06-30`.
- **Route Rules:** `'/'` is prerendered by default.
- **ESLint Stylistic Rules:**
  - `commaDangle: 'never'` (No trailing commas).
  - `braceStyle: '1tbs'` (One true brace style).

### 5.2. Styling & Theming (`app/assets/css/main.css`)
- Colors and design tokens are centrally managed in `app/assets/css/main.css` using Tailwind CSS v4 `@theme static`:
  ```css
  @import "tailwindcss";
  @import "@nuxt/ui";

  @theme static {
    --font-sans: 'Public Sans', sans-serif;

    /* Theme Primary Colors (50 - 950) */
    --color-primary-50: #EEF2FF;
    ...
    --color-primary-600: #4F46E5;
    ...
    --color-primary-950: #1E1B4B;

    --color-brand-50: var(--color-primary-50);
    ...
    --color-brand-950: var(--color-primary-950);
  }
  ```
- Colors configured in `app/app.config.ts`:
  - `primary`: `'brand'`
  - `neutral`: `'slate'`
- **Rule for UI components & pages:** Use semantic `primary-*` utility classes (e.g. `bg-primary-600`, `text-primary-500`, `hover:bg-primary-700`, `shadow-primary-600/25`). Avoid hardcoded color names (such as `indigo-*`, `blue-*`, etc.) so changing hex codes in `main.css` will seamlessly update the entire application.

---

## 6. Development Workflows & Commands

All commands should be executed with `pnpm`:

```bash
# Start local development server with hot-reload (http://localhost:3000)
pnpm dev

# Typecheck with vue-tsc and Nuxt types
pnpm typecheck

# Lint and check code style with ESLint
pnpm lint

# Build for production
pnpm build

# Preview the production build locally
pnpm preview

# Regenerate .nuxt auto-generated types / schemas
pnpm postinstall # (runs `nuxt prepare`)
```

> **Agent Check:** Before completing any significant code modification, always verify that `pnpm lint` and `pnpm typecheck` pass without errors.

---

## 7. Coding Standards & AI Guidelines

### 7.1. Vue 3 & Nuxt Best Practices
1. **`<script setup>` & TypeScript:** Always use `<script setup lang="ts">` in components and pages.
2. **Auto-Imports:** Nuxt automatically imports Vue APIs (`ref`, `computed`, `watch`, `onMounted`), Nuxt composables (`useHead`, `useSeoMeta`, `useRoute`, `useRouter`, `useFetch`, `$fetch`), and components in `app/components/`. **Do not manually import them.**
3. **Nuxt UI Components:** Leverage `@nuxt/ui` built-in components:
   - Root wrapper: `<UApp>`
   - Layout: `<UHeader>`, `<UMain>`, `<UFooter>`, `<UContainer>`, `<UCard>`
   - Inputs & Forms: `<UInput>`, `<UTextarea>`, `<USelect>`, `<UFormField>`, `<UButton>`
   - Feedback: `<UAlert>`, `<UBadge>`, `<UProgress>`, `<UTooltip>`, `<UModal>`, `<USkeleton>`
   - Navigation: `<UNavigationMenu>`, `<UDropdownMenu>`, `<UTabs>`
4. **Icons:** Use the `icon` or `leading-icon` / `trailing-icon` prop with `i-lucide-*` or `i-simple-icons-*` (e.g. `icon="i-lucide-file-text"`).
5. **Formatting Rules:**
   - Single quotes for strings in JS/TS.
   - 2-space indentation.
   - **No trailing commas** (`commaDangle: 'never'`).
   - One True Brace Style (`1tbs`).

### 7.2. Server-Side Routes (`server/`)
When implementing manuscript analysis APIs:
- Place endpoints in `server/api/<endpoint>.[get|post|put|delete].ts`.
- Use `defineEventHandler` and `readBody` / `getQuery`.
- Use TypeScript interfaces for payload and response typing.
- Handle errors using `createError({ statusCode: ..., statusMessage: ... })`.

### 7.3. Target Domain Logic (`cek-naskah`)
When developing features for manuscript checking:
- **PUEBI / EYD V:** Target standard Indonesian orthography rules (huruf kapital, huruf miring, tanda baca, kata baku vs. tidak baku, partikel, kata depan *di-* vs imbuhan *di-*).
- **Text Analysis Modules:**
  - Word count, character count, estimated reading time.
  - Sentence length and readability index (e.g. Flesch-Kincaid adapted for Indonesian or Fog Index).
  - Spelling & typo detection (lexicon matching, Levenshtein / fuzzy search).
  - Redundant phrases / kata mubazir (*agar supaya*, *adalah merupakan*, *sangat sekali*).
  - Formal academic formatting checks (citations, heading hierarchies).
- **Data Flow:**
  - Client sends raw text or uploaded document (`.txt`, `.docx`, `.pdf`) -> Server parses & runs analyzer pipeline -> Returns structured diagnostics array with line/col offsets, severity (`error`, `warning`, `info`), and suggested corrections.

---

## 8. Dos and Don'ts for AI Assistants

- **DO** place frontend files strictly in `app/` (e.g., `app/pages/`, `app/components/`, `app/composables/`).
- **DO** use Appwrite client from `utils/appwrite.js` / `app/utils/appwrite.js` for authentication, database, and storage operations.
- **DO** run `pnpm lint` and `pnpm typecheck` after editing code to ensure zero regressions.
- **DO** respect ESLint formatting (`commaDangle: 'never'`).
- **DO** use `@nuxt/ui` primitives instead of installing external redundant UI component libraries.
- **DON'T** place Vue components or pages in the root directory.
- **DON'T** use `npm` or `yarn`; always use `pnpm`.
- **DON'T** hardcode secret API keys (API Keys with server permissions) into client-side code; use Appwrite client SDK for client operations.
- **DON'T** disable TypeScript or ESLint checks without explicit user agreement.
