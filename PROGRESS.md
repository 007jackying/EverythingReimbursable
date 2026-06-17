# EverythingReimbursable — Development Progress Log

> Last updated: 2026-05-20
> Status: **Phase 4 in progress — Supabase cloud storage and auth integration complete.**

---

## What's Built

### App Overview

EverythingReimbursable is a cross-platform receipt scanner and expense tracker built with Expo React Native. The core flow is: **Scan → AI Extract → Review → Save → History**. Production-ready AI integration with Google Gemini 3 Pro Preview and Google Drive backup.

---

## Screen Inventory

| Screen              | Route             | Status  | Notes                                                                     |
| ------------------- | ----------------- | ------- | ------------------------------------------------------------------------- |
| Splash / Onboarding | `/(auth)/splash`  | ✅ Done | 3-slide carousel, gradient bg, pagination dots, AUTO-EXTRACT card preview |
| Login               | `/(auth)/login`   | ✅ Done | Email + password validation, KeyboardAvoidingView                         |
| Sign Up             | `/(auth)/signup`  | ✅ Done | Name + email + password validation, terms checkbox                        |
| Home / Dashboard    | `/(main)/home`    | ✅ Done | Summary card, quick actions, recent receipts, pull-to-refresh             |
| History             | `/(main)/history` | ✅ Done | Timeline, category grouping, filters, search, export                      |
| Scan Camera         | `/(main)/scan`    | ✅ Done | expo-camera, flash toggle, capture, gallery picker                        |
| AI Processing       | `/ai-processing`  | ✅ Done | Reanimated progress bar, scan beam, staggered dot bounce                  |
| Receipt Detail      | `/receipt-detail` | ✅ Done | View + inline edit, save/update/delete, re-scan                           |
| Profile             | `/(main)/profile` | ✅ Done | Edit name modal, currency picker, export data, logout                     |

---

## Component Inventory

| Component         | File                                 | Purpose                                                                    |
| ----------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `AppButton`       | `src/components/AppButton.tsx`       | All buttons — primary, ghost, quick-action-dark/light, disabled            |
| `AppInput`        | `src/components/AppInput.tsx`        | Labelled text input with error state                                       |
| `Chip`            | `src/components/Chip.tsx`            | Status/category badges — verified, ai-verified, category-large, bank-grade |
| `FilterTab`       | `src/components/FilterTab.tsx`       | Horizontal filter pill tabs                                                |
| `HistoryListItem` | `src/components/HistoryListItem.tsx` | Receipt row in history list with long-press delete                         |
| `ReceiptCard`     | `src/components/ReceiptCard.tsx`     | Home screen receipt card                                                   |
| `SearchBar`       | `src/components/SearchBar.tsx`       | Search input with icon                                                     |
| `SummaryCard`     | `src/components/SummaryCard.tsx`     | Dark hero card — total, monthly amount, receipt count                      |
| `TimelineHeader`  | `src/components/TimelineHeader.tsx`  | Month/category section divider                                             |

---

## Context / Data Layer

| Context             | File                              | Persistence         | Key             |
| ------------------- | --------------------------------- | ------------------- | --------------- |
| `AuthContext`       | `src/context/AuthContext.tsx`     | `expo-secure-store` | `auth_user`     |
| `ReceiptsContext`   | `src/context/ReceiptsContext.tsx` | `AsyncStorage`      | `receipts_v1`   |
| Currency preference | inline in `profile.tsx`           | `AsyncStorage`      | `pref_currency` |

### AuthContext API

```typescript
user: User | null
isAuthenticated: boolean
isLoading: boolean
login(email, password): Promise<void>       // stub — derives name from email
signUp(name, email, password): Promise<void> // stub
logout(): Promise<void>
updateName(name): Promise<void>              // persists to SecureStore
```

### ReceiptsContext API

```typescript
receipts: Receipt[]
isLoading: boolean
addReceipt(receipt): Promise<void>
updateReceipt(id, partial): Promise<void>
deleteReceipt(id): Promise<void>
getReceipt(id): Receipt | undefined
```

---

## Key Technical Decisions

