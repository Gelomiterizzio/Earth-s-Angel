// AI-assisted: Claude Code (claude-opus-5-5). Original pixel effects drawn on Canvas. Human review by C pending.
// Ambient life for the field map: dust kicked up by the astronaut's boots, glints on working
// solar panels and ice, Martian dust devils and wind-blown dust during a dust storm.
// Purely visual: it reads the state and never changes it. Math.random is fine here because
// the effects are not part of the simulation.
import type { AppContext } from '../app/context';
import type { GameState } from '../core/types';
import { getSolarFactorForDay } from '../core';
import { TILE_PX } from './art';

interface Position { x: number; y: number }

interface Mote {
  x: number; y: number; vx: number; vy: number;
  born: number; life: number; size: number; color: string;
}

interface Devil { x: number; y: number; vx: number; born: number; life: number; seed: number }

interface Streak { x: number; y: number; len: number; speed: number }

interface Flash { x: number; y: number; born: number }

export interface MapAmbience {
  resize(width: number, height: number): void;
  destroy(): void;
}

// View window around the astronaut, in tiles. The camera shows about 16 × 14 tiles.
const VIEW_X = 10;
const VIEW_Y = 9;
const FRAME_MS = 1000 / 30;

const PALETTE = {
  luna: { dust: ['#c3cad8', '#8e9aaf', '#dde3ee'], gravity: 9, life: 900 },
  marte: { dust: ['#d9a066', '#b5532a', '#e8a87c'], gravity: 26, life: 600 },
} as const;

