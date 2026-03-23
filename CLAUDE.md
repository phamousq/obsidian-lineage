# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

**IMPORTANT:** Do NOT use .worktrees/ folders. Feature branches use git worktrees created directly in temp/vault/.obsidian/plugins/ with the naming convention `lineage-<branch-name>`.

```bash
# Create feature branch and worktree
git checkout -b feat/my-feature
mkdir -p temp/vault/.obsidian/plugins/lineage-my-feature
# Copy plugin files there, or symlink src for development
npm run build    # Build outputs to temp/vault/.obsidian/plugins/lineage-dev/
```

**Build output location:** `temp/vault/.obsidian/plugins/lineage-dev/main.js`

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

## Hotkey System

Hotkeys are defined in command files under `src/view/actions/keyboard-shortcuts/helpers/commands/commands/` and use `editorState` condition:
- `editor-on`: Only when inline editor is open
- `editor-off`: Only when inline editor is closed
- `both`: Always active

## Adding New Features

**New keyboard shortcut:**
1. Create command in `src/view/actions/keyboard-shortcuts/helpers/commands/commands/`
2. Export object with `name`, `callback`, `hotkeys[]`, `editorState`
3. Register in appropriate aggregator (e.g., `edit-commands.ts`)

**New context menu item:**
- Card menu: `src/view/actions/context-menu/card-context-menu/create-single-node-context-menu-items.ts`
- View menu: `src/view/actions/context-menu/view-context-menu/show-view-context-menu.ts`

## Testing

- Unit tests use vitest with `*.spec.ts` pattern co-located with source files
- E2E tests use Playwright in `e2e/` directory
- Some tests use jsdom for DOM simulation

## Key Dependencies

- **obsidian**: 1.7.2 - Plugin API
- **svelte**: 4.2.12 - UI components
- **monkey-around**: 3.0.0 - Method patching
- **fuse.js**: 7.0.0 - Fuzzy search
- **CodeMirror 6**: Inline text editing
