# EverythingReimbursable

A cross-platform receipt scanner and expense tracker built with Expo React Native.

**Scan a receipt → AI extracts the data → review and save → browse your history.**

Production-ready: real AI extraction (Google Gemini), Supabase auth + cloud sync with an
offline-first queue, and Google Drive backup. The app starts empty — all receipts come from
the user's own scans. When Supabase is not configured it gracefully runs local-only.

> **Dev progress log:** see [`PROGRESS.md`](./PROGRESS.md)  
> **Design system:** see [`CLAUDE.md`](./CLAUDE.md)  
> **Supabase setup:** see [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md)  
> **Team onboarding:** see [`docs/ONBOARDING.md`](./docs/ONBOARDING.md)

---

## Tech Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Framework   | Expo ~55 / React Native 0.83.4                                |
| Language    | TypeScript (strict)                                           |
| Navigation  | Expo Router (file-based)                                      |
| State       | React Context — `AuthContext`, `ReceiptsContext`              |
| Persistence | `expo-secure-store` (auth) + `AsyncStorage` (receipts, prefs) |
| Backend     | Supabase (auth + storage + receipts table), offline queue     |
| Camera      | `expo-camera` + `expo-image-picker`                           |
| Animations  | `react-native-reanimated` 4                                   |
| AI/OCR      | Google Gemini 3 Pro Preview (`@google/generative-ai`)         |
| Fonts       | Plus Jakarta Sans + Space Grotesk (`@expo-google-fonts`)      |
| Icons       | `@expo/vector-icons` — MaterialIcons + MaterialCommunityIcons |
| Export      | `expo-file-system` v55 + `expo-sharing`                       |
| Testing     | Jest 29 + jest-expo + React Native Testing Library            |
| Linting     | ESLint + Prettier + Husky                                     |

---

## Getting Started

### Prerequisites

- Node.js 18+
- iOS: Xcode + iOS Simulator, or physical device with Expo Go
- Android: Android Studio + Android Emulator, or physical device with Expo Go
- Google Gemini API key (for AI receipt extraction)
- Optional: a Supabase project (for cloud auth + sync) — see [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md)

### Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

3. Fill in `.env`:

   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   # Optional — without these the app runs local-only:
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Install

```bash
npm install
```

### Run

```bash
npx expo start
# iOS Simulator:     press i
# Android Emulator:  press a
# Web browser:       press w
# Physical device:   scan QR with Expo Go
```

---

## Project Structure

