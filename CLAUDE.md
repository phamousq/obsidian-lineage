# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

This project uses a skill-driven development workflow:

1. **Brainstorming** → Validate ideas before implementation
2. **Writing Plans** → Create detailed, bite-sized implementation plans
3. **Git Worktrees** → Isolated workspaces for feature development
4. **Subagent-Driven Development** → Task-by-task implementation with reviews

**IMPORTANT:** Do NOT use .worktrees/ folders. Feature branches use git worktrees created directly in `temp/vault/.obsidian/plugins/` with the naming convention `lineage-<branch-name>`.

```bash
# Create feature branch and worktree
git checkout -b feat/my-feature
mkdir -p temp/vault/.obsidian/plugins/lineage-my-feature
# Copy plugin files there, or symlink src for development
npm run build    # Build outputs to temp/vault/.obsidian/plugins/lineage-dev/
```

**Build output location:** `temp/vault/.obsidian/plugins/lineage-dev/main.js`

### Skill Reference

| Task | Command |
|------|---------|
| Brainstorming | `/superpowers:brainstorming` |
| Writing plans | `/superpowers:writing-plans` |
| Subagent-driven | `/superpowers:subagent-driven-development` |
| Verification | `/superpowers:verification-before-completion` |
| Finishing branch | `/superpowers:finishing-a-development-branch` |

See `docs/DEVELOPMENT.md` for full workflow documentation.

## Build Commands

```bash
npm run dev      # Development build (outputs to temp/vault/.obsidian/plugins/lineage-dev/)
npm run build    # Full build: type check + svelte-check + production bundle
npm run lint     # ESLint on src/
npm run test     # Unit tests (vitest run)
npm run test:watch  # Unit tests in watch mode
npm run test:e2e    # End-to-end tests (playwright)
npm run version  # Bump version and update manifest/versions
```

## Architecture Overview

**Lineage** is an Obsidian plugin that displays markdown as a tree of cards (nodes) with parent-child relationships, similar to Gingko.

### Core Entry Point
- `src/main.ts` - `Lineage` class extends Obsidian `Plugin`, registers views, commands, events, and ribbon icon

### State Management
Uses a custom Redux-like store pattern (`src/lib/store/store.ts`):
- **Plugin store**: Tracks open documents, active views, vault events
- **Settings store**: User preferences, style rules, view settings
- **View store**: Document state (active node, selection, editing mode, search)

Key files:
- `src/stores/plugin/plugin-reducer.ts` - Plugin state reducer
- `src/stores/settings/settings-reducer.ts` - Settings state reducer
- `src/stores/view/view-state-type.ts` - View state types

### Document Serialization
Lineage stores tree structure in markdown via three formats (configured in settings):
- **HTML Comments**: `<!-- id:node-id -->content<!-- /id:node-id -->`
- **HTML Elements**: `<section id="node-id">content</section>` (experimental)
- **Outline**: Indented `- content` markdown

Serialization lives in `src/lib/serialization/`.

### View Layer (`src/view/`)
- `view.ts` - `LineageView` class (Obsidian view)
- `actions/` - All user interactions (keyboard shortcuts, context menus, node CRUD)
- `components/` - Svelte UI components

### Obsidian Integration (`src/obsidian/`)
- `commands/add-commands.ts` - Command palette registration
- `events/workspace/` - File/folder context menus, workspace events
- `helpers/inline-editor/` - CodeMirror 6 wrapper for inline editing

## Critical Behavior: Escape Key Flow

The Escape key behavior is controlled by the `escapeDiscardsChanges` setting:
- **false (default)**: Escape always saves changes
- **true**: Two-stage discard flow:
  1. **First Escape**: Sets `pendingConfirmation.disableEdit = nodeId`, shows red border warning
  2. **Second Escape** (before typing): Calls `unloadNode(undefined, true)` which **discards changes**

If user types after first Escape (when `escapeDiscardsChanges: true`), the confirmation resets and next Escape **saves** changes.

See `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts`.

## Pending Confirmation State

The `pendingConfirmation` object in `PendingDocumentConfirmation` tracks in-progress user confirmations:

| Field | Type | Purpose |
|-------|------|---------|
| `disableEdit` | `string \| null` | Node marked for discard confirmation (Escape two-stage flow) |
| `deleteNode` | `Set<string>` | Nodes marked for deletion (Mod+Backspace two-stage flow) |
| `pendingDelete` | `string \| null` | Node marked for vim-style `d` delete confirmation |

**State files:**
- Type: `src/stores/view/view-state-type.ts`
- Default: `src/stores/view/default-view-state.ts`
- Reducer: `src/stores/view/view-reducer.ts`
- Actions: `src/stores/view/view-store-actions.ts`

## Hotkey System

Hotkeys are defined in command files under `src/view/actions/keyboard-shortcuts/helpers/commands/commands/` and use `editorState` condition:
- `editor-on`: Only when inline editor is open
- `editor-off`: Only when inline editor is closed
- `both`: Always active

**Key Case Sensitivity:** All keys are converted to UPPERCASE by `eventToString()` in `src/view/actions/keyboard-shortcuts/helpers/keyboard-events/event-to-string.ts`. Define hotkeys with uppercase keys (e.g., `'I'`, `'A'`, `'D'`) not lowercase.

