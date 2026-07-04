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

### Scripts

| Command          | Purpose                       |
| ---------------- | ----------------------------- |
| `npm run dev`    | Dev server                    |
| `npm run build`  | Production build              |
| `npm run start`  | Serve the production build    |
| `npm run lint`   | ESLint                        |
| `npm run format` | Prettier                      |

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