| Decision                                                  | Why                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `expo-secure-store` for auth, `AsyncStorage` for receipts | Auth tokens are sensitive; receipt data is not. SecureStore is slower but encrypted.             |
| `react-native-reanimated` for all animations              | Runs on UI thread — no JS jank during scan beam, progress bar, dot bounce                        |
| `expo-file-system` v55 OOP API (`File`, `Paths`)          | v55 dropped the legacy functional API; `file.write()` is synchronous                             |
| `MaterialIcons` + `MaterialCommunityIcons`                | MaterialIcons lacks `home-outline`; use `MaterialCommunityIcons` for that icon only              |
| `StyleSheet.create()` only, no inline styles              | Enforced by CLAUDE.md; tokens from `src/constants/theme.ts`                                      |
| File-based routing via Expo Router                        | Cleaner navigation tree; auth guard is one `if (!isAuthenticated)` check in `(main)/_layout.tsx` |
| Google Gemini 3 Pro Preview for OCR                       | Production-ready model with fast response times (2-3s), better than mock implementation          |
| Base64 image encoding for Gemini API                      | Reliable transmission across platforms; avoids file URI issues                                   |
| Modular utility functions                                 | Separation of concerns: validators, formatters, file handlers, time utilities                    |

---

## Phase History

### Phase 1 — Foundation ✅

- `AuthContext` with SecureStore persistence + rehydration
- `ReceiptsContext` with AsyncStorage persistence + mock data seed
- Root layout waits for fonts + auth + receipts before hiding native splash

### Phase 2 — Core Camera Flow ✅

- `scan.tsx`: expo-camera, flash toggle, capture → navigate to `/ai-processing`
- `ai-processing.tsx`: mockExtract stub (3.5s delay), passes extracted JSON to `/receipt-detail`
- `receipt-detail.tsx`: handles both "new from AI" and "existing edit" modes

### Phase 3 — Polish & Completeness ✅

- History filters: All / This Month / By Category / Filters (status bottom sheet)
- Receipt inline editing: merchant name, amount, notes
- Delete receipt from detail screen (header trash icon) and history (long-press)
- CSV export via `expo-sharing` + `expo-file-system`
- Upload photo shortcut via `expo-image-picker`
- Empty states on all screens

### Bug Fixes / QoL (Session 5–6) ✅

- `expo-file-system` v55 migration — `File`/`Paths` OOP API
- `home-outline` icon — switched to `MaterialCommunityIcons`
- All TypeScript errors resolved (0 errors)
- `KeyboardAvoidingView` on login + signup so keyboard doesn't cover inputs
- `ReceiptCard` and `HistoryListItem` replaced `onTouchEnd` with `Pressable`
- Quick action buttons equal-width with `flex: 1` wrapper

### Session 6 — Loop x3 ✅

- **ai-processing.tsx**: Reanimated `useSharedValue` + `withTiming` progress bar (removed `setInterval`); dot bounce properly staggered with `withDelay(200/400)`
- **Splash screen**: Rebuilt with `expo-linear-gradient`, 3-slide onboarding, pagination dots, richer card preview with AUTO-EXTRACT pill
- **index.tsx**: Auth-aware redirect — authenticated users skip splash → home directly
- **home.tsx**: Pull-to-refresh (`RefreshControl`), monthly spending computed from current month, receipts limit 3→5 with overflow hint
- **SummaryCard**: `monthlyAmount` + `monthlyCount` props (replaces hardcoded `+12%`)
- **profile.tsx**: Edit name modal (tap name → slide-up TextInput), currency preference bottom sheet (USD/MYR/EUR/GBP/SGD stored to AsyncStorage)
- **AuthContext**: Added `updateName()` function

### Session 7 — Production AI Integration ✅

