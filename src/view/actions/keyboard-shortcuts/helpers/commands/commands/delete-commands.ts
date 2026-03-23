import { LineageView } from 'src/view/view';
import { DefaultViewCommand } from 'src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys';

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
                        type: 'view/delete-node/confirm',
                        payload: { id: activeNode },
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
