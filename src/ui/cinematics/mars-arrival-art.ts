// AI-assisted: OpenAI Codex. Original Canvas animation using the game's sprites.
import { drawLunarLander, TILE_PX } from '../../map/art';
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { INTRO_HEIGHT as HEIGHT, INTRO_WIDTH as WIDTH } from './intro-art';

const PAD = 144;
const arrival = [
  { x: 84, from: 56, start: 0, touch: 3.25, trim: '#ffbb69' },
  { x: 303, from: 357, start: 2.1, touch: 6.8, trim: '#a8bcff' },
] as const;

const crew: readonly { role: SuitRole; ship: 0 | 1; start: number; x: number; y: number }[] = [
  { role: 'commander', ship: 0, start: 4.05, x: 169, y: 172 },
  { role: 'engineer', ship: 0, start: 4.98, x: 135, y: 160 },
  { role: 'botanist', ship: 0, start: 5.91, x: 66, y: 182 },
  { role: 'medic', ship: 0, start: 6.84, x: 100, y: 187 },
  { role: 'radio', ship: 1, start: 7.75, x: 214, y: 172 },
  { role: 'geologist', ship: 1, start: 8.68, x: 245, y: 187 },
];

function portion(time: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

export function createMarsArrivalArt(g: CanvasRenderingContext2D, suit: CanvasRenderingContext2D) {
  const pixel = (color: string, x: number, y: number, w: number, h: number): void => {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const strata = [
    { color: '#694053', y: 97, amp: 11, wave: 36, shift: 2 },
    { color: '#924b4e', y: 114, amp: 10, wave: 26, shift: 6 },
    { color: '#b5614c', y: 129, amp: 4, wave: 36, shift: 9 },
  ];

  function landscape(t: number): void {
    const sky = ['#231d36', '#35243e', '#513148', '#79434f', '#a05452', '#c46d55', '#dd8a60', '#eaa671'];
    sky.forEach((color, i) => pixel(color, 0, i * 16, WIDTH, 16));
    for (let i = 0; i < 32; i++) {
      pixel(i % 4 ? '#795b71' : '#dfb2ad', (i * 73 + i * i * 11) % WIDTH, i * 41 % 75, 1, 1);
    }
    for (let y = -18; y <= 18; y += 2) {
      const half = Math.floor(Math.sqrt(19 * 19 - y * y));
      pixel(y < 3 ? '#ffd69a' : '#eeb27d', 220 - half, 94 + y, 2 * half, 2);
    }
    for (const { color, y, amp, wave, shift } of strata) {
      for (let x = 0; x < WIDTH; x += 2) {
        const ridge = Math.floor(y + Math.sin(x / wave + shift) * amp + Math.cos(x / 12 + shift) * 3);
        pixel(color, x, ridge, 2, HEIGHT - ridge);
      }
    }
    pixel('#ac664e', 0, 138, WIDTH, HEIGHT - 138);
    pixel('#9c5947', 0, 170, WIDTH, HEIGHT - 170);
    for (let i = 0; i < 140; i++) {
      const x = (i * 79 + i * i * 19) % WIDTH;
      const y = 140 + (i * 53 + i * i) % 76;
      pixel(i % 3 ? '#bb755a' : '#814a45', x, y, 2 + (i % 4), 1);
    }
    for (const [x, y, w] of [[24, 161, 13], [60, 186, 16], [349, 174, 16], [330, 151, 8], [275, 193, 10]]) {
      pixel('#794344', x - 2, y, w + 4, 3);
      pixel('#8d4c44', x, y - 3, w, 4);
      pixel('#ce896a', x + 2, y - 5, w - 4, 2);
    }
    for (let i = 0; i < 23; i++) {
      const x = (i * 73 + t * (10 + i % 6)) % (WIDTH + 34) - 17;
      pixel('#f2a97645', x, 128 + i * 29 % 63, 6 + i % 7, 1);
    }
  }

  function lander(t: number, i: 0 | 1): void {
    const { x, from, start, touch, trim } = arrival[i];
    if (t < start) return;
    const descent = portion(t, start, touch);
    const flight = 1 - descent;
    const cx = Math.round(x + (from - x) * flight * flight);
    const base = Math.round(PAD - 160 * flight * flight);
    const shadowWidth = 12 + descent * 46;
    pixel('#663b4a80', cx - shadowWidth / 2, PAD + 2, Math.round(shadowWidth), 4);
    if (t < touch) {
      const flame = 9 + Math.floor(t * 29) % 7;
      pixel('#c95848', cx - 5, base - 7, 10, flame);
      pixel('#ffa357', cx - 3, base - 7, 6, flame - 2);
      pixel('#fff0b4', cx - 1, base - 8, 2, flame - 6);
    }
    const dustAge = t - touch + .55;
    if (dustAge > 0 && dustAge < 1.9) {
      g.globalAlpha = 1 - dustAge / 1.9;
      for (let j = 0; j < 29; j++) {
        const spread = (j * 13 % 49) - 24;
        pixel(j % 3 ? '#db9166' : '#f6b983', x + spread * (1 + 2 * dustAge),
          PAD - 4 - (j % 8) * dustAge + j % 4, 2 + j % 6, 1 + j % 3);
      }
      g.globalAlpha = 1;
    }
    g.save();
    g.translate(cx, base);
    g.scale(i === 0 ? 2 : -2, 2);
    g.translate(-12, -22);
    drawLunarLander(g, 0, 0);
    g.restore();
    pixel(trim, cx - 20, base - 24, 40, 3);
    pixel('#edfbff', cx + (i === 0 ? -24 : 20), base - 28, 3, 2);
    if (i === 1) {
      pixel('#312d51', cx + 4, base - 80, 2, 12);
      pixel(Math.floor(t * 3) % 2 ? '#a8bcff' : '#6590ce', cx + 2, base - 81, 6, 2);
    }
    const ladder = portion(t, touch + .14, touch + .72);
    const lx = x + (i === 0 ? 21 : -21);
    if (!ladder) return;
    for (const rail of [-3, 4]) pixel('#40516a', lx + rail, PAD - 21, 2, Math.floor(35 * ladder));
    for (let rung = 0; rung < Math.floor(ladder * 8); rung++) {
      pixel('#d9c8b4', lx - 2, PAD - 20 + rung * 4, 7, 1);
    }
  }

  function astronaut(member: typeof crew[number], t: number): void {
    const { role, ship, start, x, y } = member;
    if (t < start) return;
    const lx = arrival[ship].x + (ship === 0 ? 21 : -21);
    const climb = portion(t, start, start + .8);
    const walk = portion(t, start + .8, start + 2.6);
    const footX = Math.round(lx + (x - lx) * walk);
    const footY = Math.round(PAD - 17 + 32 * climb + (y - PAD - 15) * walk);
    const direction = ship === 0 ? 1 : -1;
    const stride = walk < 1 ? Math.floor(t * 14) % 8 : -1;
    const waving = role === 'radio' && t >= 11.8 && t < 14.3;
    const greeting = role === 'commander' && t >= 15.4 && t < 17.3;
    drawAstronaut(suit, climb < 1 ? { x: 0, y: -1 } :
      { x: walk === 1 && role !== 'commander' && role !== 'radio' ? 0 : direction, y: 1 }, stride, role);
    g.drawImage(suit.canvas, footX - TILE_PX, footY - 42, 48, 48);
    if (waving || greeting) {
      const hand = Math.floor(t * 5) % 2;
      pixel('#132039', footX + direction * 13 - 3, footY - 21 - hand * 3, 6, 10);
      pixel('#fcf4d7', footX + direction * 13 - 2, footY - 20 - hand * 3, 4, 6);
    }
  }

  const stillFrames = [3.55, 7.05, 11.25, 13, 16.2];
  const byDepth = [...crew].sort((a, b) => a.y - b.y);
  return (cue: number, seconds: number, still: boolean): void => {
    const t = still ? stillFrames[cue] : seconds;
    g.imageSmoothingEnabled = false;
    landscape(t);
    lander(t, 0);
    lander(t, 1);
    for (const member of byDepth) astronaut(member, t);
  };
}
