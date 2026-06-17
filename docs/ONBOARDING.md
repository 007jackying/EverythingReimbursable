# EverythingReimbursable — Developer Onboarding Guide

> Generated from the project knowledge graph on 2026-06-01.

---

## Project Overview

**EverythingReimbursable** is a cross-platform receipt scanner and expense tracker built with Expo React Native (iOS, Android, Web).

The core user journey: snap a photo of a receipt → Gemini Vision AI extracts structured data → review and correct → browse your full expense history.

**Languages:** TypeScript, JavaScript, Markdown, HTML, JSON  
**Frameworks:** React Native, Expo ~55, Supabase, Jest  
**Key integrations:** Google Gemini Vision API (OCR), Supabase Auth + Storage, Google Drive REST API, Google OAuth

---

## Architecture Layers

The codebase is organised into 8 layers. Understanding the layer contract prevents the most common mistake new contributors make: reaching across layer boundaries in the wrong direction.

### 1. Design System & Types (`src/constants/`, `src/types/`)

The non-negotiable foundation. Every other layer imports from here; this layer imports from nothing.

- `src/constants/theme.ts` — 47 named color tokens, spacing scale, border radius variants, shadow presets, type scale. **Never hardcode a hex value anywhere else.**
- `src/constants/app.ts` — `APP_NAME`, `GEMINI_MODEL`, storage keys, pagination limits, category label maps.
- `src/types/receipt.ts` — The `Receipt` interface (15 fields) and `ReceiptCategory` discriminated union. The source of truth for the app's data model.

### 2. External Services Layer (`src/services/`, `src/config/`)

API adapters for all third-party integrations. These modules have no React dependencies — they are pure async functions that talk to external APIs.

- `src/services/gemini.ts` — Base64-encodes image bytes, calls the Gemini Vision API with a structured prompt, parses the response into a `Receipt` object, and implements exponential-backoff retry.
- `src/services/supabaseAuth.ts` — Thin wrapper over the Supabase JS client's auth methods (sign-up, sign-in, sign-out, session, `onAuthStateChange`).
- `src/services/cloudStorage.ts` — Supabase Storage operations for receipt images: upload (with compression), delete, get public URL, and batch migrations.
- `src/services/googleDrive.ts` — Full Google Drive REST API suite: folder management, file search, upload (images), and delete.
- `src/config/supabase.ts` — Creates the nullable Supabase client (configured with AsyncStorage for session persistence).
- `src/config/google.ts` — Exports `GOOGLE_CONFIG` with OAuth client IDs and Drive scopes.

### 3. Hooks & Utilities (`src/hooks/`, `src/utils/`)

Custom React hooks and pure utility functions. No external API calls; no global state mutation.

- `src/hooks/useReceiptFilter.ts` — Manages filter/search/sort state for the History screen, returning a filtered receipt array.
- `src/hooks/useAuthForm.ts` — Encapsulates auth form state and validation for login and sign-up screens.
- `src/hooks/useLazyImage.ts` — On-demand image loading with loading/error state via `expo-image-picker`.
- `src/utils/formatters.ts` — `formatAmount` (multi-currency), `formatDate`, `getMonthYear`.
- `src/utils/validators.ts` — Pure validation functions: email, password, name, generic required.
- `src/utils/exportCsv.ts` — Serialises `Receipt[]` to CSV and triggers the platform share sheet.
- `src/utils/imageCompression.ts` — Resize-and-compress to JPEG using `expo-image-manipulator`.
- `src/utils/offlineQueue.ts` — AsyncStorage-backed offline sync queue for receipts pending cloud upload.
- `src/utils/secureStorage.ts` — Cross-platform secure storage (expo-secure-store on native, localStorage on web).
- `src/utils/categories.ts` — Maps `ReceiptCategory` values to Material Icon name strings.
- `src/utils/fileHandler.ts` — Copy images to app cache, check file existence, read/write bytes.
- `src/utils/time.ts` — Month-membership test, time-of-day greeting, month-year label, human-readable date.

### 4. State & Context Layer (`src/context/`)

React Context providers that hold global application state. Screens read from these contexts and never talk to services directly.

