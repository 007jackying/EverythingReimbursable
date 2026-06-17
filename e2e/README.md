# E2E Testing with Maestro

EverythingReimbursable end-to-end tests using [Maestro](https://maestro.mobile.dev) —
the simplest mobile UI testing framework. Free, open-source, YAML-based.

**10 flows | 6 subflows | 100+ test scenarios | $0 cost**

## Prerequisites

1. **Maestro installed:**

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   # Add to PATH (or restart your shell):
   export PATH="$HOME/.maestro/bin:$PATH"
   # Verify:
   maestro --version
   ```

2. **iOS Simulator booted** (or Android Emulator):

   ```bash
   open -a Simulator
   ```

3. **App built and installed** on the simulator:

   ```bash
   # Dev client (recommended — gives you clearState support)
   npx expo run:ios

   # Or use Expo Go (appId = host.exp.Exponent)
   npx expo start --ios
   ```

4. **Environment variables** set for E2E test account:
   ```bash
   cp .env.example .env
   # Make sure EXPO_PUBLIC_GEMINI_API_KEY is set (needed for scan/ai flows)
   ```

## Quick Start

```bash
# Run all E2E flows
bash e2e/scripts/run-e2e.sh

# Run a single flow by keyword
bash e2e/scripts/run-e2e.sh onboarding
bash e2e/scripts/run-e2e.sh auth
bash e2e/scripts/run-e2e.sh navigation
bash e2e/scripts/run-e2e.sh scan
bash e2e/scripts/run-e2e.sh history
bash e2e/scripts/run-e2e.sh profile
bash e2e/scripts/run-e2e.sh receipt
bash e2e/scripts/run-e2e.sh reset
bash e2e/scripts/run-e2e.sh processing
bash e2e/scripts/run-e2e.sh edge

# Or run directly with maestro
maestro test e2e/flows/01-onboarding.yaml
```

## Flow Reference

| #   | File                        | Scenarios                                                                                         | Dependencies      |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------- | ----------------- |
| 01  | `01-onboarding.yaml`        | Carousel slides, swipe back, dot nav, Get Started, Sign In bypass                                 | Fresh install     |
| 02  | `02-auth-signup-login.yaml` | Sign up, validation errors, password toggle, terms, logout, login, invalid creds, forgot password | 01 completed      |
| 03  | `03-core-navigation.yaml`   | Tab bar, empty states, pull-to-refresh, greeting, View All, View Insights                         | User logged in    |
| 04  | `04-scan-camera.yaml`       | Quick action, FAB, permission, mode tabs, flash, gallery, Upload Photo                            | User logged in    |
| 05  | `05-history-export.yaml`    | All/This Month/By Category/Filters tabs, FilterSheet, search, CSV export                          | User logged in    |
| 06  | `06-profile-settings.yaml`  | Edit name, currency picker (5x), Google Drive, notifications, export, logout, help, avatar        | User logged in    |
| 07  | `07-receipt-detail.yaml`    | Receipt card view, inline edit, save, delete, back nav, empty Scan CTA                            | Receipt exists    |
| 08  | `08-reset-password.yaml`    | Forgot password modal, email validation, reset form, invalid link, password mismatch              | Fresh install     |
| 09  | `09-ai-processing.yaml`     | Loading state, progress bar, confidence, Gemini, privacy badge, error state                       | API key + gallery |
| 10  | `10-edge-cases.yaml`        | Keyboard avoiding, empty states, background/foreground, tab cycling, accessibility                | User logged in    |

### Subflows

| File                                   | Purpose                                      |
| -------------------------------------- | -------------------------------------------- |
| `subflows/handle-permission.yaml`      | Grant camera/location permission dialogs     |
| `subflows/receipt-detail-actions.yaml` | Full view/edit/save/delete on receipt detail |
| `subflows/receipt-empty-state.yaml`    | Tap "Scan Receipt" from empty history        |
| `subflows/confirm-delete.yaml`         | Handle delete confirmation alert             |

## Configuration

### App ID

Edit `e2e/.maestro/config.yaml` — the `appId` must match your build:

| Build type               | appId                            |
| ------------------------ | -------------------------------- |
| Dev client (recommended) | `com.everythingreimbursable.app` |
| Expo Go                  | `host.exp.Exponent`              |

### Test Account

Flows 02-10 use these environment defaults:

- `TEST_EMAIL=e2e-test@example.com`
- `TEST_PASSWORD=Test1234!`
- `TEST_NAME=E2E User`

Override them per run:

```bash
maestro test --env TEST_EMAIL=my@email.com e2e/flows/02-auth-signup-login.yaml
```

### API-Dependent Flows

Flows 04, 07, and 09 interact with real device features:

- **04 (Scan)**: Camera/gallery — works on simulator with limitations
- **07 (Receipt Detail)**: Requires at least one receipt to exist
- **09 (AI Processing)**: Requires `EXPO_PUBLIC_GEMINI_API_KEY` in `.env`

## Resetting App State

For onboarding tests (flow 01), you need a fresh install:

```bash
# Option A: Reset via script (dev client)
bash e2e/scripts/reset-simulator.sh

# Option B: Launch with clearState (dev client only)
# The onboarding flow already uses `clearState: true`

# Option C: For Expo Go — reinstall the dev build
npx expo run:ios
```

## Writing New Flows

Maestro uses simple YAML commands. Available commands:

```yaml
# Assertions
- assertVisible: "text"
- assertNotVisible: "text"

# Interactions
- tapOn: "text"              # tap element by text
- tapOn: { point: "50%,50%" }    # tap by screen percentage
- tapOn: { text: "X", optional: true }  # tap if visible
- inputText: "hello"         # type into focused field
- eraseText: 50              # erase N characters
- pressKey: Enter            # keyboard key
- swipe:
    direction: LEFT
    duration: 300
- swipe:
    start: "50%,20%"
    end: "50%,60%"
    duration: 500
- scrollUntilVisible:
    element: { text: "target" }
    direction: DOWN

# Flow control
- launchApp                             # launch or foreground
- launchApp: { clearState: true }        # fresh install (dev client only)
- pressKey: Home                         # background the app
- runFlow:
    when: { visible: "text" }           # conditional subflow
    file: subflows/foo.yaml
- runFlow:
    when: { notVisible: "text" }         # negative condition
    commands:                            # inline subflow
      - tapOn: "Button"
- extendedWaitUntil:
    visible: { text: "target" }
    timeout: 5000                        # wait for async UI

# Environment
env:
  MY_VAR: value                          # top of flow
# Pass vars: maestro test --env KEY=VALUE flow.yaml
# Reference: ${MY_VAR} in inputText/assertVisible

# Screenshots & reporting
- takeScreenshot: name                    # capture current screen
```

### Selector Tips

- Use visible **text** as primary selector: `- tapOn: "Get Started"`
- Use `point: "X%,Y%"` for icon-only buttons (e.g., `"90%,8%"`)
- Use `optional: true` for elements that may not appear
- Check `src/app/` files to find the exact text strings rendered
- Icon-only buttons use MaterialIcons — check `name="icon-name"` in source

## Structure

```
e2e/
├── .maestro/
│   └── config.yaml              # Global config (appId, timeouts)
├── flows/
│   ├── 01-onboarding.yaml       # First launch carousel
│   ├── 02-auth-signup-login.yaml # Auth forms & validation
│   ├── 03-core-navigation.yaml  # Tab bar & empty states
│   ├── 04-scan-camera.yaml      # Camera & gallery
│   ├── 05-history-export.yaml   # Filters, search, export
│   ├── 06-profile-settings.yaml # Edit name, currency, logout
│   ├── 07-receipt-detail.yaml   # Receipt view/edit/save
│   ├── 08-reset-password.yaml   # Forgot password flow
│   ├── 09-ai-processing.yaml    # AI extraction states
│   ├── 10-edge-cases.yaml       # Empty states, keyboard, lifecycle
│   └── subflows/
│       ├── handle-permission.yaml
│       ├── receipt-detail-actions.yaml
│       ├── receipt-empty-state.yaml
│       └── confirm-delete.yaml
├── scripts/
│   ├── run-e2e.sh               # Run all or single flow
│   └── reset-simulator.sh       # Clear app data
└── README.md                    # This file
```

## CI Integration (Future)

Add to `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Boot simulator
        run: |
          xcrun simctl boot "iPhone 16"
      - name: Build app
        run: npx expo run:ios
      - name: Run E2E
        run: maestro test e2e/flows/
```

## Cost

**$0** — Maestro is MIT-licensed and free for unlimited local runs. Maestro Cloud
(parallel CI runs) has a free tier with 100 runs/month.
