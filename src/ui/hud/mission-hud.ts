// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AppContext, Tool } from '../app-bridge';
import type {
  ActionError,
  BuildingType,
  ForecastItem,
  GameState,
  HudSummary,
  Status,
} from '../core-bridge';
import { computeForecast, previewAction, summarizeHud } from '../core-bridge';
import { button } from '../components/button';
import { statusBadge } from '../components/status-badge';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el, hasModal, isTypingTarget, on } from '../dom';
import { mountDayReport } from '../panels/day-report';
import { mountDecisionPanel } from '../panels/decision';
import { mountLearningCheck, shouldAskPre } from '../panels/learning-check';
import { openCards } from '../panels/science-card';
import { mountTutorial } from '../panels/tutorial';

const BLOCKS = new Set(['NO_MATERIALS', 'NO_AP', 'NOT_AVAILABLE_IN_LEVEL', 'WRONG_PHASE', 'DECISION_PENDING']);
const BUILDING_ART = {
  panel: 1, bateria: 2, generador: 3, reciclador: 4, extractor: 5, invernadero: 6, refugio: 7,
  deposito: 0, comunicaciones: 1, laboratorio: 2, habitat: 3,
} as const;
const MARS_BUILDINGS = new Set(['deposito', 'comunicaciones', 'laboratorio', 'habitat']);

