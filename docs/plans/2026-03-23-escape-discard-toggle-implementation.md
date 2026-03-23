# Escape Discard Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `escapeDiscardsChanges` setting to toggle between always-save escape and two-stage discard workflow.

**Architecture:** Add boolean setting to `Settings.view`, wire through settings store/reducer, branch in cancel-changes.ts, conditionally show red border CSS.

**Tech Stack:** TypeScript, Obsidian API, Svelte, Vitest, Playwright

---

## Task 1: Add Setting to Types

**File:** `src/stores/settings/settings-type.ts:69`

**Step 1: Add to Settings.view interface**

In the `view` object of `Settings` type (around line 69), add:

```typescript
escapeDiscardsChanges: boolean;
```

---

## Task 2: Add Default Value

**File:** `src/stores/settings/default-settings.ts:35`

**Step 1: Add default value**

In the `view` section of `DEFAULT_SETTINGS()` (around line 35, after `alwaysShowCardButtons`), add:

```typescript
escapeDiscardsChanges: false,
```

---

## Task 3: Add Settings Action

**File:** `src/stores/settings/settings-store-actions.ts`

**Step 1: Add action type**

In the `SettingsActions` type union (around line 170, after `set-always-show-card-buttons`), add:

```typescript
| {
      type: 'settings/view/set-escape-discards-changes';
      payload: {
          discard: boolean;
      };
  }
```

---

## Task 4: Add Reducer Handler

**File:** `src/stores/settings/settings-reducer.ts`

**Step 1: Add reducer case**

Around line 200, after `set-always-show-card-buttons` handler, add:

```typescript
} else if (action.type === 'settings/view/set-escape-discards-changes') {
    store.view.escapeDiscardsChanges = action.payload.discard;
}
```

---

## Task 5: Create Settings UI Component

**Files:**
- Create: `src/view/actions/settings/components/escape-discards-changes.ts`
- Modify: `src/view/actions/settings/render-settings.ts:46`

**Step 1: Create component**

Create `src/view/actions/settings/components/escape-discards-changes.ts`:

```typescript
import { SettingsStore } from 'src/main';
import { Setting } from 'obsidian';
import { lang } from 'src/lang/lang';

export const EscapeDiscardsChanges = (
    element: HTMLElement,
    settingsStore: SettingsStore,
) => {
    const settingsState = settingsStore.getValue();
    new Setting(element)
        .setName(lang.settings_escape_discards_changes)
        .setDesc(lang.settings_escape_discards_changes_desc)
        .addToggle((cb) => {
            cb.setValue(settingsState.view.escapeDiscardsChanges).onChange(
                (discard) => {
                    settingsStore.dispatch({
                        type: 'settings/view/set-escape-discards-changes',
                        payload: {
                            discard,
                        },
                    });
                },
            );
        });
};
```

**Step 2: Add to render-settings.ts**

In `render-settings.ts`, import the new component and add it after `AlwaysShowCardButtons`:

```typescript
import { EscapeDiscardsChanges } from 'src/view/actions/settings/components/escape-discards-changes';
```

And in the `render` function, after line 46 (`AlwaysShowCardButtons(generalTab, settingsStore);`), add:

```typescript
EscapeDiscardsChanges(generalTab, settingsStore);
```

---

## Task 6: Add Lang Keys

**File:** Find the lang file (likely `src/lang/lang.ts` or similar)

**Step 1: Add lang keys**

Add these keys to the `lang` object:
```typescript
settings_escape_discards_changes: 'Escape discards unsaved changes',
settings_escape_discards_changes_desc: 'When enabled, pressing Escape twice without typing will discard changes',
```

---

## Task 7: Modify Cancel Changes Logic

**File:** `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`

**Step 1: Modify cancelChanges function**

Read the current implementation and modify to check the setting. The function should:

- Get `escapeDiscardsChanges` from the view's settings store
- If `true`: Use the existing two-stage discard flow (first escape sets warning, second discards)
- If `false`: Always save (call `unloadNode(undefined, false)` directly)

