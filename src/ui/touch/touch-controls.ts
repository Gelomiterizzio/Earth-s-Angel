// AI-assisted: Claude Code (claude-opus-5-5). Directed and approved by the team.
// Touch controls for Mobile/Tablet mode.
//
// Earth's Angel is a turn-based grid game: the astronaut walks tile by tile, faces a tile and
// acts on it. So the touch scheme is built around the map, not around a copy of the keyboard:
//
// 1. Tap the map (main control). Tap a tile and the astronaut walks there along a free path.
//    Tap a mineral, fog, a building or a rock and the astronaut walks next to it and faces it.
//    Tap the tile they already face and the action runs (collect, explore, repair, build).
// 2. A small pad at the bottom left for precise moves: tap to turn, hold to walk (like WASD).
// 3. Thumb buttons at the bottom right: a large Action button that shows what it will do, and
//    Tools, Base, Journal, End day and Pause.
//
// Input manager: every touch control sends the same command as its key (W A S D, E, Q, B, M, F,
// P) through the same keyboard path the game already listens to, the way presentation mode X
// drives the astronaut. The game logic is never duplicated, and the PC keys keep working.
//
// Visibility is handled by CSS (styles/mobile.css): only in Mobile/Tablet mode, only on the Moon
// and Mars maps, and never while a dialog is open.
import { findWalkPath } from '../../app/presentation';
import type { AppContext } from '../../app/context';
import { canWalk, type LunarWalkController, type WalkPosition } from '../../map';

type Direction = 'up' | 'down' | 'left' | 'right';
const KEY: Record<Direction, string> = { up: 'w', down: 's', left: 'a', right: 'd' };
const VECTOR: Record<Direction, WalkPosition> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
const STEP_MS = 150;
const TURN_MS = 70;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function keyDown(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}
function keyUp(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}
/** Press and release, like a quick tap on the key. */
function tapKey(key: string): void {
  keyDown(key);
  keyUp(key);
}

function directionOf(delta: WalkPosition): Direction | null {
  for (const [name, v] of Object.entries(VECTOR) as [Direction, WalkPosition][]) {
    if (v.x === delta.x && v.y === delta.y) return name;
  }
  return null;
}

