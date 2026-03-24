import { LineageView } from 'src/view/view';
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
        documentState.document.columns,
        viewState.document.activeNode,
        direction,
        viewState.document.activeNodesOfColumn,
        viewState.outline.collapsedParents,
    );

    if (nextNode) return false; // Navigation target exists

    // Create empty node (suppress edit mode since we're navigating)
    saveNodeAndInsertNode(view, direction, '', undefined, true);

    // Get new active node and mark as auto-created
    const newNodeId = view.viewStore.getValue().document.activeNode;
    view.viewStore.dispatch({
        type: 'view/document/set-auto-created-empty-node',
        payload: { nodeId: newNodeId },
    });

    return true;
};
