# EverythingReimbursable — Development Progress Log

> Last updated: 2026-05-07
> Status: **Phase 3 complete with production AI integration. Phase 4 (real backend) pending.**

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

---

## What's Still Missing (Phase 4)

| Feature                    | Priority | Notes                                                    |
| -------------------------- | -------- | -------------------------------------------------------- |
| Real auth API backend      | High     | Supabase / Firebase / custom — swap `AuthContext` stubs  |
| Cloud storage optimization | Medium   | Compress images before upload, implement lazy loading    |
| Push notifications         | Low      | `expo-notifications` — token registration, server needed |
| Error boundaries           | Medium   | Network errors, large list performance                   |
| Onboarding "has seen" flag | Low      | Show splash only on first launch, skip on reinstall      |
| Offline mode               | Medium   | Queue receipts when offline, sync when online            |

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
