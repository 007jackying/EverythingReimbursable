# Web Conversion — Expo React Native → Next.js

**Date:** 2026-07-04
**Scope:** Full conversion of EverythingReimbursable from an Expo React Native mobile app to a mobile-responsive Next.js webapp, plus removal of all native-only code, tests, and dead integrations.

---

## 1. What Changed

### Stack

| | Before | After |
| --- | --- | --- |
| Framework | Expo ~55 / React Native 0.83 | Next.js 16 (App Router) |
| Language | TypeScript (strict) | TypeScript (strict) — unchanged |
| Routing | Expo Router (`src/app/`) | Next.js App Router (`app/`) |
| Styling | `StyleSheet.create` + `theme.ts` tokens | Tailwind CSS v4 — same token palette in `app/globals.css` `@theme` |
| Fonts | `@expo-google-fonts/*` | `next/font/google` (Plus Jakarta Sans, Space Grotesk) |
| Icons | `@expo/vector-icons` Material Icons | Material Symbols web font (`components/Icon.tsx`) |
| Auth | Supabase + expo-secure-store | Supabase + localStorage (`lib/auth.tsx`) |
| Receipt storage | AsyncStorage + Supabase + offline queue | localStorage + Supabase, online-first (`lib/receipts.tsx`) |
| AI extraction | Gemini called from the client (key exposed via `EXPO_PUBLIC_*`) | Gemini called from a **server route** `/api/extract` — key stays server-side |
| Camera | expo-camera viewfinder | `<input type="file" accept="image/*" capture="environment">` — opens the native camera on mobile browsers, file picker on desktop; drag-and-drop supported |
| Image compression | expo-image-manipulator | Canvas API (`lib/image.ts`) |
| CSV export | expo-file-system + expo-sharing | Blob download (`lib/csv.ts`) |
| Deploy | EAS build (iOS/Android) | Any Node host (`next build` / `next start`) or Vercel |

### Route map

| Old (Expo Router) | New (Next.js) |
| --- | --- |
| `/(auth)/splash` | `/` (onboarding, redirects to `/home` when authenticated) |
| `/(auth)/login` | `/login` |
| `/(auth)/signup` | `/signup` |
| `/reset-password` | `/reset-password` (request + recovery modes) |
| `/(main)/home` | `/home` |
| `/(main)/history` | `/history` |
| `/(main)/profile` | `/profile` |
| `/(main)/scan` | `/scan` (upload screen — no live camera) |
| `/ai-processing` | `/processing` |
| `/receipt-detail` | `/review` (`?id=` for existing receipts) |

The scan → processing → review flow passes the picked image and extraction result through in-memory module state (`lib/pending.ts`) instead of router params; a hard refresh mid-flow returns to `/scan`.

### Mobile responsiveness

- Mobile-first layout: full-bleed app column on phones, centered 640px column with shadow on desktop (root `app/layout.tsx`).
- Fixed bottom tab bar (Home | History | Scan FAB | Profile) with `env(safe-area-inset-bottom)` padding for notched phones.
- All touch targets ≥48px; `dvh` units for viewport height.

## 2. What Was Removed

- **Native projects/config:** `android/`, `app.json`, `eas.json`, `babel.config.js`, `expo-env.d.ts`, `assets/` (native icons/splash), `metro`/Expo entries.
- **Old source tree:** `src/` in its entirety (screens, components, contexts, services, utils) — all logic was ported into `app/`, `components/`, and `lib/`.
- **Native-only utilities:** offline queue + NetInfo reconnect worker (web is online-first; failed cloud writes keep the local copy and log a warning), expo-secure-store wrapper, file-cache copier, expo camera screen.
- **Tests & tooling:** Jest configs and all suites, Maestro `e2e/`, husky + lint-staged, Airbnb ESLint config (replaced by `eslint-config-next`).
- **Dead integrations:** Google Drive backup + Google OAuth (`google.ts`, `GoogleContext`, `googleDrive.ts` — were already being deleted before conversion).
- **Obsolete docs:** test reports, linting setup, Google OAuth setup, session summaries, onboarding doc (all described the RN codebase).
- **Dependencies:** from 33 runtime deps down to 5 (`next`, `react`, `react-dom`, `@supabase/supabase-js`, `@google/generative-ai`).

## 3. What Was Preserved

- **Design system** — the full Material 3 token palette, typography scale, radius/shadow/spacing rules from CLAUDE.md, now expressed as Tailwind theme variables. `designMockups/` remains the visual source of truth.
- **Receipt data model** — the `Receipt` interface is unchanged, including the Supabase `receipts` table row mapping (snake_case columns) — existing cloud data works as-is.
- **Local-only fallback** — without Supabase env vars the app still fully works: local auth, localStorage persistence, no uploads. (Receipt images are inlined as compressed data URLs in this mode so they survive reloads.)
- **Business logic** — filter/grouping logic in History, monthly totals on Home, confidence → status rule, category inference keyword map, CSV column layout, currency preference (aggregates only), last-write-wins cloud merge.

## 4. Environment Variables

| Old | New | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_GEMINI_API_KEY` | `GEMINI_API_KEY` | **Server-side only now** — set in `.env.local`, never shipped to the browser |
| `EXPO_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | optional |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional |

The Supabase password-reset redirect changed from the `everythingreimbursable://` deep link to `{origin}/reset-password` — update the redirect URL allowlist in the Supabase dashboard.

## 5. New Project Layout

```
app/
├── layout.tsx            → fonts, providers, 640px app frame
├── globals.css           → Tailwind v4 + design tokens (@theme)
├── page.tsx              → splash / onboarding
├── login/ signup/ reset-password/
├── (main)/
│   ├── layout.tsx        → auth guard + bottom tab bar
│   ├── home/ history/ profile/
├── scan/ processing/ review/   → standalone full-screen flow
└── api/extract/route.ts  → server-side Gemini OCR
components/               → Icon, Button, Input, TabBar
lib/                      → types, supabase, auth, receipts, cloud,
                            currency, csv, extract, pending, image,
                            format, categories
```

## 6. Known Simplifications

- No offline queue — a receipt saved while offline stays local until the next successful edit or login pull. Add back a queue only if offline use becomes a real requirement.
- Local-only image persistence uses data URLs in localStorage (~a few dozen receipts of headroom). Move to IndexedDB if local-only mode needs more.
- No live in-browser camera viewfinder — the file input's `capture` attribute delegates to the phone's camera app, which is more reliable.
- No unit tests were ported; the RN suites tested Expo-specific modules that no longer exist.