/** The canvas goes above the ground and effect layers, below the clickable grid and the astronaut. */
export function createMapAmbience(
  canvas: HTMLCanvasElement,
  world: HTMLElement,
  ctx: AppContext,
  avatarPosition: () => Position | null,
  still: () => boolean,
): MapAmbience {
  canvas.className = 'map-ambience';
  canvas.setAttribute('aria-hidden', 'true');
  const g = canvas.getContext('2d');

  let motes: Mote[] = [];
  let devils: Devil[] = [];
  let streaks: Streak[] = [];
  let nextDevilAt = 0;
  let flashes: Flash[] = [];
  // Buildings seen under construction, to celebrate the moment they start working.
  let scaffolds = new Set<number>();
  let scaffoldDay = -1;
  let last: Position | null = null;
  let lastLevel = '';
  let handle = 0;
  let lastFrame = 0;
  let cleared = true;

  const clear = (): void => {
    if (cleared || !g) return;
    g.clearRect(0, 0, canvas.width, canvas.height);
    cleared = true;
  };

  const frame = (now: number): void => {
    handle = requestAnimationFrame(frame);
    if (now - lastFrame < FRAME_MS) return;
    const dt = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;

    const state = ctx.store.getState();
    const at = avatarPosition();
    const level = state?.mission.level;
    if (!g || !state || !at || (level !== 'luna' && level !== 'marte')
      || ctx.flow.current().scene !== 'mision' || world.closest?.('[hidden]') || still()) {
      clear();
      last = null;
      return;
    }
    if (level !== lastLevel) {
      motes = []; devils = []; streaks = []; flashes = []; scaffolds = new Set(); last = null; lastLevel = level;
    }

    // Boot dust: a small puff on the tile the astronaut just left.
    if (last && (last.x !== at.x || last.y !== at.y)) puff(last, level, now);
    last = { x: at.x, y: at.y };

    const view = {
      x0: Math.max(0, at.x - VIEW_X), x1: Math.min(state.mission.map.width - 1, at.x + VIEW_X),
      y0: Math.max(0, at.y - VIEW_Y), y1: Math.min(state.mission.map.height - 1, at.y + VIEW_Y),
    };
    g.clearRect(0, 0, canvas.width, canvas.height);
    cleared = false;
    g.imageSmoothingEnabled = false;

    drawConstruction(state, view, now);
    drawGlints(state, view, now);
    if (level === 'marte') {
      updateDevils(view, now, dt);
      if (stormToday(state)) drawStorm(view, dt);
      else streaks = [];
    }
    drawMotes(level, now, dt);
  };

  function puff(tile: Position, level: 'luna' | 'marte', now: number): void {
    const { dust, life } = PALETTE[level];
    for (let i = 0; i < 6; i++) {
      motes.push({
        x: (tile.x + 0.5) * TILE_PX + (Math.random() - 0.5) * 10,
        y: (tile.y + 0.88) * TILE_PX,
        vx: (Math.random() - 0.5) * 26,
        vy: -6 - Math.random() * (level === 'luna' ? 16 : 10),
        born: now,
        life: life * (0.7 + Math.random() * 0.6),
        size: Math.random() < 0.3 ? 2 : 1,
        color: dust[Math.floor(Math.random() * dust.length)],
      });
    }
    if (motes.length > 120) motes = motes.slice(-120);
  }

  function drawMotes(level: 'luna' | 'marte', now: number, dt: number): void {
    if (!g) return;
    const { gravity } = PALETTE[level];
    motes = motes.filter((m) => now - m.born < m.life);
    for (const m of motes) {
      m.vy += gravity * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      g.globalAlpha = 0.85 * (1 - (now - m.born) / m.life);
      g.fillStyle = m.color;
      g.fillRect(Math.round(m.x), Math.round(m.y), m.size, m.size);
    }
    g.globalAlpha = 1;
  }

  function drawConstruction(state: GameState, view: { x0: number; x1: number; y0: number; y1: number }, now: number): void {
    if (!g) return;
    const { mission } = state;
    const inView = (b: { x: number; y: number }): boolean =>
      b.x >= view.x0 && b.x <= view.x1 && b.y >= view.y0 && b.y <= view.y1;
    // A building that was scaffolding on an earlier day and works today gets a flash.
    if (mission.day !== scaffoldDay && mission.phase === 'planning') {
      for (const b of mission.buildings) {
        if (scaffolds.has(b.id) && b.operationalFromDay <= mission.day) {
          flashes.push({ x: b.x, y: b.y, born: now });
          scaffolds.delete(b.id);
        }
      }
      scaffoldDay = mission.day;
    }
    for (const b of mission.buildings) {
      if (b.operationalFromDay <= mission.day) continue;
      scaffolds.add(b.id);
      if (!inView(b)) continue;
      // Welding sparks on the scaffold: short bursts at uneven moments.
      const seed = b.x * 13 + b.y * 7;
      const cycle = (now + seed * 97) % 1500;
      if (cycle > 520) continue;
      const sx = b.x * TILE_PX + 6 + (seed % 12);
      const sy = b.y * TILE_PX + 5 + ((seed * 3) % 10);
      g.fillStyle = '#ffffff';
      g.globalAlpha = 1 - cycle / 520;
      g.fillRect(sx, sy, 1, 1);
      for (let i = 0; i < 4; i++) {
        const angle = seed + i * 1.9 + Math.floor(cycle / 130);
        const r = 1 + (cycle / 520) * 5;
        g.fillStyle = i % 2 ? '#ffd166' : '#ff9a3d';
        g.fillRect(Math.round(sx + Math.cos(angle) * r), Math.round(sy + Math.sin(angle) * r + (cycle / 520) * 3), 1, 1);
      }
    }
    // Completion flash: an expanding ring of light and a few rising sparkles.
    flashes = flashes.filter((f) => now - f.born < 1100);
    for (const f of flashes) {
      if (!inView(f)) continue;
      const t = (now - f.born) / 1100;
      const cx = (f.x + 0.5) * TILE_PX;
      const cy = (f.y + 0.5) * TILE_PX;
      const radius = 4 + t * 16;
      g.globalAlpha = 1 - t;
      g.fillStyle = '#ffd166';
      for (let a = 0; a < 20; a++) {
        const angle = (a / 20) * Math.PI * 2;
        g.fillRect(Math.round(cx + Math.cos(angle) * radius), Math.round(cy + Math.sin(angle) * radius * 0.75), 1, 1);
      }
      g.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        g.fillRect(Math.round(cx - 8 + i * 4), Math.round(cy - 4 - t * 14 - (i % 2) * 3), 1, 2);
      }
    }
    g.globalAlpha = 1;
  }

  function drawGlints(state: GameState, view: { x0: number; x1: number; y0: number; y1: number }, now: number): void {
    if (!g) return;
    const { mission } = state;
    const light = getSolarFactorForDay(mission.schedule, mission.day);
    // Solar panels catch the light when they are working and the Sun is up.
    if (light >= 50) {
      for (const b of mission.buildings) {
        if (b.type !== 'panel' || !b.enabled || b.damaged || b.operationalFromDay > mission.day) continue;
        if (b.x < view.x0 || b.x > view.x1 || b.y < view.y0 || b.y > view.y1) continue;
        const period = 3400;
        const phase = ((now + (b.x * 733 + b.y * 397)) % period) / 450;
        if (phase > 1) continue;
        // A short diagonal flash sweeping across the panel face.
        const ox = b.x * TILE_PX + 4 + phase * 14;
        const oy = b.y * TILE_PX + 6 + phase * 6;
        g.globalAlpha = (light / 100) * Math.sin(phase * Math.PI);
        g.fillStyle = '#ffffff';
        g.fillRect(Math.round(ox), Math.round(oy), 1, 3);
        g.fillRect(Math.round(ox) + 1, Math.round(oy) + 1, 1, 1);
        g.fillStyle = '#ffd166';
        g.fillRect(Math.round(ox) - 1, Math.round(oy) + 1, 1, 1);
      }
    }
    // Ice twinkles now and then, so explorers spot it.
    for (let y = view.y0; y <= view.y1; y++) {
      for (let x = view.x0; x <= view.x1; x++) {
        const tile = mission.map.tiles[y * mission.map.width + x];
        if (!tile?.explored || tile.terrain !== 'hielo' || tile.collected) continue;
        const period = 2600 + ((x * 31 + y * 17) % 7) * 300;
        const phase = ((now + x * 977 + y * 571) % period) / 380;
        if (phase > 1) continue;
        const cx = x * TILE_PX + 6 + ((x * 7 + y * 3) % 12);
        const cy = y * TILE_PX + 6 + ((x * 5 + y * 11) % 10);
        const a = Math.sin(phase * Math.PI);
        g.globalAlpha = a;
        g.fillStyle = '#ffffff';
        g.fillRect(cx, cy, 1, 1);
        g.globalAlpha = a * 0.6;
        g.fillStyle = '#9be7ff';
        g.fillRect(cx - 1, cy, 1, 1);
        g.fillRect(cx + 1, cy, 1, 1);
        g.fillRect(cx, cy - 1, 1, 1);
        g.fillRect(cx, cy + 1, 1, 1);
      }
    }
    g.globalAlpha = 1;
  }

  function updateDevils(view: { x0: number; x1: number; y0: number; y1: number }, now: number, dt: number): void {
    if (!g) return;
    if (devils.length < 2 && now >= nextDevilAt) {
      devils.push({
        x: (view.x0 + Math.random() * (view.x1 - view.x0 + 1)) * TILE_PX,
        y: (view.y0 + 1 + Math.random() * Math.max(1, view.y1 - view.y0 - 1)) * TILE_PX,
        vx: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 7),
        born: now,
        life: 5000 + Math.random() * 3000,
        seed: Math.random() * 10,
      });
      nextDevilAt = now + 4500 + Math.random() * 6000;
    }
    devils = devils.filter((d) => now - d.born < d.life);
    for (const d of devils) {
      d.x += d.vx * dt;
      const age = (now - d.born) / d.life;
      const fade = Math.min(1, age * 5, (1 - age) * 5);
      const spin = (now / 1000) * 9 + d.seed;
      // A funnel of dust: narrow at the ground, wider and fainter higher up.
      for (let k = 0; k < 14; k++) {
        const radius = 1 + k * 0.55;
        const sway = Math.sin(now / 420 + d.seed + k * 0.25) * k * 0.25;
        for (let arm = 0; arm < 2; arm++) {
          const angle = spin + k * 0.7 + arm * Math.PI;
          const px = d.x + sway + Math.cos(angle) * radius;
          const front = Math.sin(angle) > 0;
          g.globalAlpha = fade * (0.75 - k * 0.04) * (front ? 1 : 0.5);
          g.fillStyle = front ? '#e8a87c' : '#b5532a';
          g.fillRect(Math.round(px), Math.round(d.y - k * 1.6), 1, 1);
        }
      }
      // Grains kicked up at the base.
      g.globalAlpha = fade * 0.6;
      g.fillStyle = '#d9a066';
      for (let i = 0; i < 3; i++) {
        const a = spin * 1.7 + i * 2.1;
        g.fillRect(Math.round(d.x + Math.cos(a) * 4), Math.round(d.y + 1 + Math.sin(a)), 1, 1);
      }
    }
    g.globalAlpha = 1;
  }

  function drawStorm(view: { x0: number; x1: number; y0: number; y1: number }, dt: number): void {
    if (!g) return;
    const left = view.x0 * TILE_PX;
    const right = (view.x1 + 1) * TILE_PX;
    const top = view.y0 * TILE_PX;
    const bottom = (view.y1 + 1) * TILE_PX;
    const spawn = (anywhere: boolean): Streak => ({
      x: anywhere ? left + Math.random() * (right - left) : left - Math.random() * 40,
      y: top + Math.random() * (bottom - top),
      len: 3 + Math.random() * 6,
      speed: 70 + Math.random() * 90,
    });
    while (streaks.length < 70) streaks.push(spawn(true));
    g.fillStyle = '#d9a066';
    for (const s of streaks) {
      s.x += s.speed * dt;
      s.y += s.speed * dt * 0.12;
      if (s.x > right + 10 || s.y > bottom || s.x < left - 60) Object.assign(s, spawn(false));
      g.globalAlpha = 0.4;
      g.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.len), 1);
    }
    g.globalAlpha = 1;
  }

  // Test environments without animation frames get a static, empty layer.
  if (typeof requestAnimationFrame === 'function') handle = requestAnimationFrame(frame);
  return {
    resize(width, height) {
      canvas.width = width * TILE_PX;
      canvas.height = height * TILE_PX;
      motes = []; devils = []; streaks = []; last = null;
      cleared = true;
    },
    destroy() {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(handle);
      canvas.remove?.();
    },
  };
}

function stormToday(state: GameState): boolean {
  const { mission } = state;
  return mission.schedule.some((event) => event.type === 'tormenta-polvo'
    && event.startDay <= mission.day && mission.day < event.startDay + event.durationDays);
}
