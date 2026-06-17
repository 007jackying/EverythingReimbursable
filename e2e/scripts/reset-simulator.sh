#!/bin/bash
# e2e/scripts/reset-simulator.sh
# Clears iOS simulator app data for fresh onboarding tests.
# Usage: bash e2e/scripts/reset-simulator.sh [DEVICE_UUID]

set -euo pipefail

# Ensure Maestro is in PATH
export PATH="$HOME/.maestro/bin:$PATH"

BUNDLE_ID="${BUNDLE_ID:-com.everythingreimbursable.app}"
DEVICE="${1:-booted}" # default: first booted simulator

echo "=== Reset Simulator App Data ==="
echo "Bundle ID: $BUNDLE_ID"
echo "Device:    $DEVICE"
echo ""

# Get device UUID if "booted" is specified
if [ "$DEVICE" = "booted" ]; then
  DEVICE_UUID=$(xcrun simctl list devices | grep "Booted" | head -1 | grep -oE '[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}' || true)
  if [ -z "$DEVICE_UUID" ]; then
    echo "ERROR: No booted simulator found. Boot one first:"
    echo "  xcrun simctl boot 'iPhone 16'"
    exit 1
  fi
else
  DEVICE_UUID="$DEVICE"
fi

echo "Device UUID: $DEVICE_UUID"

# Check if app is installed
if ! xcrun simctl get_app_container "$DEVICE_UUID" "$BUNDLE_ID" data &>/dev/null; then
  echo ""
  echo "App not installed on this simulator."
  echo "Build & install it first:"
  echo "  npx expo run:ios"
  echo ""
  echo "Or for Expo Go, set BUNDLE_ID=host.exp.Exponent"
  exit 1
fi

# Uninstall and reinstall preserves a clean state
echo "Uninstalling app..."
xcrun simctl uninstall "$DEVICE_UUID" "$BUNDLE_ID" 2>/dev/null || true
echo "Done. App data cleared."
echo ""
echo "Next: rebuild and install the app, then run Maestro tests:"
echo "  npx expo run:ios --device \"$DEVICE_UUID\""
echo "  maestro test e2e/flows/"
