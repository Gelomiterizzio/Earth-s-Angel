// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext } from '../app-bridge';
import type { DayReport, ObjectiveStatus } from '../core-bridge';
import { el, on } from '../dom';
import { press } from '../chrome';

export function mountDayReport(root: HTMLElement, ctx: AppContext): () => void {
  const state = ctx.store.getState();
  const report = state?.mission.lastReport ?? null;
  const veil = el('div', 'veil');
  const dialog = el('div', 'dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = el('h2');
  title.id = 'day-report-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const events = el('p');
  const causes = el('div');
  const blocks = el('div', 'stack');
  const goals = el('p');
  const more = el('button', 'btn');
  more.type = 'button';
  more.hidden = true;
  const go = el('button', 'btn btn-primary');
  go.type = 'button';
  dialog.append(title, events, causes, blocks, goals, more, go);
  veil.append(dialog);
  root.append(veil);

  let expanded = false;
  const paint = (): void => {
    const current = ctx.store.getState()?.mission.lastReport ?? report;
    title.textContent = ctx.t('ui.report.title', { day: current?.day ?? '—' });
    events.textContent = current && current.activeEvents.length > 0
      ? current.activeEvents.map((item) => ctx.t(`content.event.${item.type}.name`)).join(' · ')
      : ctx.t('ui.report.noEvents');
    paintCauses(causes, more, current, expanded, ctx);
    blocks.replaceChildren();
    if (current) blocks.append(energyBlock(ctx, current), lifeBlock(ctx, current), shieldBlock(ctx, current));
    goals.textContent = goalLine(ctx, current);
    go.textContent = ctx.t('ui.report.continue');
    more.textContent = ctx.t('ui.report.more');
  };
  const offMore = on(more, 'click', () => {
    expanded = true;
    more.hidden = true;
    paint();
  });
  const offGo = on(go, 'click', press(ctx, () => {
    const day = ctx.store.getState()?.mission.lastReport?.day ?? ctx.store.getState()?.mission.day;
    if (day === undefined) return;
    ctx.store.dispatch({ type: 'ACK_REPORT', day });
  }, 'sfx-confirm'));
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') event.preventDefault();
  });
  const offLang = ctx.options.subscribe(paint);
  paint();
  go.focus();
  return () => {
    offMore();
    offGo();
    offKeys();
    offLang();
    veil.remove();
  };
}

function paintCauses(
  host: HTMLElement,
  more: HTMLButtonElement,
  report: DayReport | null,
  expanded: boolean,
  ctx: AppContext,
): void {
  host.replaceChildren(el('h3', undefined, ctx.t('ui.report.causes')));
  const keys = report?.causeEffectKeys ?? [];
  const shown = expanded ? keys : keys.slice(0, 5);
  const list = el('ul', 'report-causes');
  if (shown.length === 0) list.append(el('li', undefined, ctx.t('ui.report.noCauses')));
  for (const key of shown) list.append(el('li', undefined, ctx.t(key.startsWith('sim.') ? key : `sim.cause.${key}`)));
  host.append(list);
  more.hidden = expanded || keys.length <= 5;
}

function energyBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section');
  block.append(
    el('h3', undefined, ctx.t('ui.report.energy')),
    el('p', undefined, ctx.t('ui.report.generated', { n: report.energy.generated })),
    el('p', undefined, ctx.t('ui.report.used', { n: report.energy.used })),
    el('p', undefined, ctx.t('ui.report.stored', { n: report.energy.end })),
    el('p', undefined, ctx.t('ui.report.wasted', { n: report.energy.wasted })),
  );
  return block;
}

function lifeBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section');
  block.append(el('h3', undefined, ctx.t('ui.report.life')));
  for (const id of ['oxigeno', 'agua', 'alimentos'] as const) {
    block.append(el('p', undefined, ctx.t('ui.report.line', {
      name: ctx.t(`ui.resource.${id}`),
      made: report.produced[id],
      used: report.crewConsumed[id],
      short: report.shortages[id],
    })));
  }
  return block;
}

function shieldBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section');
  block.append(
    el('h3', undefined, ctx.t('ui.report.shield')),
    el('p', undefined, ctx.t(report.shelter.active ? 'ui.report.shelterOn' : 'ui.report.shelterOff')),
  );
  for (const member of report.crew) {
    const known = ctx.store.getState()?.mission.crew.find((person) => person.id === member.id);
    block.append(el('p', undefined, ctx.t('ui.report.crewLine', {
      name: ctx.t(known?.nameKey ?? `content.crew.${member.id}`),
      exposure: member.exposure,
      delta: member.exposureDelta,
    })));
  }
  return block;
}

function goalLine(ctx: AppContext, report: DayReport | null): string {
  if (!report) return ctx.t('ui.report.empty');
  const fresh = report.objectives.filter((goal) => newlyMet(goal, report));
  const names = fresh.map((goal) => ctx.t(`ui.objective.${goal.id}`)).join(', ');
  return ctx.t('ui.report.streak', { n: report.streak, goals: names || ctx.t('ui.report.noNewGoals') });
}

function newlyMet(goal: ObjectiveStatus, report: DayReport): boolean {
  return report.causeEffectKeys.some((key) => key.endsWith(goal.id));
}
