// AI-assisted: Claude Code (claude-opus-5-5). Original pixel art drawn on Canvas. Human review by C pending.
// Short scene shown after the player shelters the crew from a solar storm. Purely visual:
// the decision is already applied in the store before this opens.
import type { AppContext } from '../app-bridge';
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { TILE_PX } from '../../map/art';
import { button } from '../components/button';
import { el } from '../dom';

const W = 320;
const H = 180;
const ROLES: readonly SuitRole[] = ['commander', 'engineer', 'botanist', 'medic'];

interface Seat { x: number; y: number; facing: -1 | 0 | 1; crate: boolean }
// Where each crew member sits: on the floor or on a supply crate.
const SEATS: readonly Seat[] = [
  { x: 64, y: 124, facing: 1, crate: false },
  { x: 116, y: 116, facing: 0, crate: false },
  { x: 176, y: 106, facing: -1, crate: true },
  { x: 230, y: 124, facing: -1, crate: false },
  { x: 150, y: 128, facing: 1, crate: false },
  { x: 262, y: 110, facing: -1, crate: true },
];

interface Streak { x: number; y: number; len: number; speed: number; color: string }

export function openShelterScene(root: HTMLElement, ctx: AppContext, crewCount: number): () => void {
  const veil = el('div', 'veil shelter-veil');
  const dialog = el('div', 'dialog shelter-scene');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'shelter-title');
  const canvas = el('canvas', 'shelter-canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute('aria-hidden', 'true');
  const title = el('h2', undefined, ctx.t('ui.shelter.title'));
  title.id = 'shelter-title';
  const body = el('p', undefined, ctx.t('ui.shelter.body'));
  const note = el('p', 'note', ctx.t('ui.shelter.note'));
  const close = (): void => cleanup();
  const ok = button({ label: ctx.t('ui.shelter.continue'), className: 'btn-primary', onClick: close });
  dialog.append(canvas, title, body, note, ok);
  veil.append(dialog);
  root.append(veil);
  ok.focus();

  const g = canvas.getContext('2d');
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = TILE_PX;
  const sg = sprite.getContext('2d');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const still = (): boolean => media.matches || ctx.options.get().reducedMotion;
  const crew = Math.max(1, Math.min(SEATS.length, crewCount));
  const streaks: Streak[] = Array.from({ length: 16 }, () => newStreak(true));
  const looks = Array.from({ length: crew }, (_, i) => ({ facing: SEATS[i].facing, until: 0 }));
  const started = performance.now();

  let handle = 0;
  let closed = false;
  const frame = (time: number): void => {
    if (!g || !sg) return;
    const t = still() ? 0 : time - started;
    paintRoom(g, t, streaks, still());
    for (let i = 0; i < crew; i++) {
      const seat = SEATS[i];
      const look = looks[i];
      if (!still() && time > look.until) {
        // Glance at the windows or at each other at uneven intervals.
        look.facing = ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)];
        look.until = time + 900 + Math.random() * 2200;
      }
      if (seat.crate) paintCrate(g, seat.x - 4, seat.y + 30);
      // A small shiver while the storm passes.
      const shiver = still() ? 0 : Math.round(Math.sin(t / 90 + i * 1.7) * 0.6);
      drawAstronaut(sg, { x: look.facing, y: 0 }, -1, ROLES[i % ROLES.length]);
      g.imageSmoothingEnabled = false;
      g.drawImage(sprite, seat.x + shiver, seat.y, TILE_PX * 2, TILE_PX * 2);
    }
    if (!still() && !closed) handle = requestAnimationFrame(frame);
  };
  handle = requestAnimationFrame(frame);
  frame(started);

  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      ok.focus();
    } else {
      // Keep movement and shortcut keys from reaching the map while the scene is open.
      event.stopImmediatePropagation();
    }
  };
  window.addEventListener('keydown', onKey, true);

  function cleanup(): void {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(handle);
    window.removeEventListener('keydown', onKey, true);
    veil.remove();
  }
  return cleanup;
}

