// AI-assisted: OpenAI Codex. Original pixel art drawn in Canvas.
import type { AppContext } from '../app-bridge';
import { el } from '../dom';

export function spaceAppsEntry(ctx: AppContext): HTMLElement {
  const badge = el('p', 'space-apps-entry');
  const icon = el('canvas', 'space-apps-patch');
  icon.width = icon.height = 40;
  icon.setAttribute('aria-hidden', 'true');
  const g = icon.getContext('2d');
  if (g) paintPatch(g);
  const name = el('span', undefined, ctx.t('ui.spaceApps.event'));
  name.append(el('small', undefined, ctx.t('ui.spaceApps.entry')));
  badge.append(icon, name);
  return badge;
}

const SIZE = 40;

// Distance from the left edge for each occupied row, starting at y = 2.
const SHIELD_INSETS = [
  14, 10, 7, 5, 3, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 3, 3, 4, 5, 6, 7, 9, 11, 13, 15, 17, 19,
];

const WING = [
  '..d..........',
  '.dld.........',
  '.dlwd........',
  '.dswwd.......',
  '..dlwwd......',
  '.ddslwwdd....',
  'dswdswwwwdd..',
  '.dsllllwwwld.',
  '..ddslwwlllhd',
  '....ddlwlshd.',
  '......dshhd..',
  '.......ddd...',
];

const WING_COLORS: Record<string, string> = {
  d: '#38445c',
  h: '#7c92a6',
  s: '#a9c1ce',
  l: '#deeced',
  w: '#fff8e3',
};

const LAND = [
  '..gg.......gg..',
  '.gGgg....ggGGg.',
  'gGGggg..gGGGggg',
  '.gGGgg..gggGgg.',
  '..ggg.....g.gg.',
  '...gg..........',
  '....gg....gg...',
  '.....gG..gGGg..',
  '.....gGg.gGg...',
  '......Gg..gg...',
  '......gg..g....',
  '......g........',
  '.....g.........',
];

function inShield(x: number, y: number): boolean {
  const inset = SHIELD_INSETS[y - 2];
  return inset !== undefined && x >= inset && x < SIZE - inset;
}

function hasShieldPadding(x: number, y: number, padding: number): boolean {
  return inShield(x - padding, y) && inShield(x + padding, y)
    && inShield(x, y - padding) && inShield(x, y + padding);
}

function paintPatch(g: CanvasRenderingContext2D): void {
  const pixel = (color: string, x: number, y: number) => {
    g.fillStyle = color;
    g.fillRect(x, y, 1, 1);
  };

  for (let y = 2; y < SIZE - 2; y++) {
    for (let x = 1; x < SIZE - 1; x++) {
      if (!inShield(x, y)) continue;
      const lit = x + y < SIZE;
      if (!hasShieldPadding(x, y, 1)) {
        pixel(lit ? '#a67032' : '#5b3728', x, y);
      } else if (!hasShieldPadding(x, y, 2)) {
        pixel(lit ? '#ffe099' : '#d69a4e', x, y);
      } else if (!hasShieldPadding(x, y, 3)) {
        pixel(lit ? '#6d5038' : '#74503a', x, y);
      } else {
        pixel(y < 19 ? '#17162a' : '#1d1b30', x, y);
      }
    }
  }

  for (const [x, y] of [[10, 9], [26, 8], [31, 10], [7, 23], [30, 26], [14, 28], [23, 32]]) {
    pixel('#8799b0', x, y);
  }
  for (const [x, y] of [[19, 7], [19, 30]]) {
    pixel('#d19b63', x, y - 1);
    pixel('#d19b63', x, y + 1);
    pixel('#edc98b', x - 1, y);
    pixel('#edc98b', x + 1, y);
    pixel('#fff4cf', x, y);
  }

  for (const [row, feathers] of WING.entries()) {
    for (let column = 0; column < feathers.length; column++) {
      const color = WING_COLORS[feathers[column]];
      if (!color) continue;
      const x = 5 + column;
      pixel(color, x, 12 + row);
      pixel(color, SIZE - 1 - x, 12 + row);
    }
  }

  for (let y = 9; y <= 27; y++) {
    for (let x = 10; x <= 29; x++) {
      const distance = (x - 19.5) ** 2 + (y - 18.5) ** 2;
      if (distance > 9.2 ** 2) continue;
      if (distance > 8.2 ** 2) {
        pixel(x + y < 36 ? '#99ecdd' : '#213756', x, y);
        continue;
      }

      const land = LAND[y - 12]?.[x - 12];
      const shade = x + y;
      if (land === 'G' || land === 'g') {
        pixel(shade > 42 ? '#438e70' : land === 'G' ? '#b1df83' : '#63b98c', x, y);
      } else {
        pixel(shade > 43 ? '#265287' : shade < 33 ? '#61cee8' : '#408ec6', x, y);
      }
    }
  }
}
