# Obsidian-Lineage Plugin Documentation

## Overview

**Obsidian-Lineage** is an Obsidian plugin that provides a Gingko-like card/outline interface for editing markdown documents. Documents are organized as a tree of cards (nodes) with parent-child relationships that can be navigated spatially (vim-like HJKL), edited inline, rearranged, and exported back to standard markdown.

- **Repository**: `/Users/quintonpham/Code/obsidian-lineage`
- **Main entry point**: `src/main.ts`
- **Version**: 0.8.5

---

## 1. Menu Items

### 1.1 Ribbon Icon

**File**: `src/main.ts:108-118`

| Icon | Action | Keyboard Shortcut |
|------|--------|-------------------|
| Custom "cards" icon | **Toggle Lineage view** - Opens active file in Lineage view, or creates new Lineage document if no file active | None |

```typescript
private loadRibbonIcon() {
    this.addRibbonIcon(
        customIcons.cards.name,
        'Toggle Lineage view',
        () => {
            const file = getActiveFile(this);
            if (file) toggleFileViewType(this, file, undefined);
            else createLineageDocument(this);
        },
    );
}
```

### 1.2 File Context Menu (Right-click on file)

**Files**: 
- `src/obsidian/events/workspace/register-file-menu-event.ts`
- `src/obsidian/events/workspace/context-menu-itetms/add-toggle-view-menu-item.ts`

| Menu Item | Action | Condition |
|-----------|--------|-----------|
| **Open in Lineage** | Opens file in Lineage card view | Markdown files (.md) |
| **Open in editor** | Switches back to standard editor | When already in Lineage view |
| **Import from Gingko** | Imports JSON files from Gingko app | Only shown when ALL selected files are .json |

### 1.3 Folder Context Menu (Right-click on folder)

**File**: `src/obsidian/events/workspace/context-menu-itetms/add-folder-context-menu-items.ts`

| Menu Item | Action |
|-----------|--------|
| **New document** | Creates new Lineage document in the folder |

### 1.4 Files Context Menu (Multi-select)

**File**: `src/obsidian/events/workspace/register-files-menu-event.ts`

| Menu Item | Action | Condition |
|-----------|--------|-----------|
| **Import from Gingko** | Batch import multiple JSON files | Only when ALL selected items are .json files |

### 1.5 View Context Menu (Right-click on view background)

**File**: `src/view/actions/context-menu/view-context-menu/show-view-context-menu.ts`

| Menu Item | Action |
|-----------|--------|
| **Format headings** | Formats headings in the document (disabled if no headings) |
| **Document Format** submenu | Changes how document is serialized |
| → Format: HTML elements (experimental) | Use `<section>` tags |
| → Format: HTML comments | Use `<!-- -->` markers |
| → Format: outline | Use outline format |
| **Export document** | Exports entire document |
| **Eject document** | Removes document from Lineage (dangerous - deletes all Lineage metadata) |

### 1.6 Card/Node Context Menu (Right-click on card)

**Files**: 
- `src/view/actions/context-menu/card-context-menu/show-node-context-menu.ts`
- `src/view/actions/context-menu/card-context-menu/create-single-node-context-menu-items.ts`
- `src/view/actions/context-menu/card-context-menu/create-multiple-nodes-context-menu.ts`
- `src/view/actions/context-menu/card-context-menu/create-sidebar-context-menu-items.ts`

#### Single Node Selected:

| Menu Item | Action |
|-----------|--------|
| **Split section** | Splits node at cursor position into two siblings |
| **Sort subsections** submenu | Sort child nodes |
| → Ascending order | Sort children A-Z |
| → Descending order | Sort children Z-A |
| **Merge with branch above** | Merge with previous sibling |
| **Merge with branch below** | Merge with next sibling |
| **Copy link to block** | Copy wiki link to block |
| **Copy** (if no children) | Copy section only |
| **Copy** (if has children) submenu | Multiple copy options |
| → Copy branch | Copy with all children |
| → Copy branch as plain text | Copy without formatting |
| → Copy sections | Copy only this node (no children) |
| **Cut** | Cut branch to clipboard |
| **Paste** | Paste branch from clipboard |
| **Pin in left sidebar** / **Unpin from left sidebar** | Toggle pin state |
| **Extract branch** | Extract branch (with children) to new document |
| **Extract section** | Extract this node only to new document |
| **Export section** / **Export** submenu | Export options |

