// AI-assisted: Cursor (Composer) and OpenAI Codex. Team review pending.
import type { AppContext } from '../app/context';
import type { GameState, MapView } from '../core/types';
import { BUILDING_PX, drawAtlasFrame, drawLunarLander, drawMapEffect, drawTerrainAccent, EFFECT_DURATION, loadMapArt, makeLunarBackdrop, TILE_PX } from './art';
import type { MapEffect } from './art';
import { createMapAmbience } from './ambience';
import { actionForTool, dispatchToolAction, previewAt } from './map-input';
import { STRUCTURE_SPRITE, TERRAIN_FALLBACK, TERRAIN_SPRITE } from './tiles';
import { createLunarWalk, supportsFieldWalk, type LunarWalkController } from './walk';
import './map.css';

export {
  buildMissionJournalData,
  canWalk,
  createLunarWalk,
  inspectWalkTarget,
  describeWalkTarget,
  type LunarWalkController,
  type MissionJournalData,
  type MissionJournalObjective,
  type WalkActionOption,
  type WalkActionOutcome,
  type WalkDirection,
  type WalkPosition,
  type WalkSnapshot,
  type WalkTargetInfo,
} from './walk';

export interface LunarMapView extends MapView {
  walk: LunarWalkController;
}

interface Position {
  x: number;
  y: number;
}

const arrowSteps: Record<string, Position> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

function describeCell(ctx: AppContext, state: GameState, { x, y }: Position, withPreview = true): string {
  const tile = state.mission.map.tiles[y * state.mission.map.width + x];
  if (!tile) return '';
  const building = state.mission.buildings.find((b) => b.x === x && b.y === y);
  const parts = [ctx.t('content.map.colRow', { col: x, row: y })];
  if (!tile.explored) {
    parts.push(ctx.t('content.map.fog'));
  } else {
    const terrain = tile.collected && tile.terrain === 'mineral' ? 'llano' : tile.terrain;
    parts.push(ctx.t(`content.map.terrain.${terrain}`));
    if (building) {
      parts.push(ctx.t(ctx.data.buildings[building.type]?.nameKey ?? building.type));
      if (state.mission.day < building.operationalFromDay) {
        parts.push(ctx.t('content.map.readyDay', { day: building.operationalFromDay }));
      }
    } else if (terrain !== 'nave') parts.push(ctx.t('content.map.free'));
  }
  if (withPreview && ctx.uiStore.get().tool.kind !== 'inspect') {
    const { error, readyDay } = previewAt(ctx, state, x, y);
    if (error) parts.push(ctx.t(error.messageKey, error.params));
    else if (readyDay !== undefined) parts.push(ctx.t('content.map.readyDay', { day: readyDay }));
  }
  return parts.filter(Boolean).map((part) => part.replace(/[. ]+$/u, '')).join('. ') + '.';
}

