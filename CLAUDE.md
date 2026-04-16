# CLAUDE.md — EverythingReimbursable Design System

This file defines the canonical design language for **EverythingReimbursable**, a cross-platform receipt scanner and expense tracking app built with Expo React Native (iOS, Android, Web). Every screen, component, and interaction must strictly follow this system. Reference the `designMockups/` folder at the project root for screen-level visual truth — each subfolder contains a `screen.png` (visual) and `code.html` (implementation reference).

---

## Design Mockup Reference

| Screen                  | Folder                                                            |
| ----------------------- | ----------------------------------------------------------------- |
| Splash / Onboarding     | `designMockups/splash_onboarding/`                                |
| Login                   | `designMockups/login/`                                            |
| Sign Up                 | `designMockups/sign_up/`                                          |
| Home / Dashboard        | `designMockups/home_dashboard_1/` `home_dashboard_2/`             |
| Scan Camera             | `designMockups/scan_receipt_camera/`                              |
| AI Extraction Progress  | `designMockups/ai_extraction_progress/`                           |
| Receipt Detail / Review | `designMockups/receipt_detail_review/`                            |
| History (All Receipts)  | `designMockups/history_all_receipts_1/` `history_all_receipts_2/` |
| Profile                 | `designMockups/profile/`                                          |
| Minimal Lens            | `designMockups/lens_minimal/`                                     |

---

## 1. App Identity

| Property    | Value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| App Name    | EverythingReimbursable                                                     |
| Platform    | Expo React Native — iOS, Android, Web                                      |
| Design Tone | Editorial bento-style, fintech-grade, purposeful whitespace                |
| Inspiration | High-end financial apps — editorial layouts, asymmetric composition, depth |

---

## 2. Color System

The palette is a Material Design 3–derived system. Use only these tokens. Never hardcode hex values in components — always use the token name.

### Full Token Palette

| Token                       | Hex       | Usage                                                            |
| --------------------------- | --------- | ---------------------------------------------------------------- |
| `primary`                   | `#070235` | Headings, icon color on light surfaces, key text                 |
| `primary-container`         | `#1E1B4B` | Summary card background, active nav badge, detected amount card  |
| `on-primary`                | `#FFFFFF` | Text/icons on `primary` background                               |
| `on-primary-container`      | `#8683BA` | Muted text/labels on `primary-container` background              |
| `primary-fixed`             | `#E3DFFF` | Very light primary tint                                          |
| `primary-fixed-dim`         | `#C4C1FB` | Dimmed primary tint                                              |
| `secondary`                 | `#006C49` | Verified badge, scan FAB, AI scanning beam, confidence indicator |
| `secondary-container`       | `#6CF8BB` | Chip background (dining/verified), mint accent                   |
| `on-secondary`              | `#FFFFFF` | Text/icons on `secondary` background                             |
| `on-secondary-container`    | `#00714D` | Text on `secondary-container`                                    |
| `secondary-fixed`           | `#6FFBBE` | Light green fixed tint                                           |
| `secondary-fixed-dim`       | `#4EDEA3` | Dimmed secondary tint                                            |
| `background`                | `#FAF9F7` | App background, screen base, sticky header bg                    |
| `surface`                   | `#FAF9F7` | Same as background                                               |
| `surface-bright`            | `#FAF9F7` | Bright surface variant                                           |
| `surface-dim`               | `#DBDAD8` | Dimmed surface                                                   |
| `surface-container-lowest`  | `#FFFFFF` | Receipt cards, modals, elevated white surfaces                   |
| `surface-container-low`     | `#F4F3F1` | Input field bg, secondary card areas, icon containers            |
| `surface-container`         | `#EFEEEC` | Dividers, neutral chips                                          |
| `surface-container-high`    | `#E9E8E6` | Hover states, muted icon bg, nav pill bg                         |
| `surface-container-highest` | `#E3E2E0` | Strongest neutral surface                                        |
| `on-surface`                | `#1A1C1B` | Primary body text on light bg                                    |
| `on-surface-variant`        | `#47464F` | Secondary text, placeholders, meta labels                        |
| `outline`                   | `#787680` | Pending status, subtle icons, search icon                        |
| `outline-variant`           | `#C8C5D0` | Dividers, light borders                                          |
| `error`                     | `#BA1A1A` | Error states, destructive actions                                |
| `error-container`           | `#FFDAD6` | Error background                                                 |
| `on-error`                  | `#FFFFFF` | Text on error                                                    |
| `inverse-surface`           | `#2F3130` | Dark chip/toast bg                                               |
| `inverse-on-surface`        | `#F1F1EF` | Text on dark chip/toast                                          |

