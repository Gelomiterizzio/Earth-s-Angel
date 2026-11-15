// AI-assisted: OpenAI Codex and Antigravity (Gemini). Team review pending.
import type { AppContext } from '../app/context';
import type {
  Action,
  ActionError,
  Building,
  BuildingType,
  CrewMember,
  GameState,
  ObjectiveId,
  Terrain,
  Tool,
} from '../core/types';
import { buildTerrain } from '../core/terrain';
import { lifeSupportAdvice } from './advisor';
import { TILE_PX } from './art';
import { createAstronautAnimation, drawAstronaut, type SuitRole } from './astronaut-art';
import {
  actionForTool,
  describeActionOption,
  dispatchToolAction,
  type WalkActionOption,
} from './map-input';

export type { WalkActionOption } from './map-input';

export interface WalkPosition {
  x: number;
  y: number;
}

export type WalkDirection = 'north' | 'south' | 'east' | 'west';

export type CrewId = CrewMember['id'];

export interface WalkTargetInfo {
  position: WalkPosition;
  terrain: Terrain | null;
  explored: boolean;
  collected: boolean;
  building: Building | null;
  primary: WalkActionOption | null;
  options: WalkActionOption[];
}

export interface WalkActionOutcome {
  ok: boolean;
  action: Action | null;
  error: ActionError | null;
  message: string;
}

export interface MissionJournalObjective {
  id: ObjectiveId;
  label: string;
  met: boolean;
  current?: number;
  target?: number;
  progressText: string;
}

export interface MissionJournalData {
  title: string;
  day: number;
  dayLimit: number | null;
  windowRemaining: number | null;
  windowText: string;
  earthDaysRemaining: number;
  earthDeadlineText: string;
  streak: number;
  streakTarget: number;
  streakText: string;
  activeObjective: MissionJournalObjective | null;
  activeObjectiveText: string;
  decisionHintText: string;
  objectives: MissionJournalObjective[];
  exploredCount: number;
  totalTiles: number;
  exploredText: string;
  operationalBuildings: number;
  totalBuildings: number;
  buildingsText: string;
}

export interface WalkSnapshot {
  position: WalkPosition;
  facing: WalkPosition;
  direction: WalkDirection;
  target: WalkPosition;
  crewId: CrewId;
  journalOpen: boolean;
  targetInfo: WalkTargetInfo | null;
  lastOutcome: WalkActionOutcome | null;
}

export interface LunarWalkController {
  reset(state: GameState, ship: WalkPosition): void;
  refresh(state: GameState): void;
  destroy(): void;
  getSnapshot(): WalkSnapshot;
  setJournalOpen(open: boolean): void;
  fieldActionBlock(state: GameState, action: Action, notify?: boolean): string | null;
}

const south: WalkPosition = { x: 0, y: 1 };
const steps: Record<string, WalkPosition> = {
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: south,
  d: { x: 1, y: 0 },
  arrowup: { x: 0, y: -1 },
  arrowleft: { x: -1, y: 0 },
  arrowdown: south,
  arrowright: { x: 1, y: 0 },
};

const crewRoles: readonly SuitRole[] = ['commander', 'engineer', 'botanist', 'medic', 'geologist', 'radio'];
const buildingOwner: Partial<Record<BuildingType, SuitRole>> = {
  panel: 'commander',
  bateria: 'commander',
  generador: 'engineer',
  reciclador: 'engineer',
  extractor: 'engineer',
  invernadero: 'botanist',
  laboratorio: 'botanist',
  refugio: 'medic',
  deposito: 'geologist',
  comunicaciones: 'radio',
  habitat: 'medic',
};
const WALK_REPEAT_MS = 150;
// NASA NSSDC surface gravity, m/s². Only the visual arc of a Martian step uses this value.
const MARS_GRAVITY = 3.73;
const STEP_LIFT_VELOCITY = .25;
const STEP_FLIGHT = 2 * STEP_LIFT_VELOCITY / MARS_GRAVITY;

export function supportsFieldWalk(level: GameState['mission']['level'] | undefined): boolean {
  return level === 'luna' || level === 'marte';
}

function requiredRole(state: GameState, action: Action): SuitRole | undefined {
  if (action.type === 'BUILD' && action.building === 'deposito' && state.mission.crew.length < 5) return 'engineer';
  if (action.type === 'BUILD' && action.building === 'comunicaciones' && state.mission.crew.length < 6) return 'commander';
  if (action.type === 'BUILD') return buildingOwner[action.building];
  if (action.type === 'REPAIR' || action.type === 'CLEAN_PANELS') return 'engineer';
  if (action.type === 'SCAN') return 'commander';
  return undefined;
}

function roleBlock(ctx: AppContext, state: GameState, role: SuitRole, action: Action): string | null {
  if (!supportsFieldWalk(state.mission.level)) return null;
  const owner = requiredRole(state, action);
  if (!owner || owner === role) return null;
  const specialist = state.mission.crew[crewRoles.indexOf(owner)];
  return ctx.t(specialist && specialist.health > 0 ? 'content.map.walk.requiresRole' : 'content.map.walk.roleUnavailable', {
    role: ctx.t(specialist?.nameKey ?? `sim.crew.${crewRoles.indexOf(owner)}`),
  });
}

