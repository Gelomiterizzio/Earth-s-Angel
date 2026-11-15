// AI-assisted: Claude Code (claude-opus-5-5) and OpenAI Codex. Human review by C pending.
// Title-screen crew: each astronaut picks a new activity, place and duration every time,
// so the scene does not repeat the same loop. Visual only: it never touches game state.
import type { AppContext } from '../app-bridge';
import { el } from '../dom';
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { TILE_PX } from '../../map/art';

type Mode = 'walk' | 'idle' | 'look' | 'work' | 'hop' | 'drift';

interface Zone {
  /** Horizontal range, in % of the backdrop width. */
  minX: number;
  maxX: number;
  /** Ground line (or float band), in % from the bottom. */
  minY: number;
  maxY: number;
}

interface Actor {
  role: SuitRole;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  zone: Zone;
  /** Relative chance of each activity for this crew member. */
  habits: Partial<Record<Mode, number>>;
  x: number;
  y: number;
  facing: -1 | 0 | 1;
  mode: Mode;
  startedAt: number;
  until: number;
  targetX: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  workRate: number;
  lastFrame: number;
}

// Ground lanes leave gaps for the 5.7%-wide sprites and for the ship and antenna.
// The medic floats in the open sky between the logo and the menu.
const CREW: { role: SuitRole; zone: Zone; habits: Actor['habits'] }[] = [
  { role: 'commander', zone: { minX: 39, maxX: 62, minY: 5, maxY: 5 }, habits: { walk: 5, look: 2, idle: 1, hop: 1 } },
  { role: 'engineer', zone: { minX: 26, maxX: 31, minY: 11, maxY: 11 }, habits: { work: 5, walk: 2, look: 1, idle: 1 } },
  { role: 'botanist', zone: { minX: 70, maxX: 74, minY: 7, maxY: 7 }, habits: { work: 3, walk: 3, look: 2, hop: 1 } },
  { role: 'medic', zone: { minX: 45, maxX: 64, minY: 72, maxY: 85 }, habits: { drift: 1 } },
];

const WALK_SPEED = 3.2; // % of backdrop width per second
const FRAME_MS = 103;

export function mountTitleCrew(landscape: HTMLElement, ctx: AppContext): () => void {
  const layer = el('div', 'title-crew');
  layer.setAttribute('aria-hidden', 'true');
  landscape.append(layer);

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const still = (): boolean => media.matches || ctx.options.get().reducedMotion;
  const now = performance.now();

  const actors: Actor[] = CREW.map(({ role, zone, habits }) => {
    const canvas = el('canvas', 'title-crew-member');
    canvas.dataset.role = role;
    canvas.width = canvas.height = TILE_PX;
    layer.append(canvas);
    const actor: Actor = {
      role, canvas, context: canvas.getContext('2d'), zone, habits,
      x: between(zone.minX, zone.maxX), y: between(zone.minY, zone.maxY),
      facing: Math.random() < 0.5 ? -1 : 1, mode: 'idle', startedAt: now, until: now,
      targetX: 0, vx: 0, vy: 0, spin: 0, angle: 0, workRate: 1, lastFrame: Number.NaN,
    };
    pickActivity(actor, now);
    // Spread the first decisions so the crew never start in step.
    actor.until = now + between(300, 2400);
    return actor;
  });

  let handle = 0;
  let previous = now;
  const tick = (time: number): void => {
    const dt = Math.min(0.1, (time - previous) / 1000);
    previous = time;
    for (const actor of actors) {
      if (still()) {
        place(actor, 0);
        paint(actor, -1);
        continue;
      }
      if (time >= actor.until) pickActivity(actor, time);
      update(actor, time, dt);
    }
    handle = requestAnimationFrame(tick);
  };
  handle = requestAnimationFrame(tick);
  for (const actor of actors) {
    place(actor, 0);
    paint(actor, -1);
  }
  return () => {
    cancelAnimationFrame(handle);
    layer.remove();
  };
}

function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function choose(habits: Actor['habits']): Mode {
  const entries = Object.entries(habits) as [Mode, number][];
  let roll = Math.random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [mode, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return mode;
  }
  return entries[0][0];
}