### Rules

- Never use hex values directly in component code — always reference the token.
- Text on `primary-container` uses `on-primary-container` for secondary text, `on-primary` (white) for primary text.
- Text on `secondary` uses `on-secondary` (white).
- All text/background combos must pass **WCAG AA** (4.5:1 normal text, 3:1 large text).
- Decorative blur/glow effects (summary card circles, scan beam glow) are allowed — they are part of the editorial style.

---

## 3. Typography

### Font Families

| Role       | Font              | Package                                |
| ---------- | ----------------- | -------------------------------------- |
| Headline   | Plus Jakarta Sans | `@expo-google-fonts/plus-jakarta-sans` |
| Body       | Plus Jakarta Sans | `@expo-google-fonts/plus-jakarta-sans` |
| Label/Mono | Space Grotesk     | `@expo-google-fonts/space-grotesk`     |

> Use `Space Grotesk` for: transaction amounts, e-invoice IDs, reference codes, category chips, uppercase meta labels, status badges, confidence percentages, and all `font-label` contexts.

### Type Scale

| Token          | Font              | Size | Weight | Usage                                                                          |
| -------------- | ----------------- | ---- | ------ | ------------------------------------------------------------------------------ |
| `text.display` | Plus Jakarta Sans | 36px | 800    | Hero total on summary card                                                     |
| `text.h1`      | Plus Jakarta Sans | 30px | 700    | Screen page titles (History, Profile)                                          |
| `text.h2`      | Plus Jakarta Sans | 24px | 700    | Receipt detail merchant name, section headers                                  |
| `text.h3`      | Plus Jakarta Sans | 20px | 700    | Greeting text, card section titles                                             |
| `text.body`    | Plus Jakarta Sans | 15px | 400    | Body copy, descriptions, sub-labels                                            |
| `text.body.md` | Plus Jakarta Sans | 15px | 600    | Merchant name in list items, emphasized body                                   |
| `text.caption` | Plus Jakarta Sans | 13px | 500    | Date, meta info, setting descriptions                                          |
| `text.label`   | Space Grotesk     | 10px | 700    | Uppercase tracking labels (TOTAL EXPENSES, CONFIDENCE, OCR_v4), tab bar labels |
| `text.mono`    | Space Grotesk     | 15px | 700    | Amounts in list items ($18.42), e-invoice ID                                   |
| `text.mono.lg` | Space Grotesk     | 60px | 700    | Large receipt total on detail screen                                           |
| `text.mono.xl` | Space Grotesk     | 36px | 800    | Summary card total amount                                                      |

### Rules

- All uppercase labels use `Space Grotesk`, `font-weight: 700`, `letter-spacing: 0.15–0.2em`.
- Never use `fontSize` below 10px.
- Heading text is `tracking-tight` or `tracking-tighter` (tight letter spacing).
- Body text is default tracking.

---

## 4. Spacing System

Base unit: **4px**. All spacing is a multiple of 4.

| Token      | Value | Usage                                        |
| ---------- | ----- | -------------------------------------------- |
| `space.1`  | 4px   | Micro gaps — icon-to-text, dot separators    |
| `space.2`  | 8px   | Chip padding, tight inline gaps              |
| `space.3`  | 12px  | Input vertical padding, list item inner gaps |
| `space.4`  | 16px  | Standard component padding                   |
| `space.5`  | 20px  | Card internal padding (receipt list items)   |
| `space.6`  | 24px  | Screen horizontal padding, section gaps      |
| `space.8`  | 32px  | Summary card padding, large section spacing  |
| `space.10` | 40px  | Between major sections                       |
| `space.12` | 48px  | Hero/auth top safe area offset               |
| `space.16` | 64px  | Hero vertical spacing                        |

### Screen Layout

