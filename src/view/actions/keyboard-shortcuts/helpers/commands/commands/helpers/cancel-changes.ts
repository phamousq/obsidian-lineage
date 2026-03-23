import { LineageView } from 'src/view/view';

export const cancelChanges = (view: LineageView) => {
    const documentViewState = view.viewStore.getValue().document;
    const settings = view.plugin.settings.getValue();
    const escapeDiscardsChanges = settings.view.escapeDiscardsChanges;

    if (escapeDiscardsChanges) {
        // Two-stage discard: first escape shows warning, second discards
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
    } else {
        // Always save on escape
        view.inlineEditor.unloadNode(undefined, false);
        if (documentViewState.editing.isInSidebar) {
            view.viewStore.dispatch({
                type: 'view/editor/disable-sidebar-editor',
            });
        } else {
            view.viewStore.dispatch({
                type: 'view/editor/disable-main-editor',
            });
        }
    }
};