#### Multiple Nodes Selected:

| Menu Item | Action |
|-----------|--------|
| **Copy** submenu | |
| → Copy branches | Copy selected branches with children |
| → Copy branches as plain text | Unformatted copy |
| → Copy sections | Copy nodes only (no children) |
| **Cut** | Cut selected branches |
| **Export** submenu | |
| → Export branches | With subitems |
| → Export sections | Without subitems |

#### Sidebar Context Menu:

| Menu Item | Action |
|-----------|--------|
| **Copy link to block** | Copy link to block |
| **Copy** | Copy node content |
| **Pin in left sidebar** / **Unpin from left sidebar** | Toggle pin (disabled in recent cards) |

---

## 2. Keyboard Shortcuts

### 2.1 Command Palette Commands

**File**: `src/obsidian/commands/add-commands.ts`

| Command Name | Action | Keyboard Shortcut |
|--------------|--------|-------------------|
| `toggle-lineage-view` | Toggle between Lineage and editor view | None |
| `create-new-document` | Create new Lineage document | None |
| `toggle-horizontal-scrolling-mode` | Toggle always center card horizontally | None |
| `toggle-vertical-scrolling-mode` | Toggle always center card vertically | None |
| `split-section` | Open split node modal | None |
| `sort-subsections-ascending-order` | Sort children ascending | None |
| `sort-subsections-descending-order` | Sort children descending | None |
| `copy-link-to-block` | Copy link to block | None |
| `toggle-pin-section-in-left-sidebar` | Toggle pin in sidebar | None |
| `extract-branch-to-new-document` | Extract branch to new file | None |
| `export-branches` | Export branches with subitems | None |
| `export-sections` | Export sections without subitems | None |
| `export-document` | Export entire document | None |
| `eject-document` | Remove from Lineage view | None |
| `toggle-minimap` | Toggle document minimap | None |
| `toggle-left-sidebar` | Toggle left sidebar | None |
| `toggle-space-between-cards` | Toggle spacing between cards | None |

### 2.2 View Keyboard Shortcuts (Inside Lineage View)

**Files**: 
- `src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys.ts` - entry point
- `src/view/actions/keyboard-shortcuts/helpers/commands/commands/*.ts` - individual command files

**How hotkeys work:**
- Hotkeys are registered via `viewHotkeys` dictionary
- Commands have `editorState` condition: `editor-on`, `editor-off`, or `both`
- `editor-on`: only active when inline editor is open
- `editor-off`: only active when inline editor is closed
- `both`: always active

**Escape key behavior:**
- When `editor-on`: calls `cancelChanges()` in `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`
  - First Escape: sets `pendingConfirmation.disableEdit = nodeId`
  - Second Escape (before content change): calls `unloadNode(undefined, true)` which **discards changes**
- When `editor-off`: calls `handleEscapeKey()` in `src/view/actions/on-escape/helpers/handle-escape-key.ts`
  - Closes modals/sidebars
  - Clears selection
  - Clears search

#### Navigation Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Go right | `L` or `ArrowRight` | editor-off |
| Go left | `H` or `ArrowLeft` | editor-off |
| Go down | `J` or `ArrowDown` | editor-off |
| Go up | `K` or `ArrowUp` | editor-off |
| Select parent | `G` | editor-off |
| Select next section | `N` | editor-off |
| Select previous section | `B` | editor-off |
| Go to start of group | `PageUp` | editor-off |
| Go to end of group | `PageDown` | editor-off |
| Go to start of column | `Home` | editor-off |
| Go to end of column | `End` | editor-off |
| Navigate back | `Alt+J` | both |
| Navigate forward | `Alt+K` | both |

#### Edit Commands

| Action | Shortcut | Editor State | File |
|--------|----------|-------------|------|
| Edit section | `Enter` | editor-off | `edit-commands.ts:5-21` |
| Edit section, cursor at start | `Shift+Enter` | editor-off | `edit-commands.ts:23-42` |
| Edit section, cursor at end | `Alt+Enter` | editor-off | `edit-commands.ts:44-59` |
| Save changes and exit | `Shift+Mod+Enter` | editor-on | `edit-commands.ts:61-72` |
| Cancel changes | `Escape` | editor-on | `edit-commands.ts:74-82` |

**Save vs Cancel flow:**
- `saveNodeContent()` (`src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/save-node-content.ts`) - saves content and calls `unloadNode()`
- `cancelChanges()` (`src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`) - discards or confirms discard