- **Horizontal screen padding:** 24px (`space.6`) on mobile.
- **Max content width on Web:** `640px`, centered (`max-w-xl` / `max-w-2xl`).
- **Bottom safe area:** always use `SafeAreaView` / `useSafeAreaInsets`. Nav bar adds `pb-6` above the safe area.

---

## 5. Border Radius

| Token         | Value  | Usage                                                                                                              |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `radius.sm`   | 8px    | Icon containers in history list (`rounded-lg`)                                                                     |
| `radius.md`   | 12px   | Inputs, export card, smaller action buttons (`rounded-xl`)                                                         |
| `radius.lg`   | 16px   | Nav active tab badge, meta grid items, bottom nav bar top corners (`rounded-2xl`)                                  |
| `radius.xl`   | 24px   | Receipt cards on History screen (`rounded-xl` = 12px there — see screen), but home receipt cards use `rounded-3xl` |
| `radius.2xl`  | 24px   | Home receipt cards, quick action buttons (`rounded-3xl` = 24px)                                                    |
| `radius.hero` | 32px   | Summary card (`rounded-[2rem]`)                                                                                    |
| `radius.full` | 9999px | Pills, chips, filter tabs, FAB, avatar, status badges                                                              |

> Note: Home receipt cards use `rounded-3xl` (24px). History list items use `rounded-xl` (12px). Summary card uses `rounded-[2rem]` (32px). These are intentionally different.

---

## 6. Elevation & Shadows

| Token         | React Native Value                                                                                      | Usage                                           |
| ------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `shadow.none` | none                                                                                                    | Default surfaces                                |
| `shadow.sm`   | `{ shadowColor: '#1A1C1B', shadowOffset: {0,12}, shadowOpacity: 0.04, shadowRadius: 32, elevation: 1 }` | Receipt cards, history items (editorial shadow) |
| `shadow.md`   | `{ shadowColor: '#1A1C1B', shadowOffset: {0,4}, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }`  | Bottom nav bar, modals                          |
| `shadow.lg`   | `{ shadowColor: '#1A1C1B', shadowOffset: {0,8}, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }`  | Scan FAB, floating action elements              |
| `shadow.hero` | `{ shadowColor: '#070235', shadowOpacity: 0.2, shadowRadius: 32, elevation: 8 }`                        | Summary card on home                            |

---

## 7. Iconography

- **Library:** `@expo/vector-icons` using **Material Icons** / **Material Community Icons** (matching Material Symbols Outlined from mockups)
- **Style:** Outlined/regular by default. Filled variant only for the **active bottom tab badge icon**.
- **Icon sizes:**

| Context                     | Size |
| --------------------------- | ---- |
| Bottom tab bar              | 24px |
| List item leading (history) | 24px |
| Card/button inline          | 20px |
| Chip / badge inline         | 14px |
| Input trailing (search)     | 24px |

- **Color:** Inherits from context — `primary` on light surfaces, `on-primary` (white) inside `primary-container`, `outline` for inactive/search states, `secondary` for verified/success states.

---

## 8. Component Specifications

### 8.1 Buttons

| Variant              | Background               | Text                 | Border                | Radius             | Height      |
| -------------------- | ------------------------ | -------------------- | --------------------- | ------------------ | ----------- |
| `primary`            | `primary` (`#070235`)    | `on-primary` (white) | none                  | `radius.md` (12px) | 56px        |
| `ghost`              | transparent              | `primary`            | 1px `outline-variant` | `radius.md` (12px) | 52px        |
| `quick-action-dark`  | `primary` (`#070235`)    | white                | none                  | `radius.lg` (16px) | auto (py-5) |
| `quick-action-light` | `surface-container-high` | `primary`            | none                  | `radius.lg` (16px) | auto (py-5) |
| `disabled`           | `surface-container-high` | `on-surface-variant` | none                  | `radius.md`        | 52px        |

- **Font:** Space Grotesk, weight 700, for all button labels.
- **Primary button:** full-width, 56px, `rounded-xl`. Arrow icon trailing (`→`).
- **Pressed state:** scale `0.98`, 200ms.
- **Quick action buttons** (Home screen): side-by-side 2-column grid, `py-5 px-6`, icon on top, label below, `rounded-2xl`.