export function mountTouchControls(ctx: AppContext, getWalk: () => LunarWalkController | null): () => void {
  const stage = document.getElementById('stage');
  const map = document.getElementById('map');
  if (!stage || !map) return () => undefined;

  const isMobile = (): boolean => ctx.options.get().platform === 'mobile';
  const root = document.createElement('div');
  root.className = 'touch-controls';
  root.setAttribute('role', 'group');

  // ---- Pad: hold to walk, with one pointer per arrow (multitouch safe). ----
  const pad = document.createElement('div');
  pad.className = 'touch-pad';
  const held = new Map<number, string>();
  const arrows = new Map<Direction, HTMLButtonElement>();
  for (const direction of ['up', 'left', 'right', 'down'] as Direction[]) {
    const arrow = document.createElement('button');
    arrow.type = 'button';
    arrow.className = `touch-arrow touch-${direction}`;
    arrow.textContent = { up: '▲', down: '▼', left: '◀', right: '▶' }[direction];
    arrow.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      cancelRoute();
      // Keeps the release on this arrow even if the finger slides off. Some pointers cannot be
      // captured (already gone); walking still works, the release then comes from pointerup.
      try { arrow.setPointerCapture?.(event.pointerId); } catch { /* not capturable */ }
      held.set(event.pointerId, KEY[direction]);
      arrow.classList.add('is-held');
      keyDown(KEY[direction]);
    });
    const release = (event: PointerEvent): void => {
      const key = held.get(event.pointerId);
      if (!key) return;
      held.delete(event.pointerId);
      arrow.classList.remove('is-held');
      keyUp(key);
    };
    arrow.addEventListener('pointerup', release);
    arrow.addEventListener('pointercancel', release);
    arrow.addEventListener('lostpointercapture', release);
    // Keyboard and screen reader users can still press it.
    arrow.addEventListener('click', (event) => { if (event.detail === 0) tapKey(KEY[direction]); });
    arrows.set(direction, arrow);
    pad.append(arrow);
  }
  const hub = document.createElement('span');
  hub.className = 'touch-hub';
  hub.setAttribute('aria-hidden', 'true');
  pad.append(hub);

  // ---- Thumb buttons: same commands as the keys. ----
  const actions = document.createElement('div');
  actions.className = 'touch-actions';
  const makeButton = (className: string, icon: string, key: string): { button: HTMLButtonElement; label: HTMLSpanElement } => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `touch-btn ${className}`;
    const glyph = document.createElement('span');
    glyph.className = 'touch-icon';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = icon;
    const label = document.createElement('span');
    label.className = 'touch-label';
    button.append(glyph, label);
    button.addEventListener('pointerdown', (event) => event.preventDefault());
    button.addEventListener('click', () => {
      cancelRoute();
      tapKey(key);
    });
    return { button, label };
  };
  const act = makeButton('touch-act', '✋', 'e');
  const actDetail = document.createElement('small');
  actDetail.className = 'touch-detail';
  act.button.append(actDetail);
  const tools = makeButton('touch-tools', '⚒', 'q');
  const base = makeButton('touch-base', '🏠', 'b');
  const journal = makeButton('touch-journal', '📓', 'm');
  const endDay = makeButton('touch-end', '🌙', 'f');
  const pause = makeButton('touch-pause', '⏸', 'p');
  const small = document.createElement('div');
  small.className = 'touch-small';
  small.append(tools.button, base.button, journal.button, endDay.button);
  actions.append(small, act.button);
  root.append(pad, actions, pause.button);
  stage.append(root);

  const paint = (): void => {
    root.setAttribute('aria-label', ctx.t('ui.touch.controls'));
    pad.setAttribute('aria-label', ctx.t('ui.touch.pad'));
    for (const [direction, arrow] of arrows) arrow.setAttribute('aria-label', ctx.t(`ui.touch.${direction}`));
    act.label.textContent = ctx.t('ui.touch.action');
    tools.label.textContent = ctx.t('ui.touch.tools');
    base.label.textContent = ctx.t('ui.touch.base');
    journal.label.textContent = ctx.t('ui.touch.journal');
    endDay.label.textContent = ctx.t('ui.touch.endDay');
    pause.label.textContent = ctx.t('ui.touch.pause');
  };
  paint();

  // The Action button shows what the action key would do now (collect, explore, build...).
  let shownAction = '';
  const syncAction = (): void => {
    if (!isMobile()) return;
    const prompt = document.querySelector<HTMLButtonElement>('.walk-hint-action');
    const name = prompt && !prompt.hidden ? prompt.querySelector('span')?.textContent ?? '' : '';
    const cost = prompt && !prompt.hidden ? prompt.querySelector('small')?.textContent ?? '' : '';
    const text = [name, cost].filter(Boolean).join(' · ');
    if (text !== shownAction) {
      shownAction = text;
      actDetail.textContent = text;
    }
    act.button.classList.toggle('is-ready', Boolean(name));
    const end = document.querySelector<HTMLButtonElement>('[data-action="end-day"]');
    endDay.button.disabled = Boolean(end?.disabled);
  };
  const ticker = setInterval(syncAction, 250);

  // ---- Tap the map to walk. ----
  let route = 0;
  function cancelRoute(): void {
    route++;
  }

  async function press(direction: Direction, token: number): Promise<boolean> {
    if (token !== route) return false;
    tapKey(KEY[direction]);
    await sleep(STEP_MS);
    return token === route;
  }

  async function face(direction: Direction, token: number): Promise<boolean> {
    const walk = getWalk();
    if (!walk || token !== route) return false;
    const { facing } = walk.getSnapshot();
    const v = VECTOR[direction];
    if (facing.x === v.x && facing.y === v.y) return true;
    tapKey(KEY[direction]);
    await sleep(TURN_MS);
    return token === route;
  }

  async function goTo(target: WalkPosition): Promise<void> {
    const token = ++route;
    const walk = getWalk();
    const state = ctx.store.getState();
    if (!walk || !state) return;
    const { position, facing } = walk.getSnapshot();
    const building = ctx.uiStore.get().tool.kind === 'build';
    const free = canWalk(state, target) && !building;
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const adjacent = Math.abs(dx) + Math.abs(dy) === 1;

    // Tapping the tile you already face runs the action there.
    if (adjacent && facing.x === dx && facing.y === dy && !free) {
      tapKey('e');
      return;
    }
    if (dx === 0 && dy === 0) return;

    let path = free ? findWalkPath(state, position, target, false) : null;
    const beside = !path;
    if (!path) path = findWalkPath(state, position, target, true);
    if (!path) return;
    for (const next of path) {
      const here = walk.getSnapshot().position;
      const direction = directionOf({ x: next.x - here.x, y: next.y - here.y });
      if (!direction) return;
      if (!(await face(direction, token))) return;
      if (!(await press(direction, token))) return;
      const moved = walk.getSnapshot().position;
      if (moved.x !== next.x || moved.y !== next.y) return;
    }
    if (beside) {
      const here = walk.getSnapshot().position;
      const ox = target.x - here.x;
      const oy = target.y - here.y;
      const direction = Math.abs(ox) >= Math.abs(oy)
        ? directionOf({ x: Math.sign(ox), y: 0 })
        : directionOf({ x: 0, y: Math.sign(oy) });
      if (direction) await face(direction, token);
    }
  }

  const onMapClick = (event: MouseEvent): void => {
    if (!isMobile()) return;
    const cell = (event.target as HTMLElement | null)?.closest?.<HTMLElement>('.map-cell');
    const state = ctx.store.getState();
    if (!cell || !state || !getWalk()) return;
    if (state.mission.level !== 'luna' && state.mission.level !== 'marte') return;
    if (state.mission.phase !== 'planning' || ctx.flow.current().scene !== 'mision') return;
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    // On the walking maps a tap moves the astronaut instead of acting from afar.
    event.preventDefault();
    event.stopImmediatePropagation();
    void goTo({ x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
  };
  map.addEventListener('click', onMapClick, true);

  // Never leave a key held: losing focus, hiding the page or switching mode releases everything.
  const releaseAll = (): void => {
    cancelRoute();
    for (const key of held.values()) keyUp(key);
    held.clear();
    for (const arrow of arrows.values()) arrow.classList.remove('is-held');
  };
  const onVisibility = (): void => { if (document.hidden) releaseAll(); };
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', onVisibility);
  root.addEventListener('contextmenu', (event) => event.preventDefault());
  const offOptions = ctx.options.subscribe((options) => {
    paint();
    if (options.platform !== 'mobile') releaseAll();
  });

  return () => {
    releaseAll();
    clearInterval(ticker);
    offOptions();
    map.removeEventListener('click', onMapClick, true);
    window.removeEventListener('blur', releaseAll);
    document.removeEventListener('visibilitychange', onVisibility);
    root.remove();
  };
}