- `src/context/AuthContext.tsx` — User state, session restoration on startup, `login`/`signUp`/`logout`/`updateName` actions. Delegates network calls to `supabaseAuth.ts`. **Highest fan-in node in the graph (4 importers).**
- `src/context/ReceiptsContext.tsx` — The receipt collection, persisted via AsyncStorage (`receipts_v1`). Add, update, delete operations. Syncs images to Supabase Storage via `cloudStorage.ts`.
- `src/context/GoogleContext.tsx` — Google OAuth token lifecycle. Stores the access token in secure storage; consumed by the AI processing screen to authorise Drive uploads.

### 5. UI Component Library (`src/components/`)

Reusable presentational components implementing the design system. They receive all data via props and call back via handlers — no context access, no side effects.

| Component             | Purpose                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `AppButton.tsx`       | 5-variant animated button (primary, ghost, quick-action-dark, quick-action-light, disabled) |
| `AppInput.tsx`        | Text input with uppercase label, focus/error border states, password visibility toggle      |
| `Chip.tsx`            | 6-variant pill badge (verified, pending, category, category-large, ai-verified, bank-grade) |
| `ReceiptCard.tsx`     | Home screen receipt card with merchant avatar, amount, status chip, editorial shadow        |
| `HistoryListItem.tsx` | History screen list row with icon container, merchant name, date, amount, chip              |
| `SummaryCard.tsx`     | Dark summary card with blurred decorative circles and monthly stats bento                   |
| `SearchBar.tsx`       | Controlled search input with leading Material icon                                          |
| `FilterTab.tsx`       | Pill-shaped filter tab with active/inactive styling                                         |
| `FilterSheet.tsx`     | Bottom-sheet modal for status filter selection                                              |
| `TimelineHeader.tsx`  | Month-group section header (Space Grotesk uppercase)                                        |
| `ScreenHeader.tsx`    | Top app bar with app name, optional hamburger/close button                                  |

### 6. Screens & Navigation (`src/app/`)

Expo Router file-based screens and layout files. These are the only files that should call context hooks and pass data down to components.

**Navigation tree:**

```
src/app/
├── _layout.tsx           ← Root: fonts, providers, splash gate
├── index.tsx             ← Auth redirect (session → home or splash)
├── (auth)/
│   ├── _layout.tsx       ← Auth stack wrapper
│   ├── splash.tsx        ← Onboarding carousel
│   ├── login.tsx         ← Email/password + Google login
│   └── signup.tsx        ← Registration
├── (main)/
│   ├── _layout.tsx       ← Main tab navigator + auth guard
│   ├── home.tsx          ← Dashboard: summary card, recent receipts, quick actions
│   ├── history.tsx       ← Full receipt archive with search/filter/export
│   ├── scan.tsx          ← Camera capture (expo-camera)
│   └── profile.tsx       ← User stats, preferences, Google Drive, logout
├── ai-processing.tsx     ← AI orchestration modal (Gemini + Drive + Supabase)
├── receipt-detail.tsx    ← Review, inline-edit, and save extracted receipt
└── +not-found.tsx        ← 404 catch-all
```

### 7. Test Suite (`test/`, `src/services/*.test.ts`)

Jest + React Native Testing Library. A single Jest config (`jest.config.js`) using the `jest-expo` preset runs all unit, component, and service tests.

`test/test-utils.tsx` exports a custom `render` wrapper that provides all three context providers, and factory helpers (`createMockReceipt`, `createMockUser`) used across test files.

### 8. Project Configuration & Documentation

Expo manifest (`app.json`), EAS build profiles (`eas.json`), `package.json` (40+ runtime dependencies), TypeScript config, ESLint/Prettier/Husky toolchain. See `docs/LINTING_SETUP.md` for the lint-staged commit hook setup.

---

## Key Concepts

### Design Token Discipline

Color is never a hex literal in component code. Import from `src/constants/theme.ts`:

```typescript
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme'

// ✅ Correct
backgroundColor: Colors.primary
// ❌ Wrong
backgroundColor: '#070235'
```

### Offline-First Data Strategy

Receipts write to AsyncStorage first (optimistic update), then sync to Supabase Storage asynchronously via `offlineQueue.ts`. The UI never blocks on network. If a cloud sync fails, the item stays in the offline queue for retry.

### Service → Context → Screen Dependency Rule

```
screen → context → service → external API
```

Screens never import services directly. Contexts are the only consumers of services. This keeps screens testable with context mocks and keeps services swappable.

### Parallel Side-Effects with `Promise.allSettled`

The AI processing screen runs Gemini OCR, Google Drive upload, and Supabase Storage upload in parallel using `Promise.allSettled`. A Drive failure does not abort the Supabase upload or prevent the receipt from saving.