### 8.2 Input Fields

- **Background:** `surface-container-low` (`#F4F3F1`), **no border by default**
- **Focus:** ring `primary/10` (2px soft glow), no hard border
- **Radius:** `radius.md` (12px, `rounded-xl`)
- **Height:** 48px (`h-12`)
- **Font:** Plus Jakarta Sans, weight 400
- **Label above field:** Space Grotesk, 10px, weight 700, uppercase, `letter-spacing: 0.15em`, `on-surface-variant`
- **Placeholder:** `outline` color with 60% opacity
- **No shadows on inputs.**
- **Password field:** eye icon trailing (show/hide toggle)

### 8.3 Receipt Cards (Home Screen)

- **Background:** `surface-container-lowest` (white `#FFFFFF`)
- **Radius:** `rounded-3xl` (24px)
- **Shadow:** `shadow.sm` (editorial shadow — large, very soft)
- **Padding:** 20px (`p-5`)
- **Merchant avatar:** 56px × 56px, `rounded-2xl`, `surface-container-low` background with merchant image
- **Merchant name:** Plus Jakarta Sans, bold, `primary`
- **Date:** Space Grotesk, 12px, `on-surface-variant`
- **Amount:** Space Grotesk, bold, 18px, `primary`, right-aligned
- **Status (Verified):** Material icon `verified` (filled, green), `secondary` color + "VERIFIED" Space Grotesk label
- **Status (Pending):** Clock icon, `outline` color + "PENDING" Space Grotesk label
- **Category chip:** see Section 8.4

### 8.4 Category / Status Chips

All chips use `rounded-full` pill shape.

**Verified badge:**

- Background: `secondary/10`
- Text: `secondary` (`#006C49`)
- Dot indicator: 6px circle, `secondary` fill
- Font: Space Grotesk, 10px, bold

**Category chips (History screen — inline row):**

- Background: `primary-container/10` (`#1E1B4B` at 10% opacity)
- Text: `primary-container` (`#1E1B4B`)
- Font: Space Grotesk, 10px, bold
- Padding: `px-2 py-0.5`

**Category chips (Receipt Detail — large badge):**

- Background: `secondary-container` (`#6CF8BB`)
- Text: `on-secondary-container` (`#00714D`)
- Font: Space Grotesk, 11px, bold, uppercase
- Padding: `px-3 py-1`

**AI Verified badge (Receipt Detail top-right):**

- Background: `secondary-container`
- Dot: `secondary`
- Text: `on-secondary-container`, Space Grotesk, 10px, bold, uppercase

**Bank-grade privacy badge (AI screen):**

- Background: `secondary-container/30` with `border border-secondary/10`
- Icon: verified (filled, `secondary`)
- Text: `on-secondary-container`, Space Grotesk, 10px, bold

### 8.5 Summary Card (Home Screen)

- **Background:** `primary-container` (`#1E1B4B`)
- **Radius:** 32px (`rounded-[2rem]`)
- **Padding:** 32px (`p-8`)
- **Decorative elements:** two large blurred circles — `secondary/10` top-right, `primary/20` bottom-left (background depth effect)
- **Label:** "TOTAL EXPENSES" — Space Grotesk, 10px, bold, uppercase, `on-primary-container`, `tracking-widest`
- **Amount:** Space Grotesk, 36px+, weight 800, white (`on-primary`)
- **Monthly stats bento:** `bg-white/10 backdrop-blur rounded-2xl p-4`, white text
- **Divider:** `bg-white/10` 1px line
- **AI Accuracy row:** green dot pulse indicator + "AI Accuracy 99.2%" in `secondary-fixed` + "View Insights →" button

### 8.6 Bottom Tab Bar

- **Background:** `background` (`#FAF9F7`) at 80% opacity with `backdrop-blur-xl`
- **Top shadow:** subtle `0_-8px_30px rgba(0,0,0,0.04)`
- **Top radius:** `rounded-t-3xl`
- **Tabs:** Home | History | Scan (FAB center) | Profile

**Active tab:**

- Pill badge: `bg-primary-container` (`#1E1B4B`), `rounded-2xl`, padding `p-3`
- Icon: filled variant, white
- Label: white, Space Grotesk, 10px, bold, uppercase