function directionFromFacing(facing: WalkPosition): WalkDirection {
  if (facing.y < 0) return 'north';
  if (facing.y > 0) return 'south';
  if (facing.x < 0) return 'west';
  return 'east';
}

function tileAt({ mission }: GameState, { x, y }: WalkPosition) {
  const { width, height, tiles } = mission.map;
  return x >= 0 && y >= 0 && x < width && y < height ? tiles[y * width + x] : undefined;
}

export function canWalk(state: GameState, position: WalkPosition): boolean {
  const tile = tileAt(state, position);
  return Boolean(
    tile?.explored &&
      tile.terrain !== 'roca' &&
      tile.terrain !== 'crater' &&
      tile.terrain !== 'nave' &&
      (tile.terrain !== 'mineral' || tile.collected) &&
      !state.mission.buildings.some(({ x, y }) => x === position.x && y === position.y),
  );
}

export function inspectWalkTarget(
  ctx: AppContext,
  state: GameState,
  position: WalkPosition,
  facing: WalkPosition,
  tool: Tool = ctx.uiStore.get().tool,
  role: SuitRole = 'commander',
): WalkTargetInfo {
  const targetPos = { x: position.x + facing.x, y: position.y + facing.y };
  const tile = tileAt(state, targetPos);
  if (!tile) {
    return {
      position: targetPos,
      terrain: null,
      explored: false,
      collected: false,
      building: null,
      primary: null,
      options: [],
    };
  }

  const { x, y } = targetPos;
  const building = state.mission.buildings.find((b) => b.x === x && b.y === y) ?? null;
  const actions: Action[] = [];

  if (!tile.explored) {
    actions.push({ type: 'EXPLORE', x, y });
  } else if (building?.damaged) {
    actions.push({ type: 'REPAIR', buildingId: building.id });
  } else if (tool.kind === 'scan') {
    actions.push({ type: 'SCAN', x, y });
  } else if (building?.type === 'panel' && state.mission.level === 'marte' && (state.mission.dust ?? 0) > 0) {
    actions.push({ type: 'CLEAN_PANELS' });
  } else if (tile.terrain === 'mineral' && !tile.collected) {
    actions.push({ type: 'COLLECT', x, y });
  } else if (tool.kind === 'build') {
    actions.push({ type: 'BUILD', building: tool.building, x, y });
  } else if (tool.kind === 'explore' || tool.kind === 'collect') {
    const toolAction = actionForTool(tool, x, y);
    if (toolAction) actions.push(toolAction);
  } else if (!building && tile.terrain === 'hielo') {
    actions.push({ type: 'BUILD', building: 'extractor', x, y });
  } else if (!building && buildTerrain(tile) === 'llano') {
    actions.push({ type: 'BUILD', building: 'panel', x, y });
    const available = ctx.data.levels[state.mission.level]?.availableBuildings ?? [];
    for (const candidate of available) {
      if (candidate !== 'panel' && candidate !== 'extractor') {
        actions.push({ type: 'BUILD', building: candidate, x, y });
      }
    }
  }

  const permitted = actions.filter((action) => !roleBlock(ctx, state, role, action));
  const options = (permitted.length ? permitted : actions.slice(0, 1)).map((action) => {
    const option = describeActionOption(ctx, state, action);
    return { ...option, blockedReason: roleBlock(ctx, state, role, action) ?? option.blockedReason };
  });
  return {
    position: targetPos,
    terrain: tile.terrain,
    explored: tile.explored,
    collected: tile.collected,
    building,
    primary: options[0] ?? null,
    options,
  };
}

/**
 * One line that tells the player what the astronaut is facing: the terrain, or the
 * building with its state, and why it cannot be built on when that applies.
 */
export function describeWalkTarget(ctx: AppContext, state: GameState, info: WalkTargetInfo): string {
  const look = (key: string, params?: Record<string, string | number>) =>
    ctx.t('content.map.look.prefix', { what: ctx.t(`content.map.look.${key}`, params) });
  const tile = tileAt(state, info.position);
  if (!tile) return look('edge');
  if (!tile.explored) return look('fog');
  const { building } = info;
  if (building) {
    const def = ctx.data.buildings[building.type];
    const name = def ? ctx.t(def.nameKey) : building.type;
    if (building.type === 'nave') return look('ship', { name });
    const day = state.mission.day;
    if (day < building.operationalFromDay) return look('building.scaffold', { name, day: building.operationalFromDay });
    if (building.damaged) return look('building.damaged', { name });
    if (!building.enabled) return look('building.off', { name });
    if (state.mission.lastReport?.energy.unpowered.includes(building.id)) return look('building.unpowered', { name });
    const desc = def ? ctx.t(def.descKey) : '';
    return look('building.working', { name, desc });
  }
  const terrain = buildTerrain(tile);
  if (tile.terrain === 'mineral' && tile.collected) return look('terrain.collected');
  if (terrain === 'mineral') {
    const yieldN = ctx.data.difficulty[state.campaign.difficulty]?.levels[state.mission.level]?.mineralYield ?? 0;
    return look('terrain.mineral', { n: yieldN });
  }
  return look(`terrain.${terrain}`);
}

