// AI-assisted: Claude Code (claude-opus-5-5). Directed and approved by the team.
// PC / Mobile-Tablet selector. A two-button group (radio pattern): works with mouse, touch and
// keyboard (Tab to reach it, arrows or Enter/Space to choose).
import { selectPlatform, type Platform } from '../../app/platform';
import type { AppContext } from '../app-bridge';
import { el } from '../dom';

const ICON: Record<Platform, string> = { pc: '🖥', mobile: '📱' };

export function platformSwitch(ctx: AppContext, extraClass = ''): HTMLElement {
  const group = el('div', `platform-switch ${extraClass}`.trim());
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', ctx.t('ui.platform.label'));
  const current = ctx.options.get().platform;
  const buttons: HTMLButtonElement[] = [];
  for (const platform of ['pc', 'mobile'] as Platform[]) {
    const button = el('button', 'platform-option');
    button.type = 'button';
    button.dataset.platform = platform;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(platform === current));
    button.tabIndex = platform === current ? 0 : -1;
    button.title = ctx.t(platform === 'pc' ? 'ui.platform.pcHint' : 'ui.platform.mobileHint');
    const icon = el('span', 'platform-icon', ICON[platform]);
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon, el('span', 'platform-name', ctx.t(platform === 'pc' ? 'ui.platform.pc' : 'ui.platform.mobile')));
    button.addEventListener('click', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx('sfx-click');
      selectPlatform(ctx, platform);
    });
    buttons.push(button);
    group.append(button);
  }
  group.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const index = buttons.findIndex((b) => b === document.activeElement);
    const next = buttons[(index + 1) % buttons.length];
    next.focus();
    next.click();
  });
  return group;
}