function pickActivity(actor: Actor, time: number): void {
  // Avoid repeating the same pose twice in a row when there is another option.
  let mode = choose(actor.habits);
  if (mode === actor.mode && mode !== 'walk' && mode !== 'drift') mode = choose(actor.habits);
  actor.mode = mode;
  actor.startedAt = time;
  const { zone } = actor;
  switch (mode) {
    case 'walk': {
      let target = between(zone.minX, zone.maxX);
      if (Math.abs(target - actor.x) < 4) target = actor.x < (zone.minX + zone.maxX) / 2 ? zone.maxX : zone.minX;
      actor.targetX = target;
      actor.facing = target > actor.x ? 1 : -1;
      actor.until = time + (Math.abs(target - actor.x) / WALK_SPEED) * 1000 + 50;
      break;
    }
    case 'look':
      actor.until = time + between(1400, 3200);
      break;
    case 'idle':
      actor.facing = 0;
      actor.until = time + between(900, 2600);
      break;
    case 'work':
      actor.workRate = between(0.7, 1.5);
      actor.until = time + between(2200, 5200);
      break;
    case 'hop':
      actor.until = time + 1100;
      break;
    case 'drift':
      actor.vx = between(-2.2, 2.2);
      actor.vy = between(-1.8, 1.8);
      actor.spin = between(-28, 28);
      actor.until = time + between(2500, 5500);
      break;
  }
}

function update(actor: Actor, time: number, dt: number): void {
  const elapsed = time - actor.startedAt;
  const { zone } = actor;
  let lift = 0;
  let frame = -1;
  let transform = '';
  switch (actor.mode) {
    case 'walk': {
      const step = Math.sign(actor.targetX - actor.x) * WALK_SPEED * dt;
      actor.x = Math.abs(actor.targetX - actor.x) <= Math.abs(step) ? actor.targetX : actor.x + step;
      frame = Math.floor(elapsed / FRAME_MS) % 8;
      break;
    }
    case 'look':
      // Turn to scan the horizon a few times at uneven moments.
      actor.facing = Math.sin(elapsed / 640 + actor.x) > 0.15 ? 1 : Math.sin(elapsed / 640 + actor.x) < -0.15 ? -1 : 0;
      break;
    case 'work': {
      const bend = Math.sin((elapsed / 1000) * Math.PI * actor.workRate);
      transform = `rotate(${(-5 * Math.max(0, bend)).toFixed(2)}deg) scaleY(${(1 - 0.12 * Math.max(0, bend)).toFixed(3)})`;
      break;
    }
    case 'hop': {
      const t = Math.min(1, elapsed / 1100);
      lift = 4 * t * (1 - t) * 7; // low-gravity arc, % of screen height
      frame = 2;
      break;
    }
    case 'drift': {
      actor.x += actor.vx * dt;
      actor.y += actor.vy * dt;
      if (actor.x < zone.minX || actor.x > zone.maxX) actor.vx *= -1;
      if (actor.y < zone.minY || actor.y > zone.maxY) actor.vy *= -1;
      actor.x = Math.min(zone.maxX, Math.max(zone.minX, actor.x));
      actor.y = Math.min(zone.maxY, Math.max(zone.minY, actor.y));
      actor.angle = (actor.angle + actor.spin * dt) % 360;
      actor.facing = actor.vx >= 0 ? 1 : -1;
      transform = `rotate(${actor.angle.toFixed(1)}deg)`;
      break;
    }
    case 'idle':
      break;
  }
  place(actor, lift, transform);
  paint(actor, frame);
}

function place(actor: Actor, lift: number, transform = ''): void {
  const { style } = actor.canvas;
  style.left = `${actor.x.toFixed(2)}%`;
  style.bottom = `${(actor.y + lift).toFixed(2)}%`;
  style.transform = transform;
}

function paint(actor: Actor, frame: number): void {
  const key = frame * 3 + actor.facing;
  if (key === actor.lastFrame || !actor.context) return;
  actor.lastFrame = key;
  drawAstronaut(actor.context, { x: actor.facing, y: 0 }, frame, actor.role);
}
