import { DocumentViewState } from 'src/stores/view/view-state-type';

export const resetPendingConfirmation = (
    state: Pick<DocumentViewState, 'pendingConfirmation'>,
) => {
    state.pendingConfirmation = {
        disableEdit: null,
        deleteNode: new Set(),
        pendingDelete: null,
    };
};
