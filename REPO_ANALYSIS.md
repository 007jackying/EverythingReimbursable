# Claimable (EverythingReimbursable) — Repository Analysis

> Cross-platform receipt scanner & expense tracking app built with Expo React Native (iOS, Android, Web)

---

## 1. Project Structure

```
Claimable/
├── CLAUDE.md                              # Design system & coding standards (595 lines)
├── README.md                              # Project documentation
├── app.json                               # Expo configuration
├── package.json                           # Dependencies & scripts
├── tsconfig.json                          # TypeScript config (@/ path alias)
├── .eslintrc.js                           # ESLint (Airbnb + TS + Prettier)
├── .prettierrc                            # No semi, single quotes, 100 char
├── .husky/pre-commit                      # Runs lint-staged
├── assets/
│   ├── expo.icon/                         # iOS adaptive icon (SVG + grid)
│   └── images/                            # App images (many Expo template leftovers)
│       ├── icon.png, splash-icon.png      # Active app icons
│       ├── adaptive-icon.png              # Android adaptive icon
│       ├── tabIcons/                      # home/explore @1x/2x/3x (template)
│       └── emoji1-6.png, react-logo.png   # Template leftovers
├── designMockups/                         # 11 screen mockups (PNG + HTML)
│   ├── splash_onboarding/
│   ├── login/
│   ├── sign_up/
│   ├── home_dashboard_1/ & home_dashboard_2/
│   ├── scan_receipt_camera/
│   ├── ai_extraction_progress/
│   ├── receipt_detail_review/
│   ├── history_all_receipts_1/ & history_all_receipts_2/
│   ├── profile/
│   └── lens_minimal/                      # Design philosophy doc only
└── src/
    ├── app/                               # Expo Router file-based routes
    │   ├── _layout.tsx                    # Root Stack navigator
    │   ├── +not-found.tsx                 # 404 fallback
    │   └── (tabs)/
    │       ├── _layout.tsx                # Tab bar (Home, About, Camera)
    │       ├── index.tsx                  # Home screen
    │       ├── about.tsx                  # About screen (placeholder)
    │       └── camera.tsx                 # Camera screen (basic view)
    └── components/                        # Reusable components
        ├── Button.tsx                     # Primary/default variants
        ├── CircleButton.tsx               # Circular "+" button
        ├── IconButton.tsx                 # Icon + label button
        └── ImageViewer.tsx                # Image display
```

**Total source files:** 10 TypeScript/TSX files (7 screens/layouts + 4 components)

---

## 2. Tech Stack

### Core Framework

| Technology   | Version  | Purpose                           |
| ------------ | -------- | --------------------------------- |
| Expo SDK     | ~55.0.15 | Cross-platform framework          |
| React        | 19.2.0   | UI library                        |
| React Native | 0.83.4   | Native rendering                  |
| TypeScript   | ~5.9.2   | Type safety                       |
| Expo Router  | ~55.0.12 | File-based routing (Stack + Tabs) |

### Key Dependencies

| Package                          | Version  | Purpose                        |
| -------------------------------- | -------- | ------------------------------ |
| `@react-navigation/bottom-tabs`  | ^7.15.5  | Bottom tab navigation          |
| `@react-navigation/native`       | ^7.1.33  | Navigation core                |
| `expo-camera`                    | ~55.0.15 | Camera access for receipt scan |
| `expo-image`                     | ~55.0.8  | Optimized image rendering      |
| `expo-image-picker`              | ~55.0.18 | Photo gallery selection        |
| `expo-font`                      | ~55.0.6  | Custom font loading            |
| `expo-glass-effect`              | ~55.0.10 | Glassmorphism/blur effects     |
| `react-native-reanimated`        | 4.2.1    | Animations                     |
| `react-native-gesture-handler`   | ~2.30.0  | Gesture handling               |
| `react-native-safe-area-context` | ~5.6.2   | Safe area insets               |
| `react-native-screens`           | ~4.23.0  | Native screen optimization     |
| `react-native-web`               | ~0.21.0  | Web platform support           |

### Dev Tooling

| Tool        | Version | Purpose                                 |
| ----------- | ------- | --------------------------------------- |
| ESLint      | ^8.57.1 | Linting (Airbnb + TS + Prettier config) |
| Prettier    | ^3.8.3  | Code formatting                         |
| Husky       | ^9.1.7  | Git hooks                               |
| lint-staged | ^16.4.0 | Pre-commit linting of staged files      |

### NOT Installed (but required by design system)