**Inactive tab:**

- No background
- Icon: regular/outlined, `primary` at 60% opacity
- Label: `primary` at 60%, Space Grotesk, 10px, medium, uppercase
- Hover/touch: transitions to `secondary` color

**Scan FAB (center):**

- 64px circle (`w-16 h-16`), `bg-secondary` (`#006C49`), white scanner icon
- Raised `-top-8` above the bar
- Ring: `ring-8 ring-background` (white halo)
- Shadow: `shadow-2xl`
- Label: "SCAN" below in `secondary`, Space Grotesk, 10px, bold

> On the History screen, the active tab is "History" (not Home). The active tab badge follows the user's current screen.

### 8.7 History List Items

- **Background:** `surface-container-lowest` (white)
- **Radius:** `rounded-xl` (12px)
- **Shadow:** editorial shadow (`shadow.sm`)
- **Padding:** 16px (`p-4`)
- **Icon container:** 48px × 48px, `rounded-lg` (8px), `surface-container-low` bg, Material Symbol icon in `primary`
- **Merchant name:** Plus Jakarta Sans, bold, `primary`, truncated
- **Amount:** Space Grotesk, bold, 14px, `primary`, right-aligned
- **Date:** Plus Jakarta Sans, 12px, `on-surface-variant`
- **Separator dot:** 4px circle, `outline-variant`
- **Category/status chip:** inline after date (see chip specs above)
- **Timeline header:** Space Grotesk, 10px, bold, uppercase, `letter-spacing: 0.2em`, `on-surface-variant` at 50% — e.g. "OCTOBER 2023"

### 8.8 Bottom Sheets / Modals

- **Background:** `surface-container-lowest` (white)
- **Radius:** `radius.lg` (16px) top corners only
- **Shadow:** `shadow.md`
- **Handle:** 4px × 36px, `outline-variant`, centered, 12px from top
- **Backdrop:** `rgba(26, 28, 27, 0.4)`

---

## 9. Screen-Specific Rules

### Splash / Onboarding (`designMockups/splash_onboarding/`)

- Background: subtle light gradient (mint/green tones — exception to the no-gradient rule for this screen only)
- App logo: dark square with receipt scanner icon, centered
- App name: "EverythingReimbursable", Plus Jakarta Sans, bold
- Tagline: "Scan. Extract. Organize." — body text
- Card preview: white card showing receipt mockup with VERIFIED badge and AUTO-EXTRACT pill
- CTA: "Get Started →" full-width primary button
- Footer: "Already have an account? Sign In" — "Sign In" in `secondary`
- Pagination dots: 3 circles, active in `primary-container`

### Login (`designMockups/login/`)

- Background: `background` (`#FAF9F7`)
- Logo icon + app name: centered, top area
- Heading: "Welcome back." — Plus Jakarta Sans, 36px, 800, `primary`
- Sub-heading: "Step back into your curated financial world." — body, `on-surface-variant`
- Field labels: Space Grotesk, 10px, bold, uppercase, `on-surface-variant` — "EMAIL ADDRESS", "PASSWORD"
- "Forgot?" link: right-aligned, `secondary`, Space Grotesk, bold
- Primary CTA: "Continue →" full-width 56px primary button
- Divider label: "AUTHENTICATION PROXY" — Space Grotesk, uppercase, `on-surface-variant`
- Social auth: Google + Apple — side-by-side `ghost` buttons, `surface-container-lowest` bg, provider logo left-aligned
- Footer: "New to the Lens? Create an account" — "Create an account" bold `primary`

### Sign Up (`designMockups/sign_up/`)

- Background: `background`
- App name top-left: small, Plus Jakarta Sans, bold
- Heading: "Create Account" — Plus Jakarta Sans, 36px+, 800, `primary`
- Sub-heading: "Start curating your digital archives today."
- Fields: Full Name, Email Address, Password (with eye icon toggle)
- Checkbox: "I agree to the Terms of Service and Privacy Policy" — terms/policy in bold underlined
- Primary CTA: "Create Account →"
- Divider: "OR CONTINUE WITH" — Space Grotesk, uppercase
- Social auth: Google + Apple side-by-side
- Footer: "Already part of the collection? Sign In" — "Sign In" underlined bold

