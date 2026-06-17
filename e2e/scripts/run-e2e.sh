#!/bin/bash
# e2e/scripts/run-e2e.sh
# Runs a specific E2E flow or all flows.
# Usage: bash e2e/scripts/run-e2e.sh [flow-name]
#   bash e2e/scripts/run-e2e.sh              # runs all flows
#   bash e2e/scripts/run-e2e.sh onboarding   # runs 01-onboarding only
#   bash e2e/scripts/run-e2e.sh auth         # runs 02-auth-signup-login only

set -euo pipefail

# Ensure Maestro is in PATH
export PATH="$HOME/.maestro/bin:$PATH"

FLOW_DIR="e2e/flows"
FLOW="$1"

if ! command -v maestro &>/dev/null; then
  echo "ERROR: Maestro not found. Install it first:"
  echo "  curl -Ls \"https://get.maestro.mobile.dev\" | bash"
  exit 1
fi

# Verify a simulator is booted
BOOTED=$(xcrun simctl list devices | grep "Booted" | head -1 | wc -l | tr -d ' ')
if [ "$BOOTED" -eq 0 ]; then
  echo "ERROR: No booted iOS simulator."
  echo "Boot one first: open -a Simulator"
  exit 1
fi

echo "=== Running Maestro E2E Tests ==="

if [ -z "$FLOW" ]; then
  echo "Running ALL flows..."
  maestro test "$FLOW_DIR/"
else
  # Find matching flow file
  MATCH=$(find "$FLOW_DIR" -name "*${FLOW}*.yaml" -not -path "*/subflows/*" | head -1)
  if [ -z "$MATCH" ]; then
    echo "ERROR: No flow matching '$FLOW' found in $FLOW_DIR/"
    echo "Available flows:"
    find "$FLOW_DIR" -name "*.yaml" -not -path "*/subflows/*" | sort | while read f; do
      echo "  $(basename "$f" .yaml)"
    done
    exit 1
  fi
  echo "Running: $(basename "$MATCH")"
  maestro test "$MATCH"
fi

echo ""
echo "=== Done ==="
