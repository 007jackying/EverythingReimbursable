# EverythingReimbursable

A cross-platform receipt scanner and expense tracking app built with Expo React Native (iOS, Android, Web). Scan receipts, extract data with AI, and manage your reimbursable expenses — all in one place.

---

## Tech Stack

- **Framework:** Expo (React Native) with file-based routing via Expo Router
- **Platforms:** iOS, Android, Web
- **Language:** TypeScript
- **Styling:** Design tokens (see `CLAUDE.md`)
- **Fonts:** DM Sans + JetBrains Mono via `@expo-google-fonts`
- **Icons:** `phosphor-react-native`

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Android Emulator

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npx expo start
```

From the terminal output you can open the app in:

- **iOS Simulator** — press `i`
- **Android Emulator** — press `a`
- **Web** — press `w`
- **Expo Go** — scan the QR code with your phone

---

## Project Structure

```
EverythingReimbursable/
├── src/
│   └── app/
│       ├── (tabs)/         # Bottom tab screens (Home, History, Profile)
│       ├── +not-found.tsx  # 404 fallback screen
│       └── _layout.tsx     # Root layout
├── assets/
│   └── images/             # App icons, splash screen, background images
├── CLAUDE.md               # Design system & coding standards (source of truth)
├── app.json                # Expo configuration
└── package.json
```

---

## Design System

All UI decisions — colors, typography, spacing, components, animations — are defined in [`CLAUDE.md`](./CLAUDE.md). This is the single source of truth for the app's design language.

Key principles:

- Minimalist, fintech-grade aesthetic (Revolut / Linear / Notion inspired)
- Strict 3-role color system — no gradients, no extra colors
- 4px base spacing grid
- DM Sans for all text, JetBrains Mono for amounts and IDs only

---

## Scripts

| Command                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `npm start`             | Start Expo dev server                              |
| `npm run android`       | Open on Android emulator                           |
| `npm run ios`           | Open on iOS simulator                              |
| `npm run web`           | Open in browser                                    |
| `npm run lint`          | Run ESLint                                         |
| `npm run reset-project` | Reset to blank slate (moves starter to `example/`) |

---

## Linting & Formatting

```bash
# Lint
npx expo lint

# Format (Prettier)
npx prettier --write .
```

Pre-commit hooks via Husky enforce lint and format checks before every commit.

---

## License

Private. All rights reserved.