function newStreak(anywhere: boolean): Streak {
  const colors = ['#5df28f', '#2fbf71', '#ff9a3d', '#9be7ff'];
  return {
    x: anywhere ? Math.random() * W : -20 - Math.random() * 60,
    y: 14 + Math.random() * 44,
    len: 6 + Math.random() * 10,
    speed: 60 + Math.random() * 90,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function paintRoom(g: CanvasRenderingContext2D, t: number, streaks: Streak[], still: boolean): void {
  const px = (color: string, x: number, y: number, w: number, h: number): void => {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  };
  // Walls and ceiling.
  px('#1a2236', 0, 0, W, H);
  px('#262f47', 0, 8, W, 118);
  for (let x = 0; x < W; x += 40) px('#1d2539', x, 8, 2, 118);
  px('#323d5c', 0, 8, W, 2);
  // Floor grating.
  px('#141b2c', 0, 126, W, 54);
  for (let x = 0; x < W; x += 6) px('#20293f', x, 128, 2, 52);
  for (let y = 130; y < H; y += 6) px('#20293f', 0, y, W, 1);
  px('#3a4566', 0, 126, W, 2);

  // Two portholes with the storm outside: stars, lunar ground and particle streaks.
  const windows = [{ x: 70, y: 18 }, { x: 186, y: 18 }];
  const dt = still ? 0 : 1 / 60;
  for (const s of streaks) {
    s.x += s.speed * dt;
    if (s.x > W + 20) Object.assign(s, newStreak(false));
  }
  for (const win of windows) {
    px('#4a5677', win.x - 4, win.y - 4, 72, 48);
    px('#0b1026', win.x, win.y, 64, 40);
    g.save();
    g.beginPath();
    g.rect(win.x, win.y, 64, 40);
    g.clip();
    for (let i = 0; i < 9; i++) px('#dde3ee', win.x + ((i * 23) % 64), win.y + ((i * 11) % 26), 1, 1);
    for (const s of streaks) {
      for (let k = 0; k < s.len; k++) px(s.color, s.x - k, s.y + k * 0.5, 1, 1);
    }
    px('#8e9aaf', win.x, win.y + 32, 64, 8);
    px('#6f7b92', win.x, win.y + 32, 64, 2);
    g.restore();
  }

  // Red alarm lights that pulse.
  const pulse = still ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t / 380));
  for (const lx of [22, 290]) {
    px('#3a1a24', lx - 2, 30, 12, 12);
    g.globalAlpha = pulse;
    px('#ff5a5f', lx, 32, 8, 8);
    g.globalAlpha = pulse * 0.18;
    px('#ff5a5f', lx - 14, 22, 36, 30);
    g.globalAlpha = 1;
  }
  // Red wash over the room when the alarm peaks.
  g.globalAlpha = still ? 0.06 : 0.04 + 0.06 * Math.abs(Math.sin(t / 380));
  px('#ff5a5f', 0, 0, W, H);
  g.globalAlpha = 1;

  // Warning screen with a radiation symbol, blinking.
  px('#11182a', 266, 52, 44, 34);
  px('#3a1420', 268, 54, 40, 30);
  if (still || Math.floor(t / 500) % 2 === 0) paintTrefoil(g, 288, 69);

  // Oxygen tanks and a supply rack on the left.
  for (const tx of [8, 22]) {
    px('#2e6b47', tx, 92, 11, 34);
    px('#3f8a5d', tx + 2, 94, 3, 30);
    px('#9aa5b1', tx + 3, 87, 5, 5);
  }
  px('#3a4566', 36, 60, 22, 4);
  px('#5c6b8f', 38, 52, 8, 8);
  px('#c9a227', 48, 54, 8, 6);
}

function paintCrate(g: CanvasRenderingContext2D, x: number, y: number): void {
  g.fillStyle = '#6b4f2e';
  g.fillRect(x, y, 56, 22);
  g.fillStyle = '#8a6a3f';
  g.fillRect(x + 2, y + 2, 52, 4);
  g.fillStyle = '#4a361f';
  g.fillRect(x + 26, y + 6, 4, 16);
}

function paintTrefoil(g: CanvasRenderingContext2D, cx: number, cy: number): void {
  g.fillStyle = '#ff5a5f';
  for (let y = -10; y <= 10; y++) {
    for (let x = -10; x <= 10; x++) {
      const r = Math.hypot(x, y);
      const angle = (Math.atan2(y, x) * 180) / Math.PI + 360;
      const blade = r >= 4 && r <= 10 && Math.floor((angle + 30) / 60) % 2 === 0;
      if (r <= 2 || blade) g.fillRect(cx + x, cy + y, 1, 1);
    }
  }
}