**Vim-style Shortcuts:**
- `I` / `Enter` (editor-off): Enable edit mode
- `A` / `Alt+Enter` (editor-off): Enable edit mode with cursor at end
- `d` (editor-off): Delete node (two-stage: first press marks, second press deletes)

**Delete Node Helper:** `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/delete-node.ts` implements the two-stage delete flow using `pendingConfirmation.deleteNode` (a Set). First press adds to Set, second press triggers actual deletion.

## Adding New Features

**New keyboard shortcut:**
1. Create command in `src/view/actions/keyboard-shortcuts/helpers/commands/commands/`
2. Define with uppercase key (e.g., `'I'` not `'i'`)
3. Export object with `name` (must exist in `hotkeysLang`), `callback`, `hotkeys[]`, `editorState`
4. Add `name` to appropriate `hotkeyGroups` set in `src/lang/hotkey-groups.ts`

**New context menu item:**
- Card menu: `src/view/actions/context-menu/card-context-menu/create-single-node-context-menu-items.ts`
- View menu: `src/view/actions/context-menu/view-context-menu/show-view-context-menu.ts`

## Testing

```bash
npm test                 # Unit tests (vitest run)
npm run test -- path    # Run specific test file
npm run test:watch      # Unit tests in watch mode
npm run test:e2e        # End-to-end tests (playwright)
```

- Unit tests use vitest with `*.spec.ts` pattern co-located with source files
- E2E tests use Playwright in `e2e/` directory
- Some tests use jsdom for DOM simulation

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/delete-node.ts` | Two-stage delete flow helper |
| `src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes.ts` | Escape key discard flow |
| `src/view/actions/keyboard-shortcuts/helpers/keyboard-events/event-to-string.ts` | Converts keyboard events to uppercase strings |
| `src/lang/hotkey-groups.ts` | Groups commands for settings UI |
| `src/lang/hotkeys-lang.ts` | Maps command names to display labels |
| `src/stores/view/view-state-type.ts` | View state type definitions |
| `src/stores/view/view-reducer.ts` | View state reducer |

## Key Dependencies

- **obsidian**: 1.7.2 - Plugin API
- **svelte**: 4.2.12 - UI components
- **monkey-around**: 3.0.0 - Method patching
- **fuse.js**: 7.0.0 - Fuzzy search
- **CodeMirror 6**: Inline text editing

## Keyboard Shortcuts Reference

> **Note:** `Mod` = `Cmd` (macOS) / `Ctrl` (Windows/Linux)

### Navigation (editor-off)

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

### Selection (Shift to extend)

| Action | Shortcut |
|--------|----------|
| Select All | `Mod+A` |
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
| Exit Edit Mode | `Escape` |

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

### Merging

| Action | Shortcut |
|--------|----------|
| Merge with Node Above | `Mod+Shift+K` or `Mod+Shift+↑` |
| Merge with Node Below | `Mod+Shift+J` or `Mod+Shift+↓` |

### Clipboard

| Action | Shortcut |
|--------|----------|
| Copy Node (branch) | `Mod+C` |
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

### Presets

The plugin supports alternative presets (configurable in settings):
- **Alt as Primary Modifier**: Uses `Alt` as the main modifier instead of `Mod` for navigation/editing shortcuts
- **Navigate While Editing**: Uses `Alt+Shift+Arrow keys` to navigate while in edit mode

---

## Progress Journal

### 2026-03-24

#### Vim Keyboard Shortcuts Implementation
- **Branch:** `feat/vim-keyboard-shortcuts`
- **Added `I` hotkey** for edit mode (`enable_edit_mode`) - mirrors `Enter`
- **Added `A` hotkey** for append mode (`enable_edit_mode_and_place_cursor_at_end`) - mirrors `Alt+Enter`
- **Fixed `d` key delete** - rewrote `delete-commands.ts` to use the existing `deleteNode()` helper instead of broken custom two-stage flow
- **Bug fixed:** Case sensitivity issue - `eventToString()` converts keys to uppercase, so hotkeys must be defined as uppercase (`'I'`, `'A'`, `'D'`) not lowercase
- **Files modified:**
  - `src/view/actions/keyboard-shortcuts/helpers/commands/commands/edit-commands.ts`
  - `src/view/actions/keyboard-shortcuts/helpers/commands/commands/delete-commands.ts`
  - `CLAUDE.md` (vim shortcuts, case sensitivity note, key files reference)

#### ESCape Discard Toggle
- **Branch:** `feat/escape-discard-toggle` (merged to `main`)
- **Added `escapeDiscardsChanges` setting** - controls Escape key behavior
  - `false` (default): Escape always saves changes
  - `true`: Two-stage discard flow (first Escape marks, second discards)
- **Added pending state types** for the discard confirmation flow
- **UI component** for toggle setting in preferences

#### Project Cleanup
- Renamed `master` branch to `main`
- Removed obsolete feature branches
- Updated `CLAUDE.md` development workflow (use `temp/vault/.obsidian/plugins/` instead of `.worktrees/`)

#### Documentation Updates
- Added comprehensive Keyboard Shortcuts Reference table to `CLAUDE.md`
- Created `docs/DEVELOPMENT.md` documenting the skill-driven workflow
- Added skill reference table to `CLAUDE.md`

---

### 2026-03-23

#### Initial Implementation Planning
- Created brainstorming and writing-plans skills workflow
- Set up subagent-driven development process
