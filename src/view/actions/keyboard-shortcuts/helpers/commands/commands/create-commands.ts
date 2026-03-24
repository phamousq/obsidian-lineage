import { saveNodeAndInsertNode } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/save-node-and-insert-node';
import { addNodeAndSplitAtCursor } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/add-node-and-split-at-cursor';
import { isEditing } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/is-editing';
import { DefaultViewCommand } from 'src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys';

export const createCommands = () => {
    return [
        {
            name: 'add_above',
            callback: (view) => {
                saveNodeAndInsertNode(view, 'up');
            },
            hotkeys: [
                {
                    key: 'ArrowUp',
                    modifiers: ['Mod'],
                    editorState: 'editor-off',
                },
            ],
        },

        {
            name: 'add_below',
            callback: (view, event) => {
                event.preventDefault();
                saveNodeAndInsertNode(view, 'down');
            },
            hotkeys: [
                {
                    key: 'ArrowDown',
                    modifiers: ['Mod'],
                    editorState: 'editor-off',
                },
                {
                    key: 'O',
                    modifiers: [],
                    editorState: 'editor-off',
                },
            ],
        },
        {
            name: 'add_child',
            callback: (view) => {
                saveNodeAndInsertNode(view, 'right');
            },
            hotkeys: [
                {
                    key: 'ArrowRight',
                    modifiers: ['Mod'],
                    editorState: 'editor-off',
                },
            ],
        },
        {
            name: 'add_parent_sibling',
            callback: (view) => {
                saveNodeAndInsertNode(view, 'left');
            },
            hotkeys: [
                {
                    key: 'ArrowLeft',
                    modifiers: ['Mod'],
                    editorState: 'editor-off',
                },
                {
                    key: 'H',
                    modifiers: ['Mod'],
                    editorState: 'both',
                },
            ],
        },
        {
            name: 'add_above_and_split',
            callback: (view) => {
                if (isEditing(view)) addNodeAndSplitAtCursor(view, 'up');
                else saveNodeAndInsertNode(view, 'up');
            },
            hotkeys: [{ key: 'K', modifiers: ['Mod'], editorState: 'both' }],
        },
        {
            name: 'add_below_and_split',
            callback: (view) => {
                if (isEditing(view)) addNodeAndSplitAtCursor(view, 'down');
                else saveNodeAndInsertNode(view, 'down');
            },
            hotkeys: [{ key: 'J', modifiers: ['Mod'], editorState: 'both' }],
        },
        {
            name: 'add_child_and_split',
            callback: (view) => {
                if (isEditing(view)) addNodeAndSplitAtCursor(view, 'right');
                else saveNodeAndInsertNode(view, 'right');
            },
            hotkeys: [{ key: 'L', modifiers: ['Mod'], editorState: 'both' }],
        },
    ] satisfies DefaultViewCommand[];
};
