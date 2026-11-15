// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext, Screen } from '../app-bridge';
import { button } from '../components/button';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el } from '../dom';
import { aiRows, fontCredit, nasaLinks, toolRows } from '../credits-data';
import { clearTotals, readTotals } from '../panels/learning-check';

let cleanup: (() => void) | null = null;

export const creditsScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountCredits(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountCredits(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu credits');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());

  const paint = (): void => {
    screen.replaceChildren();
    screen.append(el('h1', 'screen-title', ctx.t('ui.credits.heading')));
    screen.append(section(ctx.t('ui.credits.team'), [
      el('p', undefined, ctx.t('ui.credits.roleA')),
      el('p', undefined, ctx.t('ui.credits.roleB')),
      el('p', undefined, ctx.t('ui.credits.roleC')),
      el('p', undefined, ctx.t('ui.credits.event')),
    ]));
    const nasa = el('ul', 'goal-list');
    for (const link of nasaLinks) nasa.append(itemLink(ctx.t(link.labelKey), link.url));
    screen.append(section(ctx.t('ui.credits.nasa'), [nasa, el('p', undefined, ctx.t('ui.credits.nasaNote'))]));
    const tools = el('ul', 'goal-list');
    for (const row of toolRows) tools.append(el('li', undefined, `${ctx.t(row.nameKey)} — ${ctx.t(row.licenseKey)}`));
    tools.append(itemLink(ctx.t(fontCredit.labelKey), fontCredit.url));
    screen.append(section(ctx.t('ui.credits.tools'), [tools]));
    const ai = el('ul', 'goal-list');
    for (const row of aiRows) ai.append(el('li', undefined, `${ctx.t(row.useKey)} — ${ctx.t(row.toolKey)}`));
    screen.append(section(ctx.t('ui.credits.ai'), [ai, el('p', undefined, ctx.t('ui.credits.aiReview'))]));
    screen.append(section(ctx.t('ui.credits.learning'), learningBlock(ctx, paint)));
    screen.append(el('p', 'affiliation', ctx.t('ui.credits.notAffiliated')));
    const back = button({
      label: ctx.t('ui.credits.back'),
      className: 'btn-primary',
      onClick: press(ctx, () => ctx.flow.go('titulo')),
    });
    screen.append(back);
    // Enter still goes back to the title, but the credits open at the top, not at the button.
    // AI-assisted: Claude Code (claude-opus-5-5).
    back.focus({ preventScroll: true });
    screen.scrollTop = 0;
    requestAnimationFrame(() => { screen.scrollTop = 0; });
  };
  paint();
  bag.add(ctx.options.subscribe(paint));
  ctx.audio.playMusic('music-menu');
  return () => bag.run();
}

function section(title: string, nodes: HTMLElement[]): HTMLElement {
  const block = el('section');
  block.append(el('h2', undefined, title), ...nodes);
  return block;
}

function itemLink(label: string, url: string): HTMLLIElement {
  const item = el('li');
  const link = el('a', undefined, label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  item.append(link);
  return item;
}

function learningBlock(ctx: AppContext, refresh: () => void): HTMLElement[] {
  const totals = readTotals();
  const table = el('p', undefined, ctx.t('ui.credits.learningCounts', {
    sessions: totals.sessions,
    preA: totals.pre.A,
    preB: totals.pre.B,
    preC: totals.pre.C,
    postA: totals.post.A,
    postB: totals.post.B,
    postC: totals.post.C,
    changed: totals.changedToB,
  }));
  const copy = button({
    label: ctx.t('ui.credits.copyCounts'),
    onClick: press(ctx, () => void navigator.clipboard?.writeText(table.textContent ?? '')),
  });
  const wipe = button({
    label: ctx.t('ui.credits.clearCounts'),
    onClick: press(ctx, () => {
      clearTotals();
      refresh();
    }),
  });
  const row = el('div', 'row');
  row.append(copy, wipe);
  return [el('p', undefined, ctx.t('ui.credits.learningNote')), table, row];
}
