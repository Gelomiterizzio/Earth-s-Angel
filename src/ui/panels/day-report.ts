// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AppContext } from '../app-bridge';
import { designSuitShield } from '../../core/design';
import type { DayReport, GameData, GameState, ObjectiveStatus } from '../core-bridge';
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
  title.tabIndex = -1;
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
    const mission = ctx.store.getState()?.mission;
    const current = mission?.lastReport ?? report;
    title.textContent = ctx.t(mission?.level === 'marte' ? 'ui.report.solTitle' : 'ui.report.title', { day: current?.day ?? '—' });
    events.textContent = current && current.activeEvents.length > 0
      ? current.activeEvents.map((item) => ctx.t(`content.event.${item.type}.name`)).join(' · ')
      : ctx.t('ui.report.noEvents');
    paintCauses(causes, more, current, expanded, ctx);
    blocks.replaceChildren();
    if (current) blocks.append(balanceChart(ctx, current), energyBlock(ctx, current), lifeBlock(ctx, current), shieldBlock(ctx, current));
    goals.textContent = goalLine(ctx, current);
    go.textContent = ctx.t('ui.report.continue');
    more.textContent = ctx.t('ui.report.more');
  };
  const offMore = on(more, 'click', () => {
    expanded = true;
    more.hidden = true;
    paint();
  });
  const ackReport = press(ctx, () => {
    const day = ctx.store.getState()?.mission.lastReport?.day ?? ctx.store.getState()?.mission.day;
    if (day === undefined) return;
    const result = ctx.store.dispatch({ type: 'ACK_REPORT', day });
    if (result.ok && result.state.mission.phase === 'planning' && ctx.flow.current().scene === 'mision'
      && !document.querySelector('[role="dialog"][aria-modal="true"]')) {
      document.getElementById('map')?.focus({ preventScroll: true });
    }
  }, 'sfx-confirm');
  const offGo = on(go, 'click', ackReport);
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') event.preventDefault();
    else if (event.key === 'Enter' && event.target !== more) {
      event.preventDefault();
      ackReport();
    }
  });
  const offLang = ctx.options.subscribe(paint);
  paint();
  title.focus({ preventScroll: true });
  dialog.scrollTop = 0;
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

/**
 * Made-versus-used bars for power, oxygen, water and food, and the days the stock still covers.
 * AI-assisted: Claude Code (claude-opus-5-5). The same numbers are listed as text below.
 */
function balanceChart(ctx: AppContext, report: DayReport): HTMLElement {
  const mission = ctx.store.getState()?.mission;
  const rows = [
    { id: 'energia', made: report.energy.generated, used: report.energy.used },
    { id: 'oxigeno', made: report.produced.oxigeno, used: report.crewConsumed.oxigeno },
    { id: 'agua', made: report.produced.agua, used: report.crewConsumed.agua + report.moduleInputs.agua },
    { id: 'alimentos', made: report.produced.alimentos, used: report.crewConsumed.alimentos },
  ] as const;
  const max = Math.max(1, ...rows.flatMap((row) => [row.made, row.used]));
  const crew = Math.max(1, mission?.crew.filter((member) => member.health > 0).length ?? 1);
  const need = Math.max(1, crew * ctx.data.constants.crewNeedPerDay);
  const unit = ctx.t(mission?.level === 'marte' ? 'ui.report.chart.sols' : 'ui.report.chart.days');

  const block = el('section', 'report-chart');
  block.append(el('h3', undefined, ctx.t('ui.report.chart.title')));
  const legend = el('p', 'report-chart-legend');
  legend.append(
    el('span', 'report-chart-key report-chart-key-made', ctx.t('ui.report.chart.made')),
    el('span', 'report-chart-key report-chart-key-used', ctx.t('ui.report.chart.used')),
  );
  block.append(legend);
  for (const row of rows) {
    const net = row.made - row.used;
    const line = el('div', 'report-chart-row');
    line.dataset.trend = net > 0 ? 'up' : net < 0 ? 'down' : 'flat';
    const name = el('span', 'report-chart-name', ctx.t(`ui.resource.${row.id}`));
    const bars = el('span', 'report-chart-bars');
    bars.setAttribute('aria-hidden', 'true');
    const made = el('span', 'report-chart-bar report-chart-made');
    made.style.setProperty('--share', String(row.made / max));
    const used = el('span', 'report-chart-bar report-chart-used');
    used.style.setProperty('--share', String(row.used / max));
    bars.append(made, used);
    const delta = el('span', 'report-chart-net', `${net > 0 ? '+' : ''}${net}`);
    const label = ctx.t('ui.report.chart.row', {
      name: ctx.t(`ui.resource.${row.id}`), made: row.made, used: row.used, net,
    });
    line.setAttribute('aria-label', label);
    line.append(name, bars, delta);
    if (row.id !== 'energia' && mission) {
      const days = Math.floor(mission.resources[row.id] / need);
      const stock = el('span', 'report-chart-stock', `${days} ${unit}`);
      stock.dataset.level = days <= 1 ? 'crit' : days <= 3 ? 'warn' : 'ok';
      line.append(stock);
    } else {
      line.append(el('span', 'report-chart-stock'));
    }
    block.append(line);
  }
  return block;
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
  const mission = ctx.store.getState()?.mission;
  if (mission) {
    block.append(el('p', undefined, ctx.t('ui.hud.materials', { n: mission.resources.materiales })));
    const constructions = mission.buildings.filter(
      (b) => b.type !== 'nave' && (b.placedDay === report.day || b.operationalFromDay > report.day),
    );
    for (const b of constructions) {
      const name = ctx.t(ctx.data.buildings[b.type]?.nameKey ?? b.type);
      const ready = ctx.t('content.map.readyDay', { day: b.operationalFromDay });
      block.append(el('p', undefined, `${name} · ${ready}`));
    }
  }
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

export function suitExposureReduction(state: GameState, report: DayReport, data: GameData): number {
  if (report.radiationLevel === 0 || report.crew.every((member) => member.sheltered)) return 0;
  const base = data.constants.exposure[report.radiationLevel].unsheltered;
  return Math.min(base, designSuitShield(state.campaign, data));
}

function shieldBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section');
  block.append(
    el('h3', undefined, ctx.t('ui.report.shield')),
    el('p', undefined, ctx.t(report.shelter.active ? 'ui.report.shelterOn' : 'ui.report.shelterOff')),
  );
  const state = ctx.store.getState();
  const reduced = state ? suitExposureReduction(state, report, ctx.data) : 0;
  if (reduced > 0) block.append(el('p', undefined, ctx.t('ui.onboard.suits', { n: reduced })));
  for (const member of report.crew) {
    const known = state?.mission.crew.find((person) => person.id === member.id);
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
