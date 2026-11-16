// AI-assisted: Claude Code (claude-opus-5-5). Directed and approved by the team.
// PC / Mobile-Tablet selector. A two-button group (radio pattern): works with mouse, touch and
// keyboard (Tab to reach it, arrows or Enter/Space to choose). Icons are small inline SVGs, so
// they look the same on every device (emoji differ between systems).
import { selectPlatform, type Platform } from '../../app/platform';
import type { AppContext } from '../app-bridge';
import { el } from '../dom';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON_PATHS: Record<Platform, string[]> = {
  // Monitor on a stand.
  pc: ['M3 4h18v12H3z', 'M9 20h6', 'M12 16v4'],
  // Phone next to a tablet.
  mobile: ['M3 6h11v14H3z', 'M16 3h5v11h-5z', 'M7.5 17h2', 'M17.8 11.5h1.4'],
};

function icon(platform: Platform): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'platform-icon');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of ICON_PATHS[platform]) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

export function platformSwitch(ctx: AppContext, extraClass = ''): HTMLElement {
  const wrap = el('div', `platform-switch ${extraClass}`.trim());
  const current = ctx.options.get().platform;
  wrap.dataset.selected = current;
  const caption = el('span', 'platform-caption', ctx.t('ui.platform.label'));
  caption.setAttribute('aria-hidden', 'true');
  const group = el('div', 'platform-track');
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', ctx.t('ui.platform.label'));
  // The highlight slides under the selected option.
  const thumb = el('span', 'platform-thumb');
  thumb.setAttribute('aria-hidden', 'true');
  group.append(thumb);
  const buttons: HTMLButtonElement[] = [];
  for (const platform of ['pc', 'mobile'] as Platform[]) {
    const button = el('button', 'platform-option');
    button.type = 'button';
    button.dataset.platform = platform;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(platform === current));
    button.tabIndex = platform === current ? 0 : -1;
    button.title = ctx.t(platform === 'pc' ? 'ui.platform.pcHint' : 'ui.platform.mobileHint');
    button.append(icon(platform), el('span', 'platform-name', ctx.t(platform === 'pc' ? 'ui.platform.pc' : 'ui.platform.mobile')));
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
  wrap.append(caption, group);
  return wrap;
}
