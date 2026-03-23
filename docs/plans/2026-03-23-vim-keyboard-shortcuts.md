# Vim Keyboard Shortcuts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add vim-style keyboard shortcuts "i", "a", and "d" to the Lineage view.

**Architecture:** Add new command entries to the existing hotkey system. "i" and "a" reuse existing edit callbacks. "d" requires a new two-stage delete workflow (mark then delete) similar to vim's dd.

**Tech Stack:** TypeScript, Obsidian API, CodeMirror 6, Vitest, Playwright

---

## Task 1: Add "i" and "a" Hotkeys

**File:** `src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts`

**Step 1: Add "i" (insert) hotkey**

In the `editCommands` function, add a new command for "i" key that calls `enable_edit_mode`:

```typescript
{
    name: 'enable_edit_mode',
    callback: (view, event) => {
        event.preventDefault();
        view.viewStore.dispatch({
            type: 'view/editor/enable-main-editor',
            payload: {
                nodeId: view.viewStore.getValue().document.activeNode,
            },
        });
    },
    hotkeys: [
        { key: 'Enter', modifiers: [], editorState: 'editor-off' },
        { key: 'i', modifiers: [], editorState: 'editor-off' }, // NEW
    ],
},
```

**Step 2: Run type check**

Run: `npm run build` (TypeScript check is included)
Expected: No errors related to edit-commands.ts

**Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts
git commit -m "feat: add 'i' keybinding for edit mode"
```

---

## Task 2: Add "a" (append) Hotkey

**File:** `src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts`

**Step 1: Add "a" (append) hotkey**

Add `KeyA` to the existing `enable_edit_mode_and_place_cursor_at_end` command's hotkeys array:

```typescript
{
    name: 'enable_edit_mode_and_place_cursor_at_end',
    callback: (view, event) => {
        event.preventDefault();
        const nodeId = view.viewStore.getValue().document.activeNode;
        view.inlineEditor.deleteNodeCursor(nodeId);
        view.viewStore.dispatch({
            type: 'view/editor/enable-main-editor',
            payload: {
                nodeId: nodeId,
            },
        });
    },
    hotkeys: [
        { key: 'Enter', modifiers: ['Alt'], editorState: 'editor-off' },
        { key: 'a', modifiers: [], editorState: 'editor-off' }, // NEW
    ],
},
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts
git commit -m "feat: add 'a' keybinding for append mode"
```

---

## Task 3: Add View State for Delete Confirmation

**File:** `src/stores/view/view-state-type.ts`

**Step 1: Add pendingDelete state**

In the `PendingDocumentConfirmation` type (around line 10), add:

```typescript
export type PendingDocumentConfirmation = {
    disableEdit: string | null;
    deleteNode: Set<string>;
    pendingDelete: string | null; // NEW: node marked for deletion
};
```

**Step 2: Add to view reducer default state**

**File:** `src/stores/view/default-view-state.ts`

Add `pendingDelete: null` to the `document` state.

**Step 3: Add reducer action for pending delete**

**File:** `src/stores/view/view-reducer.ts`

Add a case to handle `'view/document/set-pending-delete'` action:

```typescript
} else if (action.type === 'view/document/set-pending-delete') {
    state.document.pendingConfirmation.pendingDelete = action.payload.nodeId;
} else if (action.type === 'view/document/clear-pending-delete') {
    state.document.pendingConfirmation.pendingDelete = null;
}
```

**Step 4: Add action types**

**File:** `src/stores/view/view-store-actions.ts`

Add to the ViewStoreActions union:

```typescript
| {
      type: 'view/document/set-pending-delete';
      payload: { nodeId: string };
  }
| {
      type: 'view/document/clear-pending-delete';
  }
```

**Step 5: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add src/stores/view/view-state-type.ts src/stores/view/default-view-state.ts src/stores/view/view-reducer.ts src/stores/view/view-store-actions.ts
git commit -m "feat: add pending delete state for vim-style delete"
```

---

## Task 4: Create Delete Mark Command

**File:** `src/view/actions/keyboard-shortcuts/helpers/commands/commands/delete-commands.ts` (CREATE NEW)

**Step 1: Create delete-commands.ts**

Create the new file with vim-style delete behavior:

```typescript
import { LineageView } from 'src/view/view';
import { DefaultViewCommand } from 'src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys';

const maintainEditMode = (view: LineageView) =>
    view.plugin.settings.getValue().view.maintainEditMode;

export const deleteCommands = () => {
    return [
        {
            name: 'mark_for_delete',
            callback: (view, event) => {
                event.preventDefault();
                const viewState = view.viewStore.getValue();
                const pendingDelete = viewState.document.pendingConfirmation.pendingDelete;
                const activeNode = viewState.document.activeNode;

                if (pendingDelete === activeNode) {
                    // Second press - delete the node
                    view.viewStore.dispatch({
                        type: 'view/document/set-pending-delete',
                        payload: { nodeId: activeNode },
                    });
                    // Actually perform the delete
                    view.viewStore.dispatch({
                        type: 'view/document/delete',
                        payload: { nodeId: activeNode },
                    });
                    view.viewStore.dispatch({
                        type: 'view/document/clear-pending-delete',
                    });
                } else {
                    // First press - mark for deletion
                    view.viewStore.dispatch({
                        type: 'view/document/set-pending-delete',
                        payload: { nodeId: activeNode },
                    });
                }
            },
            hotkeys: [
                { key: 'd', modifiers: [], editorState: 'editor-off' },
            ],
        },
    ] satisfies DefaultViewCommand[];
};
```

**Step 2: Register commands**

**File:** `src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys.ts`

Find where all view commands are aggregated and add `deleteCommands()` to the list.

**Step 3: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/delete-commands.ts
git commit -m "feat: add vim-style 'd' delete keybinding"
```

---

## Task 5: Add Visual Indicator for Delete Mark

**File:** `src/view/components/container/column/components/group/components/card/components/card-style.svelte`

**Step 1: Add pending delete styling**

Add a CSS class `.node-border--pending-delete` with a yellow/red border to indicate a node is marked for deletion.

**File:** `src/styles/theme/node.css`

Add:

```css
.node-border--pending-delete {
    border-left: 5px #f59e0b solid;
}
```

**Step 2: Apply class conditionally**

In `card.svelte` and `group.svelte`, read `pendingConfirmation.pendingDelete` and apply the `.node-border--pending-delete` class when the node is marked for deletion.

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/styles/theme/node.css
git commit -m "feat: add visual indicator for pending delete"
```

---

## Task 6: Clear Pending Delete on Navigation

**File:** `src/view/actions/keyboard-shortcuts/helpers/commands/navigate-commands.ts`

**Step 1: Clear pending delete on navigation**

In each navigation command callback (go_right, go_left, go_down, go_up, etc.), add:

```typescript
view.viewStore.dispatch({
    type: 'view/document/clear-pending-delete',
});
```

This ensures pressing "d" then navigating away clears the pending delete state.

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/navigate-commands.ts
git commit -m "feat: clear pending delete on navigation"
```

---

## Task 7: Build and Test

**Step 1: Run full build**

```bash
npm run build
```
Expected: Success

**Step 2: Run unit tests**

```bash
npm run test
```
Expected: All tests pass

**Step 3: Manual testing**

Copy built plugin to Obsidian vault and test:
- Press "i" on a card → should enter edit mode
- Press "a" on a card → should enter edit mode with cursor at end
- Press "d" once → card should show yellow border (pending delete)
- Press "d" again → card should be deleted
- Press "d" then navigate away → pending delete should clear
