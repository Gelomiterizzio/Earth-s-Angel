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
  const dialog = el('div', 'dialog day-report');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = el('h2');
  title.id = 'day-report-title';
  title.tabIndex = -1;
  dialog.setAttribute('aria-labelledby', title.id);
  const events = el('p', 'report-events');
  const causes = el('section', 'report-card report-why');
  const blocks = el('div', 'report-grid');
  const goals = el('p', 'report-goals');
  const chart = el('div', 'report-card report-chart-card');
  const more = el('button', 'btn');
  more.type = 'button';
  more.hidden = true;
  const go = el('button', 'btn btn-primary');
  go.type = 'button';
  dialog.append(title, events, causes, more, chart, blocks, goals, go);
  veil.append(dialog);
  root.append(veil);

  let expanded = false;
  const paint = (): void => {
    const mission = ctx.store.getState()?.mission;
    const current = mission?.lastReport ?? report;
    title.textContent = ctx.t(mission?.level === 'marte' ? 'ui.report.solTitle' : 'ui.report.title', { day: current?.day ?? '—' });
    events.replaceChildren();
    const active = current?.activeEvents ?? [];
    events.dataset.quiet = active.length > 0 ? 'false' : 'true';
    if (active.length > 0) {
      for (const item of active) events.append(el('span', 'report-event', ctx.t(`content.event.${item.type}.name`)));
    } else {
      events.append(el('span', 'report-event', ctx.t('ui.report.noEvents')));
    }
    paintCauses(causes, more, current, expanded, ctx);
    blocks.replaceChildren();
    if (current) blocks.append(energyBlock(ctx, current), lifeBlock(ctx, current), shieldBlock(ctx, current));
    chart.replaceChildren(...(current ? [balanceChart(ctx, current)] : []));
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
  host.replaceChildren(heading('💡', ctx.t('ui.report.causes')));
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

/** A card title with an icon, matching the base panel. */
function heading(icon: string, text: string): HTMLElement {
  const h = el('h3', 'report-card-title', text);
  h.dataset.icon = icon;
  return h;
}

/** The label of a "Label {n}" string without its number. */
function labelOf(ctx: AppContext, key: string): string {
  return ctx.t(key, { n: '' }).replace(/[:\s]+$/, '').trim();
}

/** A small figure tile: big number, short label under it. */
function stat(value: number | string, label: string, tone?: 'ok' | 'warn' | 'crit' | 'dim'): HTMLElement {
  const tile = el('div', 'report-stat');
  if (tone) tile.dataset.tone = tone;
  tile.append(el('strong', 'report-stat-value', String(value)), el('span', 'report-stat-label', label));
  return tile;
}

function energyBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section', 'report-card');
  block.append(heading('⚡', ctx.t('ui.report.energy')));
  const tiles = el('div', 'report-stats');
  const mission = ctx.store.getState()?.mission;
  tiles.append(
    stat(report.energy.generated, labelOf(ctx, 'ui.report.generated'), report.energy.generated > 0 ? 'ok' : 'dim'),
    stat(report.energy.used, labelOf(ctx, 'ui.report.used')),
    stat(report.energy.end, labelOf(ctx, 'ui.report.stored'), report.energy.end > 0 ? 'ok' : 'warn'),
    stat(report.energy.wasted, labelOf(ctx, 'ui.report.wasted'), report.energy.wasted > 0 ? 'warn' : 'dim'),
  );
  if (mission) tiles.append(stat(mission.resources.materiales, labelOf(ctx, 'ui.hud.materials')));
  block.append(tiles);
  if (mission) {
    const constructions = mission.buildings.filter(
      (b) => b.type !== 'nave' && (b.placedDay === report.day || b.operationalFromDay > report.day),
    );
    if (constructions.length > 0) {
      block.append(el('p', 'report-sub', ctx.t('ui.report.buildings')));
      const chips = el('div', 'report-chips');
      for (const b of constructions) {
        const name = ctx.t(ctx.data.buildings[b.type]?.nameKey ?? b.type);
        const ready = ctx.t('content.map.readyDay', { day: b.operationalFromDay });
        chips.append(el('span', 'report-chip', `${name} · ${ready}`));
      }
      block.append(chips);
    }
  }
  return block;
}

