# Remove Discard Workflow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the two-step discard workflow. Escape key should always save changes and exit edit mode, without requiring confirmation.

**Architecture:** Simplify `cancelChanges` to directly call `saveNodeContent`. Remove the `pendingConfirmation.disableEdit` state that triggers the red border and enables discard. Update all callers and UI components that depend on this state.

**Tech Stack:** TypeScript, Svelte, Obsidian Plugin API

---

## File Structure

### Files to Modify:
1. `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts` - Simplify to save instead of discard
2. `src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts` - Update Escape handler
3. `src/stores/view/view-reducer.ts` - Remove `view/editor/disable/confirm` action handler
4. `src/stores/view/view-store-actions.ts` - Remove `disable/confirm` action type
5. `src/stores/view/reducers/document/reset-pending-confirmation.ts` - Simplify (disableEdit always null)
6. `src/stores/view/view-state-type.ts` - Remove `pendingConfirmation.disableEdit` from type
7. `src/view/components/container/column/components/group/group.svelte` - Remove `confirmDisableEdit` prop
8. `src/view/components/container/column/components/group/components/card/card.svelte` - Remove `confirmDisableEdit` prop and red border logic
9. `src/styles/theme/node.css` - Remove `.node-border--discard` class
10. `src/view/components/container/left-sidebar/components/recent-cards/recent-cards.svelte` - Remove confirmDisableEdit
11. `src/view/components/container/left-sidebar/components/pinned-cards/pinned-cards-sidebar.svelte` - Remove confirmDisableEdit
12. `src/view/components/container/container.svelte` - Remove pendingConfirmation prop passed to children
13. `e2e/helpers/interactions/lineage-view/hotkeys/discard-changes-using-hotkey.ts` - Rename and change to single Escape
14. `e2e/helpers/interactions/lineage-view/hotkeys/discard-input-changes.ts` - Rename and update behavior
15. `e2e/tests/card-hotkeys.spec.ts` - Update test that uses discardChangesUsingHotkey
16. `e2e/tests/text-area.spec.ts` - Update tests that use discardChangesUsingHotkey

---

## Chunk 1: Core Logic Changes

### Task 1: Update cancel-changes.ts