#### Create Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Add section above | `Mod+ArrowUp` | editor-off |
| Add section below | `Mod+ArrowDown` | editor-off |
| Add subsection (child) | `Mod+ArrowRight` | editor-off |
| Add parent sibling | `Mod+ArrowLeft` or `Mod+H` | editor-off/both |
| Add above and split | `Mod+Shift+K` | both |
| Add below and split | `Mod+Shift+J` | both |
| Add child and split | `Mod+Shift+L` | both |

#### Selection Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Select all sections | `Mod+A` | editor-off |
| Extend selection up | `Shift+K` or `Shift+ArrowUp` | editor-off |
| Extend selection down | `Shift+J` or `Shift+ArrowDown` | editor-off |
| Extend to start of column | `Shift+Home` | editor-off |
| Extend to end of column | `Shift+End` | editor-off |
| Extend to start of group | `Shift+PageUp` | editor-off |
| Extend to end of group | `Shift+PageDown` | editor-off |

#### Move Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Move branch up | `Alt+Shift+K` or `Alt+Shift+ArrowUp` | both |
| Move branch down | `Alt+Shift+J` or `Alt+Shift+ArrowDown` | both |
| Move branch right | `Alt+Shift+L` or `Alt+Shift+ArrowRight` | both |
| Move branch left | `Alt+Shift+H` or `Alt+Shift+ArrowLeft` | both |

#### Merge Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Merge with branch above | `Mod+Shift+K` or `Mod+Shift+ArrowUp` | editor-off |
| Merge with branch below | `Mod+Shift+J` or `Mod+Shift+ArrowDown` | editor-off |

#### Clipboard Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Copy branch | `Mod+C` | editor-off |
| Copy branch as plain text | `Mod+Alt+C` | editor-off |
| Copy section | `Mod+Shift+C` | editor-off |
| Cut branch | `Mod+X` | editor-off |
| Paste branch | `Mod+V` | editor-off |

#### History Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Undo change | `Mod+Z` | editor-off |
| Redo change | `Mod+Y` or `Mod+Shift+Z` | editor-off |

#### Scroll Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Scroll left | `Mod+Alt+H` | both |
| Scroll right | `Mod+Alt+L` | both |
| Scroll up | `Mod+Alt+K` | both |
| Scroll down | `Mod+Alt+J` | both |
| Center active branch | `Mod+Alt+G` | both |

#### Zoom Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Zoom in | `Mod+=` | both |
| Zoom out | `Mod+-` | both |
| Reset zoom | `Mod+0` | both |

#### Outline Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Toggle outline mode | `Alt+O` | both |
| Collapse/expand section | `Alt+=` | both |
| Collapse/expand all | `Mod+Alt+=` | both |

#### Search Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Toggle search | `/` | editor-off |
| Toggle search | `Alt+F` | both |

#### Delete Commands

| Action | Shortcut | Editor State |
|--------|----------|--------------|
| Delete section | `Mod+Backspace` | editor-off |

---

## 3. Main Functionality

### 3.1 Core Concepts

Lineage displays markdown as a **tree of cards**. Each card (node) has:
- **content**: The markdown text content
- **children**: Array of child nodes
- **parent**: Reference to parent node
- **metadata**: ID, cursor position, pin state, etc.

### 3.2 Document Serialization

Lineage stores its tree structure in the markdown file using special markers. Three formats are supported:

**HTML Elements (experimental)** - `src/lib/serialization/serialize/document/format/html-elements.ts`
```html
<section id="node-id">
  Content here
  <section id="child-id">
    Child content
  </section>
</section>
```

**HTML Comments** - `src/lib/serialization/serialize/document/format/html-comments.ts`
```markdown
<!-- id:node-id -->
Content here
<!-- id:child-id -->
Child content
<!-- /id:node-id -->
<!-- /id:child-id -->
```

**Outline** - `src/lib/serialization/serialize/document/format/outline.ts`
```markdown
- Content here
  - Child content
```

### 3.3 Key State Management

**File**: `src/stores/view/view-state-type.ts`

The view state is managed via a Svelte store with these main sections:

