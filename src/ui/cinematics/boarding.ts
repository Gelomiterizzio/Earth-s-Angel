// AI-assisted: OpenAI Codex. Original Canvas animation with the game's pixel sprites.
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { drawLunarLander, TILE_PX } from '../../map/art';
import { el } from '../dom';

const WIDTH = 320;
const HEIGHT = 180;
const FLOOR = 133;
const LAUNCH = 6.4;
const DURATION = 8.5;
const roles: readonly SuitRole[] = ['commander', 'engineer', 'botanist', 'medic'];

function between(time: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

function drawGround(g: CanvasRenderingContext2D): void {
  g.fillStyle = '#0e142a';
  g.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 100; i++) {
    g.fillStyle = i % 13 ? '#394562' : '#c3d7ee';
    g.fillRect((i * 71 + i * i * 9) % WIDTH, (i * 37 + i * i) % 116, i % 13 ? 1 : 2, 1);
  }
  for (let x = 0; x < WIDTH; x += 2) {
    const y = Math.round(109 + 6 * Math.sin(x / 24) + 4 * Math.cos(x / 10));
    g.fillStyle = '#343b54';
    g.fillRect(x, y, 2, HEIGHT - y);
    g.fillStyle = '#657086';
    g.fillRect(x, 124 + Math.round(3 * Math.sin(x / 19)), 2, HEIGHT - 121);
  }
  for (let i = 0; i < 178; i++) {
    g.fillStyle = i % 3 ? '#535d72' : '#8992a3';
    g.fillRect((i * 83 + i * i * 11) % WIDTH, 132 + (i * 31 % 48), i % 6 ? 1 : 3, 1);
  }
  g.fillStyle = '#262f45';
  g.fillRect(241, 103, 48, 15);
  g.fillRect(248, 97, 35, 9);
  g.fillStyle = '#929bad';
  g.fillRect(244, 104, 42, 3);
  g.fillStyle = '#79d5dc';
  for (const x of [249, 260, 271, 279]) g.fillRect(x, 109, 4, 2);
}

export function mountBoarding(
  stage: HTMLElement,
  onBeat: (beat: 'run' | 'rescue' | 'aboard' | 'launch') => void,
  onFinish: () => void,
): () => void {
  const canvas = el('canvas', 'cine-layer');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.setAttribute('aria-hidden', 'true');
  const g = canvas.getContext('2d');
  const scenery = el('canvas');
  scenery.width = WIDTH;
  scenery.height = HEIGHT;
  const ground = scenery.getContext('2d');
  const sprite = el('canvas');
  sprite.width = sprite.height = TILE_PX;
  const suit = sprite.getContext('2d');
  if (!g || !ground || !suit) {
    queueMicrotask(onFinish);
    return () => undefined;
  }
  stage.replaceChildren(canvas);
  drawGround(ground);
  g.imageSmoothingEnabled = false;
  let frame = 0;
  let start: number | undefined;
  let currentBeat = '';
  let stopped = false;

  function draw(now: number): void {
    if (stopped || !g || !suit) return;
    start ??= now;
    const t = (now - start) / 1000;
    if (t >= DURATION) {
      onFinish();
      return;
    }
    const beat = t >= LAUNCH ? 'launch' : t >= 4 ? 'aboard' : t >= 2.12 ? 'rescue' : 'run';
    if (beat !== currentBeat) {
      currentBeat = beat;
      onBeat(beat);
    }
    g.drawImage(scenery, 0, 0);
    const flight = between(t, LAUNCH, DURATION);
    const shipY = FLOOR - Math.round(215 * flight * flight);
    if (t >= LAUNCH) {
      for (let i = 0; i < 40; i++) {
        const age = (flight * 1.7 + i * .083) % 1;
        const spread = (i * 31 % 39) - 19;
        const x = 61 + Math.round(spread * (flight + age)) + (i % 3);
        const y = shipY - 16 + Math.round(age * (39 + 94 * flight));
        g.fillStyle = age < .3 ? '#fff0b4' : age < .6 ? '#ff9a45' : '#746c7e';
        g.fillRect(x, y, 2 + (i % 4), 3 + (i % 5));
      }
    }
    g.save();
    g.translate(61, shipY);
    g.scale(2, 2);
    g.translate(-12, -22);
    drawLunarLander(g, 0, 0);
    g.restore();

    roles.forEach((role, i) => {
      const arrive = 1.85 + i * .08;
      const lineX = 108 + i * 25 + (i === 3 ? 5 : 0);
      const begin = -.32 + i * .16;
      const climbAt = 4.4 + i * .30;
      const aboardAt = climbAt + .95;
      if (t >= aboardAt) return;

      let x = 302 + i * 26 + (lineX - 302 - i * 26) * between(t, begin, arrive);
      let foot = FLOOR + i % 2 * 5;
      let rotation = 0;
      let facing = -1;
      let running = t < arrive;
      if (i === 3) {
        const fall = between(t, arrive, 2.38) * (1 - between(t, 3.02, 3.63));
        rotation = -.96 * fall;
        foot += 9 * fall;
        x -= 4 * fall;
      } else if (i === 2 && t >= 2.18 && t < climbAt) {
        const helping = between(t, 2.18, 2.93);
        x += 12 * helping;
        facing = t < 3.67 ? 1 : -1;
        running = t < 2.93;
        rotation = .35 * helping * (1 - between(t, 3.05, 3.64));
        foot += 2 * helping;
      }
      if (t >= climbAt) {
        const from = lineX + (i === 2 ? 12 : 0);
        x = from + (78 - from) * between(t, climbAt, aboardAt - .26);
        foot -= 24 * between(t, aboardAt - .26, aboardAt);
        running = true;
      }

      drawAstronaut(suit, { x: facing, y: 0 }, running ? Math.floor(t * 19) % 8 : -1, role);
      g.fillStyle = '#4a5368';
      g.fillRect(Math.round(x - 6), FLOOR + i % 2 * 5, 12, 2);
      g.save();
      g.translate(Math.round(x), Math.round(foot - 11));
      g.rotate(rotation);
      g.globalAlpha = 1 - between(t, aboardAt - .16, aboardAt);
      g.drawImage(sprite, -12, -12, 24, 24);
      g.restore();
    });
    frame = requestAnimationFrame(draw);
  }

  frame = requestAnimationFrame(draw);
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}
