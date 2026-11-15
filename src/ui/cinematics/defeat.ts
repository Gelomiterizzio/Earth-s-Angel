// AI-assisted: OpenAI Codex. Original Canvas pixel art, team review pending.
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { TILE_PX } from '../../map/art';
import type { AppContext } from '../app-bridge';
import { el } from '../dom';
import './defeat.css';

const WIDTH = 320;
const HEIGHT = 180;
const PLANET_SIZE = 144;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PLANET_LEFT = CENTER_X - PLANET_SIZE / 2;
const PLANET_TOP = CENTER_Y - 66;
const BLAST_AT = 3.7;
const REVEAL_AT = 4.45;
const END_AT = 9.5;

const crew = [
  { role: 'commander', x: 84, y: 46, dx: -7, dy: -2, facing: -1 },
  { role: 'engineer', x: 239, y: 56, dx: 7, dy: -3, facing: 1 },
  { role: 'botanist', x: 79, y: 125, dx: -8, dy: 2, facing: -1 },
  { role: 'medic', x: 243, y: 130, dx: 8, dy: 2, facing: 1 },
] as const satisfies ReadonlyArray<{ role: SuitRole; x: number; y: number; dx: number; dy: number; facing: number }>;

const fault = [62, 68, 64, 73, 66, 79, 75, 84, 73, 70, 77, 83, 78, 80];
const branches = [
  [[71, 47], [57, 51], [49, 46], [33, 53], [29, 48]],
  [[78, 63], [94, 57], [97, 45], [112, 41], [117, 25]],
  [[77, 81], [59, 83], [52, 96], [38, 93], [27, 102]],
  [[76, 104], [94, 110], [101, 101], [119, 106], [125, 99]],
] as const;

const embers = Array.from({ length: 112 }, (_, i) => {
  const angle = i * 2.39996;
  const speed = 17 + (i * 19) % 68;
  return {
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    delay: (i % 9) * .055,
    size: 1 + (i % 11 === 0 ? 3 : i % 3 === 0 ? 1 : 0),
    life: 1.05 + ((i * 31) % 46) / 10,
  };
});