- `@expo-google-fonts/plus-jakarta-sans` — Required headline/body font
- `@expo-google-fonts/space-grotesk` — Required label/mono font
- No state management library (Zustand, Redux, etc.)
- No API client (axios, etc.)
- No testing framework (Jest, React Native Testing Library)

---

## 3. Architecture

### Routing (Expo Router — File-Based)

**Current routes:**

| Route     | File                | Description                |
| --------- | ------------------- | -------------------------- |
| `/`       | `(tabs)/index.tsx`  | Home screen (placeholder)  |
| `/about`  | `(tabs)/about.tsx`  | About screen (placeholder) |
| `/camera` | `(tabs)/camera.tsx` | Camera screen (basic)      |
| `/*`      | `+not-found.tsx`    | 404 fallback               |

**Target routes (per CLAUDE.md Section 11):**

```
Stack Navigator (Root)
├── AuthStack (unauthenticated)
│   ├── SplashScreen
│   ├── LoginScreen
│   └── SignUpScreen
└── MainTabs (authenticated)
    ├── HomeScreen
    ├── HistoryScreen
    ├── ScanTab (FAB → modal)
    └── ProfileScreen

Modal Stack (over MainTabs)
├── ScanCameraScreen
├── AIProcessingScreen
└── ReceiptDetailScreen
```

### State Management

**No state management is implemented.** The Home screen uses local `useState` only. No global state, no Context API, no external library, no data persistence.

### Data Flow

**No data flow exists.** No API calls, no local storage, no database, no mock data service. The app is entirely UI-only at this point.

---

## 4. Screens — Implementation Status

| Screen                  | Target (CLAUDE.md)                                  | Current State                    | Completion |
| ----------------------- | --------------------------------------------------- | -------------------------------- | ---------- |
| Splash / Onboarding     | Branded intro, "Get Started" CTA                    | Not implemented                  | 0%         |
| Login                   | Email/password + social auth                        | Not implemented                  | 0%         |
| Sign Up                 | Registration form, terms checkbox                   | Not implemented                  | 0%         |
| Home Dashboard          | Greeting, summary card, quick actions, receipt list | Basic image picker from template | ~5%        |
| History                 | Search, filters, timeline list, export              | Not implemented                  | 0%         |
| Profile                 | Avatar, stats, settings, logout                     | Not implemented                  | 0%         |
| Scan / Camera           | Full receipt scanner with overlays                  | Basic camera flip only           | ~10%       |
| AI Extraction Progress  | Scanning animation, progress, confidence            | Not implemented                  | 0%         |
| Receipt Detail / Review | Full data display, edit/save                        | Not implemented                  | 0%         |
| Navigation              | 4 tabs + Scan FAB + modal stack                     | 3 tabs, no FAB, no modals        | ~15%       |

---

## 5. Components

### Existing Components

| Component      | Purpose                                  | Design System Alignment     |
| -------------- | ---------------------------------------- | --------------------------- |
| `Button`       | Primary/default button, FontAwesome icon | None — uses template colors |
| `CircleButton` | 84px circular "+" button                 | None — not in design system |
| `IconButton`   | Icon + label, MaterialIcons              | Minimal — wrong styling     |
| `ImageViewer`  | Image display via expo-image             | None — not in design system |

All existing components use **hardcoded hex values** (`#25292e`, `#ffd33d`) from the Expo template — not the design system tokens.

### Components Required by Design System (NOT Implemented)

- Summary Card (decorative blur circles, AI accuracy row)
- Receipt Cards (merchant avatar, amount, verified/pending status)
- History List Items (icon container, timeline headers)
- Category/Status Chips (verified badge, category chip variants)
- Bottom Tab Bar (custom with Scan FAB center, active pill badges)
- Quick Action Buttons (dark/light, 2-column grid)
- Input Fields (Space Grotesk labels, focus ring, password toggle)
- Bottom Sheets / Modals
- AI Processing components (scanning beam, confidence ring, progress bar)
- Receipt Detail components (metadata grid, e-invoice block, image preview)

---

## 6. Theme / Design System

### Current Implementation: **NONE**

No theme file, no design token constants, no shared styling system. The scaffold commit deleted `src/constants/theme.ts`. All components use hardcoded hex values.

### Target Design System (Defined in CLAUDE.md)

**Color Tokens (35+):** Material Design 3–derived palette

