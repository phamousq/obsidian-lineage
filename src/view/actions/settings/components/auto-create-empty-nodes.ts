import { SettingsStore } from 'src/main';
import { Setting } from 'obsidian';
import { lang } from 'src/lang/lang';

export const AutoCreateEmptyNodes = (
    element: HTMLElement,
    settingsStore: SettingsStore,
) => {
    const settingsState = settingsStore.getValue();
    new Setting(element)
        .setName(lang.settings_auto_create_empty_nodes)
        .setDesc(lang.settings_auto_create_empty_nodes_desc)
        .addToggle((cb) => {
            cb.setValue(settingsState.view.autoCreateEmptyNodes).onChange(
                (autoCreate) => {
                    settingsStore.dispatch({
                        type: 'settings/view/set-auto-create-empty-nodes',
                        payload: {
                            autoCreate,
                        },
                    });
                },
            );
        });
};
