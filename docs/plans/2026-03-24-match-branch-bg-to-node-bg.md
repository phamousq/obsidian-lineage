# Match Active Branch Background to Active Node Background Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toggle in Appearance settings that when ON makes the active branch background color match the active node background color (they blend together), and when OFF uses the distinct branch color.

**Architecture:** Add a boolean setting `matchActiveNodeBackground` to `Settings.view`. When true, the CSS variable `--background-active-parent` is set to `var(--background-active-node)` instead of the user-defined `activeBranchBg`. When false, uses existing behavior.

**Tech Stack:** TypeScript, Obsidian API, Svelte

---

## Task 1: Add Setting to Settings Type

**File:** `src/stores/settings/settings-type.ts`

**Step 1: Add `matchActiveNodeBackground` to `Settings.view` type**

In the `Settings` type around line 51, add:

```typescript
view: {
    // ... existing fields ...
    escapeDiscardsChanges: boolean;
    matchActiveNodeBackground: boolean;  // NEW
    hiddenVerticalToolbarButtons: ToolbarButton[];
},
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/settings-type.ts
git commit -m "feat: add matchActiveNodeBackground setting type"
```

---

## Task 2: Add Default Value

**File:** `src/stores/settings/default-settings.ts`

**Step 1: Add default value**

Find the `DEFAULT_SETTINGS()` function and add `matchActiveNodeBackground: false` to the view object.

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/default-settings.ts
git commit -m "feat: add matchActiveNodeBackground default value"
```

---

## Task 3: Add Reducer Handler

**File:** `src/stores/settings/settings-reducer.ts`

**Step 1: Add reducer case**

Add a case for `'settings/view/set-match-active-node-background'`:

```typescript
} else if (action.type === 'settings/view/set-match-active-node-background') {
    state.view.matchActiveNodeBackground = action.payload.match;
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/settings-reducer.ts
git commit -m "feat: add reducer for matchActiveNodeBackground"
```

---

## Task 4: Add Action Type

**File:** `src/stores/settings/settings-store-actions.ts`

**Step 1: Add action type**

Add to the `SettingsStoreActions` union:

```typescript
| {
      type: 'settings/view/set-match-active-node-background';
      payload: {
          match: boolean;
      };
  }
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/settings-store-actions.ts
git commit -m "feat: add action type for matchActiveNodeBackground"
```

---

## Task 5: Add Lang Keys

**File:** `src/lang/lang.ts`

**Step 1: Add lang keys**

Add the following lang keys:
- `settings_match_active_node_bg` - "Match active node background"
- `settings_match_active_node_bg_desc` - "When enabled, the active branch background matches the active node background"

**Step 2: Verify key naming pattern by checking nearby keys**

**Step 3: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/lang/lang.ts
git commit -m "feat: add lang keys for matchActiveNodeBackground"
```

---

## Task 6: Create UI Component

**File:** `src/view/actions/settings/components/match-active-node-background.ts` (CREATE)

**Step 1: Create the component**

```typescript
import { SettingsStore } from 'src/main';
import { Setting } from 'obsidian';
import { lang } from 'src/lang/lang';

export const MatchActiveNodeBackground = (
    element: HTMLElement,
    settingsStore: SettingsStore,
) => {
    const settingsState = settingsStore.getValue();
    new Setting(element)
        .setName(lang.settings_match_active_node_bg)
        .setDesc(lang.settings_match_active_node_bg_desc)
        .addToggle((cb) => {
            cb.setValue(settingsState.view.matchActiveNodeBackground).onChange(
                (match) => {
                    settingsStore.dispatch({
                        type: 'settings/view/set-match-active-node-background',
                        payload: {
                            match,
                        },
                    });
                },
            );
        });
};
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/settings/components/match-active-node-background.ts
git commit -m "feat: add MatchActiveNodeBackground toggle component"
```

---

## Task 7: Register in Appearance Tab

**File:** `src/view/actions/settings/render-settings.ts`

**Step 1: Import and add to Appearance tab**

Add import:
```typescript
import { MatchActiveNodeBackground } from 'src/view/actions/settings/components/match-active-node-background';
```

Add to appearance tab rendering (after `ActiveBranchBackground`):
```typescript
MatchActiveNodeBackground(appearanceTab, settingsStore);
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/settings/render-settings.ts
git commit -m "feat: register MatchActiveNodeBackground in Appearance tab"
```

---

## Task 8: Apply CSS When Toggle Changes

**File:** `src/stores/view/subscriptions/effects/css-variables/apply-css-color.ts`

**Step 1: Modify to handle the toggle**

```typescript
import { LineageView } from 'src/view/view';
import { cssVariables } from 'src/stores/view/subscriptions/effects/css-variables/helpers/css-variables';

export const applyCssColor = (
    view: LineageView,
    name: keyof typeof cssVariables.colors,
) => {
    const target = view.contentEl;
    const settings = view.plugin.settings.getValue();
    const color = settings.view.theme[name];
    const matchActiveNode = settings.view.matchActiveNodeBackground;

    if (name === 'activeBranchBg' && matchActiveNode) {
        // When toggle is ON, use active node background
        target.style.setProperty(cssVariables.colors[name], 'var(--background-active-node)');
    } else if (color) {
        target.style.setProperty(cssVariables.colors[name], color);
    } else {
        target.style.removeProperty(cssVariables.colors[name]);
    }
};
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/view/subscriptions/effects/css-variables/apply-css-color.ts
git commit -m "feat: apply activeBranchBg as node background when toggle is on"
```

---

## Task 9: Build and Test

**Step 1: Run full build**

```bash
npm run build
```
Expected: Success

**Step 2: Test manually**
- Enable the toggle in Appearance settings
- Verify that active branch background matches active node background
- Disable the toggle
- Verify that distinct branch background color returns

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete match active node background feature"
```