export function createMapView(parent: HTMLElement, ctx: AppContext): LunarMapView {
  parent.classList.add('mission-map');
  parent.tabIndex = -1;

  const ground = document.createElement('canvas');
  ground.className = 'map-art';
  ground.setAttribute('aria-hidden', 'true');
  const bursts = document.createElement('canvas');
  bursts.className = 'map-bursts';
  bursts.setAttribute('aria-hidden', 'true');
  const grid = document.createElement('div');
  grid.className = 'map-grid';
  grid.setAttribute('role', 'grid');
  const status = document.createElement('div');
  status.className = 'map-status sr-only';
  status.setAttribute('aria-live', 'polite');
  const world = document.createElement('div');
  world.className = 'map-world';
  const ambienceLayer = document.createElement('canvas');
  world.append(ground, bursts, ambienceLayer, grid);
  parent.replaceChildren(world, status);
  const walk = createLunarWalk(parent, world, ctx, (position) => startEffect('collect', [position]));

  let backdropReady = false;
  const art = loadMapArt(() => {
    if (!backdropReady) {
      const texture = makeLunarBackdrop(art);
      if (texture) {
        parent.style.setProperty('--lunar-backdrop', `url("${texture}")`);
        backdropReady = true;
      }
    }
    drawGround();
  });
  const groundContext = ground.getContext('2d');
  const burstContext = bursts.getContext('2d');
  const buttons: HTMLButtonElement[] = [];
  const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => ctx.options.get().reducedMotion || prefersStill.matches;
  const ambience = createMapAmbience(ambienceLayer, world, ctx,
    () => (supportsFieldWalk(level) ? walk.getSnapshot().position : null), reducedMotion);

  let visible = true;
  let width = 0;
  let height = 0;
  let level: GameState['mission']['level'] | undefined;
  let cursor = { x: 0, y: 0 };
  let selectedIndex = -1;
  let markedCells = new Set<number>();
  let previousMap = ctx.store.getState()?.mission.map;
  let currentDust = '';
  let animation = 0;
  let active: { name: MapEffect; start: number; cells: Position[] } | undefined;

  function activateCell({ x, y }: Position): void {
    const state = ctx.store.getState();
    if (!visible || ctx.flow.current().scene !== 'mision' || state?.mission.phase !== 'planning'
      || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    ctx.uiStore.setHover({ x, y });
    const action = actionForTool(ctx.uiStore.get().tool, x, y);
    if (action && walk.fieldActionBlock(state, action, true)) return;
    const result = dispatchToolAction(ctx, x, y);
    if (result?.ok && result.events.some((event) => event.type === 'resource/collected')) {
      // The collection event contains the amount but not the cell. Use the accepted action's origin.
      startEffect('collect', [{ x, y }]);
    }
    updateControls();
  }

  function buildGrid(state: GameState): void {
    width = state.mission.map.width;
    height = state.mission.map.height;
    level = state.mission.level;
    cursor = ctx.data.levels[state.mission.level]?.ship ?? { x: 0, y: 0 };
    walk.reset(state, cursor);
    ground.width = bursts.width = width * TILE_PX;
    ground.height = bursts.height = height * TILE_PX;
    ambience.resize(width, height);
    buttons.length = 0;
    selectedIndex = -1;
    markedCells = new Set();
    grid.setAttribute('aria-rowcount', String(height));
    grid.setAttribute('aria-colcount', String(width));
    grid.replaceChildren();

    for (let y = 0; y < height; y++) {
      const row = document.createElement('div');
      row.className = 'map-row';
      row.style.gridTemplateColumns = `repeat(${width}, minmax(0, 1fr))`;
      row.setAttribute('role', 'row');
      for (let x = 0; x < width; x++) {
        const position = { x, y };
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'map-cell';
        button.setAttribute('role', 'gridcell');
        button.dataset.x = String(x);
        button.dataset.y = String(y);
        button.addEventListener('pointermove', () => {
          delete parent.dataset.walkInput;
          if (cursor.x !== x || cursor.y !== y) ctx.uiStore.setHover(position);
        });
        button.addEventListener('focus', () => ctx.uiStore.setHover(position));
        button.addEventListener('click', () => activateCell(position));
        row.append(button);
        buttons.push(button);
      }
      grid.append(row);
    }
  }

  function drawGround(): void {
    const state = ctx.store.getState();
    const g = groundContext;
    if (!state || !g || !visible || width === 0) return;
    const { mission } = state;
    const martian = mission.level === 'marte';
    const tiles = martian ? 'mars' : 'moon';
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, ground.width, ground.height);

    for (const tile of mission.map.tiles) {
      const { x, y } = tile;
      if (!tile.explored) {
        g.fillStyle = martian ? '#2c1b24' : '#20283c';
        g.fillRect(x * TILE_PX, y * TILE_PX, TILE_PX, TILE_PX);
        if (supportsFieldWalk(mission.level)) {
          // Use the same terrain under every shadow so it never reveals resource locations.
          // It stays visible enough to show that the map continues past the explored area.
          g.globalAlpha = 0.42;
          drawAtlasFrame(g, art, tiles, TERRAIN_SPRITE.llano, x, y);
          g.globalAlpha = 1;
          g.fillStyle = 'rgba(11, 16, 38, .35)';
          g.fillRect(x * TILE_PX, y * TILE_PX, TILE_PX, 1);
          g.fillRect(x * TILE_PX, y * TILE_PX, 1, TILE_PX);
        }
        continue;
      }
      const terrain = tile.collected && tile.terrain === 'mineral' ? 'llano' : tile.terrain;
      const fallback = TERRAIN_FALLBACK[terrain];
      if (!drawAtlasFrame(g, art, tiles, TERRAIN_SPRITE[terrain], x, y)) {
        g.fillStyle = fallback.fill;
        g.fillRect(x * TILE_PX, y * TILE_PX, TILE_PX, TILE_PX);
        if (terrain !== 'llano' && terrain !== 'nave') mapMark(g, fallback.letter, x, y);
      }
      if (terrain === 'llano' || terrain === 'nave') drawTerrainAccent(g, martian, x, y);
    }

    for (const building of [...mission.buildings].sort((a, b) => a.y - b.y)) {
      const { x, y } = building;
      if (!mission.map.tiles[y * width + x]?.explored) continue;
      if (supportsFieldWalk(mission.level) && building.type === 'nave') {
        drawLunarLander(g, x, y);
        continue;
      }
      const scaffold = mission.day < building.operationalFromDay;
      const sprite = STRUCTURE_SPRITE[building.type];
      g.globalAlpha = building.enabled ? 1 : 0.62;
      const rendered = sprite && drawAtlasFrame(g, art,
        scaffold ? 'buildings' : sprite.sheet, scaffold ? 8 : sprite.index, x, y, BUILDING_PX);
      if (!rendered) mapMark(g, scaffold ? '…' : sprite?.letter ?? '?', x, y);
      g.globalAlpha = 1;
      if (!building.enabled || building.damaged) {
        mapMark(g, building.damaged ? '!' : '⊘', x, y, true);
      }
    }
  }

  function updateControls(refreshLabels = false): void {
    const state = ctx.store.getState();
    if (!state || !visible || width === 0) return;
    const tool = ctx.uiStore.get().tool.kind;
    const selected = cursor.y * width + cursor.x;
    const hover = previewAt(ctx, state, cursor.x, cursor.y);
    const previewEnabled = state.mission.phase === 'planning' && tool !== 'inspect';

    if (refreshLabels) {
      buttons.forEach((button, index) => {
        const tile = state.mission.map.tiles[index];
        if (!tile) return;
        button.toggleAttribute('data-fog', !tile.explored);
        const label = describeCell(ctx, state, tile, false);
        button.setAttribute('aria-label', label);
        button.title = label;
        button.tabIndex = -1;
        button.setAttribute('aria-selected', 'false');
      });
    }
    if (refreshLabels || selectedIndex !== selected) {
      const previous = buttons[selectedIndex];
      if (previous) {
        previous.tabIndex = -1;
        previous.setAttribute('aria-selected', 'false');
        const label = describeCell(ctx, state, state.mission.map.tiles[selectedIndex], false);
        previous.setAttribute('aria-label', label);
        previous.title = label;
      }
      buttons[selected].tabIndex = 0;
      buttons[selected].setAttribute('aria-selected', 'true');
      selectedIndex = selected;
    }

    const marked = new Set<number>();
    if (previewEnabled) {
      const candidates = tool === 'collect'
        ? state.mission.map.tiles.filter((tile) => tile.terrain === 'mineral' && tile.explored && !tile.collected)
        : [];
      candidates.push(state.mission.map.tiles[selected]);
      for (const tile of candidates) {
        const index = tile.y * width + tile.x;
        const action = actionForTool(ctx.uiStore.get().tool, tile.x, tile.y);
        const blocked = action && walk.fieldActionBlock(state, action);
        buttons[index].dataset.mark = blocked || previewAt(ctx, state, tile.x, tile.y).error ? 'bad' : 'ok';
        marked.add(index);
      }
      for (const { x, y } of hover.revealCells ?? []) {
        const index = y * width + x;
        if (marked.has(index) || state.mission.map.tiles[index].explored) continue;
        buttons[index].dataset.mark = 'hint';
        marked.add(index);
      }
    }
    for (const index of markedCells) {
      if (!marked.has(index)) delete buttons[index].dataset.mark;
    }
    markedCells = marked;
    const label = describeCell(ctx, state, cursor);
    buttons[selected].setAttribute('aria-label', label);
    buttons[selected].title = label;
    status.textContent = label;
    walk.refresh(state);
  }

  function sync(state = ctx.store.getState(), animateDust = false): void {
    if (!state) return;
    const map = state.mission.map;
    if (state.mission.level !== level || map.width !== width || map.height !== height || (state.mission.day === 1 && previousMap && map !== previousMap
      && state.mission.apSpentToday === 0 && state.mission.buildings.length <= 1)) buildGrid(state);
    previousMap = map;
    parent.dataset.level = state.mission.level;
    parent.toggleAttribute('data-walk-world', supportsFieldWalk(state.mission.level));
    drawGround();
    updateControls(true);

    const storm = state.mission.level === 'marte' && state.mission.schedule.find((event) =>
      event.type === 'tormenta-polvo' && event.startDay <= state.mission.day
      && state.mission.day < event.startDay + event.durationDays);
    parent.classList.toggle('map-dust', Boolean(storm));
    const nextDust = storm ? `${storm.id}:${state.mission.day}` : '';
    if (animateDust && visible && nextDust && nextDust !== currentDust) {
      startEffect('dust', [cursor, { x: Math.max(0, cursor.x - 2), y: cursor.y }]);
      ctx.audio.playSfx('sfx-dust');
    }
    currentDust = nextDust;
  }

  function paintBurst(now: number): void {
    const g = burstContext;
    if (!g) return;
    g.clearRect(0, 0, bursts.width, bursts.height);
    if (!active) return;
    const fraction = (now - active.start) / EFFECT_DURATION[active.name];
    if (fraction >= 1) {
      active = undefined;
      delete parent.dataset.effect;
      return;
    }
    const frame = reducedMotion() ? 1 : Math.max(0, Math.floor(fraction * 4));
    for (const { x, y } of active.cells) drawMapEffect(g, art, active.name, frame, x, y);
    animation = requestAnimationFrame(paintBurst);
  }

  function startEffect(name: MapEffect, cells: Position[]): void {
    if (!visible) return;
    cancelAnimationFrame(animation);
    active = { name, cells, start: performance.now() };
    parent.dataset.effect = name;
    paintBurst(active.start);
  }

  function onKey(event: KeyboardEvent): void {
    if (!visible || event.altKey || event.ctrlKey || event.metaKey
      || ctx.flow.current().scene !== 'mision'
      || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    const step = arrowSteps[event.key];
    if (step && width && height && !supportsFieldWalk(level)) {
      event.preventDefault();
      const next = {
        x: Math.max(0, Math.min(width - 1, cursor.x + step.x)),
        y: Math.max(0, Math.min(height - 1, cursor.y + step.y)),
      };
      buttons[next.y * width + next.x]?.focus({ preventScroll: true });
    } else if (event.key === 'Escape' && ctx.uiStore.get().tool.kind !== 'inspect') {
      event.preventDefault();
      event.stopPropagation();
      ctx.uiStore.setTool({ kind: 'inspect' });
    }
  }

  const unsubscribers = [
    ctx.store.subscribe((state) => sync(state, true)),
    ctx.store.on('building/placed', ({ x, y }) => startEffect('build', [{ x, y }])),
    ctx.store.on('tile/explored', ({ revealed }) => startEffect('explore', revealed)),
    ctx.uiStore.subscribe(({ hover }) => {
      if (hover && hover.x >= 0 && hover.x < width && hover.y >= 0 && hover.y < height) cursor = hover;
      updateControls();
    }),
    ctx.options.subscribe(() => {
      parent.classList.toggle('map-still', reducedMotion());
      updateControls(true);
    }),
  ];
  parent.addEventListener('keydown', onKey);
  parent.classList.toggle('map-still', reducedMotion());
  sync();

  return {
    walk,
    setVisible(show) {
      visible = show;
      parent.hidden = !show;
      if (show) sync();
      else {
        walk.setJournalOpen(false);
        if (ctx.uiStore.get().openPanel === 'walk-actions') ctx.uiStore.openPanel(null);
        const state = ctx.store.getState();
        if (state) walk.refresh(state);
        cancelAnimationFrame(animation);
        active = undefined;
        delete parent.dataset.effect;
        burstContext?.clearRect(0, 0, bursts.width, bursts.height);
      }
    },
    destroy() {
      visible = false;
      walk.destroy();
      ambience.destroy();
      cancelAnimationFrame(animation);
      for (const unsubscribe of unsubscribers) unsubscribe();
      parent.removeEventListener('keydown', onKey);
      parent.replaceChildren();
    },
  };
}

function mapMark(g: CanvasRenderingContext2D, letter: string, x: number, y: number, badge = false): void {
  const left = x * TILE_PX + (badge ? 20 : 12);
  const top = y * TILE_PX + (badge ? 7 : 16);
  g.fillStyle = '#0b1026';
  g.fillRect(left - 5, top - 9, 10, 11);
  g.fillStyle = badge ? '#ffd166' : '#f2f4ff';
  g.font = 'bold 9px monospace';
  g.textAlign = 'center';
  g.fillText(letter, left, top);
}
