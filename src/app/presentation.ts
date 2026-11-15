// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
// Presentation modes, available in every build:
// - X: the game plays itself like a player would (walk, face the target, build, explore,
//   collect) through the Moon, the solar storm and Mars, with a caption per day.
// - Z: a defeat demo. The crew ignores life support until the air runs out and the
//   game-over sequence shows the world exploding.
// Pressing the same key again stops. The player's save and options are restored afterwards,
// even if the page reloads in the middle, so a demo never overwrites a real campaign.
import { createCampaign, DEFAULT_DESIGN, launchWithDesign, startDay, type MissionDesign } from '../core';
import type { Action, GameState } from '../core/types';
import { canWalk, type LunarWalkController, type WalkPosition } from '../map';
import type { AppContext } from './context';
import { OPTIONS_STORAGE_KEY } from './options';
import { SAVE_STORAGE_KEY } from './persistence';
import {
  LOSING_DESIGN,
  LOSING_PLAN,
  PRESENTATION_DESIGN,
  missionSteps,
  PRESENTATION_DIFFICULTY,
  PRESENTATION_SEED,
  type MissionScript,
  type ScriptStep,
} from './presentation-script';
import '../styles/presentation.css';

const BACKUP_KEY = 'ea.presentation.backup';

type Backup = { save: string | null; options: string | null };
type Mode = 'victory' | 'defeat';

/** Put the player's save and options back, if a presentation left a backup behind. */
function restoreBackup(): boolean {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (raw === null) return false;
    const backup = JSON.parse(raw) as Backup;
    for (const [key, value] of [[SAVE_STORAGE_KEY, backup.save], [OPTIONS_STORAGE_KEY, backup.options]] as const) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    localStorage.removeItem(BACKUP_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Call before the app reads storage. A presentation that was cut short (reload, closed tab)
 * leaves its backup in storage: this puts the player's save and options back first.
 */
export function recoverInterruptedPresentation(): void {
  restoreBackup();
}

const PACE = {
  luna: { short: 650, report: 2400, decision: 3200, caption: 1300, step: 190, turn: 110 },
  marte: { short: 320, report: 1200, decision: 2600, caption: 850, step: 120, turn: 70 },
} as const;

/** Speeds the mouse wheel steps through. Every show starts at normal speed (1×). */
export const SPEED_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4] as const;
const NORMAL_SPEED = SPEED_STEPS.indexOf(1);

const KEY_FOR: Record<string, string> = { '0,-1': 'w', '-1,0': 'a', '0,1': 's', '1,0': 'd' };
const DIRECTIONS: readonly WalkPosition[] = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }];

/** Where the astronaut should go before an action, and whether to stand beside the target. */
function actionTarget(action: Action, state: GameState): WalkPosition | null {
  switch (action.type) {
    case 'BUILD':
    case 'EXPLORE':
    case 'COLLECT':
    case 'SCAN':
      return { x: action.x, y: action.y };
    case 'REPAIR': {
      const building = state.mission.buildings.find((b) => b.id === action.buildingId);
      return building ? { x: building.x, y: building.y } : null;
    }
    case 'CLEAN_PANELS': {
      const panel = state.mission.buildings.find((b) => b.type === 'panel');
      return panel ? { x: panel.x, y: panel.y } : null;
    }
    default:
      return null;
  }
}

/**
 * Walk to a tile beside the target (or onto it, for wandering), breadth-first. When no tile
 * beside it can be reached, the path ends on the reachable tile closest to the target, so the
 * astronaut always works from as near as the map allows.
 */
export function findWalkPath(
  state: GameState,
  from: WalkPosition,
  target: WalkPosition,
  beside: boolean,
): WalkPosition[] | null {
  const { width, height } = state.mission.map;
  const done = (p: WalkPosition): boolean => beside
    ? Math.abs(p.x - target.x) + Math.abs(p.y - target.y) === 1
    : p.x === target.x && p.y === target.y;
  // Chebyshev distance: a diagonal neighbour counts as next to the target.
  const gap = (p: WalkPosition): number => Math.max(Math.abs(p.x - target.x), Math.abs(p.y - target.y));
  if (done(from)) return [];
  const previous = new Map<number, number>();
  const start = from.y * width + from.x;
  previous.set(start, -1);
  const queue = [start];
  let best = start;
  let bestGap = beside ? gap(from) : Number.POSITIVE_INFINITY;
  const pathTo = (end: number): WalkPosition[] => {
    const path: WalkPosition[] = [];
    for (let at = end; at !== start; at = previous.get(at) ?? start) {
      path.unshift({ x: at % width, y: Math.floor(at / width) });
    }
    return path;
  };
  for (let head = 0; head < queue.length && head < 8000; head++) {
    const index = queue[head];
    const here = { x: index % width, y: Math.floor(index / width) };
    for (const d of DIRECTIONS) {
      const next = { x: here.x + d.x, y: here.y + d.y };
      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) continue;
      const key = next.y * width + next.x;
      if (previous.has(key) || !canWalk(state, next)) continue;
      previous.set(key, index);
      if (done(next)) return pathTo(key);
      if (beside && gap(next) < bestGap && !(next.x === target.x && next.y === target.y)) {
        best = key;
        bestGap = gap(next);
      }
      queue.push(key);
    }
  }
  return beside && best !== start ? pathTo(best) : beside ? [] : null;
}

