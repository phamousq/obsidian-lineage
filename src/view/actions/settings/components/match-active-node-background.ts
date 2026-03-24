import { SettingsStore } from 'src/main';
import { Setting } from 'obsidian';
import { lang } from 'src/lang/lang';

export const MatchActiveNodeBackground = (
    element: HTMLElement,
    settingsStore: SettingsStore,
) => {
    const settingsState = settingsStore.getValue();
    new Setting(element)
        .setName(lang.settings_match_active_node_bg)
        .setDesc(lang.settings_match_active_node_bg_desc)
        .addToggle((cb) => {
            cb.setValue(settingsState.view.matchActiveNodeBackground).onChange(
                (match) => {
                    settingsStore.dispatch({
                        type: 'settings/view/set-match-active-node-background',
                        payload: {
                            match,
                        },
                    });
                },
            );
        });
};
