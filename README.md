# EverythingReimbursable

A mobile-responsive receipt scanner and expense tracker webapp built with Next.js.

**Snap or upload a receipt → AI extracts the data → review and save → browse your history.**

Real AI extraction (Google Gemini via a server-side API route), Supabase auth + cloud sync,
and a graceful local-only mode when Supabase is not configured. The app starts empty — all
receipts come from the user's own uploads.

> **Web conversion notes:** see [`docs/WEB_CONVERSION.md`](./docs/WEB_CONVERSION.md)
> **Dev progress log:** see [`PROGRESS.md`](./PROGRESS.md)
> **Design system:** see [`CLAUDE.md`](./CLAUDE.md)
> **Supabase setup:** see [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md)

---

## Features

- 📸 **Capture** — take a photo (native camera on mobile browsers), pick a file, or drag-and-drop
- 🤖 **AI extraction** — Gemini reads merchant, total, tax, date, payment method, and e-invoice ID
- ✅ **Review & edit** — verify the extracted fields, edit inline, then save
- 🗂️ **History** — search, filter by month/category/status, grouped timeline view
- 📊 **Dashboard** — total spend, monthly stats, and recent receipts at a glance
- 📤 **Export** — download all receipts as CSV
- ☁️ **Sync** — optional Supabase auth + cloud storage; falls back to fully local when unconfigured
- 📱 **Responsive** — mobile-first, full-bleed on phones, centered app frame on desktop

---

## Tech Stack

| Layer       | Technology                                                     |
| ----------- | -------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router)                                        |
| Language    | TypeScript (strict)                                            |
| Styling     | Tailwind CSS v4 — design tokens in `app/globals.css` `@theme`  |
| State       | React Context — `lib/auth.tsx`, `lib/receipts.tsx`             |
| Persistence | `localStorage` (receipts, auth cache, prefs)                   |
| Backend     | Supabase (auth + storage + receipts table) — optional          |
| AI/OCR      | Google Gemini via `/api/extract` (key stays server-side)       |
| Capture     | `<input type="file" capture>` — native camera on mobile web    |
| Fonts       | Plus Jakarta Sans + Space Grotesk (`next/font/google`)         |
| Icons       | Material Symbols web font                                      |
| Export      | CSV via Blob download                                          |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Google Gemini API key (for AI receipt extraction)
- Optional: a Supabase project (cloud auth + sync) — see [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md)

### Setup

```bash
cp .env.example .env.local   # fill in GEMINI_API_KEY (+ Supabase vars if used)
npm install
npm run dev                  # http://localhost:3000
```

Without Supabase credentials the app runs fully local: local auth, localStorage
persistence, no image uploads.

### Environment variables

| Variable                        | Required | Purpose                                            |
| ------------------------------- | -------- | -------------------------------------------------- |
| `GEMINI_API_KEY`                | yes      | Server-side receipt OCR — never exposed to browser |
| `NEXT_PUBLIC_SUPABASE_URL`      | no       | Enables cloud auth + sync when set                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no       | Enables cloud auth + sync when set                 |

### Scripts

| Command          | Purpose                       |
| ---------------- | ----------------------------- |
| `npm run dev`    | Dev server                    |
| `npm run build`  | Production build              |
| `npm run start`  | Serve the production build    |
| `npm run lint`   | ESLint                        |
| `npm run format` | Prettier                      |

---

## Routes & Flow

| Route             | Screen                                                    |
| ----------------- | -------------------------------------------------------- |
| `/`               | Splash / onboarding (redirects to `/home` when signed in) |
| `/login` `/signup` `/reset-password` | Auth                                 |
| `/home`           | Dashboard — totals, monthly stats, recent receipts       |
| `/history`        | Searchable, filterable receipt archive                   |
| `/profile`        | Account, currency preference, CSV export, logout         |
| `/scan`           | Upload / capture a receipt image                         |
| `/processing`     | AI extraction progress                                   |
| `/review`         | Review new extraction or view/edit an existing receipt   |
| `/api/extract`    | Server route — Gemini OCR                                |

The capture flow (`/scan → /processing → /review`) hands the image and extraction result
through in-memory state (`lib/pending.ts`); a hard refresh mid-flow returns to `/scan`.

---

## Architecture Highlights

- **Server-side AI key** — the image is compressed in the browser (canvas) and posted to
  `/api/extract`; the Gemini key lives only on the server.
- **Local-first, cloud-optional** — receipts persist to `localStorage`; when Supabase is
  configured, writes upsert to the cloud and reads merge on login/refresh (last-write-wins by
  `updatedAt`). Image files upload to Supabase Storage; in local-only mode they're inlined as
  compressed data URLs.
- **Design tokens** — the full Material 3 palette, type scale, and shadows live once in
  `app/globals.css` `@theme`; components reference tokens, never raw hex.

---

## Project Layout

```
app/
├── layout.tsx              → fonts, providers, mobile-first 640px app frame
├── globals.css             → Tailwind v4 + Material 3 design tokens
├── page.tsx                → splash / onboarding
├── login/ signup/ reset-password/
├── (main)/                 → auth-guarded, bottom tab bar
│   ├── home/ history/ profile/
├── scan/ processing/ review/  → receipt capture flow (full-screen)
└── api/extract/route.ts    → server-side Gemini OCR
components/                 → Icon, Button, Input, TabBar
lib/                        → contexts, Supabase client, cloud sync, helpers
designMockups/              → per-screen visual source of truth (png + html)
```

---

## Deployment

Deploys to any Node host or Vercel:

```bash
npm run build && npm run start
```

Set `GEMINI_API_KEY` (and the Supabase vars, if used) in the host's environment. When Supabase
is enabled, add `{origin}/reset-password` to the project's redirect allowlist so password-reset
links resolve.