Approach: Read the setting at the start of the function and branch:

```typescript
export const cancelChanges = (view: LineageView) => {
    const documentViewState = view.viewStore.getValue().document;
    const settings = view.plugin.settings.getValue();
    const escapeDiscardsChanges = settings.view.escapeDiscardsChanges;

    if (escapeDiscardsChanges) {
        // Existing two-stage discard logic
        if (documentViewState.pendingConfirmation.disableEdit) {
            view.inlineEditor.unloadNode(undefined, true);
            // ... rest of existing logic
        } else {
            // ... existing confirmation flow
        }
    } else {
        // Always save
        view.inlineEditor.unloadNode(undefined, false);
        view.viewStore.dispatch({
            type: documentViewState.editing.isInSidebar
                ? 'view/editor/disable-sidebar-editor'
                : 'view/editor/disable-main-editor',
        });
    }
};
```

---

## Task 8: Conditionally Show Red Border

**Files:**
- Modify: `src/styles/theme/node.css`
- Modify: `src/view/components/container/column/components/group/components/card/card.svelte`
- Modify: `src/view/components/container/column/components/group/components/group.svelte`

**Step 1: Modify CSS**

In `node.css`, the red border rule `.node-border--discard` currently always applies. We need to conditionally apply it only when `escapeDiscardsChanges` is true. However, CSS can't read settings directly - we need to add a class or style.

**Approach:** Pass the setting as a prop to the card component and conditionally apply the discard class.

In `card.svelte` and `group.svelte`, read the `escapeDiscardsChanges` setting from the view settings store and conditionally pass `confirmDisableEdit` prop or apply the CSS class.

The existing flow uses `pendingConfirmation.disableEdit` to show red border. We should only set this state when `escapeDiscardsChanges` is true. This means modifying where `pendingConfirmation.disableEdit` gets set - which is in `cancel-changes.ts` when `escapeDiscardsChanges` is true.

**Step 2: Conditionally set pendingConfirmation.disableEdit**

In `cancel-changes.ts`, only dispatch `view/editor/disable/confirm` when `escapeDiscardsChanges` is true:

```typescript
if (escapeDiscardsChanges) {
    // Only set up confirmation flow when discard is enabled
    if (documentViewState.pendingConfirmation.disableEdit) {
        view.inlineEditor.unloadNode(undefined, true);
        // ... existing disable logic
    } else {
        view.inlineEditor.onNextChange(() => {
            view.viewStore.dispatch({
                type: 'view/editor/disable/reset-confirmation',
            });
        });
        view.viewStore.dispatch({
            type: 'view/editor/disable/confirm',
            payload: {
                id: documentViewState.editing.activeNodeId,
            },
        });
    }
} else {
    // Always save - no confirmation flow
    view.inlineEditor.unloadNode(undefined, false);
    view.viewStore.dispatch({
        type: documentViewState.editing.isInSidebar
            ? 'view/editor/disable-sidebar-editor'
            : 'view/editor/disable-main-editor',
    });
}
```

This way, when `escapeDiscardsChanges` is false, `pendingConfirmation.disableEdit` is never set, so the red border never appears.

---

## Task 9: Update E2E Tests

**Files:**
- Modify: `e2e/tests/card-hotkeys.spec.ts`
- Modify: `e2e/tests/text-area.spec.ts`

**Step 1: Add test for new setting behavior**

Create a test that:
1. Sets `escapeDiscardsChanges: true`
2. Tests the two-stage discard behavior
3. Sets `escapeDiscardsChanges: false`
4. Tests that escape always saves

The existing tests from the `feat/remove-discard-workflow` branch should be adapted to test both states.

---

## Task 10: Build and Verify

**Step 1: Run build**

```bash
npm run build
```

Expected: Success with no errors

**Step 2: Run tests**

```bash
npm run test
npm run test:e2e
```

Expected: All tests pass