```
src/
├── app/
│   ├── _layout.tsx              # Root layout — error boundary, fonts, auth/receipts rehydration
│   ├── index.tsx                # Redirect → home, login, or splash (first launch only)
│   ├── ai-processing.tsx        # AI extraction progress screen (modal)
│   ├── receipt-detail.tsx       # Receipt review/edit screen (modal)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── splash.tsx           # 3-slide onboarding (first launch only)
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (main)/
│       ├── _layout.tsx          # Tab navigator + auth guard + Scan FAB
│       ├── home.tsx             # Dashboard — summary card, quick actions, recent receipts
│       ├── history.tsx          # Virtualized receipt list — filters, search, timeline, export
│       ├── scan.tsx             # Camera screen
│       └── profile.tsx          # User profile — edit name, currency, export, logout
├── components/
│   ├── AppButton.tsx            # primary / ghost / quick-action variants
│   ├── AppInput.tsx             # Labelled input with error state
│   ├── Chip.tsx                 # Status + category badges
│   ├── ErrorBoundary.tsx        # Root error boundary with retry
│   ├── FilterSheet.tsx          # Status filter bottom sheet
│   ├── FilterTab.tsx            # Horizontal filter pill
│   ├── HistoryListItem.tsx      # Receipt row in history
│   ├── ReceiptCard.tsx          # Receipt card on home
│   ├── ScreenHeader.tsx         # Shared sticky header
│   ├── SearchBar.tsx
│   ├── SummaryCard.tsx          # Dark hero card with monthly stats
│   └── TimelineHeader.tsx       # Month/category section label
├── config/
│   └── supabase.ts              # Supabase client (null when unconfigured)
├── constants/
│   ├── app.ts                   # App-wide constants, storage keys, Gemini model
│   └── theme.ts                 # All color tokens, spacing, radius, shadows, fonts
├── context/
│   ├── AuthContext.tsx          # Supabase email auth with local fallback
│   ├── GoogleContext.tsx        # Google OAuth for Drive backup
│   └── ReceiptsContext.tsx      # CRUD + cloud sync + offline queue worker
├── hooks/
│   └── useReceiptFilter.ts      # Receipt filtering and search logic
├── services/
│   ├── cloudReceipts.ts         # Supabase receipts table upsert/delete/fetch
│   ├── cloudStorage.ts          # Receipt image upload/delete (Supabase Storage)
│   ├── gemini.ts                # Google Gemini AI client for receipt OCR
│   ├── googleDrive.ts           # Google Drive API for receipt backup
│   └── supabaseAuth.ts          # Email sign-up/sign-in/reset via Supabase
├── types/
│   └── receipt.ts               # Receipt interface, ReceiptCategory, ReceiptStatus
└── utils/
    ├── categories.ts            # Category → icon name map
    ├── exportCsv.ts             # CSV generation + share sheet
    ├── fileHandler.ts           # File encoding and processing utilities
    ├── formatters.ts            # Data formatting helpers
    ├── imageCompression.ts      # Resize/compress images before upload
    ├── offlineQueue.ts          # Typed upsert/delete sync queue + NetInfo helpers
    ├── secureStorage.ts         # Platform-compatible secure storage (web + native)
    ├── time.ts                  # Date/time formatting utilities
    └── validators.ts            # Form validation utilities
```

---

## Navigation Flow

```
index.tsx (redirect)
├── /(auth)/splash    ← first launch only (has_onboarded flag)
├── /(auth)/login     ← logged out, already onboarded
├── /(auth)/signup
└── /(main)/          ← auth-gated tab navigator
    ├── home
    ├── history
    ├── scan          ← opens camera as tab; hides tab bar
    └── profile

Modal stack (over tabs):
├── /ai-processing    ← receives imageUri param
└── /receipt-detail   ← receives id or extracted JSON param
```

---

## Core User Flow

1. **Splash** (first launch) → "Get Started" → **Login / Sign Up**
2. **Home** → tap Scan FAB or "Scan Receipt" quick action
3. **Camera** → capture photo → navigate to **AI Processing** with `imageUri`
4. **AI Processing** → Gemini extracts receipt data → animated progress → **Receipt Detail** with extracted JSON
5. **Receipt Detail** → review, optionally edit fields → "Save Receipt" → syncs to cloud (or queues offline) → back to **Home**
6. **History** → filter / search / group by category → long-press to delete
7. **Profile** → edit display name, select currency, export CSV, logout

All dashboard/profile stats (totals, monthly counts, AI confidence) are computed from the
user's own receipts — the app ships with no seed or demo data.

---

## Cloud Sync & Offline Behavior

- On save, receipt images upload to Supabase Storage (compressed) and receipt data upserts
  to the `receipts` table.
- When offline (or if a sync fails), operations are queued locally and replayed automatically
  on reconnect or next login. Deletes are queued as tombstones so they replay too.
- On login, receipts that exist in the cloud but not on the device are pulled and merged.
- Without Supabase credentials everything works local-only (AsyncStorage).

---

## Design System

All UI decisions are defined in [`CLAUDE.md`](./CLAUDE.md):

- Material Design 3–derived color token system (never hardcode hex)
- Plus Jakarta Sans (headings/body) + Space Grotesk (labels/amounts/mono)
- 4px base spacing grid (`theme.spacing[N]`)
- `StyleSheet.create()` only — no inline styles

---

## Scripts