**Files:**
- Modify: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`

- [ ] **Step 1: Read current implementation**

```typescript
// Current implementation (lines 1-29)
export const cancelChanges = (view: LineageView) => {
    const documentViewState = view.viewStore.getValue().document;
    if (documentViewState.pendingConfirmation.disableEdit) {
        view.inlineEditor.unloadNode(undefined, true);
        if (documentViewState.editing.isInSidebar) {
            view.viewStore.dispatch({
                type: 'view/editor/disable-sidebar-editor',
            });
        } else {
            view.viewStore.dispatch({
                type: 'view/editor/disable-main-editor',
            });
        }
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
};
```

- [ ] **Step 2: Replace with simplified version that always saves**

```typescript
import { saveNodeContent } from './save-node-content';
import { LineageView } from 'src/view/view';

export const cancelChanges = (view: LineageView) => {
    saveNodeContent(view);
};
```

- [ ] **Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts
git commit -m "refactor: simplify cancelChanges to always save instead of discard"
```

### Task 2: Update edit-commands.ts

**Files:**
- Modify: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts:74-82`

- [ ] **Step 1: Read current implementation**

```typescript
{
    name: 'disable_edit_mode',
    callback: (view) => {
        cancelChanges(view);
    },
    hotkeys: [
        { key: 'Escape', modifiers: [], editorState: 'editor-on' },
    ],
},
```

- [ ] **Step 2: No change needed** - callback already calls cancelChanges which we simplified

- [ ] **Step 3: Commit**

```bash
git add src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts
git commit -m "chore: edit-commands unchanged - cancelChanges now saves instead"
```

### Task 3: Update view-state-type.ts

**Files:**
- Modify: `src/stores/view/view-state-type.ts`

- [ ] **Step 1: Read current pendingConfirmation type (around line 100)**

```typescript
pendingConfirmation: {
    disableEdit: string | null;
    deleteNode: Set<string>;
};
```

- [ ] **Step 2: Remove disableEdit field**

```typescript
pendingConfirmation: {
    deleteNode: Set<string>;
};
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/view/view-state-type.ts
git commit -m "refactor: remove pendingConfirmation.disableEdit from state type"
```

### Task 4: Update view-store-actions.ts

**Files:**
- Modify: `src/stores/view/view-store-actions.ts`

- [ ] **Step 1: Read current file to find disable/confirm action (around line 80)**

```typescript
| { type: 'view/editor/disable/confirm'; payload: { id: string } }
```

- [ ] **Step 2: Remove the disable/confirm action type**

```typescript
// Remove this line:
// | { type: 'view/editor/disable/confirm'; payload: { id: string } }
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/view/view-store-actions.ts
git commit -m "refactor: remove view/editor/disable/confirm action type"
```

### Task 5: Update view-reducer.ts

**Files:**
- Modify: `src/stores/view/view-reducer.ts:125-129`

- [ ] **Step 1: Read current implementation**

```typescript
} else if (action.type === 'view/editor/disable/confirm') {
    state.document.pendingConfirmation = {
        ...state.document.pendingConfirmation,
        disableEdit: action.payload.id,
    };
}
```

- [ ] **Step 2: Remove the disable/confirm handler (entire block)**

Delete lines 125-129.

- [ ] **Step 3: Commit**

```bash
git add src/stores/view/view-reducer.ts
git commit -m "refactor: remove disable/confirm reducer handler"
```

### Task 6: Update reset-pending-confirmation.ts

**Files:**
- Modify: `src/stores/view/reducers/document/reset-pending-confirmation.ts`

- [ ] **Step 1: Read current implementation**

```typescript
export const resetPendingConfirmation = (
    state: Pick<DocumentViewState, 'pendingConfirmation'>,
) => {
    state.pendingConfirmation = {
        disableEdit: null,
        deleteNode: new Set(),
    };
};
```

- [ ] **Step 2: Remove disableEdit from reset**

```typescript
export const resetPendingConfirmation = (
    state: Pick<DocumentViewState, 'pendingConfirmation'>,
) => {
    state.pendingConfirmation = {
        deleteNode: new Set(),
    };
};
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/view/reducers/document/reset-pending-confirmation.ts
git commit -m "refactor: remove disableEdit reset from pendingConfirmation"
```

---

## Chunk 2: UI Component Updates

### Task 7: Update card.svelte

**Files:**
- Modify: `src/view/components/container/column/components/group/components/card/card.svelte`

- [ ] **Step 1: Read current confirmDisableEdit usage (lines 24, 59-62)**

```svelte
export let confirmDisableEdit: boolean;
// ...
confirmDelete
    ? 'node-border--delete'
    : confirmDisableEdit
      ? 'node-border--discard'
      : editing
        ? 'node-border--editing'
```

- [ ] **Step 2: Remove confirmDisableEdit export and usages**

Remove line 24: `export let confirmDisableEdit: boolean;`

Change lines 59-62 to:
```svelte
confirmDelete
    ? 'node-border--delete'
    : editing
      ? 'node-border--editing'
      : selected
        ? 'node-border--selected'
