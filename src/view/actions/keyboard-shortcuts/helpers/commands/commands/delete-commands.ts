import { deleteNode } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/delete-node';
import { DefaultViewCommand } from 'src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys';

export const deleteCommands = () => {
    return [
        {
            name: 'delete_card',
            callback: (view, event) => {
                event.preventDefault();
                const activeNode = view.viewStore.getValue().document.activeNode;
                deleteNode(view, activeNode);
            },
            hotkeys: [
                { key: 'd', modifiers: [], editorState: 'editor-off' },
            ],
        },
    ] satisfies DefaultViewCommand[];
};
