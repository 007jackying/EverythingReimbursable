# EverythingReimbursable — Development Progress Log

> Last updated: 2026-07-04
> Status: **Phase 5 complete — converted to a mobile-responsive Next.js webapp.**

---

## Phase History

| Phase                | Scope                                                                      | Status  |
| -------------------- | -------------------------------------------------------------------------- | ------- |
| 1 — Foundation       | Auth context, data context, persistence, splash gate (Expo RN)             | ✅ Done |
| 2 — Core Camera Flow | Scan screen, AI processing, receipt detail (Expo RN)                       | ✅ Done |
| 3 — Polish           | History filters, inline edit, delete, CSV export, empty states (Expo RN)   | ✅ Done |
| 4 — Production       | Supabase auth, cloud image + data sync, offline queue, error boundary      | ✅ Done |
| 5 — Web Conversion   | Full port to Next.js 16 + Tailwind v4; native code & test suites removed   | ✅ Done |

Phases 1–4 were built on Expo React Native. Phase 5 replaced the platform entirely —
see [`docs/WEB_CONVERSION.md`](./docs/WEB_CONVERSION.md) for the complete before/after,
route map, removals, and known simplifications.

---

## Screen Inventory (webapp)

| Screen              | Route             | Notes                                                            |
| ------------------- | ----------------- | ---------------------------------------------------------------- |
| Splash / Onboarding | `/`               | 3-slide carousel, redirects to `/home` when authenticated        |
| Login               | `/login`          | Email + password validation, error banner                        |
| Sign Up             | `/signup`         | Name + email + password, terms checkbox                          |
| Reset Password      | `/reset-password` | Request mode + Supabase recovery-link mode                       |
| Home / Dashboard    | `/home`           | Summary card, monthly stats, quick actions, recent receipts      |
| History             | `/history`        | Timeline, category grouping, status filters, search, CSV export  |
| Upload              | `/scan`           | File input (`capture` opens mobile camera) + drag-and-drop       |
| AI Processing       | `/processing`     | Progress animation, calls `/api/extract`, error + not-a-receipt states |
| Review / Detail     | `/review`         | New-receipt review + existing receipt view/edit/delete           |
| Profile             | `/profile`        | Edit name, currency preference, export data, logout              |

## Architecture Notes

- **Data:** `lib/receipts.tsx` — localStorage cache, online-first Supabase sync
  (last-write-wins by `updatedAt`), local-only fallback without credentials.
- **Auth:** `lib/auth.tsx` — Supabase email auth or local fallback; session cached
  in localStorage.
- **AI:** `app/api/extract/route.ts` — server-side OCR via Gemini (`GEMINI_MODEL_NAME`)
  or OpenRouter (`OPEN_ROUTER_*`) as fallback; browser sends a canvas-compressed JPEG,
  key never leaves the server. Non-receipt images return 422 and are never saved.
- **Design system:** unchanged Material 3 token palette, now as Tailwind `@theme`
  variables in `app/globals.css`. `designMockups/` remains visual truth.

## Backlog

- Receipt line-items extraction (model supports it; UI doesn't)
- Multi-page receipts
- IndexedDB for local-only image storage if usage grows
- PWA manifest + installability