### Home / Dashboard (`designMockups/home_dashboard_1/`, `home_dashboard_2/`)

- Background: `background`
- **Header:** hamburger menu icon (left) + app name + avatar circle (right), sticky, `background` bg
- **Greeting:** "Good morning, [name]" — Plus Jakarta Sans, 30px, bold, `primary`. Sub: "Ready to organize your finances?" — `on-surface-variant`
- **Summary card:** see Section 8.5
- **Quick actions:** 2-column grid, `rounded-2xl`, `py-5 px-6` — "Scan Receipt" (dark/primary) + "Upload Photo" (light/surface-container-high)
- **Section header:** "Recent Receipts" (bold, `primary`) + "View All" link (`secondary`)
- **Receipt list:** see Section 8.3. `space-y-4` between cards.
- Bottom nav: Home tab active

### Scan / Camera (`designMockups/scan_receipt_camera/`)

- Background: full dark camera view
- **Overlay:** "ALIGN RECEIPT EDGES" label — `primary-container` bg with white text pill, centered in viewfinder
- **Focus ring:** circular indicator showing focus percentage (e.g. "76%") — right side of viewfinder
- **Top bar:** X (close) button left, flash toggle right — both white on dark
- **Bottom control strip:** transparent bg with frosted effect
  - Mode tabs: SINGLE | MULTI-PAGE | IMPORT — Space Grotesk, bold, `secondary` for active tab (underlined)
  - Icons row: Gallery (left) | Scanner (center, 64px circle button) | Auto (right)
  - Center capture button: large outlined circle

### AI Extraction Progress (`designMockups/ai_extraction_progress/`)

- Background: `background`
- Header: app name left + X close button right (minimal, no nav)
- **Receipt icon:** white card, slight `rotate-[-2deg]`, with `shadow.hero`, faint receipt icon in center, AI scanning laser beam across middle (2px line, `secondary` color with green glow)
- **Heading:** "Extracting receipt details..." — Plus Jakarta Sans, 24px, bold, `primary`
- **Sub-text:** "AI is identifying merchants, totals, and line items." — `on-surface-variant`
- **Progress bar:** 6px tall, `surface-container-high` track, `primary-container` fill with glow, `rounded-full`
- **Meta bento (2-col):** `surface-container-low rounded-xl p-4`
  - Left: "CONFIDENCE" label + "98.4%" in `secondary` (Space Grotesk, bold) + SVG ring indicator
  - Right: "PROCESSING" label + "OCR_v4" in `primary`, italic (Space Grotesk)
- **Bank-grade privacy badge:** centered, see Section 8.4
- **Privacy copy:** 11px, `on-surface-variant`, centered
- **Bottom data feed:**
  - Merchant card: `surface-container-low rounded-2xl` — storefront icon + merchant name + "VERIFIED" pill
  - Amount card: `primary-container rounded-2xl` (dark) — "DETECTED AMOUNT" label + large amount in white Space Grotesk + "Categorizing..." with 3 bouncing dots
- **Floating notification:** bottom center, `surface-container-lowest/80 backdrop-blur rounded-2xl` — green dot + "AI AGENT: OPTIMIZING IMAGE CONTRAST" in Space Grotesk

### Receipt Detail / Review (`designMockups/receipt_detail_review/`)

- Background: `background`
- Header: back arrow + app name + avatar (no active tab, modal context)
- **Validation label:** "VALIDATION STAGE" — Space Grotesk, 10px, bold, uppercase, `on-surface-variant`, `letter-spacing: 0.2em`
- **Page title:** "Review Receipt" — Plus Jakarta Sans, 36px, 700, `primary`
- **Main card:** `surface-container-lowest rounded-3xl p-8 shadow.sm`
  - **AI Verified badge:** absolute top-right inside card
  - **Merchant name:** Plus Jakarta Sans, 24px, bold, `primary`
  - **Address:** Plus Jakarta Sans, 14px, `on-surface-variant`
  - **"GRAND TOTAL" label:** Space Grotesk, 10px, bold, uppercase
  - **Amount:** "$" in 24px + amount in 60px, Space Grotesk, bold, `primary`, tight tracking
  - **2-col metadata grid:** Date | Payment Method | Category | Tax — separated by `outline-variant/15` top border
  - **E-Invoice ID block:** `surface-container-low rounded-xl p-4` — label + monospaced ID in `primary/80`