```typescript
interface ViewState {
    document: {
        activeNode: string | null;        // Currently focused node ID
        selectedNodes: Set<string>;        // Multi-select state
        editing: {
            activeNodeId: string | null;   // Node being edited
            isInSidebar: boolean;          // Editing in sidebar?
        };
        pendingConfirmation: {
            disableEdit: string | null;    // Node awaiting escape confirmation
            deleteNode: Set<string>;        // Nodes pending deletion
        };
    };
    ui: {
        controls: {
            showHelpSidebar: boolean;
            showHistorySidebar: boolean;
            showSettingsSidebar: boolean;
            showStyleRulesModal: boolean;
        };
    };
    search: {
        query: string;
        showInput: boolean;
    };
}
```

### 3.4 Node Operations

#### Create Node
**Files**: 
- `src/view/actions/keyboard-shortcuts/helpers/commands/commands/create-commands.ts`

Creates new nodes via `addNode()` in `src/view/actions/node-tree/manipulation/add-node.ts`

#### Edit Node
**Files**:
- `src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts`
- `src/view/actions/editor/enable-editor.ts`
- `src/view/actions/editor/disable-editor.ts`

Uses CodeMirror 6 for inline editing (`src/obsidian/helpers/inline-editor/inline-editor.ts`)

#### Delete Node
**Files**:
- `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/delete-node.ts`

Uses confirmation flow to prevent accidental deletion.

#### Split Node
**Files**:
- `src/view/actions/node-tree/manipulation/split-node.ts`

Divides a node at the current cursor position into two sibling nodes.

#### Merge Nodes
**Files**:
- `src/view/actions/node-tree/manipulation/merge-nodes.ts`

Combines two adjacent sibling nodes.

#### Move Node
**Files**:
- `src/view/actions/node-tree/manipulation/move-node.ts`

Changes node position via `reorderChildren()` in `src/view/actions/node-tree/reorder/reorder-children.ts`.

### 3.5 Architecture Overview

```
src/
├── main.ts                           # Plugin entry point, ribbon icon
├── obsidian/
│   ├── commands/
│   │   └── add-commands.ts           # Command palette registration
│   ├── context-menu/
│   │   └── ...                       # Context menu handlers
│   ├── events/workspace/
│   │   ├── register-file-menu-event.ts
│   │   └── context-menu-itetms/      # File/folder menu items
│   └── helpers/
│       └── inline-editor/
│           └── inline-editor.ts     # CodeMirror editor wrapper
├── view/
│   ├── actions/
│   │   ├── context-menu/            # Card/view context menus
│   │   ├── keyboard-shortcuts/       # All hotkey handlers
│   │   │   ├── view-hotkeys-action.ts  # Main hotkey dispatcher
│   │   │   └── helpers/commands/commands/
│   │   │       ├── edit-commands.ts
│   │   │       ├── create-commands.ts
│   │   │       ├── navigation-commands.ts
│   │   │       └── ...
│   │   └── node-tree/               # Node CRUD operations
│   ├── components/                   # Svelte UI components
│   └── view.ts                       # LineageView class
├── stores/
│   ├── document/                     # Document state
│   ├── view/
│   │   ├── view-store.ts            # Main view store
│   │   ├── view-reducer.ts          # State reducer
│   │   └── view-state-type.ts       # State type definitions
│   └── settings/                    # Plugin settings
└── lib/
    └── serialization/                # Document parsing/serialization
```

---

## 4. Important Implementation Details

### 4.1 Escape Key Flow (Critical for Understanding Revert Behavior)

**File**: `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`

When you press Escape while editing:

1. **First Escape** (when `pendingConfirmation.disableEdit` is null):
   - Dispatches `view/editor/disable/confirm` → sets `pendingConfirmation.disableEdit = nodeId`
   - Sets up `onNextChange` listener to reset confirmation on any content change
   - Does NOT yet exit edit mode or discard changes

2. **Second Escape** (or any subsequent Escape before content change):
   - `pendingConfirmation.disableEdit` is truthy
   - Directly calls `unloadNode(undefined, true)` with `discardChanges = true`
   - **Changes are DISCARDED without saving**

3. **If user types anything** after first Escape:
   - The `onNextChange` callback fires
   - Resets `pendingConfirmation.disableEdit` to null
   - Normal save/disable flow proceeds on next Escape

### 4.2 Inline Editor Lifecycle

**File**: `src/obsidian/helpers/inline-editor/inline-editor.ts`