```

- [ ] **Step 3: Commit**

```bash
git add src/view/components/container/column/components/group/components/card/card.svelte
git commit -m "refactor: remove confirmDisableEdit from card component"
```

### Task 8: Update group.svelte

**Files:**
- Modify: `src/view/components/container/column/components/group/group.svelte`

- [ ] **Step 1: Read current confirmDisableEdit prop (lines 71-73)**

```svelte
confirmDisableEdit={
    editedNodeState.activeNodeId === node &&
    pendingConfirmation.disableEdit === node &&
    !editedNodeState.isInSidebar
}
```

- [ ] **Step 2: Remove confirmDisableEdit prop entirely**

Delete lines 71-73.

- [ ] **Step 3: Commit**

```bash
git add src/view/components/container/column/components/group/group.svelte
git commit -m "refactor: remove confirmDisableEdit prop from group component"
```

### Task 9: Update recent-cards.svelte

**Files:**
- Modify: `src/view/components/container/left-sidebar/components/recent-cards/recent-cards.svelte`

- [ ] **Step 1: Read current confirmDisableEdit usage (lines 70-72)**

```svelte
confirmDisableEdit={$editingStateStore.activeNodeId === node &&
    $pendingConfirmation.disableEdit === node &&
    !$editingStateStore.isInSidebar}
```

- [ ] **Step 2: Remove confirmDisableEdit prop entirely**

Delete lines 70-72.

- [ ] **Step 3: Commit**

```bash
git add src/view/components/container/left-sidebar/components/recent-cards/recent-cards.svelte
git commit -m "refactor: remove confirmDisableEdit from recent-cards"
```

### Task 10: Update pinned-cards-sidebar.svelte

**Files:**
- Modify: `src/view/components/container/left-sidebar/components/pinned-cards/pinned-cards-sidebar.svelte`

- [ ] **Step 1: Read current confirmDisableEdit usage (lines 39-41)**

```svelte
confirmDisableEdit={$editingStateStore.activeNodeId === node &&
    $pendingConfirmation.disableEdit === node &&
    !$editingStateStore.isInSidebar}
```

- [ ] **Step 2: Remove confirmDisableEdit prop entirely**

Delete lines 39-41.

- [ ] **Step 3: Commit**

```bash
git add src/view/components/container/left-sidebar/components/pinned-cards/pinned-cards-sidebar.svelte
git commit -m "refactor: remove confirmDisableEdit from pinned-cards-sidebar"
```

### Task 11: Update container.svelte

**Files:**
- Modify: `src/view/components/container/container.svelte`

- [ ] **Step 1: Read current pendingConfirmation usage (lines 73, 139)**

```svelte
const pendingConfirmation = PendingConfirmationStore(view);
// ...
<Group
    ...
    pendingConfirmation={$pendingConfirmation}
```

- [ ] **Step 2: Remove pendingConfirmation prop passed to Group**

Change line 139 to remove the `pendingConfirmation={$pendingConfirmation}` prop.

- [ ] **Step 3: Commit**

```bash
git add src/view/components/container/container.svelte
git commit -m "refactor: remove pendingConfirmation prop from container"
```

### Task 12: Remove node-border--discard from CSS

**Files:**
- Modify: `src/styles/theme/node.css`

- [ ] **Step 1: Read current .node-border--discard styles (lines 93-95, 111-113)**

```css
.node-border--discard {
    border-left: 5px #ff3b3b solid;
}
```

And:
```css
.lineage-view:not(:focus-within) {
    ...
    & .node-border--discard {
        border-left-color: #e8314660;
    }
}
```

- [ ] **Step 2: Remove both .node-border--discard blocks**

Delete lines 93-95 and lines 111-113.

- [ ] **Step 3: Commit**

```bash
git add src/styles/theme/node.css
git commit -m "refactor: remove .node-border--discard CSS styles"
```

---

## Chunk 3: E2E Test Updates

### Task 13: Update discard-changes-using-hotkey helper

**Files:**
- Modify: `e2e/helpers/interactions/lineage-view/hotkeys/discard-changes-using-hotkey.ts`

- [ ] **Step 1: Read current implementation**

```typescript
export const discardChangesUsingHotkey = async () => {
    await __obsidian__.waitForSelector(LINEAGE_CARD_ACTIVE);
    await __obsidian__.keyboard.press('Escape');
    await __obsidian__.keyboard.press('Escape');
    await delay(SHORT);
};
```

- [ ] **Step 2: Rename file and update to single Escape (now saves)**

Create new file `e2e/helpers/interactions/lineage-view/hotkeys/save-and-exit-card.ts`:

```typescript
import { delay, SHORT } from '../../../general/delay';
import { __obsidian__ } from '../../../getters/obsidian/load-obsidian';
import { LINEAGE_CARD_ACTIVE } from '../../../getters/lineage-view/card/get-active-card';