const LIFE_ICON = { oxigeno: '💨', agua: '💧', alimentos: '🥕' } as const;

function lifeBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section', 'report-card');
  block.append(heading('🫁', ctx.t('ui.report.life')));
  const table = el('div', 'report-life');
  for (const id of ['oxigeno', 'agua', 'alimentos'] as const) {
    const short = report.shortages[id];
    const row = el('div', 'report-life-row');
    row.dataset.short = short > 0 ? 'true' : 'false';
    row.setAttribute('aria-label', ctx.t('ui.report.line', {
      name: ctx.t(`ui.resource.${id}`),
      made: report.produced[id],
      used: report.crewConsumed[id],
      short,
    }));
    const name = el('span', 'report-life-name', ctx.t(`ui.resource.${id}`));
    name.dataset.icon = LIFE_ICON[id];
    row.append(
      name,
      stat(report.produced[id], ctx.t('ui.report.chart.made'), report.produced[id] > 0 ? 'ok' : 'dim'),
      stat(report.crewConsumed[id], ctx.t('ui.report.chart.used')),
      stat(short, ctx.t('ui.report.stat.short'), short > 0 ? 'crit' : 'dim'),
    );
    table.append(row);
  }
  block.append(table);
  return block;
}

export function suitExposureReduction(state: GameState, report: DayReport, data: GameData): number {
  if (report.radiationLevel === 0 || report.crew.every((member) => member.sheltered)) return 0;
  const base = data.constants.exposure[report.radiationLevel].unsheltered;
  return Math.min(base, designSuitShield(state.campaign, data));
}

function shieldBlock(ctx: AppContext, report: DayReport): HTMLElement {
  const block = el('section', 'report-card');
  block.append(heading('🛡', ctx.t('ui.report.shield')));
  const shelter = el('p', 'report-chip report-shelter', ctx.t(report.shelter.active ? 'ui.report.shelterOn' : 'ui.report.shelterOff'));
  shelter.dataset.on = report.shelter.active ? 'true' : 'false';
  block.append(shelter);
  const state = ctx.store.getState();
  const reduced = state ? suitExposureReduction(state, report, ctx.data) : 0;
  if (reduced > 0) block.append(el('p', 'report-sub', ctx.t('ui.onboard.suits', { n: reduced })));
  const crew = el('div', 'report-crew');
  for (const member of report.crew) {
    const known = state?.mission.crew.find((person) => person.id === member.id);
    const name = ctx.t(known?.nameKey ?? `content.crew.${member.id}`);
    const row = el('div', 'report-crew-row');
    row.setAttribute('aria-label', ctx.t('ui.report.crewLine', { name, exposure: member.exposure, delta: member.exposureDelta }));
    const delta = el('span', 'report-delta', `${member.exposureDelta > 0 ? '+' : ''}${member.exposureDelta}`);
    delta.dataset.tone = member.exposureDelta > 0 ? 'warn' : 'ok';
    row.append(
      el('span', 'report-crew-name', name),
      el('span', 'report-crew-exposure', `${ctx.t('ui.report.stat.exposure')} ${member.exposure}`),
      delta,
    );
    crew.append(row);
  }
  block.append(crew);
  return block;
}

function goalLine(ctx: AppContext, report: DayReport | null): string {
  if (!report) return ctx.t('ui.report.empty');
  const fresh = report.objectives.filter((goal) => newlyMet(goal, report));
  const names = fresh.map((goal) => ctx.t(`ui.objective.${goal.id}`)).join(', ');
  return `🏁 ${ctx.t('ui.report.streak', { n: report.streak, goals: names || ctx.t('ui.report.noNewGoals') })}`;
}

function newlyMet(goal: ObjectiveStatus, report: DayReport): boolean {
  return report.causeEffectKeys.some((key) => key.endsWith(goal.id));
}
