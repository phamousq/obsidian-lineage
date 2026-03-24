import { LineageView } from 'src/view/view';
import { AllDirections } from 'src/stores/document/document-store-actions';
import { JumpTarget } from 'src/stores/view/reducers/document/jump-to-node';
import { DefaultViewCommand } from 'src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys';
import { enableEditModeInMainSplit } from 'src/view/components/container/column/components/group/components/card/components/content/store-actions/enable-edit-mode-in-main-split';
import { autoCreateNodeOnNavigation } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/auto-create-node-on-navigation';

const outlineModeSelector = (view: LineageView) =>
    view.plugin.settings.getValue().view.outlineMode;

const maintainEditMode = (view: LineageView) =>
    view.plugin.settings.getValue().view.maintainEditMode;

const maybeEnableEditMode = (view: LineageView) => {
    const viewState = view.viewStore.getValue();
    const isEditing = viewState.document.editing.activeNodeId;
    const activeNode = viewState.document.activeNode;
    if (isEditing && maintainEditMode(view)) {
        setTimeout(() => {
            const newActiveNode = view.viewStore.getValue().document.activeNode;
            if (newActiveNode !== activeNode) {
                enableEditModeInMainSplit(view, newActiveNode);
            }
        }, 16);
    }
};

const handleAutoCreatedEmptyNodeOnNavigation = (view: LineageView) => {
    const pendingAutoCreated = view.viewStore.getValue().document.pendingConfirmation.autoCreatedEmptyNodeId;
    const currentActive = view.viewStore.getValue().document.activeNode;
    if (pendingAutoCreated && pendingAutoCreated !== currentActive) {
        const node = view.documentStore.getValue().document.content[pendingAutoCreated];
        if (node && !node.content.trim()) {
            view.documentStore.dispatch({
                type: 'document/delete-node',
                payload: { activeNodeId: pendingAutoCreated },
            });
        } else {
            view.viewStore.dispatch({
                type: 'view/document/clear-auto-created-empty-node',
            });
        }
    }
};

const spatialNavigation = (view: LineageView, direction: AllDirections) => {
    maybeEnableEditMode(view);
    view.viewStore.dispatch({
        type: 'view/set-active-node/keyboard',
        payload: {
            direction: direction,
        },
        context: {
            outlineMode: outlineModeSelector(view),
        },
    });
};

const sequentialNavigation = (
    view: LineageView,
    direction: 'forward' | 'back',
) => {
    maybeEnableEditMode(view);
    view.viewStore.dispatch({
        type: 'view/set-active-node/sequential/select-next',
        payload: {
            direction,
            sections: view.documentStore.getValue().sections,
        },
        context: {
            outlineMode: outlineModeSelector(view),
        },
    });
};

const jump = (view: LineageView, target: JumpTarget) => {
    maybeEnableEditMode(view);
    view.viewStore.dispatch({
        type: 'view/set-active-node/keyboard-jump',
        payload: {
            target,
        },
    });
};
export const navigateCommands = () => {
    const commands: DefaultViewCommand[] = [];
    commands.push(
        {
            name: 'go_right',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);
                if (!outlineModeSelector(view)) {
                    const created = autoCreateNodeOnNavigation(view, 'right');
                    if (!created) {
                        spatialNavigation(view, 'right');
                    }
                } else {
                    spatialNavigation(view, 'down');
                }
            },
            hotkeys: [
                { key: 'L', modifiers: [], editorState: 'editor-off' },
                { key: 'ArrowRight', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'go_left',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);

                if (!outlineModeSelector(view)) {
                    spatialNavigation(view, 'left');
                } else {
                    spatialNavigation(view, 'up');
                }
            },
            hotkeys: [
                { key: 'H', modifiers: [], editorState: 'editor-off' },
                { key: 'ArrowLeft', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'go_down',
            callback: (view, event) => {
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);
                if (!outlineModeSelector(view)) {
                    const created = autoCreateNodeOnNavigation(view, 'down');
                    if (!created) {
                        view.viewStore.dispatch({
                            type: 'view/document/clear-pending-delete',
                        });
                        spatialNavigation(view, 'down');
                    }
                } else {
                    sequentialNavigation(view, 'forward');
                }
            },
            hotkeys: [
                { key: 'J', modifiers: [], editorState: 'editor-off' },
                { key: 'ArrowDown', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'go_up',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);
                if (!outlineModeSelector(view)) {
                    spatialNavigation(view, 'up');
                } else {
                    sequentialNavigation(view, 'back');
                }
            },
            hotkeys: [
                { key: 'K', modifiers: [], editorState: 'editor-off' },
                { key: 'ArrowUp', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'select_parent',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);
                spatialNavigation(view, 'left');
            },
            hotkeys: [{ key: 'G', modifiers: [], editorState: 'editor-off' }],
        },
        {
            name: 'navigate_to_next_node',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);
                sequentialNavigation(view, 'forward');
            },
            hotkeys: [{ key: 'N', modifiers: [], editorState: 'editor-off' }],
        },
        {
            name: 'navigate_to_previous_node',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                handleAutoCreatedEmptyNodeOnNavigation(view);
                sequentialNavigation(view, 'back');
            },
            hotkeys: [{ key: 'B', modifiers: [], editorState: 'editor-off' }],
        },
        {
            name: 'go_to_beginning_of_group',
            callback: (view, e) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                e.preventDefault();
                e.stopPropagation();
                jump(view, 'start-of-group');
            },
            hotkeys: [
                { key: 'PageUp', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'go_to_end_of_group',
            callback: (view, e) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                e.preventDefault();
                e.stopPropagation();
                jump(view, 'end-of-group');
            },
            hotkeys: [
                { key: 'PageDown', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'go_to_beginning_of_column',
            callback: (view, e) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                e.preventDefault();
                e.stopPropagation();
                jump(view, 'start-of-column');
            },
            hotkeys: [
                { key: 'Home', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'go_to_end_of_column',
            callback: (view, e) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                e.preventDefault();
                e.stopPropagation();
                jump(view, 'end-of-column');
            },
            hotkeys: [{ key: 'End', modifiers: [], editorState: 'editor-off' }],
        },
        {
            name: 'navigate_back',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                view.viewStore.dispatch({
                    type: 'view/set-active-node/history/select-previous',
                });
            },
            hotkeys: [{ key: 'J', modifiers: ['Alt'], editorState: 'both' }],
        },
        {
            name: 'navigate_forward',
            callback: (view, event) => {
                view.viewStore.dispatch({
                    type: 'view/document/clear-pending-delete',
                });
                event.preventDefault();
                view.viewStore.dispatch({
                    type: 'view/set-active-node/history/select-next',
                });
            },
            hotkeys: [{ key: 'K', modifiers: ['Alt'], editorState: 'both' }],
        },
    );
    return commands;
};
