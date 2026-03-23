# Escape Discard Toggle Design

## Overview

Add a new boolean setting `escapeDiscardsChanges` below `alwaysShowCardButtons` in the view settings. This allows users to choose between the old two-stage discard workflow (Escape shows warning, second Escape discards) and a simpler always-save behavior.

## Setting

- **Name**: `escapeDiscardsChanges`
- **Type**: `boolean`
- **Default**: `false`
- **Location**: `Settings.view`

## Behavior

| Setting | First Escape | Second Escape (no typing) |
|---------|-------------|---------------------------|
| `false` (default) | Saves and exits | N/A - already saved |
| `true` | Shows red border warning | Discards changes |

## Files to Modify

1. **`src/stores/settings/settings-type.ts`** — Add `escapeDiscardsChanges: boolean` to `Settings.view`
2. **`src/stores/settings/default-settings.ts`** — Default to `false`
3. **`src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`** — Branch on setting value
4. **Settings UI** — Add toggle below `alwaysShowCardButtons`
5. **`src/styles/theme/node.css`** — Conditionally show red border only when `escapeDiscardsChanges: true`
6. **E2E tests** — Update `card-hotkeys.spec.ts` and `text-area.spec.ts`

## UI Label

"Escape discards unsaved changes"
