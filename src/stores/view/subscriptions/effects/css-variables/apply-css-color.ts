import { LineageView } from 'src/view/view';
import { cssVariables } from 'src/stores/view/subscriptions/effects/css-variables/helpers/css-variables';

export const applyCssColor = (
    view: LineageView,
    name: keyof typeof cssVariables.colors,
) => {
    const target = view.contentEl;
    const settings = view.plugin.settings.getValue();
    const color = settings.view.theme[name];
    const matchActiveNode = settings.view.matchActiveNodeBackground;

    if (name === 'activeBranchBg' && matchActiveNode) {
        // When toggle is ON, use active node background (get computed value)
        const computedBg = getComputedStyle(target).getPropertyValue('--background-active-node').trim();
        target.style.setProperty(cssVariables.colors[name], computedBg || '#ffffff');
    } else if (color) {
        target.style.setProperty(cssVariables.colors[name], color);
    } else {
        target.style.removeProperty(cssVariables.colors[name]);
    }
};
