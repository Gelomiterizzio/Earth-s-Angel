// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AppContext, Tool } from '../app-bridge';
import { designCommsForecast, designForecastBonus, designOf, designRepairCost } from '../../core/design';
import { forecastHorizon } from '../../core/progression';
import { mineralPayloadExtra } from '../../map/map-input';
import type {
  ActionError,
  BuildingType,
  CampaignData,
  CampaignState,
  ForecastItem,
  GameState,
  HudSummary,
} from '../core-bridge';
import { computeForecast, previewAction, summarizeHud } from '../core-bridge';
import { button } from '../components/button';
import { spaceAppsEntry } from '../components/space-apps';
import { statusBadge } from '../components/status-badge';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el, hasModal, isTypingTarget, on } from '../dom';
import { mountDayReport } from '../panels/day-report';
import { mountDecisionPanel } from '../panels/decision';
import { openShelterScene } from '../panels/shelter-scene';
import { mountDayQuiz } from '../panels/day-quiz';
import { mountLearningCheck, shouldAskPre } from '../panels/learning-check';
import { mountOnboardArrival } from '../panels/onboard-arrival';
import { openCards } from '../panels/science-card';
import { mountTutorial } from '../panels/tutorial';
import { clueLog } from './clues';

const BLOCKS = new Set(['NO_MATERIALS', 'NO_AP', 'NOT_AVAILABLE_IN_LEVEL', 'WRONG_PHASE', 'DECISION_PENDING']);
const BUILDING_ART = {
  panel: 1, bateria: 2, generador: 3, reciclador: 4, extractor: 5, invernadero: 6, refugio: 7,
  deposito: 0, comunicaciones: 1, laboratorio: 2, habitat: 3,
} as const;
const MARS_BUILDINGS = new Set(['deposito', 'comunicaciones', 'laboratorio', 'habitat']);
const RESERVE_RESOURCES = [
  ['oxigeno', 'oxigeno'],
  ['agua', 'agua'],
  ['alimentos', 'alimentos'],
  ['energia', 'energy'],
  ['materiales', 'materiales'],
] as const;

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
  const reserves = el('aside', 'hud-reserves');
  const reserveList = el('ul', 'hud-reserve-list');
  reserveList.id = 'mission-reserve-list';
  reserveList.hidden = true;
  const reserveToggle = button({
    label: ctx.t('ui.hud.reservesShortcut'),
    onClick: () => {
      reserveList.hidden = !reserveList.hidden;
      reserveToggle.setAttribute('aria-expanded', String(!reserveList.hidden));
    },
  });
  reserveToggle.dataset.tutorial = 'hud-reserves';
  reserveToggle.setAttribute('aria-controls', reserveList.id);
  reserveToggle.setAttribute('aria-expanded', 'false');
  reserveToggle.setAttribute('aria-keyshortcuts', 'R');
  const reserveRows = RESERVE_RESOURCES.map(([id, icon]) => {
    const row = el('li');
    const glyph = el('span', `icon icon-${icon}`);
    glyph.setAttribute('aria-hidden', 'true');
    const label = el('span', 'sr-only');
    const amount = el('span');
    row.append(glyph, label, amount);
    reserveList.append(row);
    return { id, row, label, amount };
  });
  reserves.append(reserveToggle, reserveList);
  const polite = el('div', 'sr-only');
  polite.setAttribute('aria-live', 'polite');
  const assertive = el('div', 'sr-only');
  assertive.setAttribute('aria-live', 'assertive');
  const messages = el('p', 'messages');
  const endDay = button({ label: '', className: 'btn-primary end-day', onClick: () => endDayNow() });
  endDay.dataset.tutorial = 'btn-end-day';
  bottom.append(messages, endDay);
  let eventBadge = spaceAppsEntry(ctx);
  bottom.insertBefore(eventBadge, endDay);
  screen.append(top, side, bottom, reserves, polite, assertive);

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
    paintSide(side, ctx, state, tool, say);
    side.hidden = (state?.mission.level === 'luna' || state?.mission.level === 'marte')
      && ctx.uiStore.get().openPanel !== 'base';
    reserves.hidden = !state;
    const reservesName = ctx.t('ui.hud.reserves');
    reserveToggle.textContent = ctx.t('ui.hud.reservesShortcut');
    reserveToggle.title = reservesName;
    reserveList.setAttribute('aria-label', reservesName);
    if (state) {
      for (const { id, row, label, amount } of reserveRows) {
        const name = ctx.t(`ui.resource.${id}`);
        row.title = name;
        label.textContent = `${name}: `;
        amount.textContent = String(state.mission.resources[id]);
      }
    }
    if (focusKey) {
      screen.querySelector<HTMLElement>(`[data-hud-focus="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
    }
    endDay.textContent = ctx.t(state?.mission.level === 'marte' ? 'ui.hud.endSol' : 'ui.hud.endDay');
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

  bag.add(ctx.store.subscribe((_state, events) => {
    signature = '';
    draw();
    if (events?.some(({ type }: { type: string }) => type === 'scan/empty')) say(ctx.t('ui.clues.scanEmpty'));
  }));
  bag.add(ctx.uiStore.subscribe(() => {
    signature = '';
    draw();
  }));
  bag.add(ctx.options.subscribe(() => {
    const translatedBadge = spaceAppsEntry(ctx);
    eventBadge.replaceWith(translatedBadge);
    eventBadge = translatedBadge;
    signature = '';
    draw();
  }));
  bag.add(ctx.store.on('action/rejected', (event) => {
    say(ctx.t(event.error.messageKey, event.error.params));
  }));
  bag.add(ctx.store.on('resource/collected', ({ resource, amount }) => {
    const state = ctx.store.getState();
    if (!state || resource !== 'materiales') return;
    const extra = mineralPayloadExtra(state, ctx.data, amount);
    say(extra > 0 ? ctx.t('ui.onboard.drill', { n: extra }) : ctx.t('content.map.walk.done.COLLECT_DETAIL', { n: amount }));
  }));
  bag.add(ctx.store.on('decision/made', (event) => {
    if (!event.shelter) return;
    const crew = ctx.store.getState()?.mission.crew.length ?? 4;
    // Opens after the decision panel has closed, so the scene owns the focus.
    queueMicrotask(() => bag.add(openShelterScene(screen, ctx, crew)));
  }));
  bag.add(ctx.store.on('alert/shortage', (event) => {
    say(ctx.t('ui.hud.shortage', { resource: ctx.t(`ui.resource.${event.resource}`), n: event.crewAffected }), true);
  }));
  bag.add(ctx.store.on('alert/radiation', (event) => {
    say(ctx.t(event.sheltered ? 'ui.hud.radiationSheltered' : 'ui.hud.radiationOpen', { level: event.level }), true);
  }));
  bag.add(ctx.store.on('discovery/found', ({ discoveryId }) => {
    if (discoveryId.startsWith('beacon-')) say(ctx.t('ui.clues.beaconFound'));
    else if (/^(luna|marte)\.(column|row|signal)$/.test(discoveryId)) say(ctx.t('ui.clues.newClue'));
  }));
  bag.add(on(window, 'keydown', (event) => {
    if (event.key === 'Escape' && !hasModal() && !event.defaultPrevented) {
      if (openMeter) {
        event.preventDefault();
        openMeter = null;
        draw();
        return;
      }
      const clues = side.querySelector<HTMLDetailsElement>('.clue-log[open]');
      if (clues) {
        event.preventDefault();
        clues.open = false;
        clues.querySelector('summary')?.focus();
        return;
      }
    }
    onKey(event, ctx, endDayNow, showCards, () => reserveToggle.click());
  }));
  bag.add(mountTutorial(screen, ctx, (text) => say(text)));
  bag.add(mountDayQuiz(screen, ctx));

  if (shouldAskPre(ctx)) bag.add(mountLearningCheck(screen, ctx, 'pre'));
  bag.add(mountOnboardArrival(screen, ctx));
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
  toggleReserves: () => void,
): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey
    || hasModal() || isTypingTarget(event.target)) return;
  const key = event.key.toLowerCase();
  if (event.key === 'Escape') {
    if (ctx.uiStore.get().openPanel === 'base') {
      ctx.uiStore.openPanel(null);
      return;
    }
    const tool = ctx.uiStore.getState().tool;
    if (tool.kind !== 'inspect') ctx.uiStore.setTool({ kind: 'inspect' });
    else ctx.flow.go('pausa');
    return;
  }
  if (key === 'f') endDay();
  else if (key === 'r') {
    event.preventDefault();
    toggleReserves();
  }
  else if (key === 'p') ctx.flow.go('pausa');
  else if (key === 'h' || event.key === '?') help();
  else if (key === 'b') {
    const level = ctx.store.getState()?.mission.level;
    if (level === 'luna' || level === 'marte') {
      ctx.uiStore.openPanel(ctx.uiStore.get().openPanel === 'base' ? null : 'base');
    } else {
      document.querySelector<HTMLElement>('.palette button:not(:disabled)')?.focus();
    }
  }
  else if (key === 'c') ctx.uiStore.setTool({ kind: 'collect' });
  else if (key === 'm') {
    event.preventDefault();
    const currentPanel = ctx.uiStore.getState().openPanel;
    ctx.uiStore.openPanel(currentPanel === 'journal' ? null : 'journal');
  }
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
  const unit = state.mission.level === 'marte' ? 'sol' : 'day';
  const displayDay = state.mission.phase === 'report'
    ? state.mission.lastReport?.day ?? state.mission.day
    : state.mission.day;
  // AI-assisted: Claude Code (claude-opus-5-5). Numbers stand out by colour; bars show progress.
  const clockText = ctx.t(`ui.hud.${unit}${level?.dayLimit == null ? 'Open' : ''}`, {
    day: displayDay, limit: level?.dayLimit ?? '',
  });
  const clock = el('p', 'hud-clock');
  clock.setAttribute('aria-label', clockText);
  clock.append(emphasize(clockText, displayDay, 'hud-num-accent'));
  if (level?.dayLimit) {
    const share = Math.min(1, displayDay / level.dayLimit);
    clock.append(hudBar(share, share >= 0.85 ? 'crit' : share >= 0.65 ? 'warn' : 'ok'));
  }
  if (state.mission.level === 'marte') {
    clock.title = `${ctx.t('ui.hud.solHint')} ${ctx.t('ui.hud.marsGravity')}`;
  }
  const earth = el('p', 'hud-stat hud-earth');
  const earthDays = state.campaign.earthDaysRemaining;
  earth.dataset.level = earthDays <= 10 ? 'crit' : earthDays <= 20 ? 'warn' : 'ok';
  earth.append(el('span', 'icon icon-earth'), emphasize(ctx.t('ui.hud.earth', { days: earthDays }), earthDays, 'hud-num'));
  const meters = el('div', 'hud-meters');
  meters.dataset.tutorial = 'hud-meters';
  meters.append(
    meterButton(ctx, 'energia', summary, openMeter, state, toggle),
    meterButton(ctx, 'soporte', summary, openMeter, state, toggle),
    meterButton(ctx, 'proteccion', summary, openMeter, state, toggle),
  );
  const materials = el('p', 'hud-stat hud-materials');
  const stock = state.mission.resources.materiales;
  materials.dataset.level = stock < 6 ? 'crit' : stock < 12 ? 'warn' : 'ok';
  materials.append(el('span', 'icon icon-materiales'), emphasize(ctx.t('ui.hud.materials', { n: stock }), stock, 'hud-num'));
  const ap = el('p', 'hud-stat hud-ap');
  ap.dataset.level = state.mission.ap === 0 ? 'crit' : 'ok';
  const apText = ctx.t('ui.hud.ap', { n: state.mission.ap });
  ap.setAttribute('aria-label', apText);
  const pips = el('span', 'hud-pips');
  pips.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < state.mission.crew.length; i++) pips.append(el('i', i < state.mission.ap ? 'is-on' : undefined));
  ap.append(el('span', 'icon icon-ap'), emphasize(apText, state.mission.ap, 'hud-num'), pips);
  const help = button({ label: ctx.t('ui.hud.help'), onClick: press(ctx, showCards) });
  const options = button({ label: ctx.t('ui.hud.options'), onClick: press(ctx, () => ctx.flow.go('opciones')) });
  const pause = button({ label: ctx.t('ui.hud.pause'), onClick: press(ctx, () => ctx.flow.go('pausa')) });
  const actions = el('div', 'hud-actions');
  if (state.mission.level === 'luna' || state.mission.level === 'marte') {
    const base = button({ label: ctx.t('content.map.walk.baseShortcut'), onClick: () => {
      ctx.uiStore.openPanel(ctx.uiStore.get().openPanel === 'base' ? null : 'base');
    } });
    base.dataset.hudFocus = 'base';
    base.dataset.tutorial = 'btn-base';
    base.setAttribute('aria-expanded', String(ctx.uiStore.get().openPanel === 'base'));
    actions.append(base);
  }
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
  if (status) node.dataset.status = status;
  const reading = meterValue(ctx, id, summary, state.mission.level === 'marte');
  const value = el('span', 'meter-reading');
  const number = !summary ? null : id === 'energia' ? summary.energia.stored
    : id === 'soporte' ? summary.soporte.marginDays : summary.proteccion.maxExposure;
  value.append(number === null ? el('span', undefined, reading) : emphasize(reading, number, 'meter-num'));
  if (status) value.append(statusBadge(status, ctx.t(`ui.status.${status}`), ctx.t(`ui.status.mark.${status}`)));
  node.append(main, value);
  if (summary && id === 'energia' && summary.energia.cap > 0) {
    node.append(hudBar(summary.energia.stored / summary.energia.cap, status === 'critico' ? 'crit' : status === 'preventivo' ? 'warn' : 'ok'));
  }
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

/** The text with the first appearance of the number wrapped in <b class>, to colour it. */
function emphasize(text: string, value: number, className: string): HTMLElement {
  const holder = el('span', 'hud-text');
  const needle = String(value);
  const at = text.indexOf(needle);
  if (at < 0) {
    holder.textContent = text;
    return holder;
  }
  holder.append(document.createTextNode(text.slice(0, at)), el('b', className, needle),
    document.createTextNode(text.slice(at + needle.length)));
  return holder;
}

/** Thin progress bar for the top bar. */
function hudBar(share: number, level: 'ok' | 'warn' | 'crit'): HTMLElement {
  const bar = el('span', 'hud-bar');
  bar.dataset.level = level;
  bar.setAttribute('aria-hidden', 'true');
  const fill = el('i');
  fill.style.setProperty('--share', String(Math.max(0, Math.min(1, share))));
  bar.append(fill);
  return bar;
}

function meterValue(ctx: AppContext, id: 'energia' | 'soporte' | 'proteccion', summary: HudSummary | null, sols = false): string {
  if (!summary) return ctx.t('ui.hud.summaryUnavailable');
  if (id === 'energia') return ctx.t('ui.hud.stored', { stored: summary.energia.stored, cap: summary.energia.cap });
  if (id === 'soporte') return ctx.t(sols ? 'ui.hud.marginSols' : 'ui.hud.margin', { days: summary.soporte.marginDays });
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

function paintSide(side: HTMLElement, ctx: AppContext, state: CampaignState | null, tool: Tool, say: (text: string) => void): void {
  const cluesOpen = side.querySelector('.clue-log[open]') !== null;
  side.replaceChildren();
  if (!state) return;
  side.append(objectives(ctx, state), forecast(ctx, state));
  if (state.mission.level === 'marte') side.append(marsExtras(ctx, state, say));
  const clues = clueLog(ctx, state, cluesOpen);
  if (clues) side.append(clues);
  side.append(palette(ctx, state, tool), crew(ctx, state));
}

function objectives(ctx: AppContext, state: GameState): HTMLElement {
  const block = el('section');
  block.dataset.tutorial = 'hud-objectives';
  const streakTarget = ctx.data.difficulty[state.campaign.difficulty]?.levels[state.mission.level]?.streakDays;
  const met = state.mission.objectives.filter((goal) => goal.met).length;
  const total = state.mission.objectives.length;
  const title = el('h2', 'zone-title zone-title-count');
  title.append(el('span', undefined, ctx.t('ui.hud.objectives')), el('span', 'zone-count', `${met} / ${total}`));
  block.append(title);
  block.append(streakRow(ctx, state.mission.streak, streakTarget));
  // AI-assisted: Claude Code (claude-opus-5-5). Status chip, name, numbers and a small bar per goal.
  const list = el('ul', 'goal-list goal-board');
  for (const goal of state.mission.objectives) {
    const hasNumbers = goal.current !== undefined && goal.target !== undefined;
    const share = hasNumbers && goal.target ? Math.max(0, Math.min(1, (goal.current ?? 0) / goal.target)) : goal.met ? 1 : 0;
    const status = goal.met ? 'met' : share > 0 ? 'progress' : 'pending';
    const name = ctx.t(`ui.objective.${goal.id}`);
    const item = el('li', 'goal');
    item.dataset.state = status;
    item.setAttribute('aria-label', `${goal.met ? ctx.t('ui.hud.met') : ctx.t('ui.hud.pending')}: ${name}${hasNumbers ? ` ${goal.current} / ${goal.target}` : ''}`);
    const chip = el('span', 'goal-chip', goal.met ? '✓' : '○');
    chip.title = goal.met ? ctx.t('ui.hud.met') : ctx.t('ui.hud.pending');
    chip.setAttribute('aria-hidden', 'true');
    const label = el('span', 'goal-name', name);
    label.setAttribute('aria-hidden', 'true');
    item.append(chip, label);
    if (hasNumbers) {
      const numbers = el('span', 'goal-num');
      numbers.setAttribute('aria-hidden', 'true');
      numbers.append(el('b', undefined, String(goal.current)), document.createTextNode(` / ${goal.target}`));
      item.append(numbers);
    }
    const bar = el('span', 'goal-bar');
    bar.setAttribute('aria-hidden', 'true');
    const fill = el('i');
    fill.style.setProperty('--share', String(share));
    bar.append(fill);
    item.append(bar);
    list.append(item);
  }
  block.append(list);
  return block;
}

/** Stability streak as a number and one dot per day of the target. */
function streakRow(ctx: AppContext, current: number, target: number | undefined): HTMLElement {
  const row = el('p', 'hud-streak');
  row.setAttribute('aria-label', ctx.t('ui.hud.streak', { current, target: target ?? '—' }));
  const label = el('span', 'hud-streak-label', ctx.t('ui.hud.streakShort'));
  const value = el('span', 'hud-streak-value');
  value.append(el('b', undefined, String(current)), document.createTextNode(` / ${target ?? '—'}`));
  const dots = el('span', 'hud-streak-dots');
  for (let i = 0; i < (target ?? 0); i++) dots.append(el('i', i < current ? 'is-on' : undefined));
  for (const part of [label, value, dots]) part.setAttribute('aria-hidden', 'true');
  row.append(label, value, dots);
  if (target !== undefined && current >= target) row.classList.add('is-done');
  return row;
}

const EVENT_ICON: Record<string, string> = {
  sombra: '🌑', 'tormenta-solar': '☢', 'tormenta-polvo': '🌪', averia: '🔧',
};

function forecast(ctx: AppContext, state: GameState): HTMLElement {
  const block = el('section');
  block.dataset.tutorial = 'hud-forecast';
  block.append(el('h2', 'zone-title', ctx.t('ui.hud.forecast')));
  const list = el('ul', 'forecast-list');
  const items = readForecast(state, ctx);
  const mars = state.mission.level === 'marte';
  const bonus = designForecastBonus(state.campaign, ctx.data);
  const hasAntenna = designCommsForecast(state.campaign, ctx.data) > 0;
  const withoutSensor = items.length > 0 && (bonus > 0 || hasAntenna) ? forecastHorizon(state, ctx.data) - bonus : 0;
  const baseHorizon = hasAntenna && items.length > 0 ? forecastHorizon({
    ...state,
    campaign: { ...state.campaign, design: { ...designOf(state.campaign), comms: 'estandar' } },
  }, ctx.data) - bonus : withoutSensor;
  if (items.length === 0) list.append(el('li', 'forecast-empty', ctx.t(mars ? 'ui.hud.marsForecastEmpty' : 'ui.hud.forecastEmpty')));
  for (const item of items) {
    const when = item.inDays === 0
      ? ctx.t(mars ? 'ui.hud.thisSol' : 'ui.hud.today')
      : ctx.t(mars ? (item.inDays === 1 ? 'ui.hud.nextSol' : 'ui.hud.inSols') : 'ui.hud.inDays', { days: item.inDays });
    const line = el('li', 'forecast-item');
    line.dataset.urgency = item.inDays === 0 ? 'now' : item.inDays === 1 ? 'soon' : 'later';
    const icon = el('span', 'forecast-icon', EVENT_ICON[item.type] ?? '•');
    icon.setAttribute('aria-hidden', 'true');
    line.append(el('span', 'forecast-when', when), icon, el('span', 'forecast-name', ctx.t(`content.event.${item.type}.name`)));
    if (bonus > 0 && item.inDays > withoutSensor) {
      line.append(el('small', 'onboard-forecast', ctx.t(bonus === 1 ? 'ui.onboard.sensor' : 'ui.onboard.sensorPlural', { n: bonus })));
    } else if (hasAntenna && item.inDays > baseHorizon) {
      line.append(el('small', 'onboard-forecast', ctx.t('ui.onboard.antennaForecast')));
    }
    list.append(line);
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
  const data: CampaignData = ctx.data;
  if (data.levels[state.mission.level]?.secret) {
    const scan = button({
      label: ctx.t('ui.hud.scan'),
      pressed: (tool.kind as string) === 'scan',
      disabled: state.mission.phase !== 'planning' || state.mission.ap === 0,
      onClick: press(ctx, () => ctx.uiStore.setTool({ kind: 'scan' } as unknown as Tool)),
    });
    scan.dataset.hudFocus = 'scan';
    tools.append(scan);
  }
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
  // AI-assisted: Claude Code (claude-opus-5-5). Key badge, cost chips and warning per card.
  const heading = el('span', 'build-name');
  heading.append(el('span', 'build-label', label));
  if (index < 7) {
    node.setAttribute('aria-keyshortcuts', String(index + 1));
    const key = el('kbd', 'build-key', String(index + 1));
    key.setAttribute('aria-hidden', 'true');
    heading.prepend(key);
  }
  if (Object.hasOwn(BUILDING_ART, type)) {
    const art = el('span', 'build-art');
    art.setAttribute('aria-hidden', 'true');
    art.classList.toggle('build-art-mars', MARS_BUILDINGS.has(type));
    art.style.setProperty('--frame-offset', String(-24 * BUILDING_ART[type as keyof typeof BUILDING_ART]));
    heading.prepend(art);
  }
  const costs = el('span', 'build-costs');
  if (def) {
    costs.setAttribute('aria-label', ctx.t('ui.hud.cost', { cost: def.cost, ap: def.apCost }));
    const materials = el('span', 'build-chip', `🧱 ${def.cost}`);
    materials.classList.toggle('is-short', state.mission.resources.materiales < def.cost);
    materials.title = ctx.t('ui.hud.costMaterials', { n: def.cost, have: state.mission.resources.materiales });
    const ap = el('span', 'build-chip build-chip-ap', `⚡ ${def.apCost} ${ctx.t('ui.hud.apShort')}`);
    ap.classList.toggle('is-short', state.mission.ap < def.apCost);
    ap.title = ctx.t('ui.hud.costAp', { n: def.apCost, have: state.mission.ap });
    for (const chip of [materials, ap]) chip.setAttribute('aria-hidden', 'true');
    costs.append(materials, ap);
  }
  node.replaceChildren(heading, costs, el('small', 'why', def ? ctx.t(def.whyKey) : ''));
  node.classList.toggle('is-blocked', reason !== null);
  if (reason) node.append(el('small', 'build-warning', `⚠ ${ctx.t(reason.messageKey, reason.params)}`));
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
  const limit = ctx.data.constants.exposureLimit;
  const caution = ctx.data.constants.exposureCaution;
  const active = state.mission.crew.filter((member) => member.health > 0 && member.exposure < limit).length;
  const title = el('h2', 'zone-title zone-title-count');
  title.append(el('span', undefined, ctx.t('ui.hud.crew')),
    el('span', 'zone-count', ctx.t('ui.hud.crewActive', { n: active, total: state.mission.crew.length })));
  block.append(title);
  const list = el('ul', 'crew-list crew-board');
  state.mission.crew.forEach((member, index) => {
    const row = el('li', 'crew-row');
    const portrait = el('span', index > 3 ? 'portrait portrait-mars' : 'portrait');
    if (index < 6) portrait.style.setProperty('--frame-offset', String(-32 * (index % 4)));
    else portrait.classList.add('portrait-empty');
    portrait.setAttribute('aria-hidden', 'true');
    // AI-assisted: Claude Code (claude-opus-5-5). Health and exposure meters with colour by state.
    const healthState = member.health <= 0 ? 'crit' : member.health < 50 ? 'crit' : member.health < 80 ? 'warn' : 'ok';
    const exposureState = member.exposure >= limit ? 'crit' : member.exposure >= caution ? 'warn' : 'ok';
    row.dataset.state = healthState === 'crit' || exposureState === 'crit' ? 'crit'
      : healthState === 'warn' || exposureState === 'warn' ? 'warn' : 'ok';
    const name = ctx.t(member.nameKey);
    row.setAttribute('aria-label', `${name}. ${ctx.t('ui.hud.health', { n: member.health })}. ${ctx.t('ui.hud.exposureShort', { n: member.exposure })}`);
    const meter = (kind: 'health' | 'exposure', icon: string, value: number, max: number, level: string): HTMLElement => {
      const box = el('span', `crew-meter crew-${kind}`);
      box.dataset.level = level;
      box.title = kind === 'health' ? ctx.t('ui.hud.health', { n: value }) : ctx.t('ui.hud.exposureShort', { n: value });
      const bar = el('span', 'crew-bar');
      const fill = el('i');
      fill.style.setProperty('--share', String(Math.max(0, Math.min(1, value / max))));
      bar.append(fill);
      box.append(el('span', 'crew-icon', icon), bar, el('b', 'crew-num', String(value)));
      return box;
    };
    const info = el('span', 'crew-info');
    info.append(el('span', 'crew-name', name), el('span', 'crew-meters'));
    info.lastElementChild!.append(
      meter('health', '♥', member.health, 100, healthState),
      meter('exposure', '☢', member.exposure, limit, exposureState),
    );
    for (const part of [portrait, info]) part.setAttribute('aria-hidden', 'true');
    row.append(portrait, info);
    list.append(row);
  });
  block.append(list);
  return block;
}

function marsExtras(ctx: AppContext, state: CampaignState, say: (text: string) => void): HTMLElement {
  const block = el('section');
  block.append(el('h2', 'zone-title', ctx.t('ui.hud.maintenance')));
  const row = el('div', 'dust-row');
  const data: CampaignData = ctx.data;
  const cfg = data.difficulty[state.campaign.difficulty].levels.marte;
  const dust = state.mission.dust ?? 0;
  const damaged = state.mission.buildings.filter((building) => building.damaged);
  const cleanAction = { type: 'CLEAN_PANELS' } as const;
  const cleanError = previewAction(state, cleanAction, ctx.data);
  const clean = button({
    label: ctx.t('ui.hud.clean'),
    disabled: state.mission.phase !== 'planning' || dust === 0 || cleanError !== null,
    onClick: press(ctx, () => ctx.store.dispatch(cleanAction)),
  });
  clean.dataset.hudFocus = 'clean';
  if (cleanError) clean.title = ctx.t(cleanError.messageKey, cleanError.params);
  row.append(el('span', undefined, ctx.t('ui.hud.dust', { n: dust })), clean);
  block.append(row);
  const comms = state.mission.objectives.find(({ id }) => id === 'comunicaciones');
  const linkTarget = comms?.target ?? cfg?.linkDays;
  if (linkTarget !== undefined) {
    block.append(el('p', undefined, ctx.t('ui.hud.linkStreak', {
      n: state.mission.linkStreak ?? comms?.current ?? 0, target: linkTarget,
    })));
  }
  if (cfg?.maxLinkOutage !== undefined && state.mission.linkEstablished) {
    block.append(el('p', undefined, ctx.t('ui.hud.linkOutage', {
      n: state.mission.linkOutageDays ?? 0, limit: cfg.maxLinkOutage,
    })));
  }
  const baseRepair = data.constants.repairCost;
  const repairCost = designRepairCost(state.campaign, baseRepair ?? 0);
  const freeRepair = (baseRepair ?? 0) > 0 && repairCost === 0;
  for (const building of damaged) {
    const repairAction = { type: 'REPAIR', buildingId: building.id } as const;
    const reason = previewAction(state, repairAction, ctx.data);
    const name = ctx.t(ctx.data.buildings[building.type].nameKey);
    const repair = button({
      label: ctx.t('ui.hud.repair'),
      disabled: state.mission.phase !== 'planning' || reason !== null,
      onClick: press(ctx, () => {
        if (ctx.store.dispatch(repairAction).ok && freeRepair) say(ctx.t('ui.onboard.repair'));
      }),
    });
    if (reason) repair.title = ctx.t(reason.messageKey, reason.params);
    repair.dataset.hudFocus = `repair-${building.id}`;
    const item = el('div', 'repair-row');
    item.append(el('span', undefined, ctx.t('ui.hud.damaged', { name, x: building.x, y: building.y })), repair);
    if (baseRepair !== undefined) item.append(el('small', undefined, ctx.t('ui.hud.repairCost', { n: repairCost })));
    block.append(item);
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
  state: CampaignState | null,
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
    dust: state?.mission.dust,
    linkStreak: state?.mission.linkStreak,
    linkOutageDays: state?.mission.linkOutageDays,
    labDays: state?.mission.labDays,
    clues: state?.campaign.clues,
    buildings: state?.mission.buildings.map((building) => [building.id, building.enabled, building.damaged]),
  };
}