- **Receipt image:** `surface-container-low rounded-3xl h-48`, image at 60% opacity + "View Full Image" button overlay (`surface-container-lowest/90 backdrop-blur rounded-2xl`)
- **Actions:**
  - "Save Receipt →" — full-width primary button, 56px
  - "Edit" + "Re-scan" — side-by-side ghost buttons, `border border-outline-variant/30`, 52px
- Bottom nav: Scan tab active (center)

### History (`designMockups/history_all_receipts_1/`, `history_all_receipts_2/`)

- Background: `background`
- Header: hamburger + app name + avatar, sticky
- **Page title:** "History" — Plus Jakarta Sans, 30px, 800, `primary`
- **Sub-title:** "Your digital archive of curated expenses." — `on-surface-variant`, 70% opacity
- **Search bar:** `surface-container-low rounded-xl h-12 pl-12` — search icon left at `outline`, placeholder `outline/60`
- **Filter tabs (horizontal scroll):**
  - Active: `bg-primary rounded-full px-5 py-2.5`, white text, Space Grotesk, bold
  - Inactive: `bg-surface-container-low rounded-full`, `on-surface-variant`, Space Grotesk, bold
  - Options: All | This Month | By Category | Filters (with filter icon)
- **Timeline sections:** grouped by month. Month header in Space Grotesk, 10px, bold, uppercase, `on-surface-variant/50`, `letter-spacing: 0.2em`
- **List items:** see Section 8.7
- **Export History card:** `surface-container-low rounded-2xl p-6` — title, description, "Download Report" primary button. Decorative `ios_share` icon in background at 5% opacity.
- **FAB (add):** bottom-right, 56px circle, `bg-secondary` (green), white "+" icon, `shadow-2xl`, `z-40`
- Bottom nav: History tab active

### Profile (`designMockups/profile/`)

- Background: `background`
- Header: hamburger + app name + avatar, sticky
- **Avatar:** 96px × 96px circle with real photo, `rounded-2xl` shape (not circle), with `secondary` verified badge overlay bottom-right
- **Name:** Plus Jakarta Sans, 20px, bold, `primary`
- **Email:** Plus Jakarta Sans, 14px, `on-surface-variant`
- **"PREMIUM MEMBER" badge:** `secondary-container/30 rounded-full` — `secondary` star icon + Space Grotesk text
- **Stats row (2-col):**
  - "RECEIPTS SCANNED" card: `surface-container-low rounded-2xl p-5` — label + count (Plus Jakarta Sans, 30px, bold) + `+12%` sub-label
  - "CONFIDENCE" card: `primary-container rounded-2xl p-5` — dark card, label in `on-primary-container`, value in white, 30px bold
- **"PREFERENCES & SECURITY" section label:** Space Grotesk, 12px, bold, uppercase, `on-surface-variant`
- **Settings rows:** `surface-container-lowest rounded-2xl p-4` — icon (24px, `primary-container`) + label (Plus Jakarta Sans, bold, `primary`) + description (14px, `on-surface-variant`) + chevron-right
  - Notifications | Export Data | General Settings
- **Logout button:** `surface-container-low rounded-2xl p-4` — door-exit icon + "Logout Account" — neutral style, NOT red
- **Help row:** "Need Help? Our support team is here 24/7" + "Contact" primary button (small, inline)
- Bottom nav: Profile tab active

---

## 10. Animation & Motion

- **Default transition:** 200ms, ease-in-out
- **Button/tap press:** scale `0.95`–`0.98`, 200ms
- **Nav badge tap:** scale `0.90`, 300ms
- **Pulse / loading:** scale 1.0 → 1.05, 1200ms loop, ease-in-out (receipt icon on AI screen)
- **Dot bounce (categorizing):** vertical bounce, staggered 0.2s delay per dot, `animate-bounce`
- **Progress bar fill:** animated width, 1000ms ease-in-out, no jump
- **Green dot (AI accuracy):** `animate-pulse` subtle glow
- **List entry:** fade-in + translateY (8px → 0), staggered 60ms per item
- **Bottom sheet:** slide up from bottom, 280ms, ease-out
- **No spring physics on navigation transitions.** No bounce.
- Use `react-native-reanimated` for all animations. Use `Animated` API only for simple opacity/scale.

