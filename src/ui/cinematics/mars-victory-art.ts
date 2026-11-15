// AI-assisted: OpenAI Codex. Canvas art from the approved Mars victory proposal.
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { drawLunarLander } from '../../map/art';
import { INTRO_HEIGHT, INTRO_WIDTH } from './intro-art';

export function createMarsVictoryArt(g: CanvasRenderingContext2D, suit: CanvasRenderingContext2D, globe: HTMLImageElement) {
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
  const hash = (i: number) => { const a = Math.sin(i * 78.233 + 5.1) * 43758.5453; return a - Math.floor(a); };
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

  const roles: readonly SuitRole[] = ['commander', 'engineer', 'botanist', 'medic', 'geologist', 'radio'];
  const warm = ['#ffdb83', '#7ce5ed', '#b5ef9e', '#f5a184', '#d8b5fb'];
  function ship(x: number, foot: number, scale: number): void {
    g.save(); g.translate(Math.round(x), Math.round(foot)); g.scale(scale, scale); g.translate(-12, -22);
    drawLunarLander(g, 0, 0); g.restore();
  }
  function terrain(t: number, pan: number, dawn: boolean): void {
    const gradient = g.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#231633');
    gradient.addColorStop(.55, dawn ? '#9d5273' : '#6b3759');
    gradient.addColorStop(.77, dawn ? '#e68a72' : '#ad604f');
    gradient.addColorStop(1, '#914435');
    g.fillStyle = gradient; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 56; i++)pixel(i % 4 ? '#786180' : '#f1c3b2', hash(i + 158) * W, hash(i + 1130) * 103);
    if (dawn) {
      const glow = g.createRadialGradient(88, 107, 10, 88, 107, 90);
      glow.addColorStop(0, '#ffce8670'); glow.addColorStop(1, '#ffbb7600');
      g.fillStyle = glow; g.fillRect(0, 0, W, 146);
      disk('#ef9d73', 88, 109, 26); disk('#ffc58f', 88, 108, 22);
    }
    for (let x = 0; x < W; x += 2) {
      const distant = 109 + 13 * Math.sin((x + pan * .25) / 38) + 10 * Math.sin((x + pan * .25) / 16);
      const near = 130 + 8 * Math.cos((x + pan * .48) / 24) + 13 * Math.sin((x + pan * .48) / 42);
      pixel('#683e56', x, Math.round(distant), 2, 120);
      pixel('#854853', x, Math.round(near), 2, 105);
      pixel('#aa5f52', x, 148 + 4 * Math.cos((x + pan) / 31), 2, 76);
    }
    for (let i = 0; i < 250; i++) {
      const x = ((hash(i + 241) * W - pan * .99) % W + W) % W, y = 151 + hash(i + 1100) * 64;
      pixel(i % 5 ? '#88484c' : '#d28164', x, y, i % 8 ? 1 : 4, 1);
      if (i % 23 === 0) pixel('#673e48', x, y + 1, 4, 2);
    }
    for (let i = 0; i < 17; i++) {
      const x = ((hash(i + 2026) * W + t * (9 + i % 3 * 5)) % W + W) % W;
      g.globalAlpha = .20 + hash(i + 41) * .22;
      pixel('#fdb58a', x, 121 + hash(i + 720) * 65, 3 + i % 4, 1);
    }
    g.globalAlpha = 1;
  }
  function panel(x: number, y: number, t: number, offset: number): void {
    pixel('#753f50', x - 7, y + 1, 43, 4);
    pixel('#342d49', x + 8, y - 14, 5, 16); pixel('#887d8f', x + 9, y - 12, 2, 13);
    for (let row = 0; row < 11; row++) {
      const start = x + Math.round((10 - row) * .62);
      pixel(row === 0 || row === 10 ? '#15253c' : '#264376', start, y - 22 + row, 32, 1);
      if (row > 0 && row < 10) for (let i = 0; i < 4; i++)pixel(i % 2 ? '#5b91bf' : '#6ea7d0', start + 2 + i * 7, y - 22 + row, 5, 1);
    }
    const glint = Math.floor((t * 38 + offset) % 40);
    if (glint < 28) pixel('#b1f0f5', x + glint + 5, y - 17, 4, 1);
  }
  function habitat(x: number, foot: number, t: number, offset: number): void {
    pixel('#723e50', x - 11, foot, 86, 5);
    pixel('#292944', x - 4, foot - 30, 77, 31);
    pixel('#4b4d6c', x, foot - 28, 68, 27); pixel('#aaa2a5', x + 2, foot - 27, 64, 5);
    pixel('#cb8a78', x + 2, foot - 20, 64, 10); pixel('#927682', x + 2, foot - 9, 64, 5);
    for (let i = 0; i < 4; i++) {
      pixel('#282c49', x + 8 + i * 14, foot - 19, 9, 7);
      pixel(Math.floor(t * 2 + offset + i) % 13 === 0 ? '#ddedb8' : '#7fd5dc', x + 9 + i * 14, foot - 18, 7, 4);
    }
    pixel('#47415c', x + 27, foot - 11, 13, 11); pixel('#e8bc8b', x + 32, foot - 8, 2, 2);
    pixel('#f6b674', x + 3, foot - 24, 2, 2);
  }
  function dome(x: number, foot: number, t: number): void {
    g.save();
    g.beginPath();
    g.rect(x - 27, foot - 29, 54, 30);
    g.clip();
    disk('#302b4a', x, foot - 1, 27);
    disk('#709cab', x, foot - 2, 24);
    disk('#395b73', x, foot - 1, 20);
    g.restore();
    pixel('#34344d', x - 25, foot + 4, 50, 3);
    for (let i = 0; i < 6; i++) {
      const plant = x - 15 + i * 6;
      pixel('#62885a', plant, foot - 5, 2, 5);
      pixel(i % 2 ? '#9dc674' : '#bbdf83', plant - 2, foot - 8 - (i % 3), 5, 3);
    }
    for (let i = 0; i < 22; i++) {
      const streakX = x - 15 + i;
      if (i % 2 === 0) pixel('#a5d6d7', streakX, foot - 18 + Math.floor((i - 8) ** 2 / 47), 1, 1);
    }
    pixel('#9da5b1', x - 27, foot, 54, 3); pixel('#444763', x - 27, foot + 3, 54, 3);
    pixel(Math.floor(t * 4) % 4 === 0 ? '#fff5b1' : '#84e9be', x + 19, foot - 1, 3, 2);
  }
  function antenna(x: number, foot: number, t: number, active: boolean): void {
    pixel('#302d46', x - 3, foot - 28, 4, 30); pixel('#bfacb0', x - 1, foot - 27, 2, 26);
    pixel('#302d46', x - 8, foot, 17, 3);
    for (let row = 0; row < 11; row++)pixel(row < 6 ? '#b9bfd0' : '#7c839e', x - 12 + row, foot - 29 + row, 25 - row * 2);
    pixel('#eee2d2', x, foot - 38, 2, 14); pixel('#ffd188', x, foot - 38, 2);
    if (active) {
      for (let ring = 0; ring < 3; ring++) {
        const phase = (t * .7 + ring * .32) % 1, r = 3 + phase * 16;
        g.globalAlpha = (1 - phase) * .7;
        for (let k = 0; k < 9; k++) {
          const angle = Math.PI * (1.12 + k * .09);
          pixel('#8ce8ed', x + Math.cos(angle) * r, foot - 37 + Math.sin(angle) * r);
        }
      }
      g.globalAlpha = 1;
    }
  }
  function colony(t: number, pan: number): void {
    terrain(t, pan, true);
    pixel('#825064', 0, 165, W, 2);
    for (let i = 0; i < 5; i++)panel(12 + i * 36 - pan, 153 + (i % 2) * 6, t, i * 9);
    habitat(193 - pan, 140, t, 2);
    habitat(240 - pan, 158, t, 4);
    dome(326 - pan, 153, t);
    antenna(183 - pan, 159, t, true);
    ship(357 - pan, 179, 1.34);
    for (let i = 0; i < 8; i++) {
      pixel('#998077', 102 + i * 15 - pan, 179 + (i % 2) * 2, 4, 1);
      if ((Math.floor(t * 5) + i) % 7 < 4) pixel('#f7b587', 104 + i * 15 - pan, 178 + (i % 2) * 2, 1);
    }
  }
  function crew(role: SuitRole, x: number, foot: number, t: number, dir: number, jump: number, running: boolean): void {
    const width = 28;
    pixel('#623b4c', x - 8, foot, 16, 2);
    drawAstronaut(suit, { x: dir, y: dir ? 0 : 1 }, running ? Math.floor(t * 12) % 8 : -1, role);
    g.drawImage(actor, Math.round(x - width / 2), Math.round(foot - 26 - jump), width, width);
  }
  function beaconLights(t: number, baseY: number, energy: number): void {
    for (let i = 0; i < 38; i++) {
      const age = ((t * .67 + hash(i + 973)) % 1);
      const x = 48 + hash(i + 283) * 285 + Math.cos(i * 2.4) * age * 19;
      const y = baseY - age * (22 + hash(i + 225) * 69) * energy;
      g.globalAlpha = (1 - age) * energy;
      pixel(warm[i % warm.length], x, y, i % 8 === 0 ? 3 : 2, i % 5 === 0 ? 3 : 1);
      if (i % 6 === 0) { pixel(warm[i % warm.length], x - 1, y + 1, 5, 1); pixel('#f8edd3', x + 1, y, 1, 4); }
    }
    g.globalAlpha = 1;
  }
  function celebrate(t: number): void {
    terrain(t, 0, true);
    dome(41, 153, t); habitat(135, 153, t, 4); antenna(313, 158, t, true);
    pixel('#97514f', 80, 161, 223, 34);
    for (let i = 0; i < 24; i++) {
      const width = i % 3 ? 1 : 3;
      pixel('#bd7060', 87 + hash(i + 3221) * 206, 164 + hash(i + 319) * 27, width, 1);
    }
    if (t > 1.45) beaconLights(t, 172, progress(t, 1.45, 2.45));
    roles.forEach((role, i) => {
      const arrival = ease(progress(t, i * .12, 1.64 + i * .13));
      const target = 68 + i * 48;
      const highFive = (i === 2 || i === 3) ? ease(progress(t, 3.35, 4.0)) * (1 - ease(progress(t, 4.30, 5.0))) : 0;
      const x = mix(i < 3 ? target - 37 : target + 37, target, arrival) + (i < 3 ? 1 : -1) * highFive * 11;
      const jumpPhase = ((t - 2.0 - i * .08) * .92) % 1;
      const jump = t > 2.0 + i * .08 ? 14 * 4 * jumpPhase * (1 - jumpPhase) : 0;
      const dir = arrival < 1 || highFive > .3 ? (i < 3 ? 1 : -1) : 0;
      crew(role, x, 172 + (i % 2) * 5, t + i * .037, dir, jump * (1 - highFive), arrival < 1);
      if (highFive > .7) {
        pixel('#f5eed3', x + (i === 2 ? 10 : -16), 151, 6, 3);
        pixel('#f3c47e', x + (i === 2 ? 15 : -17), 148, 3, 5);
      }
      if (jump > 8 && highFive === 0) {
        pixel('#cfedf1', x - 12, 172 + (i % 2) * 5 - 16 - jump, 3, 5);
        pixel('#cfedf1', x + 9, 172 + (i % 2) * 5 - 16 - jump, 3, 5);
      }
    });
    if (t >= 4 && t < 4.38) {
      const spread = 2 + Math.floor((t - 4) * 18);
      pixel('#fff1ac', 188 - spread, 145, spread * 2 + 1);
      pixel('#fff1ac', 188, 145 - spread, 1, spread * 2 + 1);
    }
  }
  function radio(t: number): void {
    sky(t, -t * .6, '#212d58');
    disk('#603d64', 55, 104, 34); disk('#cc7857', 54, 103, 31); disk('#e7a676', 48, 97, 22);
    for (const [x, y, r] of [[48, 91, 7], [61, 116, 9], [41, 110, 5]]) disk('#b97266', x, y, r);
    g.drawImage(globe, 262, 42, 143, 143);
    const orbit = (p: number) => [89 + p * 187, 100 - 39 * Math.sin(p * Math.PI)];
    for (let i = 0; i < 40; i++) {
      const [x, y] = orbit(i / 40);
      pixel(i % 3 ? '#556b99' : '#a1b8d5', x, y);
    }
    const replied = t >= 3.45;
    const travel = progress(t, replied ? 3.45 : .25, replied ? 6.65 : 3.25);
    for (let i = 0; i < 7; i++) {
      const p = replied ? 1 - travel + i * .015 : travel - i * .015;
      if (p < 0 || p > 1) continue;
      const [x, y] = orbit(p);
      pixel(i === 0 ? '#fff4c5' : replied ? '#82dce3' : '#fcb67a', x - 1, y - 1, i === 0 ? 4 : 2, i === 0 ? 3 : 1);
    }
    const [x, y] = orbit(replied ? 1 : 0);
    g.globalAlpha = (1 - (t * 1.1) % 1) * .65;
    for (let r = 5; r < 24; r += 6) {
      for (let j = 0; j < 10; j++) {
        const a = (j / 9) * Math.PI * .9 - Math.PI * .46 + (replied ? Math.PI : 0);
        pixel('#85bfd9', x + Math.cos(a) * (r + (t * 14) % 6), y + Math.sin(a) * (r + (t * 14) % 6));
      }
    }
    g.globalAlpha = 1;
  }
  function finaleScene(t: number): void {
    terrain(t, 4 * t, true);
    g.drawImage(globe, 281, 13, 85, 85);
    for (let j = 0; j < 4; j++)panel(7 + j * 30, 171 + (j % 2) * 7, t, j * 7);
    habitat(219, 157, t, 3); dome(310, 156, t); antenna(356, 165, t, true);
    pixel('#19132956', 0, 0, W, 136);
    beaconLights(t, 176, 1);
    roles.forEach((role, i) => {
      const phase = (t * .80 + i * .10) % 1;
      crew(role, 130 + i * 24, 178 + (i % 2) * 4, t, 0, 9 * 4 * phase * (1 - phase), false);
    });

  }

  const shots = [(t: number) => colony(t, t * 9), celebrate, radio, finaleScene];
  const stillFrames = [3.7, 4.05, 5.5, 4.1];
  return (shot: number, seconds: number, still: boolean): void => {
    shots[shot]?.(still ? stillFrames[shot] : seconds);
  };
}