### Expo Router Route Groups

Folders named `(auth)` and `(main)` are route groups — the parentheses are stripped from the URL path. `(auth)/login.tsx` is accessible at `/login`. This organises screens into logical groups with shared `_layout.tsx` wrappers without affecting the URL structure.

---

## Guided Tour

Follow these 15 steps to build a complete mental model of the codebase, reading the files in dependency order.

| Step | Title                                | Files                                                                                                     |
| ---- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1    | Project Overview                     | `README.md`                                                                                               |
| 2    | App Shell & Bootstrap                | `src/app/_layout.tsx`                                                                                     |
| 3    | The Design System Foundation         | `src/constants/theme.ts`, `src/constants/app.ts`                                                          |
| 4    | The Receipt Data Model               | `src/types/receipt.ts`                                                                                    |
| 5    | Authentication Context               | `src/context/AuthContext.tsx`                                                                             |
| 6    | Receipt State & Cloud Sync           | `src/context/ReceiptsContext.tsx`, `src/services/cloudStorage.ts`                                         |
| 7    | Google OAuth Context                 | `src/context/GoogleContext.tsx`                                                                           |
| 8    | Auth Screens: Splash, Login, Sign-Up | `src/app/index.tsx`, `src/app/(auth)/splash.tsx`, `src/app/(auth)/login.tsx`, `src/app/(auth)/signup.tsx` |
| 9    | Main Tab Navigator & Home            | `src/app/(main)/_layout.tsx`, `src/app/(main)/home.tsx`                                                   |
| 10   | Camera Capture Screen                | `src/app/(main)/scan.tsx`                                                                                 |
| 11   | AI Orchestration: The Core Feature   | `src/app/ai-processing.tsx`                                                                               |
| 12   | Gemini OCR Service                   | `src/services/gemini.ts`                                                                                  |
| 13   | Supabase Auth Service                | `src/services/supabaseAuth.ts`                                                                            |
| 14   | Receipt Detail & Review Screen       | `src/app/receipt-detail.tsx`                                                                              |
| 15   | History, Profile & Dependencies      | `src/app/(main)/history.tsx`, `src/app/(main)/profile.tsx`, `package.json`                                |

---

## File Map

### Screens & Navigation

| File                         | Complexity | Purpose                                                 |
| ---------------------------- | ---------- | ------------------------------------------------------- |
| `src/app/_layout.tsx`        | moderate   | Root layout: fonts, providers, splash gate              |
| `src/app/index.tsx`          | simple     | Auth redirect entry point                               |
| `src/app/(auth)/splash.tsx`  | complex    | Onboarding carousel with Reanimated stagger             |
| `src/app/(auth)/login.tsx`   | moderate   | Email/password + Google sign-in                         |
| `src/app/(auth)/signup.tsx`  | moderate   | Registration with validation and terms checkbox         |
| `src/app/(auth)/_layout.tsx` | simple     | Auth stack wrapper                                      |
| `src/app/(main)/_layout.tsx` | moderate   | Main tab navigator + auth guard                         |
| `src/app/(main)/home.tsx`    | complex    | Dashboard: summary card, recent receipts, quick actions |
| `src/app/(main)/history.tsx` | complex    | Full archive with search, filter, sort, CSV export      |
| `src/app/(main)/scan.tsx`    | complex    | Camera capture: focus, zoom, flash, gallery picker      |
| `src/app/(main)/profile.tsx` | complex    | User stats, name edit, Drive backup, logout             |
| `src/app/ai-processing.tsx`  | complex    | Gemini + Drive + Supabase orchestration modal           |
| `src/app/receipt-detail.tsx` | complex    | Review, inline-edit, and save extracted receipt         |
| `src/app/+not-found.tsx`     | simple     | 404 catch-all                                           |

### Design System & Types

| File                     | Complexity | Purpose                                                |
| ------------------------ | ---------- | ------------------------------------------------------ |
| `src/constants/theme.ts` | moderate   | All design tokens — never hardcode hex values          |
| `src/constants/app.ts`   | simple     | Storage keys, model IDs, pagination limits, label maps |
| `src/types/receipt.ts`   | simple     | `Receipt` interface + `ReceiptCategory` union          |

### State & Context