| Token                 | Hex       | Usage                             |
| --------------------- | --------- | --------------------------------- |
| `primary`             | `#070235` | Deep Indigo — headings, key text  |
| `primary-container`   | `#1E1B4B` | Dark Indigo — summary card bg     |
| `secondary`           | `#006C49` | Soft Emerald — verified, scan FAB |
| `secondary-container` | `#6CF8BB` | Mint — chip backgrounds           |
| `background`          | `#FAF9F7` | Warm Off-White — app background   |
| `error`               | `#BA1A1A` | Error states                      |

**Typography:**

| Token          | Font              | Size | Weight | Usage                     |
| -------------- | ----------------- | ---- | ------ | ------------------------- |
| `text.display` | Plus Jakarta Sans | 36px | 800    | Hero total                |
| `text.h1`      | Plus Jakarta Sans | 30px | 700    | Screen page titles        |
| `text.h2`      | Plus Jakarta Sans | 24px | 700    | Section headers           |
| `text.body`    | Plus Jakarta Sans | 15px | 400    | Body copy                 |
| `text.label`   | Space Grotesk     | 10px | 700    | Uppercase tracking labels |
| `text.mono`    | Space Grotesk     | 15px | 700    | Amounts in list items     |
| `text.mono.xl` | Space Grotesk     | 36px | 800    | Summary card total        |

**Spacing:** 4px base grid — tokens from `space.1` (4px) to `space.16` (64px)
**Border Radius:** 7 tokens from `radius.sm` (8px) to `radius.full` (9999px)
**Shadows:** 5 elevation levels from `shadow.none` to `shadow.hero`

**Neither design font is installed** — packages not in `package.json`.

---

## 7. API / Backend Integration

**Zero backend integration.** No API client, no service files, no environment variables, no authentication flow, no data fetching hooks, no mock API, no network requests.

---

## 8. Data Model

The `Receipt` interface is defined in CLAUDE.md Section 12 but not implemented in code:

```typescript
interface Receipt {
  id: string
  eInvoiceId: string | null
  companyName: string
  address: string | null
  date: string
  totalAmount: number
  taxAmount: number | null
  currency: string
  paymentMethod: string | null
  paymentLast4: string | null
  category: ReceiptCategory
  imageUri: string
  confidence: number
  status: 'verified' | 'pending' | 'failed'
  createdAt: string
  notes: string | null
}

type ReceiptCategory =
  | 'dining'
  | 'grocery'
  | 'electronics'
  | 'travel'
  | 'transport'
  | 'healthcare'
  | 'utilities'
  | 'other'
```

---

## 9. Key Disconnects (Current vs. Target)

| Area                 | Current                                                     | Target (CLAUDE.md)                                   |
| -------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| **Background color** | `#25292e` (dark charcoal)                                   | `#FAF9F7` (warm off-white)                           |
| **Accent color**     | `#ffd33d` (gold)                                            | `#070235` (indigo) + `#006C49` (emerald)             |
| **Fonts**            | System defaults                                             | Plus Jakarta Sans + Space Grotesk                    |
| **Icons**            | Ionicons + FontAwesome                                      | Material Icons only                                  |
| **Tab structure**    | Home / About / Camera                                       | Home / History / Scan(FAB) / Profile                 |
| **Components**       | 4 template components                                       | 12+ spec'd components                                |
| **State management** | None                                                        | Receipt data, auth state, UI state                   |
| **README**           | Says "DM Sans + JetBrains Mono" and "phosphor-react-native" | Plus Jakarta Sans + Space Grotesk and Material Icons |

---

## 10. Testing

**Zero tests.** No test files, no test directories, no testing dependencies, no test configuration, no coverage reports.

---

## 11. Overall Completion Assessment

| Category                    | Completion |
| --------------------------- | ---------- |
| Design system documentation | 100%       |
| Design mockups              | 100%       |
| Dev tooling (lint/format)   | 100%       |
| Project scaffolding         | 100%       |
| Theme/token implementation  | 0%         |
| Font installation           | 0%         |
| Screens                     | ~2%        |
| Components                  | ~5%        |
| Navigation                  | ~15%       |
| State management            | ~2%        |
| API integration             | 0%         |
| Data model implementation   | 0%         |
| Animations                  | 0%         |
| Accessibility               | 0%         |
| Testing                     | 0%         |

**Bottom line:** The project is in the **very early scaffolding stage**. The design system documentation and mockups are comprehensive and production-quality, but the actual app implementation is essentially the unmodified Expo template with a basic camera screen. Virtually all features, screens, components, theming, and data infrastructure still need to be built from scratch.
