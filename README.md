# EverythingReimbursable

A cross-platform receipt scanner and expense tracker built with Expo React Native.
Scan a receipt → AI extracts the data → review and save → browse your history.

> **Dev progress log:** see [`PROGRESS.md`](./PROGRESS.md)
> **Design system:** see [`CLAUDE.md`](./CLAUDE.md)

---

## Tech Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Framework   | Expo ~55 / React Native 0.83.4                                |
| Language    | TypeScript (strict)                                           |
| Navigation  | Expo Router (file-based)                                      |
| State       | React Context — `AuthContext`, `ReceiptsContext`              |
| Persistence | `expo-secure-store` (auth) + `AsyncStorage` (receipts, prefs) |
| Camera      | `expo-camera` + `expo-image-picker`                           |
| Animations  | `react-native-reanimated` 4                                   |
| Fonts       | Plus Jakarta Sans + Space Grotesk (`@expo-google-fonts`)      |
| Icons       | `@expo/vector-icons` — MaterialIcons + MaterialCommunityIcons |
| Export      | `expo-file-system` v55 + `expo-sharing`                       |

---

## Getting Started

### Prerequisites

- Node.js 18+
- iOS: Xcode + iOS Simulator, or physical device with Expo Go
- Android: Android Studio + Android Emulator, or physical device with Expo Go

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
│   ├── _layout.tsx              # Root layout — font load, auth/receipts rehydration
│   ├── index.tsx                # Auth-aware redirect → home or splash
│   ├── ai-processing.tsx        # AI extraction progress screen (modal)
│   ├── receipt-detail.tsx       # Receipt review/edit screen (modal)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── splash.tsx           # 3-slide onboarding with gradient bg
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (main)/
│       ├── _layout.tsx          # Tab navigator + auth guard + Scan FAB
│       ├── home.tsx             # Dashboard — summary card, quick actions, recent receipts
│       ├── history.tsx          # Full receipt list — filters, search, timeline, export
│       ├── scan.tsx             # Camera screen
│       └── profile.tsx          # User profile — edit name, currency, export, logout
├── components/
│   ├── AppButton.tsx            # primary / ghost / quick-action-dark / quick-action-light / disabled
│   ├── AppInput.tsx             # Labelled input with error state
│   ├── Chip.tsx                 # Status + category badges
│   ├── FilterTab.tsx            # Horizontal filter pill
│   ├── HistoryListItem.tsx      # Receipt row in history
│   ├── ReceiptCard.tsx          # Receipt card on home
│   ├── SearchBar.tsx
│   ├── SummaryCard.tsx          # Dark hero card with monthly stats
│   └── TimelineHeader.tsx       # Month/category section label
├── constants/
│   └── theme.ts                 # All color tokens, spacing, radius, shadows, font families
├── context/
│   ├── AuthContext.tsx          # login / signUp / logout / updateName
│   └── ReceiptsContext.tsx      # CRUD: add / update / delete / get
├── data/
│   └── mockReceipts.ts          # 8 seed receipts + format helpers
├── types/
│   └── receipt.ts               # Receipt interface, ReceiptCategory, ReceiptStatus
└── utils/
    ├── categories.ts            # Category → icon name map
    └── exportCsv.ts             # CSV generation + share sheet (expo-file-system v55 OOP API)
```

---

## Navigation Flow

```
index.tsx (auth-aware redirect)
├── /(auth)/splash    ← first launch / logged out
├── /(auth)/login
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

1. **Splash** → tap "Get Started" → **Login / Sign Up**
2. **Home** → tap Scan FAB or "Scan Receipt" quick action
3. **Camera** → capture photo → navigate to **AI Processing** with `imageUri`
4. **AI Processing** → `mockExtract` runs (3.5s) → animated progress bar → navigate to **Receipt Detail** with extracted JSON
5. **Receipt Detail** → review, optionally edit fields → "Save Receipt" → back to **Home**
6. **History** → filter / search / group by category → long-press to delete
7. **Profile** → edit display name, select currency, export CSV, logout

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
| `npx expo lint`            | ESLint                      |

---

## Status

See [`PROGRESS.md`](./PROGRESS.md) for the full phase-by-phase development log, all technical decisions, and the Phase 4 backlog.

**Current:** Phases 1–3 complete. All screens built, local persistence wired, animations polished.
**Next:** Real auth API, real OCR/AI API, cloud image storage.

---

## License

Private. All rights reserved.