| File                              | Complexity | Purpose                                               |
| --------------------------------- | ---------- | ----------------------------------------------------- |
| `src/context/AuthContext.tsx`     | moderate   | Auth state, session restoration, login/logout actions |
| `src/context/ReceiptsContext.tsx` | moderate   | Receipt CRUD with AsyncStorage persistence            |
| `src/context/GoogleContext.tsx`   | complex    | Google OAuth token lifecycle + Drive integration      |

### External Services

| File                           | Complexity | Purpose                                               |
| ------------------------------ | ---------- | ----------------------------------------------------- |
| `src/services/gemini.ts`       | complex    | Gemini Vision OCR with retry and confidence scoring   |
| `src/services/supabaseAuth.ts` | moderate   | Supabase Auth method wrappers                         |
| `src/services/cloudStorage.ts` | moderate   | Supabase Storage upload/delete/URL for receipt images |
| `src/services/googleDrive.ts`  | complex    | Full Google Drive REST API suite                      |
| `src/config/supabase.ts`       | simple     | Supabase client factory                               |
| `src/config/google.ts`         | simple     | Google OAuth config (client IDs, scopes)              |

---

## Complexity Hotspots

These files are the most complex in the codebase. Read them last, after you understand their dependencies.

| File                            | Why complex                                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/ai-processing.tsx`     | Orchestrates 3 concurrent async operations (Gemini, Drive, Supabase), animated progress bar, live confidence ring, highest fan-out screen |
| `src/app/(main)/home.tsx`       | Aggregates data from two contexts, renders summary card with computed totals, quick actions, capped receipt list                          |
| `src/app/(main)/profile.tsx`    | User stats computation, inline name editing, currency preference, Google Drive backup toggle, Google OAuth revocation, logout             |
| `src/app/(main)/history.tsx`    | Multi-axis filtering (search + tab + category + status + sort), month-grouped timeline, CSV export                                        |
| `src/app/(main)/scan.tsx`       | expo-camera lifecycle, permission handling, tap-to-focus, pinch-to-zoom, mode switching, gallery picker                                   |
| `src/app/receipt-detail.tsx`    | Inline field editing, full-screen image preview modal, save to context, cloud cleanup on delete                                           |
| `src/app/(auth)/splash.tsx`     | Reanimated stagger animation, three-slide feature carousel, pagination dot transitions                                                    |
| `src/context/GoogleContext.tsx` | Google OAuth token acquisition, refresh, secure persistence, auth state change propagation                                                |
| `src/services/gemini.ts`        | Multi-URI-scheme normalisation, base64 encoding, structured prompt engineering, exponential backoff, response parsing                     |
| `src/services/googleDrive.ts`   | Folder management, file search, multipart upload, resumable upload for large files, delete                                                |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: EXPO_PUBLIC_GEMINI_API_KEY, EXPO_PUBLIC_GOOGLE_CLIENT_ID,
#          EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start development server
npx expo start

# Run tests
npm test                         # utility tests (Node env)
npm run test:components          # component tests (jsdom)
npm run test:expo                # integration tests (jest-expo)

# Lint and format
npm run lint
npm run format
```

**Supabase setup:** See `docs/SUPABASE_SETUP.md` for bucket configuration and RLS policy setup.  
**Google OAuth:** See `docs/GOOGLE_OAUTH_SETUP.md` for redirect URI configuration.  
**Linting toolchain:** See `docs/LINTING_SETUP.md` for ESLint/Prettier/Husky details.

---

## Current Build Status

| Phase                | Scope                                                                 | Status  |
| -------------------- | --------------------------------------------------------------------- | ------- |
| 1 — Foundation       | Auth context, data context, persistence, splash gate                  | ✅ Done |
| 2 — Core Camera Flow | Scan screen, AI processing, receipt detail                            | ✅ Done |
| 3 — Polish           | History filters, inline edit, delete, CSV export, empty states        | ✅ Done |
| 4 — Production       | Supabase auth, cloud image + data sync, offline queue, error boundary | ✅ Done |

**Production notes:**

- Auth is real Supabase email auth (`src/services/supabaseAuth.ts`); it falls back to local-only auth when Supabase credentials are not in `.env`
- OCR is real Gemini extraction (`src/services/gemini.ts`) — there is no mock data anywhere in the app; all stats are computed from the user's own receipts
- Receipts sync to Supabase (storage + `receipts` table) with an offline queue (`src/utils/offlineQueue.ts`) that replays upserts and delete tombstones on reconnect
- Currency preference is stored locally only (not synced to backend)
- Push notifications are not implemented (requires a server)
