
# Lineage

Lineage is an Obsidian plugin that allows you to edit markdown files in a [gingko-like](https://gingkowriter.com/) interface. It displays markdown as a tree of cards (nodes) with parent-child relationships, enabling hierarchical outlining and document organization.

![](https://raw.githubusercontent.com/ycnmhd/obsidian-lineage/docs/docs/media/screenshot.png)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Selection System](#selection-system)
- [Architecture Overview](#architecture-overview)
- [Development](#development)
- [Key Files Reference](#key-files-reference)

---

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open Obsidian
2. Go to Settings → Community Plugins
3. Search for "Lineage"
4. Install and enable

### From Source

```bash
git clone https://github.com/ycnmhd/obsidian-lineage.git
cd obsidian-lineage
npm install
npm run build
```

Copy `temp/vault/.obsidian/plugins/lineage-dev/main.js` to your vault's `.obsidian/plugins/lineage/` folder, or symlink the directory.

---

## Usage

To open a file in Lineage view:
- Click the ribbon icon in the left sidebar
- Right-click a file in the file explorer → "Open with Lineage"
- Use the command palette (`Ctrl/Cmd+P`) → "Lineage: Open file"

To export changes:
- Right-click the Lineage view → "Export to markdown"

---

## Keyboard Shortcuts

> **Note:** `Mod` = `Cmd` (macOS) / `Ctrl` (Windows/Linux)

### Navigation

| Action | Shortcut |
|--------|----------|
| Go Right | `L` or `→` |
| Go Left | `H` or `←` |
| Go Down | `J` or `↓` |
| Go Up | `K` or `↑` |
| Go to Parent | `G` |
| Go to Next Node | `N` |
| Go to Previous Node | `B` |
| Go to Beginning of Group | `PageUp` |
| Go to End of Group | `PageDown` |
| Go to Beginning of Column | `Home` |
| Go to End of Column | `End` |
| Navigate Back | `Alt+J` |
| Navigate Forward | `Alt+K` |

### Selection

| Action | Shortcut |
|--------|----------|
| Select All (in group → column → all) | `Mod+A` |
| Extend Selection Up | `Shift+K` or `Shift+↑` |
| Extend Selection Down | `Shift+J` or `Shift+↓` |
| Extend to Start of Column | `Shift+Home` |
| Extend to End of Column | `Shift+End` |
| Extend to Start of Group | `Shift+PageUp` |
| Extend to End of Group | `Shift+PageDown` |

### Editing

| Action | Shortcut |
|--------|----------|
| Enter Edit Mode | `Enter` or `I` |
| Edit + Cursor at Start | `Shift+Enter` |
| Edit + Cursor at End | `Alt+Enter` or `A` |
| Save & Exit Card | `Shift+Mod+Enter` |
| Exit Edit Mode (Save) | `Escape` |
| Exit Edit Mode (Discard, if enabled) | `Escape` (two-stage) |

### Creating Nodes

| Action | Shortcut |
|--------|----------|
| Add Node Below | `Mod+↓` or `O` |
| Add Node Above | `Mod+↑` |
| Add Child | `Mod+→` |
| Add Parent Sibling | `Mod+←` or `Mod+H` |
| Add Below & Split | `Mod+J` |
| Add Above & Split | `Mod+K` |
| Add Child & Split | `Mod+L` |

### Moving Nodes

| Action | Shortcut |
|--------|----------|
| Move Node Up | `Alt+Shift+K` or `Alt+Shift+↑` |
| Move Node Down | `Alt+Shift+J` or `Alt+Shift+↓` |
| Move Node Right | `Alt+Shift+L` or `Alt+Shift+→` |
| Move Node Left | `Alt+Shift+H` or `Alt+Shift+←` |

### Merging Nodes

| Action | Shortcut |
|--------|----------|
| Merge with Node Above | `Mod+Shift+K` or `Mod+Shift+↑` |
| Merge with Node Below | `Mod+Shift+J` or `Mod+Shift+↓` |

### Clipboard

| Action | Shortcut |
|--------|----------|
| Copy Node (with branch) | `Mod+C` |
| Copy Node Unformatted | `Mod+Alt+C` |
| Copy Node Without Subitems | `Mod+Shift+C` |
| Cut Node | `Mod+X` |
| Paste Node | `Mod+V` |

### History

| Action | Shortcut |
|--------|----------|
| Undo | `Mod+Z` |
| Redo | `Mod+Y` or `Mod+Shift+Z` |

### Zoom

| Action | Shortcut |
|--------|----------|
| Zoom In | `Mod+=` |
| Zoom Out | `Mod+-` |
| Reset Zoom | `Mod+0` |

### Scroll View

| Action | Shortcut |
|--------|----------|
| Scroll Up | `Mod+Alt+K` |
| Scroll Down | `Mod+Alt+J` |
| Scroll Left | `Mod+Alt+H` |
| Scroll Right | `Mod+Alt+L` |
| Center Active Node | `Mod+Alt+G` |

### Other

| Action | Shortcut |
|--------|----------|
| Delete Card | `Backspace` or `D` |
| Toggle Search | `/` or `Alt+F` |
| Toggle Outline Mode | `Alt+O` |
| Toggle Collapse | `Alt+=` |
| Toggle Collapse All | `Mod+Alt+=` |

### Hotkey Presets

The plugin supports alternative presets (configurable in settings):
- **Alt as Primary Modifier**: Uses `Alt` as the main modifier instead of `Mod`
- **Navigate While Editing**: Uses `Alt+Shift+Arrow keys` to navigate while editing

---

## Selection System

### Visual Indicators

| State | Left Border Color |
|-------|-------------------|
| Single Active Node | **Green** (`--lineage-accent`) |
| Multi-Selected Node | **Blue** (`--lineage-color-selection`) |
| Editing | **Gray** |
| Pending Discard | **Red** |
| Pending Delete | **Orange** |

### How Selection Works

#### Single Node Click
When you click a node:
1. `resetSelectionState()` clears `selectedNodes`
2. The clicked node becomes `activeNode`
3. Only `activeNode` gets the green border

#### Shift+Click Multi-Select
When you shift-click to navigate:
1. `updateSelectedNodes()` calculates the range from `previousActiveNode` to `newActiveNode`
2. All nodes in that range are added to `selectedNodes`
3. Each selected node gets the blue border

#### Select All (`Mod+A`)
Pressing `Mod+A` cycles through selection scopes:
1. **First press**: Selects all nodes in current **group**
2. **Second press**: Selects all nodes in current **column**
3. **Third press**: Selects all nodes in **first column** (root level)

### Two-Stage Delete

The delete operation uses a two-stage confirmation:
1. First press of `D` or `Backspace` marks the node with orange border
2. Second press confirms deletion

---

## Architecture Overview

### Project Structure

```
obsidian-lineage/
├── src/
│   ├── main.ts                    # Plugin entry point
│   ├── helpers/                   # Utility functions
│   ├── lang/                      # Localization (hotkey groups, labels)
│   ├── lib/                       # Core library code
│   │   └── store/                 # Redux-like state management
│   ├── obsidian/                  # Obsidian API integration
│   │   ├── commands/              # Command palette entries
│   │   ├── events/                # Workspace events
│   │   └── helpers/               # Obsidian helpers
│   ├── stores/                    # Application state (Redux-like)
│   │   ├── document/              # Document tree state
│   │   ├── plugin/                # Plugin state
│   │   ├── settings/              # User preferences
│   │   └── view/                  # View state (selection, UI, etc.)
│   ├── styles/                   # CSS stylesheets
│   └── view/                     # UI layer (Svelte components)
│       ├── actions/               # User interactions
│       │   ├── keyboard-shortcuts/
│       │   ├── context-menu/
│       │   ├── click-and-drag/
│       │   └── inline-editor/
│       ├── components/            # Svelte UI components
│       ├── helpers/              # View helpers
│       └── modals/               # Modal dialogs
├── e2e/                         # End-to-end tests (Playwright)
├── temp/vault/                  # Development vault for testing
└── docs/                        # Documentation
```

### State Management

The plugin uses a custom Redux-like store pattern with the following stores:

#### Plugin Store (`src/stores/plugin/`)
- Tracks open documents
- Manages active views
- Handles vault events

#### Settings Store (`src/stores/settings/`)
- User preferences
- Style rules
- View settings
- Serialization format configuration

#### View Store (`src/stores/view/`)
- **activeNode**: Currently focused node
- **selectedNodes**: Set of multi-selected nodes
- **editing**: Inline editor state
- **search**: Search query and results
- **navigationHistory**: Back/forward navigation

### Document Model

Nodes are stored in a nested structure:

```typescript
interface Column {
  id: string;
  groups: Group[];
}

interface Group {
  id: string;
  nodes: string[];  // Node IDs in display order
}

interface Node {
  id: string;
  content: string;
  parentId: string | null;
  childIds: string[];
  // ...
}
```

### Serialization Formats

Lineage stores tree structure in markdown via three formats (configured in settings):

1. **HTML Comments** (default): `<!-- id:node-id -->content<!-- /id:node-id -->`
2. **HTML Elements**: `<section id="node-id">content</section>`
3. **Outline**: Indented `- content` markdown

---

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
git clone https://github.com/ycnmhd/obsidian-lineage.git
cd obsidian-lineage
npm install
```

### Build Commands

```bash
npm run dev      # Development build (outputs to temp/vault/.obsidian/plugins/lineage-dev/)
npm run build    # Full build: type check + svelte-check + production bundle
npm run lint     # ESLint on src/
npm run test     # Unit tests (vitest run)
npm run test:watch  # Unit tests in watch mode
npm run test:e2e    # End-to-end tests (playwright)
npm run version  # Bump version and update manifest/versions
```

### Development Workflow

This project uses a skill-driven development workflow:

1. **Brainstorming** → Validate ideas before implementation
2. **Writing Plans** → Create detailed, bite-sized implementation plans
3. **Git Worktrees** → Isolated workspaces for feature development
4. **Subagent-Driven Development** → Task-by-task implementation with reviews

**Important:** Feature branches use git worktrees created directly in `temp/vault/.obsidian/plugins/` with the naming convention `lineage-<branch-name>`.

```bash
# Create feature branch and worktree
git checkout -b feat/my-feature
mkdir -p temp/vault/.obsidian/plugins/lineage-my-feature
# Copy plugin files there, or symlink src for development
npm run build    # Build outputs to temp/vault/.obsidian/plugins/lineage-dev/
```

### Testing

```bash
npm test                 # Unit tests (vitest run)
npm run test -- path    # Run specific test file
npm run test:watch      # Unit tests in watch mode
npm run test:e2e        # End-to-end tests (playwright)
```

- Unit tests use vitest with `*.spec.ts` pattern co-located with source files
- E2E tests use Playwright in `e2e/` directory
- Some tests use jsdom for DOM simulation

---

## Key Files Reference

### Core

| File | Purpose |
|------|---------|
| `src/main.ts` | `Lineage` class - Plugin entry point, registers views/commands |
| `src/view/view.ts` | `LineageView` class - Obsidian view implementation |

### State Management

| File | Purpose |
|------|---------|
| `src/stores/view/view-state-type.ts` | View state type definitions |
| `src/stores/view/view-reducer.ts` | View state reducer (main state transitions) |
| `src/stores/view/view-store-actions.ts` | All action type definitions |
| `src/stores/document/document-state-type.ts` | Document tree type definitions |

### Selection

| File | Purpose |
|------|---------|
| `src/stores/view/view-state-type.ts` | `selectedNodes: Set<string>` definition |
| `src/stores/view/reducers/document/helpers/reset-selection-state.ts` | Clears selection |
| `src/stores/view/reducers/document/helpers/update-selected-nodes.ts` | Shift-click multi-select logic |
| `src/stores/view/reducers/selection/select-all-nodes.ts` | `Mod+A` select all |

### Keyboard Shortcuts

| File | Purpose |
|------|---------|
| `src/view/actions/keyboard-shortcuts/view-hotkeys-action.ts` | Main keyboard event handler |
| `src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys.ts` | All hotkey command definitions |
| `src/view/actions/keyboard-shortcuts/helpers/keyboard-events/event-to-string.ts` | Converts events to uppercase strings |
| `src/lang/hotkey-groups.ts` | Groups commands for settings UI |
| `src/lang/hotkeys-lang.ts` | Maps command names to display labels |

### Card Component

| File | Purpose |
|------|---------|
| `src/view/components/container/column/components/group/components/card/card.svelte` | Main card component |
| `src/styles/theme/node.css` | Card styling (borders, backgrounds) |

### Escape Key Behavior

| File | Purpose |
|------|---------|
| `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts` | Escape key discard flow |
| `src/stores/view/view-state-type.ts` | `pendingConfirmation` type |

### Delete Node (Two-Stage)

| File | Purpose |
|------|---------|
| `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/delete-node.ts` | Two-stage delete flow |
| `src/stores/view/view-state-type.ts` | `pendingConfirmation.deleteNode` type |

### Serialization

| File | Purpose |
|------|---------|
| `src/lib/serialization/` | Markdown serialization/deserialization |

### Context Menus

| File | Purpose |
|------|---------|
| `src/view/actions/context-menu/card-context-menu/create-single-node-context-menu-items.ts` | Card right-click menu |
| `src/view/actions/context-menu/view-context-menu/show-view-context-menu.ts` | View right-click menu |

---

## Adding New Features

### New Keyboard Shortcut

1. Create command in `src/view/actions/keyboard-shortcuts/helpers/commands/commands/`
2. Define with uppercase key (e.g., `'I'` not `'i'`)
3. Export object with `name` (must exist in `hotkeysLang`), `callback`, `hotkeys[]`, `editorState`
4. Add `name` to appropriate `hotkeyGroups` set in `src/lang/hotkey-groups.ts`

Example:
```typescript
{
    name: 'my_command',
    callback: (view, event) => {
        // Implementation
    },
    hotkeys: [
        { key: 'M', modifiers: ['Mod'], editorState: 'editor-off' },
    ],
},
```

### New Context Menu Item

- Card menu: `src/view/actions/context-menu/card-context-menu/create-single-node-context-menu-items.ts`
- View menu: `src/view/actions/context-menu/view-context-menu/show-view-context-menu.ts`

### Hotkey Editor State

Hotkeys can be restricted by editor state:
- `editor-on`: Only when inline editor is open
- `editor-off`: Only when inline editor is closed
- `both`: Always active

---

## License

MIT