- **Gemini AI Integration**: Upgraded from mock to Google Gemini 3 Pro Preview for real receipt OCR
- **gemini.ts**: Production-ready extraction with robust error handling, base64 image encoding, confidence scoring
- **googleDrive.ts**: Complete Google Drive backup implementation with folder creation, file upload, and sync status
- **Utility modules**: Created validators.ts, formatters.ts, fileHandler.ts, time.ts for better code organization
- **Custom hooks**: useAuthForm.ts for reusable auth logic, useReceiptFilter.ts for receipt filtering
- **Removed mockReceipts.ts**: App now works with real AI-extracted data
- **Error handling**: Comprehensive try-catch blocks, fallback values, and user-friendly error messages
- **Type safety**: All new utilities fully typed with TypeScript

### Session 8 — Supabase Cloud Storage & Auth Integration ✅

- **Supabase Integration**: Installed `@supabase/supabase-js` and configured client with AsyncStorage persistence
- **Cloud Storage Service**: Created `cloudStorage.ts` for receipt image upload/delete/download operations
- **Image Compression**: Added `expo-image-manipulator` for optimizing images before upload (1920px max, 80% quality)
- **Receipt Sync**: Updated `ReceiptsContext` to automatically sync receipt images to cloud on save
- **Offline Queue**: Implemented `offlineQueue.ts` with `@react-native-community/netinfo` for network detection
- **Lazy Loading**: Created `useLazyImage.ts` hook for efficient image loading in history list
- **Supabase Auth**: Created `supabaseAuth.ts` service with email sign-up, sign-in, password reset
- **AuthContext Update**: Replaced stub auth with real Supabase authentication (falls back to local if not configured)
- **Receipt Type**: Added `cloudPath` and `syncedAt` fields to track cloud sync status
- **Setup Guide**: Created `docs/SUPABASE_SETUP.md` with step-by-step instructions for bucket creation and policies

### Session 9 — Production Hardening: Cloud DB Sync, Offline Worker, Error Boundary ✅

- **Build fixes**: Upgraded `@supabase/supabase-js` to 2.108.1 (2.106 broke Hermes builds with a raw dynamic `import()`); downgraded Jest to 29 for `jest-expo` compatibility; consolidated three broken Jest configs into one `jest-expo`-based `jest.config.js` — 94/94 tests pass
- **Fixed image upload corruption**: `cloudStorage.ts` read binary JPEGs with `file.text()` (UTF-8) — now uses `file.bytes()`; uploads use `upsert: true` so offline retries don't conflict
- **cloudReceipts.ts**: New service syncing receipt rows to the Supabase `receipts` table (upsert/delete/fetch, snake_case mapping, graceful no-op when unconfigured)
- **Offline sync worker**: Wired the previously-orphaned `offlineQueue.ts` into `ReceiptsContext` — failed/offline syncs queue, queue flushes on login and on network reconnect (NetInfo listener)
- **Cloud pull on login**: receipts missing locally are fetched from the cloud and merged
- **ErrorBoundary**: Root-level error boundary with design-system fallback UI and retry
- **Receipt IDs**: now `crypto.randomUUID()` (collision-safe) with timestamp fallback
- **SUPABASE_SETUP.md**: receipts table schema corrected (TEXT primary key for client IDs, added `cloud_path`/`synced_at`, user index)

### Session 10 — List Virtualization, Onboarding Flag, Model Constant ✅

- **History screen virtualized**: replaced the `ScrollView` + `.map()` render (all receipts mounted at once) with a `SectionList` — header/filters/empty-state/export card moved to `ListHeaderComponent`/`ListEmptyComponent`/`ListFooterComponent`, month groups become sections
- **Onboarding "has seen" flag**: `has_onboarded_v1` in AsyncStorage — splash/onboarding shows only on first launch; returning (logged-out) users land on Login directly
- **Gemini model constant**: `GEMINI_MODEL` in `constants/app.ts` was stale (`gemini-2.0-flash`) while `gemini.ts` hardcoded its own — `gemini.ts` now uses the constant, updated to `gemini-3-pro-preview`

### Session 11 — Offline Delete Tombstones ✅