export function buildMissionJournalData(ctx: AppContext, state: GameState): MissionJournalData {
  const diffCfg = ctx.data.difficulty[state.campaign.difficulty]?.levels[state.mission.level];
  const day = state.mission.day;
  const dayLimit = diffCfg?.dayLimit ?? null;
  const windowRemaining = dayLimit !== null ? Math.max(0, dayLimit - day) : null;
  // Mars counts sols, like the HUD clock.
  const sol = state.mission.level === 'marte' ? 'Sol' : '';
  const windowText =
    dayLimit !== null
      ? ctx.t(`content.map.journal.window${sol}`, { day, limit: dayLimit, remaining: windowRemaining ?? 0 })
      : ctx.t(`content.map.journal.windowOpen${sol}`, { day });

  const earthDaysRemaining = state.campaign.earthDaysRemaining;
  const earthDeadlineText = ctx.t('content.map.journal.earthDeadline', { days: earthDaysRemaining });

  const streak = state.mission.streak;
  const streakTarget = diffCfg?.streakDays ?? 2;
  const streakText = ctx.t('content.map.journal.streakProgress', {
    current: streak,
    target: streakTarget,
  });

  const objectives: MissionJournalObjective[] = state.mission.objectives.map((goal) => {
    const label = ctx.t(`ui.objective.${goal.id}`);
    const statusLabel = goal.met ? ctx.t('ui.hud.met') : ctx.t('ui.hud.pending');
    const numeric =
      goal.current !== undefined && goal.target !== undefined
        ? ` (${goal.current} / ${goal.target})`
        : '';
    return {
      id: goal.id,
      label,
      met: goal.met,
      current: goal.current,
      target: goal.target,
      progressText: `${statusLabel} · ${label}${numeric}`,
    };
  });

  const activeObjective = objectives.find((goal) => !goal.met) ?? null;
  const activeObjectiveText = activeObjective
    ? `${activeObjective.label}${
        activeObjective.current !== undefined && activeObjective.target !== undefined
          ? ` (${activeObjective.current} / ${activeObjective.target})`
          : ''
      }`
    : ctx.t('content.map.journal.allMet');

  const decisionHintText = state.mission.level === 'luna' && day === 1 && state.mission.apSpentToday === 0
    ? ctx.t('content.map.journal.decisionHint')
    : '';

  const totalTiles = state.mission.map.tiles.length;
  const exploredCount = state.mission.map.tiles.filter((t) => t.explored).length;
  const exploredText = ctx.t('content.map.journal.exploredTiles', {
    explored: exploredCount,
    total: totalTiles,
  });

  const totalBuildings = state.mission.buildings.length;
  const operationalBuildings = state.mission.buildings.filter(
    (b) => b.enabled && !b.damaged && state.mission.day >= b.operationalFromDay,
  ).length;
  const buildingsText = ctx.t('content.map.journal.buildingsCount', {
    ready: operationalBuildings,
    total: totalBuildings,
  });

  return {
    title: ctx.t('content.map.journal.title'),
    day,
    dayLimit,
    windowRemaining,
    windowText,
    earthDaysRemaining,
    earthDeadlineText,
    streak,
    streakTarget,
    streakText,
    activeObjective,
    activeObjectiveText,
    decisionHintText,
    objectives,
    exploredCount,
    totalTiles,
    exploredText,
    operationalBuildings,
    totalBuildings,
    buildingsText,
  };
}

