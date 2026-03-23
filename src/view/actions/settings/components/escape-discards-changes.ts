import { SettingsStore } from 'src/main';
import { Setting } from 'obsidian';
import { lang } from 'src/lang/lang';

export const EscapeDiscardsChanges = (
    element: HTMLElement,
    settingsStore: SettingsStore,
) => {
    const settingsState = settingsStore.getValue();
    new Setting(element)
        .setName(lang.settings_escape_discards_changes)
        .setDesc(lang.settings_escape_discards_changes_desc)
        .addToggle((cb) => {
            cb.setValue(settingsState.view.escapeDiscardsChanges).onChange(
                (discard) => {
                    settingsStore.dispatch({
                        type: 'settings/view/set-escape-discards-changes',
                        payload: {
                            discard,
                        },
                    });
                },
            );
        });
};