function unit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function pixel(g: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

function disk(g: CanvasRenderingContext2D, color: string, x: number, y: number, radius: number): void {
  const size = Math.floor(radius);
  g.fillStyle = color;
  for (let row = -size; row <= size; row++) {
    const half = Math.floor(Math.sqrt(size * size - row * row));
    g.fillRect(Math.round(x) - half, Math.round(y) + row, half * 2 + 1, 1);
  }
}

function paintSpace(g: CanvasRenderingContext2D): void {
  pixel(g, '#110922', 0, 0, WIDTH, HEIGHT);
  for (let i = 1; i < 152; i++) {
    const x = (i * 67 + i * i * 7) % WIDTH;
    const y = (i * 47 + i * i * 3) % HEIGHT;
    pixel(g, i % 11 === 0 ? '#a9c7e7' : i % 3 === 0 ? '#665279' : '#302442', x, y, 1, 1);
    if (i % 31 === 0) {
      pixel(g, '#8c789e', x - 1, y, 3, 1);
      pixel(g, '#8c789e', x, y - 1, 1, 3);
      pixel(g, '#e8e2ff', x, y, 1, 1);
    }
  }
}

function seam(y: number): number {
  const index = Math.min(fault.length - 2, Math.floor(y / 11));
  const fraction = (y - index * 11) / 11;
  return Math.round(fault[index] + (fault[index + 1] - fault[index]) * fraction)
    + (y % 7 < 3 ? 1 : 0);
}

function planetLayer(): CanvasRenderingContext2D {
  const layer = el('canvas');
  layer.width = layer.height = PLANET_SIZE;
  const g = layer.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return g;
}

function makePlanet(image: HTMLImageElement) {
  const globe = planetLayer();
  if (image.naturalWidth) globe.drawImage(image, 0, 0, PLANET_SIZE, PLANET_SIZE);
  else {
    disk(globe, '#2968a7', 72, 66, 57);
    pixel(globe, '#499c72', 26, 45, 43, 15);
    pixel(globe, '#499c72', 53, 55, 20, 27);
    pixel(globe, '#499c72', 87, 67, 29, 22);
  }
  return { globe, composite: planetLayer(), left: planetLayer(), right: planetLayer() };
}

function drawCrack(
  g: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  growth: number,
): void {
  const progress = growth * (points.length - 1);
  for (const border of [1, 0]) {
    for (let i = 0; i < Math.min(progress, points.length - 1); i++) {
      const [x, y] = points[i];
      const [endX, endY] = points[i + 1];
      const count = Math.max(Math.abs(endX - x), Math.abs(endY - y));
      for (let step = 0; step <= count * unit(progress - i); step++) {
        const px = x + (endX - x) * step / count;
        const py = y + (endY - y) * step / count;
        const color = border ? '#481c2d' : step % 3 === 0 ? '#ffd47b' : '#da4b2d';
        pixel(g, color, px - border, py - border, border * 2 + 1, border * 2 + 1);
      }
    }
  }
}

function crackPlanet(planet: ReturnType<typeof makePlanet>, time: number): void {
  const g = planet.composite;
  g.clearRect(0, 0, PLANET_SIZE, PLANET_SIZE);
  g.drawImage(planet.globe.canvas, 0, 0);
  const damage = unit((time - .55) / (BLAST_AT - .55));
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = damage * .54;
  pixel(g, '#42203e', 0, 0, PLANET_SIZE, PLANET_SIZE);
  g.globalAlpha = 1;
  for (let row = 0; row < PLANET_SIZE; row++) {
    if (Math.abs(row - 66) > damage * 89 || !damage) continue;
    const x = seam(row);
    const width = 1 + Math.floor(damage * (row % 11 < 4 ? 7 : 4));
    pixel(g, '#451a2b', x - width, row, width * 2 + 1, 1);
    pixel(g, '#c43829', x - width + 1, row, width * 2 - 1, 1);
    pixel(g, row % 5 < 3 ? '#ffae35' : '#f2752d', x - Math.floor(width / 2), row, width, 1);
    if (damage > .67) pixel(g, '#ffe3a0', x, row, 1, 1);
  }
  branches.forEach((points, index) => drawCrack(g, points, unit(damage * 2.2 - .42 - index * .12)));
  g.globalCompositeOperation = 'source-over';
}

function splitPlanet(planet: ReturnType<typeof makePlanet>): void {
  crackPlanet(planet, BLAST_AT);
  const { left, right, composite } = planet;
  for (let row = 0; row < PLANET_SIZE; row++) {
    const x = seam(row);
    left.drawImage(composite.canvas, 0, row, x, 1, 0, row, x, 1);
    right.drawImage(composite.canvas, x, row, PLANET_SIZE - x, 1, x, row, PLANET_SIZE - x, 1);
  }
}

function paintBlast(g: CanvasRenderingContext2D, planet: ReturnType<typeof makePlanet>, age: number): void {
  const spread = 3 + 22 * (1 - Math.exp(-age * 3.6)) + age * 7;
  const slant = Math.round(age * 4);
  g.globalAlpha = 1 - unit((age - 2.2) / 3.2);
  g.drawImage(planet.left.canvas, Math.round(PLANET_LEFT - spread), PLANET_TOP + slant);
  g.drawImage(planet.right.canvas, Math.round(PLANET_LEFT + spread), PLANET_TOP - slant);
  g.globalAlpha = 1;

  if (age < 1.6) {
    const swell = unit(age / .24);
    const glow = (1 - unit((age - .23) / 1.37)) * swell;
    for (let i = 0; i < 23; i++) {
      const x = CENTER_X + ((i * 17) % 25 - 12) * swell;
      const y = CENTER_Y + ((i * 23) % 99 - 49) * swell;
      const size = (7 + (i * 13) % 17) * glow;
      disk(g, '#651e35', x, y, size);
      disk(g, '#e64a24', x, y, size * .74);
      disk(g, '#ff9d30', x, y, size * .51);
      disk(g, '#ffe1a1', x, y, size * .25);
    }
  }
  for (const [i, ember] of embers.entries()) {
    const travel = age - ember.delay;
    if (travel < 0 || travel > ember.life) continue;
    const x = CENTER_X + ember.dx * (.16 + travel * .67);
    const y = CENTER_Y + ember.dy * (.16 + travel * .64);
    const tail = Math.min(.1, travel);
    const cooling = travel / ember.life;
    g.globalAlpha = 1 - cooling * .86;
    pixel(g, '#6a2b37', x - ember.dx * tail, y - ember.dy * tail, ember.size, 1);
    pixel(g, cooling > .55 ? '#914654' : i % 4 === 0 ? '#ffe6ae' : '#ff792b',
      x, y, ember.size, Math.max(1, ember.size - 1));
  }
  g.globalAlpha = 1;
}

export function mountDefeatSequence(
  parent: HTMLElement,
  ctx: AppContext,
  onComplete: () => void,
): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = el('div', 'defeat-scene');
  const canvas = el('canvas', 'defeat-art');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.setAttribute('aria-hidden', 'true');
  const g = canvas.getContext('2d');
  if (!g || reduced.matches || ctx.options.get().reducedMotion) {
    onComplete();
    return () => undefined;
  }

  const sprites = crew.map(({ role, facing }) => {
    const sprite = el('canvas');
    sprite.width = sprite.height = TILE_PX;
    const context = sprite.getContext('2d');
    if (context) drawAstronaut(context, { x: facing, y: 0 }, -1, role);
    return sprite;
  });
  const earthImage = new Image();
  earthImage.src = '/assets/ui/earth.png';
  let planet: ReturnType<typeof makePlanet> | undefined;
  const caption = el('p', 'defeat-caption');
  const ending = el('div', 'defeat-ending');
  ending.hidden = true;
  const title = el('h1', 'defeat-heading');
  const advice = el('p');
  ending.append(title, advice);
  const skip = el('button', 'btn defeat-skip');
  skip.type = 'button';
  skip.setAttribute('aria-keyshortcuts', 'Escape');
  scene.append(canvas, caption, ending, skip);
  parent.append(scene);
  let frame = 0;
  let startedAt: number | undefined;
  let finished = false;
  let blastPlayed = false;
  const translate = () => {
    caption.textContent = ctx.t('ui.result.evacuation');
    title.textContent = ctx.t('ui.result.gameOver');
    advice.textContent = ctx.t('ui.result.defeatAdvice');
    skip.textContent = ctx.t(ending.hidden ? 'ui.result.skipDefeat' : 'ui.result.viewDefeatReport');
  };
  translate();
  const offOptions = ctx.options.subscribe(translate);

  function stop() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    offOptions();
    skip.removeEventListener('click', finish);
    scene.removeEventListener('keydown', skipOnEscape);
    scene.remove();
  }

  function finish() {
    if (finished) return;
    stop();
    onComplete();
  }

  function skipOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    finish();
  }

  function draw(now: number) {
    if (finished || !g) return;
    if (!earthImage.complete) {
      paintSpace(g);
      frame = requestAnimationFrame(draw);
      return;
    }
    planet ??= makePlanet(earthImage);
    startedAt ??= now;
    const elapsed = (now - startedAt) / 1000;
    if (elapsed >= END_AT || reduced.matches || ctx.options.get().reducedMotion) {
      finish();
      return;
    }
    if (elapsed >= REVEAL_AT && ending.hidden) {
      ending.hidden = false;
      caption.hidden = true;
      translate();
    }
    g.imageSmoothingEnabled = false;
    paintSpace(g);
    if (elapsed < BLAST_AT) {
      crackPlanet(planet, elapsed);
      g.drawImage(planet.composite.canvas, PLANET_LEFT, PLANET_TOP);
    } else {
      if (!blastPlayed) {
        blastPlayed = true;
        splitPlanet(planet);
        ctx.audio.playSfx('sfx-error');
      }
      paintBlast(g, planet, elapsed - BLAST_AT);
    }
    for (const [i, member] of crew.entries()) {
      g.save();
      const surge = Math.max(0, elapsed - BLAST_AT) * 1.2;
      const distance = elapsed + surge;
      g.globalAlpha = 1 - unit((elapsed - 5.8 - i * .15) / 2.4);
      g.translate(Math.round(member.x + member.dx * distance), Math.round(member.y + member.dy * distance));
      g.rotate(.13 * Math.sin(elapsed * 1.2 + i) + member.facing * elapsed * .035);
      const size = 30 - Math.round(elapsed * 1.4);
      g.drawImage(sprites[i], -size / 2, -size / 2, size, size);
      g.restore();
    }
    frame = requestAnimationFrame(draw);
  }

  skip.addEventListener('click', finish);
  scene.addEventListener('keydown', skipOnEscape);
  skip.focus({ preventScroll: true });
  frame = requestAnimationFrame(draw);
  return stop;
}