```typescript
unloadNode(nodeId?: string, discardChanges = false) {
    const currentNodeId = this.nodeId;
    if (nodeId && nodeId !== currentNodeId) return;
    if (currentNodeId && !discardChanges) {
        this.saveContent();  // Only saves if discardChanges is false
        const cursor = this.getCursor();
        this.cursorPositions.set(currentNodeId, cursor);
    }
    // ... cleanup editor DOM and subscriptions
}
```

### 4.3 The Red Border Indicator (Discard Warning)

When editing a node, pressing Escape once triggers a red vertical border on the left side of the card. This is a **warning indicator** that you've initiated the discard changes flow.

#### Visual Appearance

**File**: `src/styles/theme/node.css:93-95`
```css
.node-border--discard {
    border-left: 5px #ff3b3b solid;
}
```

#### Where the Indicator Logic Lives

**1. Card Component** - `src/view/components/container/column/components/group/components/card/card.svelte:59-62`
```svelte
confirmDelete
    ? 'node-border--delete'
    : confirmDisableEdit              // <-- Red border when true
      ? 'node-border--discard'
      : editing
        ? 'node-border--editing'
```

**2. Group Component** - `src/view/components/container/column/components/group/group.svelte:71-73`
```svelte
confirmDisableEdit={
    editedNodeState.activeNodeId === node &&    // Node is being edited
    pendingConfirmation.disableEdit === node && // <-- This triggers red border
    !editedNodeState.isInSidebar
}
```

**3. View Reducer** - `src/stores/view/view-reducer.ts:125-129`
```typescript
} else if (action.type === 'view/editor/disable/confirm') {
    state.document.pendingConfirmation = {
        ...state.document.pendingConfirmation,
        disableEdit: action.payload.id,  // <-- Set to the nodeId
    };
}
```

#### Complete Flow: How Red Border Connects to Save State

| Step | Action | Code Location | Result |
|------|--------|---------------|--------|
| 1 | Press Escape | `edit-commands.ts:74-82` | Calls `cancelChanges()` |
| 2 | First Escape | `cancel-changes.ts:22-28` | Dispatches `view/editor/disable/confirm` with nodeId |
| 3 | State update | `view-reducer.ts:125-129` | Sets `pendingConfirmation.disableEdit = nodeId` |
| 4 | Red border appears | `group.svelte:71-73` | `confirmDisableEdit = true` |
| 5 | User types | CodeMirror `onChange` | `onNextChange` callback fires, resets `pendingConfirmation.disableEdit = null` |
| 6 | Next Escape | `cancel-changes.ts:16-17` | `unloadNode()` called with `discardChanges=false` → **SAVES** |

| Step | Action | Code Location | Result |
|------|--------|---------------|--------|
| 5 | (No typing) Second Escape | `cancel-changes.ts:5-6` | `unloadNode(undefined, true)` called with `discardChanges=true` |
| 6 | Changes discarded | `inline-editor.ts:132` | `saveContent()` is **SKIPPED** |

#### Summary

The red border is a **visual warning** that you've pressed Escape once and are in "pending discard" mode:
- **First Escape**: Red border appears. Changes are NOT yet discarded. Type anything to cancel the pending discard.
- **Second Escape** (without typing): Changes are DISCARDED.
- **Navigate away** (without typing): `disableEditMode()` is called which resets `pendingConfirmation.disableEdit`, then component unmounts, calling `unloadNode()` with `discardChanges=false` → **SAVES**.

### 4.4 Adding a New Keyboard Shortcut

1. Create or find the command file in `src/view/actions/keyboard-shortcuts/helpers/commands/commands/`
2. Export a command object with:
   ```typescript
   {
       name: 'command-name',
       callback: (view: LineageView, event?: KeyboardEvent) => void,
       hotkeys: [
           { key: 'Key', modifiers: ['Mod', 'Shift'], editorState: 'editor-off' }
       ]
   }
   ```
3. Register it in the appropriate command aggregator (e.g., `edit-commands.ts`, `navigation-commands.ts`)
4. Add to command palette in `src/obsidian/commands/add-commands.ts` if desired

### 4.5 Adding a Context Menu Item

1. **For card/node context menu**: Add to `src/view/actions/context-menu/card-context-menu/create-single-node-context-menu-items.ts`
2. **For view context menu**: Add to `src/view/actions/context-menu/view-context-menu/show-view-context-menu.ts`

Context menu items follow this structure:
```typescript
{
    title: 'Menu Item Text',
    icon?: 'icon-name',
    action: (nodeId: string) => void,
    condition?: (nodeId: string) => boolean
}
```