export function mountPresentationMode(ctx: AppContext, getWalk: () => LunarWalkController | null): () => void {
  let running: Mode | null = null;
  let stopped = false;
  let driving = false;
  let pending: (() => void) | null = null;
  let shield: HTMLElement | null = null;
  let caption: HTMLElement | null = null;
  let speedLabel: HTMLElement | null = null;
  let speedTimer: ReturnType<typeof setInterval> | undefined;
  let speedIndex = NORMAL_SPEED;

  /**
   * Waits `ms` of show time. The time runs faster or slower with the wheel speed, and a change
   * applies at once, even in the middle of a pause.
   */
  const wait = (ms: number): Promise<void> => new Promise((resolve) => {
    let left = ms;
    let last = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    const tick = (): void => {
      const now = performance.now();
      left -= (now - last) * SPEED_STEPS[speedIndex];
      last = now;
      if (left <= 0) { pending = null; resolve(); return; }
      timer = setTimeout(tick, Math.min(50, left / SPEED_STEPS[speedIndex]));
    };
    timer = setTimeout(tick, Math.min(50, ms / SPEED_STEPS[speedIndex]));
    pending = () => { clearTimeout(timer); resolve(); };
  });

  /** Waits real time: for cinematics and the game-over sequence, which play at their own pace. */
  const hold = (ms: number): Promise<void> => new Promise((resolve) => {
    const timer = setTimeout(() => { pending = null; resolve(); }, ms);
    pending = () => { clearTimeout(timer); resolve(); };
  });

  /** Waits (real time) until the condition holds, or at most `maxMs`. */
  async function until(done: () => boolean, maxMs: number): Promise<void> {
    const started = performance.now();
    while (!stopped && !done() && performance.now() - started < maxMs) await hold(150);
  }

  function showSpeed(): void {
    if (!speedLabel) return;
    const value = SPEED_STEPS[speedIndex];
    speedLabel.textContent = ctx.t('ui.presentation.speed', { n: String(value) });
    speedLabel.dataset.speed = value === 1 ? 'normal' : value > 1 ? 'fast' : 'slow';
    // Restart the small pop so each wheel notch is visible.
    speedLabel.classList.remove('presentation-speed-pop');
    void speedLabel.offsetWidth;
    speedLabel.classList.add('presentation-speed-pop');
  }

  const onWheel = (event: WheelEvent): void => {
    if (!running) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.deltaY === 0) return;
    // Wheel up (away from you) speeds up, wheel down slows down.
    const next = Math.max(0, Math.min(SPEED_STEPS.length - 1, speedIndex + (event.deltaY < 0 ? 1 : -1)));
    if (next === speedIndex) return;
    speedIndex = next;
    showSpeed();
  };

  function say(key: string, params: Record<string, number> = {}): void {
    const text = caption?.querySelector('.presentation-text');
    if (text) text.textContent = ctx.t(`ui.presentation.${key}`, params);
    placeCaption();
  }

  /** On the results and credits the caption moves to the bottom so it never hides their titles. */
  /** Keep the speed control beside the Space Apps badge of the current screen. */
  function placeSpeed(): void {
    if (!speedLabel) return;
    const badge = [...document.querySelectorAll<HTMLElement>('.space-apps-entry')]
      .find((node) => node.offsetParent !== null && !node.closest('[hidden]'));
    if (badge) {
      if (speedLabel.nextElementSibling !== badge) badge.before(speedLabel);
      speedLabel.classList.remove('is-floating');
    } else if (!speedLabel.classList.contains('is-floating') || !speedLabel.isConnected) {
      (document.getElementById('stage') ?? document.body).append(speedLabel);
      speedLabel.classList.add('is-floating');
    }
  }

  function placeCaption(): void {
    const scene = ctx.flow.current().scene;
    caption?.classList.toggle('presentation-bottom', scene === 'resultado' || scene === 'creditos');
  }

  function readStorage(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function stop(): void {
    if (!running) return;
    stopped = true;
    pending?.();
    restoreBackup();
    location.reload();
  }

  function state(): GameState {
    const s = ctx.store.getState();
    if (!s) throw new Error('presentation: no state');
    return s;
  }

  /** Press and release a key the way a player would, letting it through the demo's key block. */
  function press(key: string): void {
    driving = true;
    try {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    } finally {
      driving = false;
    }
  }

  async function face(direction: WalkPosition, level: 'luna' | 'marte'): Promise<void> {
    const walk = getWalk();
    if (!walk) return;
    const { facing } = walk.getSnapshot();
    if (facing.x === direction.x && facing.y === direction.y) return;
    press(KEY_FOR[`${direction.x},${direction.y}`]);
    await wait(PACE[level].turn);
  }

  /** Walk step by step with WASD, then turn to face the target. */
  async function walkTo(target: WalkPosition, beside: boolean, level: 'luna' | 'marte'): Promise<void> {
    const walk = getWalk();
    if (!walk) return;
    const path = findWalkPath(state(), walk.getSnapshot().position, target, beside);
    if (!path) return;
    for (const next of path) {
      if (stopped) return;
      const here = walk.getSnapshot().position;
      const direction = { x: next.x - here.x, y: next.y - here.y };
      if (Math.abs(direction.x) + Math.abs(direction.y) !== 1) return;
      await face(direction, level);
      press(KEY_FOR[`${direction.x},${direction.y}`]);
      await wait(PACE[level].step);
      const moved = walk.getSnapshot().position;
      if (moved.x !== next.x || moved.y !== next.y) return;
    }
    if (beside) {
      const here = walk.getSnapshot().position;
      const dx = target.x - here.x;
      const dy = target.y - here.y;
      // Face the target along its main axis (diagonal neighbours included).
      if (dx !== 0 || dy !== 0) {
        await face(Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) }, level);
      }
    }
  }

  /** The working panel the astronaut can walk right up to with the shortest walk. */
  function reachablePanel(): WalkPosition | null {
    const walk = getWalk();
    const s = state();
    if (!walk) return null;
    const from = walk.getSnapshot().position;
    let best: { at: WalkPosition; gap: number; steps: number } | null = null;
    for (const b of s.mission.buildings) {
      if (b.type !== 'panel') continue;
      const path = findWalkPath(s, from, b, true);
      if (!path) continue;
      const end = path[path.length - 1] ?? from;
      const gap = Math.max(Math.abs(end.x - b.x), Math.abs(end.y - b.y));
      if (!best || gap < best.gap || (gap === best.gap && path.length < best.steps)) {
        best = { at: { x: b.x, y: b.y }, gap, steps: path.length };
      }
    }
    return best?.at ?? null;
  }

  /** On a day without work, stroll to a random explored tile near the ship. */
  async function wander(level: 'luna' | 'marte'): Promise<void> {
    const ship = ctx.data.levels[level]?.ship;
    if (!ship) return;
    const s = state();
    for (let tries = 0; tries < 12; tries++) {
      const spot = { x: ship.x + Math.round((Math.random() - 0.5) * 6), y: ship.y + Math.round((Math.random() - 0.5) * 6) };
      if (canWalk(s, spot)) {
        await walkTo(spot, false, level);
        return;
      }
    }
  }

  function closeShelterScene(): void {
    document.querySelector<HTMLButtonElement>('.shelter-scene button')?.click();
  }

  async function playMission(level: 'luna' | 'marte', plan?: MissionScript): Promise<void> {
    const pace = PACE[level];
    let lastCaption = '';
    let actedToday = false;
    for (const step of missionSteps(state, plan) as Generator<ScriptStep>) {
      if (stopped) return;
      if (step.kind === 'caption') {
        // Generic days only update the day number; a new message also gets time to be read.
        say(step.key, { day: step.day });
        if (step.key !== lastCaption || !step.key.endsWith('Day')) await wait(pace.caption);
        lastCaption = step.key;
        actedToday = false;
        continue;
      }
      const { action } = step;
      if (action.type === 'END_DAY' && !actedToday) await wander(level);
      const target = action.type === 'CLEAN_PANELS' ? reachablePanel() : actionTarget(action, state());
      if (target) {
        // A dialog can interrupt a walk for a moment: try again before acting.
        for (let attempt = 0; attempt < 3 && !stopped; attempt++) {
          await walkTo(target, true, level);
          const here = getWalk()?.getSnapshot().position;
          if (!here || Math.max(Math.abs(here.x - target.x), Math.abs(here.y - target.y)) <= 1) break;
          await hold(350);
        }
        const here = getWalk()?.getSnapshot().position;
        if (here && Math.max(Math.abs(here.x - target.x), Math.abs(here.y - target.y)) > 1) {
          console.warn('[presentation] acting away from the astronaut', action, here);
        }
        actedToday = true;
      }
      if (stopped) return;
      const result = ctx.store.dispatch(action);
      if (!result.ok) {
        console.warn('[presentation] step rejected', action, result.error.code);
        return;
      }
      await wait(pace[step.pause]);
      if (step.pause === 'decision') closeShelterScene();
    }
  }

  /** Click a card or button on the design screen, if it is there. */
  function pick(selector: string): void {
    document.querySelector<HTMLButtonElement>(selector)?.click();
  }

  /**
   * A fixed, canonical campaign (the scripts are checked against it in the tests), then the
   * mission design screen played like a player: objective, rocket, trajectory, payload, launch.
   */
  async function startCampaign(design: MissionDesign, captions: 'design' | 'loseDesign'): Promise<void> {
    const created = createCampaign(PRESENTATION_DIFFICULTY, PRESENTATION_SEED, ctx.data, { canonical: true });
    const opened = startDay(created, ctx.data);
    ctx.store.replaceState(opened.state, opened.events);
    ctx.flow.go('dificultad');
    ctx.flow.go('diseno');
    await wait(400);
    // Start from an empty payload, whatever the last visitor chose.
    for (const card of [...document.querySelectorAll<HTMLButtonElement>('[data-design^="payload:"][aria-pressed="true"]')]) card.click();
    const pace = 1100;
    say(`${captions}1`);
    await wait(pace);
    pick(`[data-design="objective:${design.objective}"]`);
    await wait(pace);
    say(`${captions}2`);
    pick(`[data-design="rocket:${design.rocket}"]`);
    await wait(pace);
    pick(`[data-design="trajectory:${design.trajectory}"]`);
    pick(`[data-design="ship:${design.ship ?? DEFAULT_DESIGN.ship}"]`);
    pick(`[data-design="comms:${design.comms ?? DEFAULT_DESIGN.comms}"]`);
    await wait(pace);
    say(`${captions}3`);
    for (const id of design.payload) {
      if (stopped) return;
      pick(`[data-design="payload:${id}"]`);
      await wait(pace * 0.7);
    }
    say(`${captions}4`);
    await wait(pace * 1.6);
    if (stopped) return;
    pick('.design-launch');
    await wait(200);
    // If the screen refused the design (should not happen), launch it directly.
    if (ctx.flow.current().scene === 'diseno') {
      const launched = launchWithDesign(ctx.store.getState()!, design, ctx.data);
      if (launched) ctx.store.replaceState(launched);
      ctx.flow.go('cinematica', { id: 'opening' });
    }
  }

  function goToTitle(): void {
    if (ctx.flow.current().scene === 'mision') ctx.flow.go('pausa');
    if (ctx.flow.current().scene !== 'titulo') ctx.flow.go('titulo');
  }

  async function runVictory(): Promise<void> {
    say('start');
    goToTitle();
    await wait(2200);
    if (stopped) return;
    await startCampaign(PRESENTATION_DESIGN, 'design');
    if (stopped) return;
    say('opening');
    await hold(5000);
    if (stopped) return;
    ctx.flow.completeCinematic('opening');
    await wait(900);
    pick('[data-onboard-arrival] button');

    await playMission('luna');
    if (stopped) return;
    say('moonWin');
    await wait(4200);
    if (stopped) return;

    ctx.flow.departToMars?.();
    say('toMars');
    // The cargo manifest first, then Continue, like a player: the crew walks up the ramp,
    // boards the ship, lifts off and meets the reinforcements on Mars.
    await hold(4500);
    if (stopped) return;
    const board = document.querySelector<HTMLButtonElement>('.cine-briefing .btn-primary');
    if (board) {
      board.click();
      say('boarding');
      // Follow the animation itself: it ends when the flight scenes replace its canvas.
      await hold(300);
      const boardingArt = document.querySelector('.cine-layer');
      await until(() => !boardingArt?.isConnected, 16000);
      if (stopped) return;
      say('flight');
      // The Mars arrival animation: the second ship lands with two more crew members.
      await until(() => Boolean(document.querySelector('.mars-arrival-canvas'))
        || ctx.flow.current().scene === 'mision', 40_000);
      if (stopped) return;
      if (ctx.flow.current().scene !== 'mision') say('arrival');
      await until(() => ctx.flow.current().scene === 'mision', 40_000);
    }
    if (stopped) return;
    if (ctx.flow.current().scene === 'cinematica') ctx.flow.completeCinematic('moonToMars');
    await wait(900);

    say('marsArrive');
    await wait(2600);
    await playMission('marte');
    if (stopped) return;
    say('marsWin');
    await wait(4200);
    if (stopped) return;

    ctx.flow.chooseEnding?.('mars');
    say('ending');
    await until(() => ctx.flow.current().scene === 'creditos', 32_000);
    if (stopped) return;
    if (ctx.flow.current().scene === 'cinematica') ctx.flow.completeCinematic('marsVictory');
    say('end');
    await wait(5000);
  }

  async function runDefeat(): Promise<void> {
    say('loseStart');
    goToTitle();
    await wait(2400);
    if (stopped) return;
    await startCampaign(LOSING_DESIGN, 'loseDesign');
    if (stopped) return;
    await wait(1800);
    if (stopped) return;
    ctx.flow.completeCinematic('opening');
    await wait(900);
    pick('[data-onboard-arrival] button');

    await playMission('luna', LOSING_PLAN);
    if (stopped) return;
    // The result screen plays the game-over sequence: the world breaks apart.
    say('loseBoom');
    await hold(9800);
    if (stopped) return;
    say('loseLesson');
    await wait(7000);
  }

  async function run(mode: Mode): Promise<void> {
    running = mode;
    stopped = false;
    speedIndex = NORMAL_SPEED;
    // Kept in storage, not memory, so a reload in the middle of the show still restores it.
    try {
      if (localStorage.getItem(BACKUP_KEY) === null) {
        const backup: Backup = { save: readStorage(SAVE_STORAGE_KEY), options: readStorage(OPTIONS_STORAGE_KEY) };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      }
    } catch { /* storage unavailable: nothing to protect */ }
    // Tutorial bubbles and quiz questions would stop the show; the defeat needs its animation.
    ctx.options.set('tutorial', false);
    ctx.options.set('learningCheck', false);
    if (mode === 'defeat') ctx.options.set('reducedMotion', false);

    const stage = document.getElementById('stage') ?? document.body;
    shield = document.createElement('div');
    shield.className = 'presentation-shield';
    caption = document.createElement('div');
    caption.className = mode === 'defeat' ? 'presentation-caption presentation-defeat' : 'presentation-caption';
    caption.setAttribute('role', 'status');
    caption.setAttribute('aria-live', 'polite');
    const badge = document.createElement('span');
    badge.className = 'presentation-badge';
    badge.textContent = ctx.t(mode === 'defeat' ? 'ui.presentation.badgeDefeat' : 'ui.presentation.badge');
    const text = document.createElement('p');
    text.className = 'presentation-text';
    const stopButton = document.createElement('button');
    stopButton.type = 'button';
    stopButton.className = 'presentation-stop';
    stopButton.textContent = ctx.t(mode === 'defeat' ? 'ui.presentation.stopDefeat' : 'ui.presentation.stop');
    stopButton.addEventListener('click', stop);
    speedLabel = document.createElement('span');
    speedLabel.className = 'presentation-speed';
    speedLabel.title = ctx.t('ui.presentation.speedHint');
    caption.append(badge, text, stopButton);
    // The caption bar is not shown (the show plays without it). Only the speed control stays on
    // screen, next to the NASA Space Apps badge (bottom bar of the mission), or floating at the
    // bottom left on screens without that badge.
    showSpeed();
    stage.append(shield);
    placeSpeed();
    speedTimer = setInterval(placeSpeed, 300);

    await (mode === 'defeat' ? runDefeat() : runVictory());
    if (!stopped) stop();
  }

  const onKey = (event: KeyboardEvent): void => {
    if (driving) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest?.('input, textarea, select') || target?.isContentEditable) return;
    const key = event.key.toLowerCase();
    const mode: Mode | null = key === 'x' ? 'victory' : key === 'z' ? 'defeat' : null;
    if (mode && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.repeat) return;
      // The same key stops the show; the other key does nothing while one is running.
      if (running) {
        if (running === mode) stop();
        return;
      }
      void run(mode).catch((error: unknown) => {
        console.error('[presentation]', error);
        stop();
      });
      return;
    }
    // While the demo runs, the keyboard belongs to it.
    if (running) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  const offFlow = ctx.flow.subscribe(() => { if (running) placeCaption(); });
  return () => {
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('wheel', onWheel, true);
    offFlow();
    pending?.();
    shield?.remove();
    caption?.remove();
    speedLabel?.remove();
    clearInterval(speedTimer);
  };
}
