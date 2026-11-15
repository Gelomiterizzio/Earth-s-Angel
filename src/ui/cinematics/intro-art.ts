// AI-assisted: OpenAI Codex. Canvas storyboard based on the approved local preview.
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { drawLunarLander, TILE_PX } from '../../map/art';

export const INTRO_WIDTH = 384;
export const INTRO_HEIGHT = 216;
export const LIFTOFF_SECONDS = 1.18;
const roles: readonly SuitRole[] = ['commander', 'engineer', 'botanist', 'medic'];

export function createIntroArt(g: CanvasRenderingContext2D, suit: CanvasRenderingContext2D, globe: HTMLImageElement, logo: HTMLImageElement) {
  const actor = suit.canvas;
  const W = INTRO_WIDTH;
  const H = INTRO_HEIGHT;
  g.imageSmoothingEnabled = false;

  function pixel(color: string, x: number, y: number, w = 1, h = 1): void {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function disk(color: string, cx: number, cy: number, r: number): void {
    g.fillStyle = color;
    for (let y = -Math.floor(r); y <= r; y++) {
      const span = Math.floor(Math.sqrt(r * r - y * y));
      g.fillRect(Math.round(cx) - span, Math.round(cy) + y, span * 2 + 1, 1);
    }
  }
  const unit = (v: number) => Math.max(0, Math.min(1, v));
  const progress = (t: number, a: number, b: number) => unit((t - a) / (b - a));
  const ease = (v: number) => v * v * (3 - 2 * v);
  const mix = (a: number, b: number, p: number) => a + (b - a) * p;
  const hash = (i: number) => {
    const a = Math.sin(i * 78.233 + 5.1) * 43758.5453;
    return a - Math.floor(a);
  };
  function sky(t: number, drift = 0, glow = '#19294a'): void {
    const shade = g.createRadialGradient(185, 110, 18, 185, 110, 222);
    shade.addColorStop(0, glow); shade.addColorStop(1, '#090d21');
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
    for (let i = 1; i <= 118; i++) {
      const x = ((hash(i) * W + drift * (i % 3 + 1)) % W + W) % W;
      const y = hash(i + 200) * H;
      const bright = (Math.floor(t * 3) + Math.floor(i / 3)) % 7 === 0;
      const color = bright ? '#c0d8fa' : i % 3 ? '#3a5377' : '#7992b4';
      pixel(color, x, y, i % 23 === 0 ? 2 : 1, 1);
      if (i % 23 === 0 && bright) { pixel('#7399c4', x - 1, y, 4); pixel('#d4e6fc', x + 1, y - 1, 1, 3); }
    }
  }
  function portrait(role: SuitRole, x: number, foot: number, frame: number, face = 1, scale = 1.6): void {
    pixel('#101a2c90', x - 7, foot - 2, 14, 2);
    drawAstronaut(suit, { x: face, y: face ? 0 : 1 }, frame, role);
    const size = Math.round(TILE_PX * scale);
    g.drawImage(actor, Math.round(x - size / 2), Math.round(foot - 22 * scale), size, size);
  }
  function lander(x: number, foot: number, scale: number): void {
    g.save();
    g.translate(Math.round(x), Math.round(foot));
    g.scale(scale, scale);
    g.translate(-12, -22);
    drawLunarLander(g, 0, 0);
    g.restore();
  }

  function earthScene(t: number): void {
    sky(t, -t * 1.5, '#223f5e');
    const zoom = ease(t / 7);
    const size = 194 + zoom * 43, x = 97 - zoom * 20, y = 3 - zoom * 13;
    const cx = x + size * .5, cy = y + size * 44 / 96;
    disk('#273f65', cx + 1, cy + 1, size * .405);
    disk('#74b1d1', cx - 1, cy - 1, size * .397);
    g.drawImage(globe, Math.round(x), Math.round(y), Math.round(size), Math.round(size));
    g.globalAlpha = .57;
    for (let i = 0; i < 45; i++) {
      const flow = (hash(i + 504) * 111 + t * (2 + i % 4)) % 111 - 55;
      const band = hash(i + 327) * 77 - 38;
      if (flow * flow + band * band > (size * .32) ** 2) continue;
      const width = 2 + hash(i + 189) * 8;
      pixel(i % 3 ? '#b7dcec' : '#e7eef2', cx + flow, cy + band, width, 1);
      if (i % 7 === 0) pixel('#aacde2', cx + flow + 3, cy + band + 1, width * .68, 1);
    }
    g.globalAlpha = 1;
  }
  function river(t: number): void {
    const dry = ease(progress(t, .65, 7.25));
    const pan = t * 4.2;
    const colors = dry < .48 ? ['#6e8197', '#c1b4a8', '#675f64', '#899487', '#79866d']
      : ['#665d77', '#d09684', '#705f68', '#908278', '#a18a6e'];
    const shade = g.createLinearGradient(0, 0, 0, 165);
    shade.addColorStop(0, colors[0]); shade.addColorStop(1, colors[1]);
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
    disk('#ffd5a5', 294 - pan * .25, 62, 22);
    for (let i = 0; i < 19; i++) {
      const x = (hash(i + 8) * 450 + pan * .9) % 450 - 36;
      const y = 28 + hash(i + 51) * 76;
      g.globalAlpha = .26 + dry * .24;
      pixel('#dec7ba', x, y, 13 + hash(i + 107) * 38, 1);
    }
    g.globalAlpha = 1;
    for (let x = 0; x < W; x += 2) {
      const far = 87 + 18 * Math.sin((x + pan * .4) / 34) + 9 * Math.cos((x + pan * .4) / 13);
      const near = 122 + 11 * Math.cos((x + pan * .75) / 35) + 7 * Math.sin((x + pan * .75) / 17);
      pixel(colors[2], x, Math.max(57, far), 2, 150);
      pixel(colors[3], x, near, 2, 125);
      pixel(colors[4], x, 141 + 5 * Math.sin((x + pan) / 31), 2, 90);
    }
    const riverX = (y: number) => {
      const z = (y - 124) / 91;
      return 214 + 44 * Math.sin(z * 6.5 + .7) + z * z * 29 - pan * .73;
    };
    for (let y = 124; y < H; y++) {
      const z = (y - 124) / 92;
      const x = riverX(y), bank = 1 + z * z * 65, water = Math.max(1, bank * mix(.79, .25, dry));
      pixel('#b4a080', x - bank, y, bank * 2 + 1);
      pixel('#9b8d7b', x - bank * .9, y, bank * 1.8 + 1);
      pixel('#49798a', x - water, y, water * 2 + 1);
      pixel('#719cad', x - water * .65, y, water * .85 + 1);
      if ((y + Math.floor(t * 26)) % 14 < 3) pixel('#a0b4b7', x - water * .35, y, Math.max(1, water * .7));
    }
    for (let i = 0; i < 33; i++) {
      const x = hash(i + 133) * 465 - pan;
      const y = 132 + hash(i + 389) * 50;
      const scale = .4 + (y - 132) / 47;
      if (Math.abs(x - riverX(y)) < 58 * ((y - 124) / 92) ** 2 + 8) continue;
      const height = 10 * scale;
      pixel('#5a4943', x, y - height, 2 * scale, height);
      pixel('#5a4943', x - 3 * scale, y - height * .75, 4 * scale, 1);
      pixel('#5a4943', x + 2 * scale, y - height * .85, 4 * scale, 1);
      if (hash(i + 27) > dry * .92) {
        disk(dry > .35 ? '#818668' : '#4e6b59', x, y - height, 5.1 * scale);
        disk(dry > .35 ? '#979170' : '#6e8871', x - 1, y - height - 2 * scale, 3.3 * scale);
      }
    }
    for (let i = 0; i < 34; i++) {
      const y = 152 + hash(i + 645) * 35;
      const x = hash(i + 557) * W - pan * .8;
      if (hash(i + 691) > dry || Math.abs(x - riverX(y)) < 52 * ((y - 124) / 92) ** 2 + 7) continue;
      pixel('#6c5951', x, y, 5); pixel('#6c5951', x + 4, y + 1, 4); pixel('#a78e75', x + 5, y + 2, 3);
    }
  }
  function city(t: number): void {
    sky(t, 0, '#2f3252');
    pixel('#2a304a', 0, 80, W, 84);
    // Window power is lost by building, with a few lights flickering out first.
    for (let i = 0, x = -5; x < W; i++) {
      const width = 16 + Math.floor(hash(i + 733) * 27);
      const height = 24 + Math.floor(hash(i + 955) * 63);
      const y = 160 - height;
      const front = i % 2 ? '#283650' : '#1c263e';
      pixel('#172239', x - 1, y - 2, width, height + 2);
      pixel(front, x, y, width - 3, height + 1);
      pixel('#425273', x, y, width - 3, 2);
      pixel('#151e35', x + width - 5, y + 3, 3, height - 3);
      const cutoff = 1.1 + hash(i + 28) * 6;
      for (let row = y + 8; row < 154; row += 6) {
        for (let col = x + 3; col < x + width - 8; col += 5) {
          const key = row * 29 + col;
          const lit = hash(key) < .32 && t < cutoff + hash(key + 3) * .45 &&
            (t < cutoff - .25 || (Math.floor(t * 12) + key) % 3 === 0);
          pixel(lit ? (hash(key + 1) > .4 ? '#ffd183' : '#a4c9d6') : '#344360', col, row, 2, 2);
        }
      }
      x += width - 1;
    }
    pixel('#262a40', 0, 160, W, 55);
    pixel('#4b4f60', 0, 161, W, 2);
    for (let i = 0; i < 11; i++)pixel('#33394d', 27 * i, 174 + i % 2 * 3, 19);
    pixel('#151d2c', 69, 174, 59, 8); pixel('#586984', 67, 170, 61, 6); pixel('#96a6b9', 66, 169, 62, 2);
    pixel('#677b92', 89, 152, 11, 19); pixel('#acb9c6', 89, 151, 12, 2);
    for (let i = 0; i < 7; i++) {
      const phase = (t * 1.9 + i * .16) % 1;
      if (phase > 1 - progress(t, 4.2, 6.5) * .84) continue;
      pixel('#80c6df', 99 + phase * 10, 154 + phase * phase * 16, 1, 2);
    }
    for (let i = 0; i < 6; i++) {
      const p = ease(progress(t, i * .13, 6.2 + i * .11));
      const x = 151 + i * 26 - p * 29;
      const y = 175 + (i % 3) * 3;
      const step = p < 1 ? Math.round(Math.sin(t * 6 + i * .4)) : 0;
      pixel('#141c30', x - 5, y, 14, 2); disk('#192239', x, y - 19, 4);
      pixel('#121b2e', x - 4, y - 15, 8, 12);
      pixel('#23304a', x - 4, y - 14, 2, 10);
      pixel('#11182a', x - 3 - step, y - 4, 3, 5); pixel('#11182a', x + 1 + step, y - 4, 3, 5);
      if (i % 3 === 1) pixel('#3d4e65', x - 8, y - 8, 3, 6);
    }
  }
  function briefing(t: number): void {
    const pullback = ease(progress(t, 0, 6.8));
    const zoom = mix(1.1, 1, pullback);
    pixel('#12223c', 0, 0, W, H);
    g.save(); g.translate(192, 98); g.scale(zoom, zoom); g.translate(-192, -98);
    pixel('#2b3b58', 0, 24, W, 111);
    pixel('#364d6b', 0, 34, W, 2);
    pixel('#20314d', 0, 127, W, 80);
    for (let x = 13; x < 380; x += 358) { pixel('#536b88', x, 54, 2, 68); pixel('#83d6e7', x + 3, 74, 1, 31); }
    for (let i = -1; i < 8; i++)pixel('#364965', i * 58, 152, 34, 1);
    pixel('#10192e', 70, 34, 244, 99); pixel('#597d98', 73, 37, 238, 92); pixel('#122341', 75, 39, 234, 88);
    for (let x = 84; x < 305; x += 11)pixel('#244464', x, 43, 1, 80);
    for (let y = 46; y < 123; y += 10)pixel('#244464', 78, y, 227, 1);
    g.drawImage(globe, 89, 60, 45, 45);
    disk('#8098ae', 194, 68, 12); disk('#566c8d', 197, 64, 4); disk('#667c9a', 189, 72, 3);
    disk('#aa624f', 271, 79, 17); disk('#d58c66', 269, 77, 12); disk('#ae634b', 277, 82, 7);
    for (let x = 133; x < 179; x += 3)pixel('#8ce7ec', x, Math.round(84 - (x - 133) * .31));
    for (let x = 209; x < 252; x += 3)pixel('#da9c6b', x, Math.round(67 + (x - 209) * .24));
    const pulse = (t * .60) % 1;
    const px = 133 + pulse * 45, py = 84 - pulse * 14;
    pixel('#f5f3d3', px - 2, py, 5); pixel('#a9e6eb', px, py - 2, 1, 5);
    const roll = (Math.floor(t * 24) % 81);
    pixel('#8bc7dc28', 76, 42 + roll, 230, 3);
    pixel('#18273f', 95, 130, 197, 28); pixel('#526581', 101, 131, 185, 16);
    pixel('#253a54', 100, 147, 186, 10); pixel('#82bbc9', 155, 137, 71, 2);
    roles.forEach((role, i) => {
      const p = ease(progress(t, .2 + i * .45, 2.3 + i * .45));
      const from = i % 2 === 0 ? 61 - i * 8 : 342 + i * 6;
      const x = mix(from, 136 + i * 35, p);
      const stepping = p < 1;
      const response = t > 4.6 + i * .32 && t < 5.05 + i * .32;
      const face = stepping ? (i % 2 === 0 ? 1 : -1) : 0;
      portrait(role, x, 169 + (i % 2) * 7, stepping ? Math.floor(t * 14 + i) % 8 : response ? 2 : -1, face, 1.52);
      if (response) pixel('#75e6e7', x + 7, 137, 2, 2);
    });
    g.restore();
  }
  function vapor(t: number, foot: number, intensity: number): void {
    for (let i = 0; i < 73; i++) {
      const age = (hash(i + 211) + t * (.52 + hash(i + 700) * .5)) % 1;
      const spread = (hash(i + 17) - .5) * 2;
      const x = 194 + spread * (8 + age * 101 * intensity);
      const y = foot - 3 + age * (23 + 75 * intensity);
      const color = age < .21 ? (i % 3 === 0 ? '#fff4b6' : '#ffc775') : age < .52 ? (i % 3 ? '#f18c55' : '#e9b48a') : '#7c798b';
      const radius = age < .4 ? 2 + hash(i + 31) * 6 : 1 + age * 5;
      g.globalAlpha = unit((1 - age) * 2.4) * intensity;
      disk(color, x, y, radius * intensity);
    }
    g.globalAlpha = 1;
  }
  function launch(t: number): void {
    const rise = Math.max(0, t - LIFTOFF_SECONDS), travel = rise ** 1.65 * 27;
    const camera = Math.max(0, travel - 18), foot = 153 - travel + camera;
    const shade = g.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, '#162548'); shade.addColorStop(.55, '#635678'); shade.addColorStop(1, '#cf8c73');
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 3) {
      const y = 125 + camera + Math.sin(x / 22) * 6 + Math.cos(x / 7) * 3;
      pixel('#51495f', x, y, 3, 100);
      pixel('#25243d', x, 157 + camera + Math.cos(x / 17) * 4, 3, 83);
    }
    for (const x of [102, 281]) {
      pixel('#273750', x, 48 + camera, 6, 115);
      for (let h = 57; h < 150; h += 14) { pixel('#526284', x - 7, h + camera, 20, 2); pixel('#3a496c', x - 4, h + 2 + camera, 3, 10); }
      pixel(Math.floor(t * 5) % 2 ? '#ee8b64' : '#f9cb8b', x + 1, 46 + camera, 4, 2);
    }
    pixel('#2a334d', 140, 155 + camera, 107, 6);
    const intensity = progress(t, .8, 1.48);
    if (intensity > 0) vapor(t, foot, intensity);
    const shake = rise < .55 ? Math.round(Math.sin(t * 97) * 2 * intensity) : 0;
    lander(193 + shake, foot, 3.3);
    for (let i = 0; i < 37; i++) {
      const x = hash(i + 524) * W, y = 169 + hash(i + 665) * 23 + camera;
      pixel('#b79b9a', x, y, 2, 1);
    }
  }
  function crossing(t: number): void {
    sky(t, -t * 22, '#262a59');
    g.drawImage(globe, Math.round(-52 - t * 30), 63, 166, 166);
    const moonX = 309 - t * 20;
    disk('#33486b', moonX + 1, 75, 52);
    disk('#7b90ac', moonX, 74, 50);
    disk('#a0b0c3', moonX - 8, 66, 40);
    for (const [dx, dy, r] of [[-23, -17, 9], [11, -27, 5], [15, 18, 10], [-18, 19, 6], [3, 5, 4]]) {
      disk('#7088a7', moonX + dx, 75 + dy, r);
      disk('#8ca0b8', moonX + dx + 1, 75 + dy + 1, r * .73);
    }
    const travel = progress(t, 0, 2.8);
    const x = mix(77, 265, travel), y = 118 - Math.sin(travel * Math.PI * .8) * 52;
    for (let i = 1; i < 7; i++)pixel(i < 3 ? '#b5f0fb' : '#5b83be', x - 9 - i * 4, y + 11 + i * 1.4, 3, 1);
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(.77); lander(0, 16, 1.58); g.restore();
  }
  function lunar(t: number): void {
    sky(t, -t * .8, '#172d53');
    g.drawImage(globe, 251, 10, 96, 96);
    const floor = 154, landing = 2.22;
    for (let x = 0; x < W; x += 2) {
      pixel('#3e5675', x, 93 + 7 * Math.cos(x / 27) + 4 * Math.sin(x / 8), 2, 125);
      pixel('#61738b', x, 112 + 9 * Math.sin(x / 31) + 4 * Math.cos(x / 11), 2, 110);
      pixel('#8794a7', x, 137 + 3 * Math.cos(x / 16), 2, 100);
    }
    for (let i = 0; i < 340; i++)pixel(i % 3 ? '#677991' : '#b4c2d0', hash(i + 50) * W, 139 + hash(i + 1100) * 77, i % 6 ? 1 : 3);
    const p = progress(t, 0, landing);
    const foot = mix(24, floor, 1 - (1 - p) ** 2);
    pixel('#53667a', 148, 154, 72, 4); pixel('#53667a8c', 157, 158, 59, 2);
    if (p > .45 && t < 2.95) vapor(t, foot, (1 - progress(t, 2.05, 2.95)) * .66);
    lander(184, foot, 2.65);
    if (t > 2.44) {
      const strut = progress(t, 2.45, 2.82);
      const rungLength = 35 * strut;
      pixel('#293b55', 204, 119, 2, rungLength);
      pixel('#a9bbce', 214, 119, 2, rungLength);
      for (let h = 4; h < rungLength; h += 5)pixel('#dae2d4', 205, 119 + h, 9);
      const step = progress(t, 2.75, 4.02), walk = progress(t, 3.95, 4.78);
      portrait('commander', 207 + walk * 35, mix(122, 158, step) + walk * 3, step < 1 || walk < 1 ? Math.floor(t * 12) % 8 : -1, 1, 1.5);
      if (t > 4.28) portrait('engineer', 206, mix(120, 156, progress(t, 4.28, 5.1)), Math.floor(t * 13) % 8, -1, 1.35);
      if (t > 4.5) { pixel('#78e4ec', 242, 144, 3, 1); pixel('#b3f5f4', 246, 142, 2, 1); pixel('#6bacd6', 249, 141, 2, 1); }
    }
    if (t > 6.1) {
      g.globalAlpha = progress(t, 6.1, 6.8);
      pixel('#0b16296e', 0, 0, W, 132);
      g.drawImage(logo, 77, 26, 230, 86);
      g.globalAlpha = 1;
    }
  }

  const scenes = [earthScene, river, city, briefing,
    (time: number) => time < 4.45 ? launch(time) : crossing(time - 4.45), lunar];
  const stillFrames = [3.5, 5.5, 4.5, 6, 2.5, 7.2];

  return (index: number, local: number, still: boolean) => {
    const scene = scenes[index];
    if (!scene) return;
    scene(still ? stillFrames[index] : local);
    if (!still && index > 0 && index < scenes.length - 1 && local < .24) {
      g.globalAlpha = (1 - local / .24) * .60;
      pixel('#0c1327', 0, 0, W, H);
      g.globalAlpha = 1;
    }
  };
}
