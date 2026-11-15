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

const lettering = [
  '##...## .#####. .###### .#####.',
  '###..## ##...## ##..... ##...##',
  '###..## ##...## ##..... ##...##',
  '##.#.## ####### .#####. #######',
  '##..### ##...## .....## ##...##',
  '##..### ##...## .....## ##...##',
  '##...## ##...## ######. ##...##',
];

function paintPatch(g: CanvasRenderingContext2D): void {
  const pixel = (color: string, x: number, y: number, w = 1, h = 1) => {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  };
  for (let y = 1; y < 39; y++) {
    for (let x = 1; x < 39; x++) {
      const distance = (x - 19.5) ** 2 + (y - 19.5) ** 2;
      if (distance > 19 ** 2) continue;
      const color = distance > 17.9 ** 2 ? '#273f9d'
        : distance > 16.7 ** 2 ? (x + y < 40 ? '#5f9cdf' : '#365ab8')
        : x + y > 47 ? '#2753a9' : '#3065bf';
      pixel(color, x, y);
    }
  }
  for (const [x, y] of [[17, 5], [14, 9], [23, 10], [9, 11], [31, 14], [33, 27], [15, 31], [22, 34], [27, 29]]) {
    pixel('#8bd1fa', x, y);
  }
  for (const [x, y] of [[11, 13], [27, 7], [31, 30], [15, 35]]) {
    pixel('#8bd1fa', x - 1, y, 3);
    pixel('#8bd1fa', x, y - 1, 1, 3);
    pixel('#fff4d9', x, y);
  }
  for (let step = 0; step < 96; step++) {
    const angle = step * Math.PI / 48;
    const u = Math.cos(angle) * 15;
    const v = Math.sin(angle) * 5.5;
    pixel('#d6ebfb', Math.round(19 + .6 * u - .8 * v), Math.round(19 + .8 * u + .6 * v));
  }
  for (let x = 1; x <= 38; x++) {
    const y = Math.round(29 - .37 * x - .028 * Math.max(0, x - 19) ** 2);
    pixel('#d62837', x, y + 1, 1, x < 7 || x > 35 ? 1 : 3);
    pixel('#fa463d', x, y, 1, x < 7 || x > 35 ? 1 : 2);
  }
  lettering.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') pixel('#1b3b86', 5 + x, 17 + y);
    }
  });
  lettering.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') pixel('#fffaf0', 5 + x, 16 + y);
    }
  });
}