export function createLunarWalk(
  parent: HTMLElement,
  world: HTMLElement,
  ctx: AppContext,
  onCollect: (position: WalkPosition) => void,
): LunarWalkController {
  const avatar = document.createElement('canvas');
  avatar.className = 'walk-avatar';
  avatar.width = avatar.height = TILE_PX;
  avatar.setAttribute('aria-hidden', 'true');
  world.append(avatar);
  const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)');
  const astronaut = createAstronautAnimation(
    avatar,
    () => prefersStill.matches || ctx.options.get().reducedMotion,
  );

  const hint = document.createElement('div');
  hint.className = 'walk-hint';
  const controls = document.createElement('span');
  controls.className = 'walk-hint-controls';
  const prompt = document.createElement('button');
  prompt.type = 'button';
  prompt.className = 'walk-hint-action';
  const key = document.createElement('kbd');
  key.textContent = 'E';
  key.setAttribute('aria-hidden', 'true');
  const actionLabel = document.createElement('span');
  const actionCost = document.createElement('small');
  prompt.append(key, actionLabel, actionCost);
  const journalButton = document.createElement('button');
  journalButton.type = 'button';
  journalButton.className = 'walk-hint-journal';
  journalButton.setAttribute('aria-haspopup', 'dialog');
  const actionsButton = document.createElement('button');
  actionsButton.type = 'button';
  actionsButton.className = 'walk-hint-menu';
  actionsButton.setAttribute('aria-haspopup', 'dialog');
  const status = document.createElement('span');
  status.className = 'walk-hint-status';
  status.setAttribute('aria-live', 'polite');
  const look = document.createElement('span');
  look.className = 'walk-hint-look';
  // Mission control advice when a life-support reserve is about to run out.
  const advice = document.createElement('span');
  advice.className = 'walk-hint-advice';
  advice.setAttribute('role', 'status');
  hint.append(controls, actionsButton, journalButton, advice, look, prompt, status);
  parent.append(hint);
  // Small warning bubble over the astronaut, visible while walking.
  const alertBubble = document.createElement('div');
  alertBubble.className = 'walk-alert';
  alertBubble.setAttribute('aria-hidden', 'true');
  alertBubble.hidden = true;
  world.append(alertBubble);
  const hintSize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    parent.style.setProperty('--walk-hint-height', `${hint.offsetHeight}px`);
  });
  hintSize?.observe(hint);

  let journalVeil: HTMLElement | null = null;
  let actionsVeil: HTMLElement | null = null;
  let selectedCrew: CrewId | undefined;
  let walkingKey = '';
  let walkTimer: ReturnType<typeof setTimeout> | undefined;
  let position: WalkPosition = { x: 0, y: 0 };
  let facing: WalkPosition = south;
  let message = '';
  let lastTurnSignature = '';
  let lastToolSignature = JSON.stringify(ctx.uiStore.get().tool);
  let lastOutcome: WalkActionOutcome | null = null;
  let lastTargetInfo: WalkTargetInfo | null = null;

  function activeCrewId(state: GameState | null): CrewId {
    const selected = state?.mission.crew.find((member) => member.id === selectedCrew && member.health > 0);
    if (selected) return selected.id;
    const available = state?.mission.crew.find((member) => member.health > 0);
    if (available) return available.id;
    return state?.mission.crew[0]?.id ?? 1;
  }

  function roleFor(state: GameState): SuitRole {
    return crewRoles[state.mission.crew.findIndex((member) => member.id === activeCrewId(state))] ?? 'commander';
  }

  function openActions(open: boolean): void {
    stopWalking();
    ctx.uiStore.openPanel(open ? 'walk-actions' : null);
    if (!open && !parent.hidden) parent.focus({ preventScroll: true });
  }

  function syncActionsMenu(state: GameState): void {
    const open = !parent.hidden && ctx.flow.current().scene === 'mision'
      && supportsFieldWalk(state.mission.level) && state.mission.phase === 'planning'
      && ctx.uiStore.get().openPanel === 'walk-actions';
    if (!open) {
      actionsVeil?.remove();
      actionsVeil = null;
      return;
    }
    const active = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.actionFocus : undefined;
    if (!actionsVeil) {
      actionsVeil = document.createElement('div');
      actionsVeil.className = 'walk-journal-veil';
      (parent.parentElement ?? parent).append(actionsVeil);
    }
    const dialog = document.createElement('div');
    dialog.className = 'walk-journal walk-actions';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'walk-actions-title');
    const title = document.createElement('h2');
    title.id = 'walk-actions-title';
    title.textContent = ctx.t('content.map.walk.actionsTitle');
    const crew = document.createElement('div');
    crew.className = 'walk-crew';
    const activeId = activeCrewId(state);
    for (const [index, member] of state.mission.crew.entries()) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn';
      button.dataset.actionFocus = `crew-${member.id}`;
      const portrait = document.createElement('canvas');
      portrait.width = portrait.height = TILE_PX;
      portrait.setAttribute('aria-hidden', 'true');
      const context = portrait.getContext('2d');
      if (context) drawAstronaut(context, south, -1, crewRoles[index] ?? 'commander');
      const name = document.createElement('span');
      name.textContent = ctx.t(member.nameKey);
      button.append(portrait, name);
      button.disabled = member.health <= 0;
      button.setAttribute('aria-pressed', String(member.id === activeId));
      button.addEventListener('click', () => {
        selectedCrew = member.id;
        if (ctx.uiStore.get().tool.kind === 'inspect') refresh(state);
        else ctx.uiStore.setTool({ kind: 'inspect' });
      });
      crew.append(button);
    }
    const role = roleFor(state);
    const info = inspectWalkTarget(ctx, state, position, facing, { kind: 'inspect' }, role);
    const tileLabel = document.createElement('p');
    tileLabel.textContent = info.building
      ? ctx.t(ctx.data.buildings[info.building.type].nameKey)
      : info.terrain && info.explored ? ctx.t(`content.map.terrain.${info.terrain}`) : ctx.t('content.map.fog');
    const list = document.createElement('div');
    list.className = 'walk-action-list';
    const options = info.options.filter((option) => !roleBlock(ctx, state, role, option.action));
    const foundBeacon = state.mission.level === 'marte'
      ? state.campaign.narrativeFlags.beaconMars : state.campaign.narrativeFlags.beaconMoon;
    if (role === 'commander' && info.explored && !foundBeacon && !options.some(({ action }) => action.type === 'SCAN')) {
      const { x, y } = info.position;
      options.push(describeActionOption(ctx, state, { type: 'SCAN', x, y }));
    }
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn walk-action-option';
      button.dataset.actionFocus = option.action.type === 'BUILD' ? option.action.building : option.action.type;
      const name = document.createElement('strong');
      name.textContent = option.label;
      const cost = document.createElement('small');
      cost.textContent = formatCost(option);
      const detail = document.createElement('span');
      detail.textContent = option.blockedReason || [
        option.readyDay === undefined ? '' : ctx.t('content.map.walk.readyOnDay', { day: option.readyDay }),
        option.yieldMaterials === undefined ? '' : ctx.t('content.map.walk.yieldMaterials', { n: option.yieldMaterials }),
      ].filter(Boolean).join(' · ');
      button.disabled = Boolean(option.blockedReason);
      button.append(name, cost, detail);
      button.addEventListener('click', () => {
        openActions(false);
        const current = activeState();
        if (current) executeAction(current, option);
      });
      list.append(button);
    }
    if (!options.length) {
      const empty = document.createElement('p');
      empty.textContent = info.primary?.blockedReason ?? ctx.t('content.map.walk.noActions');
      list.append(empty);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn btn-primary walk-actions-close';
    close.textContent = ctx.t('ui.cards.close');
    close.addEventListener('click', () => openActions(false));
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' || event.key.toLowerCase() === 'q') {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) openActions(false);
      }
      if (event.key === 'Tab' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button')].filter((button) => !button.disabled);
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const backwards = event.shiftKey || event.key === 'ArrowUp';
        const next = buttons[(index + (backwards ? -1 : 1) + buttons.length) % buttons.length];
        event.preventDefault();
        next?.focus();
      }
    });
    dialog.append(title, crew, tileLabel, list, close);
    actionsVeil.replaceChildren(dialog);
    const choices = [...dialog.querySelectorAll<HTMLButtonElement>('button')];
    (choices.find((button) => button.dataset.actionFocus === active && !button.disabled)
      ?? choices.find((button) => button.className.includes('walk-action-option') && !button.disabled)
      ?? close).focus({ preventScroll: true });
  }

  function isJournalOpen(): boolean {
    return ctx.uiStore.get().openPanel === 'journal';
  }

  function setJournalOpen(open: boolean): void {
    const current = ctx.uiStore.get().openPanel;
    if (open && current !== 'journal') {
      stopWalking();
      ctx.uiStore.openPanel('journal');
    } else if (!open && current === 'journal') {
      ctx.uiStore.openPanel(null);
      journalVeil?.remove();
      journalVeil = null;
      if (!parent.hidden) parent.focus({ preventScroll: true });
    }
  }

  function syncJournalModal(state: GameState): void {
    const shouldShow =
      !parent.hidden &&
      ctx.flow.current().scene === 'mision' &&
      state.mission.phase === 'planning' &&
      isJournalOpen();

    if (!shouldShow) {
      if (journalVeil) {
        journalVeil.remove();
        journalVeil = null;
      }
      return;
    }

    const data = buildMissionJournalData(ctx, state);
    const focusInJournal = !journalVeil || Boolean(journalVeil.contains(document.activeElement));
    if (!journalVeil) {
      journalVeil = document.createElement('div');
      journalVeil.className = 'walk-journal-veil';
      (parent.parentElement ?? parent).append(journalVeil);
    }

    const dialog = document.createElement('div');
    dialog.className = 'walk-journal dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.dataset.panel = 'journal';

    const title = document.createElement('h2');
    title.id = 'mission-journal-title';
    title.textContent = data.title;
    dialog.setAttribute('aria-labelledby', title.id);

    const activeSection = document.createElement('section');
    activeSection.dataset.journalSection = 'active';
    const activeHeading = document.createElement('h3');
    activeHeading.textContent = ctx.t('content.map.journal.activeObjective');
    const activeBody = document.createElement('p');
    activeBody.dataset.journalActiveObjective = '';
    activeBody.textContent = data.activeObjectiveText;
    const decisionHint = document.createElement('p');
    decisionHint.className = 'walk-journal-hint';
    decisionHint.dataset.journalDecisionHint = '';
    decisionHint.textContent = data.decisionHintText;
    activeSection.append(activeHeading, activeBody);
    if (data.decisionHintText) activeSection.append(decisionHint);

    const deadlinesSection = document.createElement('section');
    deadlinesSection.dataset.journalSection = 'deadlines';
    const deadlinesHeading = document.createElement('h3');
    deadlinesHeading.textContent = ctx.t('content.map.journal.deadlines');
    const windowLine = document.createElement('p');
    windowLine.dataset.journalWindow = '';
    windowLine.textContent = data.windowText;
    const earthLine = document.createElement('p');
    earthLine.dataset.journalEarth = '';
    earthLine.textContent = data.earthDeadlineText;
    const streakLine = document.createElement('p');
    streakLine.dataset.journalStreak = '';
    streakLine.textContent = data.streakText;
    deadlinesSection.append(deadlinesHeading, windowLine, earthLine, streakLine);

    const progressSection = document.createElement('section');
    progressSection.dataset.journalSection = 'progress';
    const progressHeading = document.createElement('h3');
    progressHeading.textContent = ctx.t('content.map.journal.progress');
    const goalList = document.createElement('ul');
    goalList.className = 'goal-list';
    for (const goal of data.objectives) {
      const item = document.createElement('li');
      item.dataset.objectiveId = goal.id;
      item.dataset.objectiveMet = String(goal.met);
      item.textContent = goal.progressText;
      goalList.append(item);
    }
    const statsLine = document.createElement('p');
    statsLine.dataset.journalStats = '';
    statsLine.textContent = `${data.exploredText} · ${data.buildingsText}`;
    progressSection.append(progressHeading, goalList, statsLine);

    const closeHint = document.createElement('p');
    closeHint.className = 'walk-journal-close-hint';
    closeHint.textContent = ctx.t('content.map.journal.closeHint');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn btn-primary';
    closeBtn.dataset.journalClose = '';
    closeBtn.textContent = ctx.t('ui.cards.close');
    closeBtn.addEventListener('click', () => setJournalOpen(false));

    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        closeBtn.focus({ preventScroll: true });
        return;
      }
      if (event.key === 'Escape' || event.key.toLowerCase() === 'm') {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) setJournalOpen(false);
      }
    });

    dialog.append(title, activeSection, deadlinesSection, progressSection, closeHint, closeBtn);
    journalVeil.replaceChildren(dialog);

    if (focusInJournal) {
      closeBtn.focus({ preventScroll: true });
    }
  }

  function activeState(): GameState | null {
    const state = ctx.store.getState();
    return state && !parent.hidden &&
      ctx.flow.current().scene === 'mision' &&
      supportsFieldWalk(state.mission.level) &&
      state.mission.phase === 'planning' &&
      !isJournalOpen() &&
      !document.querySelector('[role="dialog"][aria-modal="true"]')
      ? state
      : null;
  }

  function target(): WalkPosition {
    return { x: position.x + facing.x, y: position.y + facing.y };
  }

  function ensureValidPosition(state: GameState): void {
    if (canWalk(state, position)) return;
    const ship = ctx.data.levels[state.mission.level]?.ship ?? { x: 5, y: 5 };
    const exits = [south, steps.d, steps.w, steps.a].map(({ x, y }) => ({
      x: ship.x + x,
      y: ship.y + y,
    }));
    const valid = exits.find((exit) => canWalk(state, exit));
    if (valid) position = valid;
  }

  function formatCost(option: WalkActionOption): string {
    if (option.costMaterials > 0) {
      return ctx.t('content.map.walk.costMaterialsAp', {
        cost: option.costMaterials,
        ap: option.costAp,
      });
    }
    return ctx.t('content.map.walk.costApOnly', { ap: option.costAp });
  }

  function formatPreviewStatus(option: WalkActionOption | null): string {
    if (message) return message;
    if (!option) return ctx.t('content.map.walk.goal');
    if (option.blockedReason) {
      return ctx.t('content.map.walk.blocked', { reason: option.blockedReason });
    }
    const details: string[] = [];
    if (option.readyDay !== undefined) {
      details.push(ctx.t('content.map.walk.readyOnDay', { day: option.readyDay }));
    }
    if (option.yieldMaterials !== undefined) {
      details.push(ctx.t('content.map.walk.yieldMaterials', { n: option.yieldMaterials }));
    }
    return details.join(' · ');
  }

  function refresh(state: GameState): void {
    const toolSig = JSON.stringify(ctx.uiStore.get().tool);
    if (toolSig !== lastToolSignature) {
      lastToolSignature = toolSig;
      message = '';
    }
    // A message about the previous day or phase (for example "no action points") is stale.
    const turnSig = `${state.mission.level}:${state.mission.day}:${state.mission.phase}`;
    if (turnSig !== lastTurnSignature) {
      lastTurnSignature = turnSig;
      message = '';
    }

    syncJournalModal(state);
    syncActionsMenu(state);
    if (parent.hidden) {
      stopWalking();
      return;
    }

    avatar.hidden = hint.hidden = !supportsFieldWalk(state.mission.level);
    if (avatar.hidden) {
      alertBubble.hidden = true;
      return;
    }

    ensureValidPosition(state);

    const crewId = activeCrewId(state);
    world.style.setProperty('--walk-x', String(position.x));
    world.style.setProperty('--walk-y', String(position.y));
    world.style.setProperty('--walk-width', String(state.mission.map.width));
    world.style.setProperty('--walk-height', String(state.mission.map.height));
    avatar.style.setProperty('--walk-x', String(position.x));
    avatar.style.setProperty('--walk-y', String(position.y));
    avatar.dataset.x = String(position.x);
    avatar.dataset.y = String(position.y);
    avatar.dataset.facing = directionFromFacing(facing);
    avatar.dataset.crewId = String(crewId);
    astronaut.setRole(roleFor(state));
    astronaut.look(facing);

    const info =
      state.mission.phase === 'planning'
        ? inspectWalkTarget(ctx, state, position, facing, ctx.uiStore.get().tool, roleFor(state))
        : null;
    lastTargetInfo = info;
    const primary = info?.primary ?? null;

    const lookText = info ? describeWalkTarget(ctx, state, info) : '';
    look.hidden = !lookText;
    if (look.textContent !== lookText) look.textContent = lookText;

    prompt.hidden = !primary;
    if (primary) {
      actionLabel.textContent = primary.label;
      actionCost.textContent = formatCost(primary);
      prompt.dataset.actionType = primary.action.type;
      if (primary.blockedReason) {
        prompt.dataset.blocked = 'true';
        prompt.setAttribute('aria-disabled', 'true');
      } else {
        delete prompt.dataset.blocked;
        prompt.removeAttribute('aria-disabled');
      }
    } else {
      delete prompt.dataset.actionType;
      delete prompt.dataset.blocked;
      prompt.removeAttribute('aria-disabled');
    }

    controls.textContent = ctx.t('content.map.walk.controls');
    journalButton.textContent = ctx.t('content.map.journal.shortcut');
    actionsButton.textContent = ctx.t('content.map.walk.actionsShortcut');
    const text = formatPreviewStatus(primary);
    if (status.textContent !== text) status.textContent = text;
    syncAdvice(state);

    const prevCell = world.querySelector('[data-walk-target]');
    prevCell?.removeAttribute('data-walk-target');
    prevCell?.removeAttribute('data-walk-blocked');
    if (state.mission.phase === 'planning') {
      const { x, y } = target();
      const targetCell = world.querySelector<HTMLElement>(`.map-cell[data-x="${x}"][data-y="${y}"]`);
      if (targetCell && (primary || info?.terrain !== null)) {
        targetCell.setAttribute('data-walk-target', '');
        if (primary?.blockedReason) {
          targetCell.setAttribute('data-walk-blocked', 'true');
        }
      }
    }
  }

  function syncAdvice(state: GameState): void {
    const found = lifeSupportAdvice(state, ctx.data);
    const sols = state.mission.level === 'marte';
    let bubbleText = '';
    let adviceText = '';
    if (found) {
      const resource = ctx.t(`content.map.advisor.res.${found.reserve}`);
      const unit = ctx.t(`content.map.advisor.unit.${sols ? 'sol' : 'day'}${found.days === 1 ? '' : 's'}`);
      bubbleText = found.days > 0
        ? ctx.t('content.map.advisor.bubble', { resource, count: found.days, unit })
        : ctx.t('content.map.advisor.bubbleNone', { resource });
      if (found.tip && found.building) {
        adviceText = ctx.t(`content.map.advisor.tip.${found.tip}`, {
          res: ctx.t(`content.map.advisor.resLower.${found.reserve}`),
          building: ctx.t(`content.building.${found.building}.name`),
          why: ctx.t(`content.map.advisor.why.${found.building}`),
        });
      }
    }
    alertBubble.hidden = !bubbleText;
    if (alertBubble.textContent !== bubbleText) alertBubble.textContent = bubbleText;
    alertBubble.dataset.severity = found?.severity ?? '';
    alertBubble.style.setProperty('--walk-x', String(position.x));
    alertBubble.style.setProperty('--walk-y', String(position.y));
    advice.hidden = !adviceText;
    advice.dataset.severity = found?.severity ?? '';
    if (advice.textContent !== adviceText) advice.textContent = adviceText;
  }

  function interact(): void {
    const state = activeState();
    if (!state) return;
    const info = inspectWalkTarget(ctx, state, position, facing, ctx.uiStore.get().tool, roleFor(state));
    lastTargetInfo = info;
    const primary = info.primary;
    if (!primary) {
      message = ctx.t('content.map.walk.none');
      lastOutcome = { ok: false, action: null, error: null, message };
      refresh(state);
      return;
    }

    executeAction(state, primary);
  }

  function executeAction(state: GameState, primary: WalkActionOption): void {
    const { action } = primary;
    const error = primary.error;
    const reason = roleBlock(ctx, state, roleFor(state), action) ?? primary.blockedReason;
    if (reason) {
      message = ctx.t('content.map.walk.blocked', { reason });
      lastOutcome = { ok: false, action, error, message };
      refresh(state);
      return;
    }

    const { x, y } = target();
    const tool = actionForTool(ctx.uiStore.get().tool, x, y);
    ctx.audio.unlock();
    const result =
      tool && action.type === tool.type && JSON.stringify(action) === JSON.stringify(tool)
        ? dispatchToolAction(ctx, x, y)
        : ctx.store.dispatch(action);

    if (!result?.ok) {
      const err = result && !result.ok ? result.error : null;
      const reason = err ? ctx.t(err.messageKey, err.params) : ctx.t('content.map.walk.none');
      message = ctx.t('content.map.walk.blocked', { reason });
      lastOutcome = { ok: false, action, error: err, message };
      refresh(ctx.store.getState() ?? state);
      return;
    }

    if (action.type === 'COLLECT') {
      onCollect({ x, y });
      const added = result.state.mission.resources.materiales - state.mission.resources.materiales;
      message = ctx.t('content.map.walk.done.COLLECT_DETAIL', { n: added });
    } else if (action.type === 'BUILD') {
      const def = ctx.data.buildings[action.building];
      const name = def ? ctx.t(def.nameKey) : action.building;
      const readyDay = state.mission.day + (def?.buildDays ?? 1);
      message = ctx.t('content.map.walk.done.BUILD_DETAIL', { name, day: readyDay });
    } else {
      message = ctx.t(action.type === 'CLEAN_PANELS' ? 'ui.walk.cleaned' : `content.map.walk.done.${action.type}`);
    }

    lastOutcome = { ok: true, action, error: null, message };
    refresh(ctx.store.getState() ?? state);
  }

  function stopWalking(): void {
    clearTimeout(walkTimer);
    walkingKey = '';
  }

  function advanceWalk(state: GameState): void {
    const next = target();
    if (canWalk(state, next)) {
      position = next;
      astronaut.step(facing);
      if (state.mission.level === 'marte' && !prefersStill.matches && !ctx.options.get().reducedMotion) {
        // Convert the ballistic arc to a small percentage of the sprite height.
        const offsets = [0, .25, .5, .75, 1];
        avatar.animate(offsets.map((offset) => {
          const t = offset * STEP_FLIGHT;
          const height = STEP_LIFT_VELOCITY * t - MARS_GRAVITY * t * t / 2;
          return { offset, transform: `translateY(${-height * 700}%)` };
        }), STEP_FLIGHT * 1000);
      }
      message = '';
    } else {
      message = blockedStepMessage(state, next);
    }
    refresh(state);
  }

  /** Explains a blocked step so the edge of the explored area never looks like the end of the map. */
  function blockedStepMessage(state: GameState, next: WalkPosition): string {
    const tile = tileAt(state, next);
    if (!tile) return ctx.t('content.map.walk.mapEdge');
    if (tile.explored) return '';
    if (state.mission.ap === 0) return ctx.t('content.map.walk.fogNoAp');
    const { costAp } = describeActionOption(ctx, state, { type: 'EXPLORE', ...next });
    return ctx.t('content.map.walk.fogAhead', { ap: costAp });
  }

  function repeatWalk(): void {
    const state = activeState();
    if (!walkingKey || !state) {
      stopWalking();
      return;
    }
    advanceWalk(state);
    walkTimer = setTimeout(repeatWalk, WALK_REPEAT_MS);
  }

  function releaseKey(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === walkingKey) stopWalking();
  }

  function onKey(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target instanceof HTMLElement &&
        (event.target.closest('input, textarea, select') || event.target.isContentEditable))
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === 'q' && !event.repeat && activeState()) {
      event.preventDefault();
      openActions(true);
      return;
    }

    if (key === 'm' && !event.repeat) {
      if (isJournalOpen()) {
        event.preventDefault();
        setJournalOpen(false);
        return;
      }
      const state = activeState();
      if (state) {
        event.preventDefault();
        setJournalOpen(true);
        return;
      }
    }

    if (
      key.startsWith('arrow') &&
      event.target instanceof HTMLElement &&
      event.target.closest('.hud-zone button, .hud-zone summary, .bubble button')
    ) {
      return;
    }

    const step = steps[key];
    if (!step && key !== 'e') return;
    const state = activeState();
    if (!state) return;

    event.preventDefault();
    parent.dataset.walkInput = '';
    if (key === 'e') {
      if (!event.repeat) interact();
      return;
    }

    if (event.repeat) return;
    stopWalking();
    walkingKey = key;
    const turning = facing.x !== step.x || facing.y !== step.y;
    facing = step;
    if (event.target instanceof HTMLElement && event.target.closest('.map-cell')) {
      parent.focus({ preventScroll: true });
    }
    if (turning) {
      message = '';
      refresh(state);
    } else {
      advanceWalk(state);
    }
    walkTimer = setTimeout(repeatWalk, WALK_REPEAT_MS);
  }

  prompt.addEventListener('click', interact);
  journalButton.addEventListener('click', () => {
    if (activeState()) setJournalOpen(true);
  });
  actionsButton.addEventListener('click', () => {
    if (activeState()) openActions(true);
  });
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', releaseKey);
  window.addEventListener('blur', stopWalking);
  return {
    reset(state: GameState, ship: WalkPosition) {
      facing = south;
      stopWalking();
      selectedCrew = undefined;
      const exits = [south, steps.d, steps.w, steps.a].map(({ x, y }) => ({
        x: ship.x + x,
        y: ship.y + y,
      }));
      position = exits.find((exit) => canWalk(state, exit)) ?? ship;
      astronaut.rest();
      message = '';
      lastOutcome = null;
      delete parent.dataset.walkInput;
    },
    refresh,
    destroy() {
      hintSize?.disconnect();
      alertBubble.remove();
      stopWalking();
      astronaut.rest();
      actionsVeil?.remove();
      if (journalVeil) {
        journalVeil.remove();
        journalVeil = null;
      }
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', releaseKey);
      window.removeEventListener('blur', stopWalking);
    },
    getSnapshot(): WalkSnapshot {
      const state = ctx.store.getState();
      return {
        position: { ...position },
        facing: { ...facing },
        direction: directionFromFacing(facing),
        target: target(),
        crewId: activeCrewId(state),
        journalOpen: isJournalOpen(),
        targetInfo: state
          ? inspectWalkTarget(ctx, state, position, facing, ctx.uiStore.get().tool, roleFor(state))
          : lastTargetInfo,
        lastOutcome,
      };
    },
    setJournalOpen,
    fieldActionBlock(state, action, notify = false) {
      const reason = roleBlock(ctx, state, roleFor(state), action);
      if (notify && reason) {
        message = ctx.t('content.map.walk.blocked', { reason });
        refresh(state);
      }
      return reason;
    },
  };
}
