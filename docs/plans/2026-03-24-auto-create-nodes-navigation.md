# Auto-Create Empty Nodes on Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toggle in General settings. When enabled, navigating down/right (J, L, arrows) on nodes without children/siblings creates an empty auto-created node. Auto-created empty nodes show red border (pending delete style) and are deleted when navigated away if still empty.

**Architecture:** Add `autoCreateEmptyNodes: boolean` to Settings.view. Modify navigation commands to check if target exists. If not and toggle is ON, create empty node marked as `autoCreatedEmptyNodeId`. When navigating away, check if node is empty and delete it.

**Tech Stack:** TypeScript, Obsidian API

---

## Task 1: Add `autoCreateEmptyNodes` to Settings Type

**Files:**
- Modify: `src/stores/settings/settings-type.ts`

**Step 1: Add to Settings.view type**

In `Settings.view` type (around line 51-72), add:
```typescript
autoCreateEmptyNodes: boolean;
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/settings-type.ts
git commit -m "feat: add autoCreateEmptyNodes setting type"
```

---

## Task 2: Add Default Value

**Files:**
- Modify: `src/stores/settings/default-settings.ts`

**Step 1: Add default value**

In `DEFAULT_SETTINGS()`, add `autoCreateEmptyNodes: false` to view object.

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/default-settings.ts
git commit -m "feat: add autoCreateEmptyNodes default value"
```

---

## Task 3: Add Reducer Handler

**Files:**
- Modify: `src/stores/settings/settings-reducer.ts`

**Step 1: Add reducer case**

Add case for `'settings/view/set-auto-create-empty-nodes'`:
```typescript
} else if (action.type === 'settings/view/set-auto-create-empty-nodes') {
    state.view.autoCreateEmptyNodes = action.payload.autoCreate;
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/settings-reducer.ts
git commit -m "feat: add reducer for autoCreateEmptyNodes"
```

---

## Task 4: Add Action Type

**Files:**
- Modify: `src/stores/settings/settings-store-actions.ts`

**Step 1: Add action type**

Add to `SettingsStoreActions` union:
```typescript
| {
      type: 'settings/view/set-auto-create-empty-nodes';
      payload: {
          autoCreate: boolean;
      };
  }
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/stores/settings/settings-store-actions.ts
git commit -m "feat: add action type for autoCreateEmptyNodes"
```

---

## Task 5: Add Lang Keys

**Files:**
- Modify: `src/lang/lang.ts`

**Step 1: Add lang keys**

Add:
- `settings_auto_create_empty_nodes`: "Auto-create empty nodes on navigation"
- `settings_auto_create_empty_nodes_desc`: "When navigating down or right at the last node, create an empty node. Empty auto-created nodes are deleted when navigated away."

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/lang/lang.ts
git commit -m "feat: add lang keys for autoCreateEmptyNodes"
```

---

## Task 6: Create UI Component

**Files:**
- Create: `src/view/actions/settings/components/auto-create-empty-nodes.ts`

**Step 1: Create component**

```typescript
import { SettingsStore } from 'src/main';
import { Setting } from 'obsidian';
import { lang } from 'src/lang/lang';

export const AutoCreateEmptyNodes = (
    element: HTMLElement,
    settingsStore: SettingsStore,
) => {
    const settingsState = settingsStore.getValue();
    new Setting(element)
        .setName(lang.settings_auto_create_empty_nodes)
        .setDesc(lang.settings_auto_create_empty_nodes_desc)
        .addToggle((cb) => {
            cb.setValue(settingsState.view.autoCreateEmptyNodes).onChange(
                (autoCreate) => {
                    settingsStore.dispatch({
                        type: 'settings/view/set-auto-create-empty-nodes',
                        payload: {
                            autoCreate,
                        },
                    });
                },
            );
        });
};
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/settings/components/auto-create-empty-nodes.ts
git commit -m "feat: add AutoCreateEmptyNodes toggle component"
```

---

## Task 7: Register in General Tab

**Files:**
- Modify: `src/view/actions/settings/render-settings.ts`

**Step 1: Add import and register**

Add import:
```typescript
import { AutoCreateEmptyNodes } from 'src/view/actions/settings/components/auto-create-empty-nodes';
```

Add to general tab (after `EscapeDiscardsChanges`):
```typescript
AutoCreateEmptyNodes(generalTab, settingsStore);
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/settings/render-settings.ts
git commit -m "feat: register AutoCreateEmptyNodes in General tab"
```

---

## Task 8: Add `autoCreatedEmptyNodeId` State

**Files:**
- Modify: `src/stores/view/view-state-type.ts`
- Modify: `src/stores/view/default-view-state.ts`
- Modify: `src/stores/view/view-store-actions.ts`
- Modify: `src/stores/view/view-reducer.ts`

**Step 1: Add to ViewDocumentState type**

In `PendingDocumentConfirmation` type (around line 30), add:
```typescript
autoCreatedEmptyNodeId: string | null;
```

**Step 2: Add to default state**

In `default-view-state.ts`, add `autoCreatedEmptyNodeId: null` to pendingConfirmation.

**Step 3: Add action types**

In `view-store-actions.ts`, add:
```typescript
| {
      type: 'view/document/set-auto-created-empty-node';
      payload: { nodeId: string };
  }
| {
      type: 'view/document/clear-auto-created-empty-node';
  }
```

**Step 4: Add reducer handlers**

In `view-reducer.ts`, add:
```typescript
} else if (action.type === 'view/document/set-auto-created-empty-node') {
    state.document.pendingConfirmation.autoCreatedEmptyNodeId = action.payload.nodeId;
} else if (action.type === 'view/document/clear-auto-created-empty-node') {
    state.document.pendingConfirmation.autoCreatedEmptyNodeId = null;
```

**Step 5: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add src/stores/view/view-state-type.ts src/stores/view/default-view-state.ts src/stores/view/view-store-actions.ts src/stores/view/view-reducer.ts
git commit -m "feat: add autoCreatedEmptyNodeId state"
```

---

## Task 9: Apply Red Border Style to Auto-Created Nodes

**Files:**
- Modify: `src/styles/theme/node.css`
- Modify: `src/view/components/container/column/components/group/components/card/card.svelte`
- Modify: `src/view/components/container/column/components/group/group.svelte`

**Step 1: Add CSS class**

In `node.css`, add:
```css
.node-border--auto-created {
    border-left: 5px #ef4444 solid;
}
```

**Step 2: Apply class in card.svelte**

Read the `pendingConfirmation` from store and apply class when nodeId matches `autoCreatedEmptyNodeId`.

**Step 3: Apply class in group.svelte**

Same logic for group styling.

**Step 4: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add src/styles/theme/node.css src/view/components/container/column/components/group/components/card/card.svelte src/view/components/container/column/components/group/group.svelte
git commit -m "feat: add red border style for auto-created nodes"
```

---

## Task 10: Create Navigation Helper

**Files:**
- Create: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/auto-create-node-on-navigation.ts`

**Step 1: Create helper**

```typescript
import { LineageView } from 'src/view/view';
import { AllDirections } from 'src/stores/document/document-store-actions';
import { saveNodeAndInsertNode } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/save-node-and-insert-node';
import { findNextActiveNodeOnKeyboardNavigation } from 'src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation';

export const autoCreateNodeOnNavigation = (
    view: LineageView,
    direction: 'down' | 'right',
): boolean => {
    const settings = view.plugin.settings.getValue();
    if (!settings.view.autoCreateEmptyNodes) return false;

    const documentState = view.documentStore.getValue();
    const viewState = view.viewStore.getValue();

    const nextNode = findNextActiveNodeOnKeyboardNavigation(
        documentState.columns,
        viewState.document.activeNode,
        direction,
        viewState.document.activeNodesOfColumn,
        viewState.outline.collapsedParents,
    );

    if (nextNode) return false; // Navigation target exists

    // Create empty node
    saveNodeAndInsertNode(view, direction);

    // Get new active node and mark as auto-created
    const newNodeId = view.viewStore.getValue().document.activeNode;
    view.viewStore.dispatch({
        type: 'view/document/set-auto-created-empty-node',
        payload: { nodeId: newNodeId },
    });

    return true;
};
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/auto-create-node-on-navigation.ts
git commit -m "feat: add auto-create node on navigation helper"
```

---

## Task 11: Modify Navigation Commands

**Files:**
- Modify: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/navigate-commands.ts`

**Step 1: Modify go_down command**

```typescript
{
    name: 'go_down',
    callback: (view, event) => {
        event.preventDefault();
        if (!outlineModeSelector(view)) {
            const created = autoCreateNodeOnNavigation(view, 'down');
            if (!created) {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                spatialNavigation(view, 'down');
            }
        } else {
            sequentialNavigation(view, 'forward');
        }
    },
    hotkeys: [
        { key: 'J', modifiers: [], editorState: 'editor-off' },
        { key: 'ArrowDown', modifiers: [], editorState: 'editor-off' },
    ],
},
```

**Step 2: Modify go_right command**

Similar logic for `go_right` with `autoCreateNodeOnNavigation(view, 'right')`.

**Step 3: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/navigate-commands.ts
git commit -m "feat: modify navigation commands for auto-create"
```

---

## Task 12: Handle Navigation Away from Auto-Created Empty Nodes

**Files:**
- Modify: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/navigate-commands.ts`

**Step 1: Add logic to clear auto-created flag**

In `go_down`, `go_right`, `go_up`, `go_left` callbacks, before clearing pending delete:

```typescript
// Check if leaving an auto-created empty node
const pendingAutoCreated = viewState.document.pendingConfirmation.autoCreatedEmptyNodeId;
if (pendingAutoCreated && pendingAutoCreated !== viewState.document.activeNode) {
    // Check if node is empty
    const node = view.documentStore.getValue().content[pendingAutoCreated];
    if (node && !node.content.trim()) {
        // Delete the empty node
        view.documentStore.dispatch({
            type: 'document/delete-node',
            payload: { activeNodeId: pendingAutoCreated },
        });
    } else {
        // Node has content, just clear the flag
        view.viewStore.dispatch({
            type: 'view/document/clear-auto-created-empty-node',
        });
    }
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/navigate-commands.ts
git commit -m "feat: handle navigation away from auto-created empty nodes"
```

---

## Task 13: Clear Auto-Created Flag When Typing

**Files:**
- Modify: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts` (or wherever edit mode is enabled)

**Step 1: Clear flag when entering edit mode**

In the callback for `enable_edit_mode`, add:
```typescript
view.viewStore.dispatch({
    type: 'view/document/clear-auto-created-empty-node',
});
```

**Step 2: Run build**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts
git commit -m "feat: clear auto-created flag when typing"
```

---

## Task 14: Build and Test

**Step 1: Run full build**

```bash
npm run build
```
Expected: Success

**Step 2: Test manually**
- Enable toggle in General settings
- Navigate to last node
- Press J/Down - should create empty node with red border
- Navigate away without typing - should delete node
- Type content then navigate away - node should stay

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete auto-create empty nodes on navigation"
```