export function mountMissionHud(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());

  const top = el('header', 'hud-zone hud-top');
  const side = el('aside', 'hud-zone hud-side');
  const bottom = el('footer', 'hud-zone hud-bottom');
  const polite = el('div', 'sr-only');
  polite.setAttribute('aria-live', 'polite');
  const assertive = el('div', 'sr-only');
  assertive.setAttribute('aria-live', 'assertive');
  const messages = el('p', 'messages');
  const endDay = button({ label: '', className: 'btn-primary end-day', onClick: () => endDayNow() });
  endDay.dataset.tutorial = 'btn-end-day';
  bottom.append(messages, endDay);
  screen.append(top, side, bottom, polite, assertive);

  let openMeter: 'energia' | 'soporte' | 'proteccion' | null = null;
  let pending = false;
  let reportCleanup: (() => void) | null = null;
  let decisionCleanup: (() => void) | null = null;
  let decisionHost: HTMLElement | null = null;
  let cardCleanup: (() => void) | null = null;
  let signature = '';

  const say = (text: string, alert = false): void => {
    messages.textContent = text;
    (alert ? assertive : polite).textContent = text;
  };

  const draw = (): void => {
    const state = ctx.store.getState();
    const tool = ctx.uiStore.getState().tool;
    const next = JSON.stringify(snapshot(state, tool, openMeter, pending, ctx.options.get().language));
    if (next === signature) return;
    signature = next;
    const focusKey = document.activeElement instanceof HTMLElement
      ? document.activeElement.dataset.hudFocus
      : undefined;
    paintTop(top, ctx, state, openMeter, (id) => {
      openMeter = openMeter === id ? null : id;
      signature = '';
      draw();
    }, showCards);
    paintSide(side, ctx, state, tool);
    if (focusKey) {
      screen.querySelector<HTMLElement>(`[data-hud-focus="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
    }
    endDay.textContent = ctx.t('ui.hud.endDay');
    endDay.disabled = pending || state?.mission.phase !== 'planning';
    syncReport(state);
    syncDecision(state);
  };

  function endDayNow(): void {
    const state = ctx.store.getState();
    if (!state || state.mission.phase !== 'planning' || pending || endDay.disabled) return;
    pending = true;
    endDay.disabled = true;
    ctx.audio.unlock();
    ctx.audio.playSfx('sfx-click');
    ctx.store.dispatch({ type: 'END_DAY', day: state.mission.day });
    pending = false;
    signature = '';
    draw();
  }

  function showCards(): void {
    cardCleanup?.();
    cardCleanup = openCards(screen, ctx);
  }

  function syncReport(state: GameState | null): void {
    const show = state?.mission.phase === 'report';
    if (show && !reportCleanup) reportCleanup = mountDayReport(screen, ctx);
    if (!show && reportCleanup) {
      reportCleanup();
      reportCleanup = null;
    }
  }

  function syncDecision(state: GameState | null): void {
    const show = state?.mission.phase === 'decision';
    if (show && !decisionHost) {
      decisionHost = el('div', 'veil');
      decisionHost.dataset.tutorial = 'panel-decision';
      screen.append(decisionHost);
      decisionCleanup = mountDecisionPanel(decisionHost, ctx);
      return;
    }
    if (!show && decisionHost) {
      decisionCleanup?.();
      decisionHost.remove();
      decisionHost = null;
      decisionCleanup = null;
    }
  }

  bag.add(ctx.store.subscribe(() => {
    signature = '';
    draw();
  }));
  bag.add(ctx.uiStore.subscribe(() => {
    signature = '';
    draw();
  }));
  bag.add(ctx.options.subscribe(() => {
    signature = '';
    draw();
  }));
  bag.add(ctx.store.on('action/rejected', (event) => {
    say(ctx.t(event.error.messageKey, event.error.params));
  }));
  bag.add(ctx.store.on('alert/shortage', (event) => {
    say(ctx.t('ui.hud.shortage', { resource: ctx.t(`ui.resource.${event.resource}`), n: event.crewAffected }), true);
  }));
  bag.add(ctx.store.on('alert/radiation', (event) => {
    say(ctx.t(event.sheltered ? 'ui.hud.radiationSheltered' : 'ui.hud.radiationOpen', { level: event.level }), true);
  }));
  bag.add(on(window, 'keydown', (event) => {
    if (event.key === 'Escape' && openMeter && !hasModal()) {
      event.preventDefault();
      openMeter = null;
      draw();
      return;
    }
    onKey(event, ctx, endDayNow, showCards);
  }));
  bag.add(mountTutorial(screen, ctx, (text) => say(text)));

  if (shouldAskPre(ctx)) bag.add(mountLearningCheck(screen, ctx, 'pre'));
  ctx.audio.playMusic(musicFor(ctx.store.getState()?.mission.level));
  draw();
  return () => {
    reportCleanup?.();
    decisionCleanup?.();
    cardCleanup?.();
    bag.run();
  };
}

function musicFor(level: GameState['mission']['level'] | undefined): string {
  if (level === 'marte') return 'music-mars';
  if (level === 'tierra') return 'music-earth';
  return 'music-moon';
}

function onKey(
  event: KeyboardEvent,
  ctx: AppContext,
  endDay: () => void,
  help: () => void,
): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey
    || hasModal() || isTypingTarget(event.target)) return;
  const key = event.key.toLowerCase();
  if (event.key === 'Escape') {
    const tool = ctx.uiStore.getState().tool;
    if (tool.kind !== 'inspect') ctx.uiStore.setTool({ kind: 'inspect' });
    else ctx.flow.go('pausa');
    return;
  }
  if (key === 'f') endDay();
  else if (key === 'p') ctx.flow.go('pausa');
  else if (key === 'h' || event.key === '?') help();
  else if (key === 'b') document.querySelector<HTMLElement>('.palette button:not(:disabled)')?.focus();
  else if (key === 'x') ctx.uiStore.setTool({ kind: 'explore' });
  else if (key === 'c') ctx.uiStore.setTool({ kind: 'collect' });
  else if (key === 'm') (document.querySelector<HTMLElement>('#map button[tabindex="0"]') ?? document.getElementById('map'))?.focus();
  else if (/^[1-7]$/.test(event.key)) pickBuilding(ctx, Number(event.key) - 1);
}

function pickBuilding(ctx: AppContext, index: number): void {
  const state = ctx.store.getState();
  if (!state) return;
  const list = ctx.data.levels[state.mission.level]?.availableBuildings ?? [];
  const building = list[index];
  if (building) ctx.uiStore.setTool({ kind: 'build', building });
}

function paintTop(
  top: HTMLElement,
  ctx: AppContext,
  state: GameState | null,
  openMeter: 'energia' | 'soporte' | 'proteccion' | null,
  toggle: (id: 'energia' | 'soporte' | 'proteccion') => void,
  showCards: () => void,
): void {
  top.replaceChildren();
  if (!state) {
    top.append(el('p', undefined, ctx.t('ui.hud.noMission')));
    return;
  }
  const summary = readSummary(state, ctx);
  const level = ctx.data.difficulty[state.campaign.difficulty]?.levels[state.mission.level];
  const dayKey = state.mission.level === 'marte' ? 'ui.hud.sol' : 'ui.hud.day';
  const clock = el('p', 'hud-clock', level?.dayLimit == null
    ? ctx.t('ui.hud.dayOpen', { day: state.mission.day })
    : ctx.t(dayKey, { day: state.mission.day, limit: level.dayLimit }));
  if (state.mission.level === 'marte') clock.title = ctx.t('ui.hud.solHint');
  const earth = el('p', 'hud-stat');
  earth.append(el('span', 'icon icon-earth'), el('span', undefined, ctx.t('ui.hud.earth', { days: state.campaign.earthDaysRemaining })));
  const meters = el('div', 'hud-meters');
  meters.dataset.tutorial = 'hud-meters';
  meters.append(
    meterButton(ctx, 'energia', summary, openMeter, state, toggle),
    meterButton(ctx, 'soporte', summary, openMeter, state, toggle),
    meterButton(ctx, 'proteccion', summary, openMeter, state, toggle),
  );
  const materials = el('p', 'hud-stat');
  materials.append(el('span', 'icon icon-materiales'), el('span', undefined, ctx.t('ui.hud.materials', { n: state.mission.resources.materiales })));
  const ap = el('p', 'hud-stat');
  ap.append(el('span', 'icon icon-ap'), el('span', undefined, ctx.t('ui.hud.ap', { n: state.mission.ap })));
  const help = button({ label: ctx.t('ui.hud.help'), onClick: press(ctx, showCards) });
  const options = button({ label: ctx.t('ui.hud.options'), onClick: press(ctx, () => ctx.flow.go('opciones')) });
  const pause = button({ label: ctx.t('ui.hud.pause'), onClick: press(ctx, () => ctx.flow.go('pausa')) });
  const actions = el('div', 'hud-actions');
  actions.append(help, options, pause);
  top.append(clock, earth, meters, materials, ap, actions);
}

function meterButton(
  ctx: AppContext,
  id: 'energia' | 'soporte' | 'proteccion',
  summary: HudSummary | null,
  open: string | null,
  state: GameState,
  toggle: (id: 'energia' | 'soporte' | 'proteccion') => void,
): HTMLDivElement {
  const node = button({ label: '', className: 'meter', onClick: press(ctx, () => toggle(id)) });
  node.dataset.hudFocus = `meter-${id}`;
  node.setAttribute('aria-expanded', open === id ? 'true' : 'false');
  const main = el('span', 'meter-main');
  const status = summary ? summary[id].status : null;
  main.append(el('span', `icon icon-${id === 'energia' ? 'energy' : id === 'soporte' ? 'agua' : 'radiation'}`));
  main.append(el('span', undefined, ctx.t(`ui.hud.${id === 'energia' ? 'energy' : id === 'soporte' ? 'life' : 'shield'}`)));
  const value = el('span', 'meter-reading', meterValue(ctx, id, summary));
  if (status) value.append(statusBadge(status, ctx.t(`ui.status.${status}`), ctx.t(`ui.status.mark.${status}`)));
  node.append(main, value);
  const item = el('div', 'meter-slot');
  item.append(node);
  if (open === id) {
    const detail = el('p', 'meter-detail', meterDetail(ctx, id, summary, state));
    detail.id = `hud-detail-${id}`;
    node.setAttribute('aria-describedby', detail.id);
    item.append(detail);
  }
  return item;
}

function meterValue(ctx: AppContext, id: 'energia' | 'soporte' | 'proteccion', summary: HudSummary | null): string {
  if (!summary) return ctx.t('ui.hud.summaryUnavailable');
  if (id === 'energia') return ctx.t('ui.hud.stored', { stored: summary.energia.stored, cap: summary.energia.cap });
  if (id === 'soporte') return ctx.t('ui.hud.margin', { days: summary.soporte.marginDays });
  return ctx.t('ui.hud.exposure', { n: summary.proteccion.maxExposure });
}

function meterDetail(ctx: AppContext, id: 'energia' | 'soporte' | 'proteccion', summary: HudSummary | null, state: GameState): string {
  if (!summary) return ctx.t('ui.hud.summaryUnavailable');
  if (id === 'energia') {
    const extra = summary.energia as HudSummary['energia'] & { unpowered?: number[] };
    const names = (extra.unpowered ?? []).map((buildingId) => {
      const found = state.mission.buildings.find((building) => building.id === buildingId);
      return found ? ctx.t(ctx.data.buildings[found.type].nameKey) : String(buildingId);
    }).join(', ');
    return ctx.t('ui.hud.energyDetail', {
      made: summary.energia.generationToday,
      used: summary.energia.demandToday,
      dark: names || ctx.t('ui.hud.none'),
    });
  }
  if (id === 'soporte') {
    const report = state.mission.lastReport;
    return ctx.t('ui.hud.lifeDetail', {
      limit: ctx.t(`ui.resource.${summary.soporte.limiting}`),
      oxygen: state.mission.resources.oxigeno,
      water: state.mission.resources.agua,
      food: state.mission.resources.alimentos,
      made: report ? report.produced.oxigeno : 0,
      used: report ? report.crewConsumed.oxigeno : 0,
    });
  }
  const crew = state.mission.crew.map((member) => ctx.t('ui.hud.crewExposure', {
    name: ctx.t(member.nameKey),
    n: member.exposure,
  })).join(' · ');
  return ctx.t('ui.hud.shieldDetail', {
    ready: ctx.t(summary.proteccion.shelterReady ? 'ui.hud.shelterReady' : 'ui.hud.shelterNotReady'),
    crew,
  });
}

function paintSide(side: HTMLElement, ctx: AppContext, state: GameState | null, tool: Tool): void {
  side.replaceChildren();
  if (!state) return;
  side.append(
    objectives(ctx, state),
    forecast(ctx, state),
    palette(ctx, state, tool),
    crew(ctx, state),
    marsExtras(ctx, state),
  );
}

function objectives(ctx: AppContext, state: GameState): HTMLElement {
  const block = el('section');
  block.dataset.tutorial = 'hud-objectives';
  const streakTarget = ctx.data.difficulty[state.campaign.difficulty]?.levels[state.mission.level]?.streakDays;
  block.append(el('h2', 'zone-title', ctx.t('ui.hud.objectives')));
  block.append(el('p', undefined, ctx.t('ui.hud.streak', { current: state.mission.streak, target: streakTarget ?? '—' })));
  const list = el('ul', 'goal-list');
  for (const goal of state.mission.objectives) {
    const progress = goal.current !== undefined && goal.target !== undefined ? ` ${goal.current} / ${goal.target}` : '';
    list.append(el('li', undefined, `${goal.met ? ctx.t('ui.hud.met') : ctx.t('ui.hud.pending')} ${ctx.t(`ui.objective.${goal.id}`)}${progress}`));
  }
  block.append(list);
  return block;
}

function forecast(ctx: AppContext, state: GameState): HTMLElement {
  const block = el('section');
  block.dataset.tutorial = 'hud-forecast';
  block.append(el('h2', 'zone-title', ctx.t('ui.hud.forecast')));
  const list = el('ul', 'forecast-list');
  const items = readForecast(state, ctx);
  if (items.length === 0) list.append(el('li', undefined, ctx.t('ui.hud.forecastEmpty')));
  for (const item of items) {
    const when = item.inDays === 0 ? ctx.t('ui.hud.today') : ctx.t('ui.hud.inDays', { days: item.inDays });
    list.append(el('li', undefined, `${when}: ${ctx.t(`content.event.${item.type}.name`)}`));
  }
  block.append(list);
  return block;
}

function palette(ctx: AppContext, state: GameState, tool: Tool): HTMLElement {
  const block = el('section');
  block.append(el('h2', 'zone-title', ctx.t('ui.hud.build')));
  const row = el('div', 'palette');
  const available = ctx.data.levels[state.mission.level]?.availableBuildings ?? [];
  available.forEach((type, index) => row.append(buildButton(ctx, state, type, index, tool)));
  const explore = button({
    label: ctx.t('ui.hud.explore'),
    pressed: tool.kind === 'explore',
    onClick: press(ctx, () => ctx.uiStore.setTool({ kind: 'explore' })),
  });
  explore.dataset.tutorial = 'tool-explore';
  explore.dataset.hudFocus = 'explore';
  const collect = button({
    label: ctx.t('ui.hud.collect'),
    pressed: tool.kind === 'collect',
    onClick: press(ctx, () => ctx.uiStore.setTool({ kind: 'collect' })),
  });
  collect.dataset.tutorial = 'tool-collect';
  collect.dataset.hudFocus = 'collect';
  const tools = el('div', 'hud-tools');
  tools.append(explore, collect);
  block.append(row, tools);
  return block;
}

function buildButton(ctx: AppContext, state: GameState, type: BuildingType, index: number, tool: Tool): HTMLButtonElement {
  const def = ctx.data.buildings[type];
  const reason = cannotBuild(ctx, state, type);
  const node = button({
    label: '',
    className: 'build-btn',
    disabled: reason !== null || state.mission.phase !== 'planning',
    pressed: tool.kind === 'build' && tool.building === type,
    onClick: press(ctx, () => ctx.uiStore.setTool({ kind: 'build', building: type })),
  });
  const label = def ? ctx.t(def.nameKey) : type;
  const heading = el('span', 'build-name', index < 7 ? `${index + 1}. ${label}` : label);
  if (index < 7) node.setAttribute('aria-keyshortcuts', String(index + 1));
  if (Object.hasOwn(BUILDING_ART, type)) {
    const art = el('span', 'build-art');
    art.setAttribute('aria-hidden', 'true');
    art.classList.toggle('build-art-mars', MARS_BUILDINGS.has(type));
    art.style.setProperty('--frame-offset', String(-24 * BUILDING_ART[type as keyof typeof BUILDING_ART]));
    heading.prepend(art);
  }
  node.replaceChildren(
    heading,
    el('small', undefined, def ? ctx.t('ui.hud.cost', { cost: def.cost, ap: def.apCost }) : ''),
    el('small', 'why', def ? ctx.t(def.whyKey) : ''),
  );
  if (reason) node.append(el('small', undefined, ctx.t(reason.messageKey, reason.params)));
  node.dataset.tutorial = `palette-${type}`;
  node.dataset.hudFocus = `build-${type}`;
  return node;
}

function cannotBuild(ctx: AppContext, state: GameState, type: BuildingType): ActionError | null {
  const def = ctx.data.buildings[type];
  try {
    const error = previewAction(state, { type: 'BUILD', building: type, x: 0, y: 0 }, ctx.data);
    if (error && BLOCKS.has(error.code)) return error;
    return null;
  } catch {
    if (!def) return null;
    if (state.mission.resources.materiales < def.cost) {
      return { code: 'NO_MATERIALS', messageKey: 'sim.error.NO_MATERIALS', params: { need: def.cost, have: state.mission.resources.materiales } };
    }
    if (state.mission.ap < def.apCost) return { code: 'NO_AP', messageKey: 'sim.error.NO_AP' };
    return null;
  }
}

function crew(ctx: AppContext, state: GameState): HTMLElement {
  const block = el('section');
  block.append(el('h2', 'zone-title', ctx.t('ui.hud.crew')));
  const list = el('ul', 'crew-list');
  state.mission.crew.forEach((member, index) => {
    const row = el('li', 'crew-row');
    const portrait = el('span', index > 3 ? 'portrait portrait-mars' : 'portrait');
    if (index < 6) portrait.style.setProperty('--frame-offset', String(-32 * (index % 4)));
    else portrait.classList.add('portrait-empty');
    portrait.setAttribute('aria-hidden', 'true');
    const health = el('span', 'bar');
    const fill = el('span');
    fill.style.width = `${Math.max(0, Math.min(100, member.health))}%`;
    health.append(fill);
    row.append(
      portrait,
      el('span', undefined, ctx.t(member.nameKey)),
      health,
      el('span', undefined, ctx.t('ui.hud.health', { n: member.health })),
      el('span', undefined, ctx.t('ui.hud.exposureShort', { n: member.exposure })),
    );
    list.append(row);
  });
  block.append(list);
  return block;
}

function marsExtras(ctx: AppContext, state: GameState): HTMLElement {
  const block = el('section', 'dust-row');
  if (state.mission.level !== 'marte') return block;
  const summary = readSummary(state, ctx) as (HudSummary & {
    dust?: { status: Status; coverage: number };
    link?: { status: Status; delay?: number };
  }) | null;
  if (summary?.dust) {
    block.append(statusBadge(summary.dust.status, ctx.t('ui.hud.dust', { n: summary.dust.coverage }), ctx.t(`ui.status.mark.${summary.dust.status}`)));
  } else {
    block.append(el('p', undefined, ctx.t('ui.hud.dustPending')));
  }
  block.append(button({
    label: ctx.t('ui.hud.clean'),
    disabled: state.mission.phase !== 'planning',
    onClick: press(ctx, () => ctx.store.dispatch({ type: 'CLEAN_PANELS' })),
  }));
  if (summary?.link) {
    block.append(statusBadge(summary.link.status, ctx.t('ui.hud.link', { n: summary.link.delay ?? '—' }), ctx.t(`ui.status.mark.${summary.link.status}`)));
  } else {
    block.append(el('p', undefined, ctx.t('ui.hud.linkPending')));
  }
  const damaged = state.mission.buildings.find((building) => building.damaged);
  if (damaged) {
    block.append(button({
      label: ctx.t('ui.hud.repair'),
      onClick: press(ctx, () => ctx.store.dispatch({ type: 'REPAIR', buildingId: damaged.id })),
    }));
  }
  return block;
}

function readSummary(state: GameState, ctx: AppContext): HudSummary | null {
  try {
    return summarizeHud(state, ctx.data);
  } catch {
    return null;
  }
}

function readForecast(state: GameState, ctx: AppContext): ForecastItem[] {
  try {
    return computeForecast(state, ctx.data);
  } catch {
    return [];
  }
}

function snapshot(
  state: GameState | null,
  tool: Tool,
  openMeter: string | null,
  pending: boolean,
  language: string,
): unknown {
  return {
    language,
    openMeter,
    pending,
    tool,
    day: state?.mission.day,
    phase: state?.mission.phase,
    resources: state?.mission.resources,
    ap: state?.mission.ap,
    streak: state?.mission.streak,
    objectives: state?.mission.objectives,
    crew: state?.mission.crew,
    buildings: state?.mission.buildings.map((building) => [building.id, building.enabled, building.damaged]),
  };
}