| Command                    | Description                 |
| -------------------------- | --------------------------- |
| `npx expo start`           | Start dev server            |
| `npx expo start --ios`     | iOS simulator directly      |
| `npx expo start --android` | Android emulator directly   |
| `npx tsc --noEmit`         | TypeScript check (0 errors) |
| `npm run lint`             | ESLint                      |
| `npm run lint:fix`         | Auto-fix ESLint errors      |
| `npm run format`           | Format code with Prettier   |
| `npm test`                 | Run tests                   |
| `npm run test:watch`       | Run tests in watch mode     |
| `npm run test:coverage`    | Generate coverage report    |

---

## Status

**Current:** Phases 1–4 complete. Production AI, cloud sync, and offline-first persistence.

### ✅ Completed Features

**Core App:**

- ✅ Full auth flow (splash, login, signup) with Supabase email auth + SecureStore persistence
- ✅ First-launch-only onboarding (`has_onboarded` flag)
- ✅ Home dashboard with summary card, quick actions, recent receipts
- ✅ Camera scan → AI processing → receipt detail flow
- ✅ Virtualized history with filters, search, timeline grouping, CSV export
- ✅ Profile with edit name, currency preference, logout
- ✅ Root error boundary with design-system fallback UI
- ✅ All stats computed from real user data — no mock/demo data anywhere

**AI Integration:**

- ✅ Google Gemini 3 Pro Preview integration for production OCR
- ✅ Receipt data extraction with real confidence scoring (shown in-app)
- ✅ Automatic category inference from merchant names
- ✅ Retry with exponential backoff on API overload

**Cloud & Sync:**

- ✅ Supabase email auth (sign-up, sign-in, password reset) with local fallback
- ✅ Receipt images uploaded to Supabase Storage (compressed via expo-image-manipulator)
- ✅ Receipt data synced to Supabase `receipts` table (RLS-protected)
- ✅ Offline-first queue: upserts and delete tombstones replay on reconnect/login
- ✅ Cloud pull + merge on login
- ✅ Google OAuth + Google Drive backup for receipt images

**Code Quality:**

- ✅ ESLint + Prettier + Husky pre-commit hooks
- ✅ TypeScript strict mode (0 errors)
- ✅ Jest test suite — 101 tests across 10 suites
- ✅ iOS + Android Hermes production bundles verified

**Remaining (needs external infrastructure):**

- Push notifications (`expo-notifications` — requires a server)
- Currency preference is local-only (not synced)

See [`PROGRESS.md`](./PROGRESS.md) for the full phase-by-phase development log.

---

## Testing

### Test Suite

Jest 29 with the `jest-expo` preset and React Native Testing Library — a single config
(`jest.config.js`) runs everything.

**Test Coverage:**

- 101 tests across 10 suites
- Utilities (categories, CSV export, secure storage, offline queue)
- Services (Gemini extraction)
- Components (AppButton, AppInput, Chip)

**Running Tests:**

```bash
npm test                              # all tests
npm run test:watch                    # watch mode
npm run test:coverage                 # coverage report
npm test test/utils/categories.test.ts  # single file
```

**Test Structure:**

```
test/
├── setup.ts                    # Global mocks (Reanimated, worklets, localStorage)
├── test-utils.tsx              # Custom render + factories
├── utils/                      # categories, exportCsv, secureStorage, offlineQueue
├── services/                   # gemini
└── components/                 # AppButton, AppInput, Chip
```

See [`test/README.md`](./test/README.md) for detailed testing documentation.

---

## Code Quality

### Pre-commit Hooks

The project uses Husky + lint-staged to enforce code quality:

- **ESLint**: Lints TypeScript/JavaScript files
- **Prettier**: Formats code consistently
- **Pre-commit**: Runs automatically on every commit

**Manual Commands:**

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all files
npm run format:check  # Check formatting
```

See [`docs/LINTING_SETUP.md`](./docs/LINTING_SETUP.md) for configuration details.

---

## License

Private. All rights reserved.