- **offlineQueue.ts**: queue items now carry a `type` (`upsert` | `delete`); a delete supersedes any pending upsert for the same receipt; legacy persisted items default to `upsert`
- **ReceiptsContext.deleteReceipt**: cloud cleanup (image + row) is attempted online; on failure or offline a delete tombstone is queued
- **flushOfflineQueue**: replays both upserts and deletes on reconnect/login; queue items are only removed after the operation succeeds
- **Login sync ordering fixed**: queue flush now runs _before_ the cloud pull, and the pull skips IDs with pending delete tombstones — offline-deleted receipts can no longer resurrect
- **Tests**: new `offlineQueue.test.ts` (7 cases) — 101/101 passing

---

### Session 12 — Final Production Sweep ✅

- Re-reviewed the full uncommitted diff (sync layer, onboarding, virtualization) — no further defects found
- Verified **Android** production bundle exports (iOS verified each session)
- `.gitignore`: excluded local tooling artifacts (`data/`, `.understand-anything/`)
- Final state: 101/101 tests, TypeScript clean, ESLint clean, iOS + Android Hermes bundles build

### Session 13 — Fake Data Removal & Docs Refresh ✅

- **Scanned the whole app for fake/mock data** — everything a user sees is now computed from their own receipts:
  - Home summary card: hardcoded `aiAccuracy="99.2%"` → real average extraction confidence (hidden when no receipts)
  - Profile: fake `+12%` growth stat → real "N this month" count; confidence shows `—` instead of `0.0%` when empty; removed the fake "PREMIUM MEMBER" badge (no membership system exists)
  - AI processing screen: hardcoded `98.4%` confidence → `—` during analysis, real confidence once extraction completes; "OCR_v4" label → "Gemini"
  - Splash: removed the unverifiable "99.2% accuracy" marketing claim (the static receipt-card illustration on the onboarding slide remains — it is decorative, per the design mockup)
  - Removed the now-unused `AI_CONFIDENCE_DISPLAY` constant
- **Docs refreshed**: README.md (features, structure, cloud sync section, 101-test status), CLAUDE.md §16 (Phase 4 done, new key-files table), docs/ONBOARDING.md and test/README.md brought in line with the current codebase

### Session 14 — Currency Wiring & Insights Link ✅

- **CurrencyContext**: new provider persisting the preferred display currency (`pref_currency`); Profile's currency picker now writes through it
- **Per-receipt currency**: list rows (home, history), receipt detail (grand total symbol + tax), and the AI-processing detected amount now format with the receipt's own extracted currency instead of a hardcoded `$`
- **Aggregate amounts** (summary card total + monthly) format with the user's preferred currency (no FX conversion — sums are nominal)
- **"View Insights →"** on the summary card is now a real button (accessible, pressed state) navigating to History — previously dead text

### Session 15 — Password Recovery, Auth Listener, Sync Conflicts, Polish ✅

- **Forgot-password flow**: "Forgot?" on Login opens an email modal → `resetPasswordForEmail` with `redirectTo: everythingreimbursable://reset-password`; new `/reset-password` screen parses the recovery deep link, establishes the session (`setSessionFromTokens`), and lets the user set a new password (`updatePassword`); login errors now alert instead of crashing
- **Auth state listener**: `onAuthStateChange` in supabaseAuth + AuthContext subscription — token refresh, revocation, and recovery sessions now propagate to app state (INITIAL_SESSION ignored; startup restore unchanged)
- **Sync conflict handling**: receipts carry `updatedAt` (stamped on add/update, synced to a new `updated_at` column — schema doc updated); login merge is now last-write-wins by timestamp, and receipts with queued local edits are never overwritten by cloud copies
- **Polish**: native splash background fixed `#208AEF` → `#FAF9F7` (design background); summary card totals display in the receipts' own currency when uniform, and show an "INCLUDES MIXED CURRENCIES" note when sums span currencies

## What's Still Missing (Phase 4 - Remaining)

| Feature            | Priority | Notes                                                    |
| ------------------ | -------- | -------------------------------------------------------- |
| Push notifications | Low      | `expo-notifications` — token registration, server needed |

---

## Running the App

```bash
npm install
npx expo start
# iOS:     press i
# Android: press a
# Web:     press w
```

**TypeScript check:**

```bash
npx tsc --noEmit
```

**Lint:**

```bash
npx expo lint
```
