// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
// Presentation modes, available in every build:
// - X: the game plays itself like a player would (walk, face the target, build, explore,
//   collect) through the Moon, the solar storm and Mars, with a caption per day.
// - Z: a defeat demo. The crew ignores life support until the air runs out and the
//   game-over sequence shows the world exploding.
// Pressing the same key again stops. The player's save and options are restored afterwards,
// even if the page reloads in the middle, so a demo never overwrites a real campaign.
import { createCampaign, startDay } from '../core';
import type { Action, GameState } from '../core/types';
import { canWalk, type LunarWalkController, type WalkPosition } from '../map';
import type { AppContext } from './context';
import { OPTIONS_STORAGE_KEY } from './options';
import { SAVE_STORAGE_KEY } from './persistence';
import {
  LOSING_PLAN,
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

/** Shortest walk to a tile beside the target (or onto it, for wandering). Breadth-first search. */
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
  if (done(from)) return [];
  const previous = new Map<number, number>();
  const start = from.y * width + from.x;
  previous.set(start, -1);
  const queue = [start];
  for (let head = 0; head < queue.length && head < 6000; head++) {
    const index = queue[head];
    const here = { x: index % width, y: Math.floor(index / width) };
    for (const d of DIRECTIONS) {
      const next = { x: here.x + d.x, y: here.y + d.y };
      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) continue;
      const key = next.y * width + next.x;
      if (previous.has(key) || !canWalk(state, next)) continue;
      previous.set(key, index);
      if (done(next)) {
        const path: WalkPosition[] = [];
        for (let at = key; at !== start; at = previous.get(at) ?? start) {
          path.unshift({ x: at % width, y: Math.floor(at / width) });
        }
        return path;
      }
      queue.push(key);
    }
  }
  return null;
}

export function mountPresentationMode(ctx: AppContext, getWalk: () => LunarWalkController | null): () => void {
  let running: Mode | null = null;
  let stopped = false;
  let driving = false;
  let pending: (() => void) | null = null;
  let shield: HTMLElement | null = null;
  let caption: HTMLElement | null = null;

  const wait = (ms: number): Promise<void> => new Promise((resolve) => {
    const timer = setTimeout(() => { pending = null; resolve(); }, ms);
    pending = () => { clearTimeout(timer); resolve(); };
  });

  function say(key: string, params: Record<string, number> = {}): void {
    const text = caption?.querySelector('.presentation-text');
    if (text) text.textContent = ctx.t(`ui.presentation.${key}`, params);
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
      await face({ x: Math.sign(target.x - here.x), y: Math.sign(target.y - here.y) }, level);
    }
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
      const target = actionTarget(action, state());
      if (target) {
        await walkTo(target, true, level);
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

  function startCampaign(): void {
    // A fixed, canonical campaign: the scripts are checked against it in the tests.
    const created = createCampaign(PRESENTATION_DIFFICULTY, PRESENTATION_SEED, ctx.data, { canonical: true });
    const opened = startDay(created, ctx.data);
    ctx.store.replaceState(opened.state, opened.events);
    ctx.flow.go('dificultad');
    ctx.flow.go('cinematica', { id: 'opening' });
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
    startCampaign();
    say('opening');
    await wait(5000);
    if (stopped) return;
    ctx.flow.completeCinematic('opening');
    await wait(900);

    await playMission('luna');
    if (stopped) return;
    say('moonWin');
    await wait(4200);
    if (stopped) return;

    ctx.flow.departToMars?.();
    say('toMars');
    await wait(5200);
    if (stopped) return;
    ctx.flow.completeCinematic('moonToMars');
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
    await wait(6500);
    if (stopped) return;
    ctx.flow.completeCinematic('marsVictory');
    say('end');
    await wait(5000);
  }

  async function runDefeat(): Promise<void> {
    say('loseStart');
    goToTitle();
    await wait(2400);
    if (stopped) return;
    startCampaign();
    await wait(1800);
    if (stopped) return;
    ctx.flow.completeCinematic('opening');
    await wait(900);

    await playMission('luna', LOSING_PLAN);
    if (stopped) return;
    // The result screen plays the game-over sequence: the world breaks apart.
    say('loseBoom');
    await wait(9800);
    if (stopped) return;
    say('loseLesson');
    await wait(7000);
  }

  async function run(mode: Mode): Promise<void> {
    running = mode;
    stopped = false;
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
    caption.append(badge, text, stopButton);
    stage.append(shield, caption);

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
  return () => {
    window.removeEventListener('keydown', onKey, true);
    pending?.();
    shield?.remove();
    caption?.remove();
  };
}
