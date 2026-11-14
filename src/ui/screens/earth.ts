// AI-assisted: Cursor Grok 4.7, reviewed by C
// Earth actions are not in the Action union yet. A needs to add EARTH_INVEST and EARTH_END_SEASON.
import type { AppContext } from '../app-bridge';
import type { Action } from '../core-bridge';
import { button } from '../components/button';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el } from '../dom';

const LINES = ['energia', 'agua', 'reciclaje', 'restauracion'] as const;
const INDICATORS = ['agua', 'emisiones', 'ecosistemas'] as const;

interface EarthView {
  season: number;
  seasons: number;
  budget: number;
  levels: Record<(typeof LINES)[number], number>;
  indicators: Record<(typeof INDICATORS)[number], number>;
  result: { outcome: string } | null;
}

export function mountEarth(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());
  const note = el('p', 'messages');

  const paint = (): void => {
    const earth = readEarth(ctx);
    screen.replaceChildren();
    screen.append(
      el('p', 'note', ctx.t('ui.earth.fiction')),
      el('p', 'note', ctx.t('ui.earth.simplified')),
      el('h1', 'screen-title', ctx.t('ui.earth.heading')),
    );
    if (!earth) {
      screen.append(el('p', undefined, ctx.t('ui.earth.waiting')));
      return;
    }
    screen.append(el('p', undefined, ctx.t('ui.earth.season', { n: earth.season, total: earth.seasons })));
    screen.append(el('p', undefined, ctx.t('ui.earth.budget', { n: earth.budget })));
    const lines = el('div', 'stack');
    for (const line of LINES) {
      const row = el('div', 'row');
      row.append(el('span', undefined, ctx.t(`ui.earth.line.${line}`, { n: earth.levels[line] ?? 0 })));
      row.append(button({
        label: ctx.t('ui.earth.invest'),
        disabled: earth.budget <= 0 || earth.result !== null,
        onClick: press(ctx, () => dispatchEarth(ctx, { type: 'EARTH_INVEST', action: line }, note)),
      }));
      lines.append(row);
    }
    const meters = el('div', 'row');
    for (const id of INDICATORS) {
      meters.append(el('p', 'hud-stat', ctx.t(`ui.earth.indicator.${id}`, { n: earth.indicators[id] ?? 0 })));
    }
    const end = button({
      label: ctx.t('ui.earth.endSeason'),
      className: 'btn-primary',
      disabled: earth.result !== null,
      onClick: press(ctx, () => dispatchEarth(ctx, { type: 'EARTH_END_SEASON', season: earth.season }, note)),
    });
    screen.append(lines, meters, end, note);
    if (earth.result) screen.append(el('p', 'suggestion', ctx.t('ui.earth.closing')));
  };
  paint();
  bag.add(ctx.store.subscribe(paint));
  bag.add(ctx.options.subscribe(paint));
  ctx.audio.playMusic('music-earth');
  return () => bag.run();
}

function readEarth(ctx: AppContext): EarthView | null {
  const state = ctx.store.getState() as { earth?: EarthView } | null;
  return state?.earth ?? null;
}

function dispatchEarth(ctx: AppContext, action: { type: string; action?: string; season?: number }, note: HTMLElement): void {
  try {
    const result = ctx.store.dispatch(action as Action);
    if (!result.ok) note.textContent = ctx.t(result.error.messageKey, result.error.params);
    else note.textContent = '';
  } catch {
    note.textContent = ctx.t('ui.earth.waiting');
  }
}