export const saveAndExitCard = async () => {
    await __obsidian__.waitForSelector(LINEAGE_CARD_ACTIVE);
    await __obsidian__.keyboard.press('Escape');
    await delay(SHORT);
};
```

- [ ] **Step 3: Delete old file**

```bash
rm e2e/helpers/interactions/lineage-view/hotkeys/discard-changes-using-hotkey.ts
```

- [ ] **Step 4: Commit**

```bash
git add e2e/helpers/interactions/lineage-view/hotkeys/
git commit -m "refactor: rename discardChangesUsingHotkey to saveAndExitCard (single Escape)"
```

### Task 14: Update discard-input-changes helper

**Files:**
- Modify: `e2e/helpers/interactions/lineage-view/hotkeys/discard-input-changes.ts`

- [ ] **Step 1: Read current implementation**

```typescript
import { __obsidian__ } from '../../../getters/obsidian/load-obsidian';

export const discardInputChanges = async () => {
    await __obsidian__.keyboard.press('Escape');
};
```

- [ ] **Step 2: Rename to saveInputChanges**

Create new file `e2e/helpers/interactions/lineage-view/hotkeys/save-input-changes.ts`:

```typescript
import { __obsidian__ } from '../../../getters/obsidian/load-obsidian';

export const saveInputChanges = async () => {
    await __obsidian__.keyboard.press('Escape');
};
```

- [ ] **Step 3: Delete old file**

```bash
rm e2e/helpers/interactions/lineage-view/hotkeys/discard-input-changes.ts
```

- [ ] **Step 4: Commit**

```bash
git add e2e/helpers/interactions/lineage-view/hotkeys/
git commit -m "refactor: rename discardInputChanges to saveInputChanges"
```

### Task 15: Update card-hotkeys.spec.ts

**Files:**
- Modify: `e2e/tests/card-hotkeys.spec.ts`

- [ ] **Step 1: Read test that uses discardChangesUsingHotkey (lines 25-41)**

```typescript
test('save card, edit card and discard changes using hotkey', async () => {
    const n1 = text();
    await typeText(n1);
    await saveCardUsingHotkey();

    const n1_b = text(1);
    await editCardUsingHotkey();
    await typeText(n1_b);
    await saveCardUsingHotkey();

    const n1_c = text(1);
    await editCardUsingHotkey();
    await typeText(n1_c);
    await discardChangesUsingHotkey();

    expect(await getTextsOfColumns()).toEqual([[n1 + n1_b]]);
});
```

- [ ] **Step 2: Update import**

Change line 6 from:
```typescript
import { discardChangesUsingHotkey } from '../helpers/interactions/lineage-view/hotkeys/discard-changes-using-hotkey';
```
to:
```typescript
import { saveAndExitCard } from '../helpers/interactions/lineage-view/hotkeys/save-and-exit-card';
```

- [ ] **Step 3: Update test to verify SAVE behavior (not discard)**

```typescript
test('edit card and save using Escape', async () => {
    const n1 = text();
    await typeText(n1);
    await saveCardUsingHotkey();

    const n1_b = text(1);
    await editCardUsingHotkey();
    await typeText(n1_b);
    await saveCardUsingHotkey();

    const n1_c = text(1);
    await editCardUsingHotkey();
    await typeText(n1_c);
    await saveAndExitCard();

    // Now changes ARE saved (unlike old discard behavior)
    expect(await getTextsOfColumns()).toEqual([[n1 + n1_b + n1_c]]);
});
```

- [ ] **Step 4: Update line 363 where discardInputChanges is used**

Change:
```typescript
import { discardInputChanges } from '../helpers/interactions/lineage-view/hotkeys/discard-input-changes';
```
to:
```typescript
import { saveInputChanges } from '../helpers/interactions/lineage-view/hotkeys/save-input-changes';
```

And change usage from `discardInputChanges()` to `saveInputChanges()`.

- [ ] **Step 5: Commit**

```bash
git add e2e/tests/card-hotkeys.spec.ts
git commit -m "test: update card-hotkeys tests for new save behavior"
```

### Task 16: Update text-area.spec.ts

**Files:**
- Modify: `e2e/tests/text-area.spec.ts`

- [ ] **Step 1: Update import**

Change line 19 from:
```typescript
import { discardChangesUsingHotkey } from '../helpers/interactions/lineage-view/hotkeys/discard-changes-using-hotkey';
```
to:
```typescript
import { saveAndExitCard } from '../helpers/interactions/lineage-view/hotkeys/save-and-exit-card';
```

- [ ] **Step 2: Update test at line 66-86**

The test "deletion hotkeys should not work while editing" uses `discardChangesUsingHotkey()` at line 80. Since Escape now saves instead of discarding, the test needs updating.

Read current test:
```typescript
test('deletion hotkeys should not work while editing', async () => {
    const n1 = text();
    await typeTextAndSaveItUsingHotkey(n1);

    await addCardUsingHotkey('right');
    const n2 = text();
    await typeTextAndSaveItUsingHotkey(n2);

    expect(await getTextsOfColumns()).toEqual([[n1], [n2]]);

    await editCardUsingHotkey();
    await deleteCardUsingHotkey();

    await discardChangesUsingHotkey();

    expect(await getTextsOfColumns()).toEqual([[n1], [n2]]);

    await deleteCardUsingHotkey();
    expect(await getTextsOfColumns()).toEqual([[n1]]);
});
```

Change to:
```typescript
test('deletion hotkeys should not work while editing', async () => {
    const n1 = text();
    await typeTextAndSaveItUsingHotkey(n1);

    await addCardUsingHotkey('right');
    const n2 = text();
    await typeTextAndSaveItUsingHotkey(n2);

    expect(await getTextsOfColumns()).toEqual([[n1], [n2]]);

    await editCardUsingHotkey();
    await deleteCardUsingHotkey();

    await saveAndExitCard();

    // Since Escape now saves, deleteCardUsingHotkey was blocked
    // and content was saved, so n2 should still be there
    expect(await getTextsOfColumns()).toEqual([[n1], [n2]]);

    await deleteCardUsingHotkey();
    expect(await getTextsOfColumns()).toEqual([[n1]]);
});
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/text-area.spec.ts
git commit -m "test: update text-area tests for new save behavior"
```

---

## Chunk 4: Cleanup and Verification

### Task 17: Verify no remaining references to disableEdit

**Files:**
- Search for any remaining references

- [ ] **Step 1: Run grep to find any remaining disableEdit references**

```bash
grep -r "disableEdit" --include="*.ts" --include="*.svelte" src/ e2e/
```

- [ ] **Step 2: Fix any remaining references**

If any references remain, remove them.

- [ ] **Step 3: Commit any fixes**

```bash
git add .
git commit -m "fix: remove any remaining disableEdit references"
```

### Task 18: Run tests

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

- [ ] **Step 2: Run e2e tests**

```bash
npm run test:e2e
```

- [ ] **Step 3: Fix any failures**

- [ ] **Step 4: Commit final changes**

---

## Summary

After this change:
- **Escape key** = Save and exit edit mode (single press)
- **No more red border** = The `pendingConfirmation.disableEdit` state is removed
- **No more two-step discard** = The discard confirmation workflow is eliminated
- **Changes always persist** = When pressing Escape, content is always saved