---

## 11. Navigation Structure

```
Stack Navigator (Root)
├── AuthStack (unauthenticated)
│   ├── SplashScreen          ← designMockups/splash_onboarding/
│   ├── LoginScreen           ← designMockups/login/
│   └── SignUpScreen          ← designMockups/sign_up/
└── MainTabs (authenticated)  ← Bottom tab bar
    ├── HomeScreen            ← designMockups/home_dashboard_1/
    ├── HistoryScreen         ← designMockups/history_all_receipts_1/
    ├── ScanTab               ← FAB, opens ScanCameraScreen as modal
    └── ProfileScreen         ← designMockups/profile/

Modal Stack (over MainTabs)
├── ScanCameraScreen          ← designMockups/scan_receipt_camera/
├── AIProcessingScreen        ← designMockups/ai_extraction_progress/
└── ReceiptDetailScreen       ← designMockups/receipt_detail_review/
```

---

## 12. Data Fields — Receipt Model

```typescript
interface Receipt {
  id: string // UUID
  eInvoiceId: string | null // Extracted e-invoice / reference number (e.g. INV-US-2023-88910-XQ9)
  companyName: string // Merchant name (e.g. "Blue Bottle Coffee")
  address: string | null // Merchant address
  date: string // ISO 8601 — "2024-10-24"
  totalAmount: number // In base currency unit (e.g. 42.50)
  taxAmount: number | null // Tax included in total
  currency: string // ISO 4217 — "MYR", "USD"
  paymentMethod: string | null // "Cash" | "Credit Card" | "Debit Card" | "E-Wallet" | null
  paymentLast4: string | null // Last 4 digits if card (e.g. "4242")
  category: ReceiptCategory
  imageUri: string // Local or remote URI of the receipt photo
  confidence: number // AI extraction confidence 0–1 (displayed as %)
  status: 'verified' | 'pending' | 'failed'
  createdAt: string // ISO 8601 timestamp
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

## 13. Accessibility

- All interactive elements: minimum touch target **48 × 48px**.
- All images require `accessibilityLabel`.
- Color is **never** the sole indicator of meaning — always pair with text or icon.
- Focus order must follow visual reading order (top-to-bottom, left-to-right).
- Use `accessibilityRole` and `accessibilityState` on all interactive components.
- Dynamic text size: support system font scaling up to 1.3× without layout breaking.

---

## 14. Coding Standards

- **Arrow functions** — always use `const` + arrow function for components, handlers, and utilities.

```typescript
// ✅ Correct
const MyComponent = () => { ... };
const handlePress = () => { ... };
const formatAmount = (value: number) => `$${value.toFixed(2)}`;

// ❌ Incorrect
function MyComponent() { ... }
function handlePress() { ... }
```

- Exception: `export default` function syntax is allowed for Expo Router file-based route screens only.
- Use `StyleSheet.create()` for all styles — no inline style objects.
- Color tokens must be imported from a central `theme.ts` constants file — never hardcode hex values.

---

## 15. Don'ts

- ❌ No fonts other than Plus Jakarta Sans and Space Grotesk
- ❌ No colors outside the defined token palette (no hardcoded hex in components)
- ❌ No border-radius values not in the defined token set
- ❌ No drop shadows beyond the defined shadow tokens
- ❌ No gradient backgrounds except on the Splash screen
- ❌ No decorative illustrations or stock photos in UI screens (merchant avatars are the exception)
- ❌ No animations above 300ms for UI transitions
- ❌ No uppercase on body text or headings — only on Space Grotesk labels and chips
- ❌ No placeholder screens — every screen must have an empty state
- ❌ No inline styles in components — use `StyleSheet.create()` with token references
- ❌ No `phosphor-react-native` — use Material Icons to match the mockup icon set

---

_This file is the single source of truth for EverythingReimbursable UI. When in doubt, open the relevant screen in `designMockups/` and match it exactly._
