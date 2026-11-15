// AI-assisted: OpenAI Codex. Team review pending.

export const TILE_PX = 24;
export const BUILDING_PX = 32;

const files = {
  moon: 'tiles-moon.png',
  mars: 'tiles-mars.png',
  buildings: 'buildings.png',
  extras: 'buildings-p1.png',
  objects: 'objects.png',
  build: 'fx-build.png',
  collect: 'fx-collect.png',
  dust: 'fx-dust.png',
} as const;

type Sheet = keyof typeof files;

export function loadMapArt(onLoad: () => void) {
  const images = new Map<Sheet, HTMLImageElement>();
  for (const [key, file] of Object.entries(files)) {
    const img = new Image();
    images.set(key as Sheet, img);
    img.addEventListener('load', onLoad, { once: true });
    img.src = new URL(`assets/sprites/${file}`, document.baseURI).href;
  }
  return images;
}

export type MapArt = ReturnType<typeof loadMapArt>;

export function makeLunarBackdrop(art: MapArt): string | null {
  const moon = art.get('moon');
  if (!moon?.complete || !moon.naturalWidth) return null;
  const canvas = document.createElement('canvas');
  const size = 6;
  canvas.width = canvas.height = size * TILE_PX;
  const g = canvas.getContext('2d');
  if (!g) return null;
  g.fillStyle = '#20283c';
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.globalAlpha = .14;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const relief = (x * 13 + y * 7 + x * y) % 23;
      const tile = relief === 17 ? 2 : relief === 7 || relief === 21 ? 1 : 0;
      drawAtlasFrame(g, art, 'moon', tile, x, y);
    }
  }
  return canvas.toDataURL();
}

export function drawLunarLander(g: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x * TILE_PX + 12;
  const base = (y + 1) * TILE_PX - 2;
  const pixels = (color: string, dx: number, dy: number, width: number, height: number) => {
    g.fillStyle = color;
    g.fillRect(cx + dx, base + dy, width, height);
  };
  // The feet mark the occupied tile. The cabin extends up into the scenery.
  pixels('#26344872', -15, -3, 30, 6);
  pixels('#26344852', -11, 3, 22, 1);
  pixels('#152238', -16, -2, 9, 3);
  pixels('#152238', 7, -2, 9, 3);
  pixels('#253d58', -14, -9, 3, 8);
  pixels('#253d58', 11, -9, 3, 8);
  pixels('#495c70', -13, -10, 4, 7);
  pixels('#495c70', 9, -10, 4, 7);
  pixels('#a3b4c7', -15, -2, 6, 1);
  pixels('#a3b4c7', 10, -2, 5, 1);
  pixels('#132039', -13, -17, 26, 10);
  pixels('#435a72', -12, -15, 24, 8);
  pixels('#c7d2d3', -11, -16, 22, 4);
  pixels('#d49b59', -11, -12, 22, 2);
  pixels('#9a613a', -10, -10, 20, 2);
  pixels('#152238', -6, -8, 12, 5);
  pixels('#41576b', -5, -7, 10, 2);
  pixels('#132039', -5, -32, 10, 2);
  pixels('#132039', -8, -30, 16, 3);
  pixels('#132039', -10, -27, 20, 12);
  pixels('#7288a1', -9, -26, 18, 10);
  pixels('#b9cad5', -8, -27, 14, 9);
  pixels('#fcf2d5', -5, -31, 9, 3);
  pixels('#f2ebd3', -7, -28, 12, 2);
  pixels('#203853', -5, -25, 11, 5);
  pixels('#4a93b5', -4, -24, 9, 3);
  pixels('#a7f1f3', -4, -24, 4, 1);
  pixels('#506981', -2, -19, 5, 5);
  pixels('#92a8b9', -1, -18, 3, 3);
  pixels('#20324b', 6, -15, 4, 9);
  for (const rung of [-13, -11, -9]) pixels('#b9c9d3', 7, rung, 3, 1);
  pixels('#21314b', -5, -36, 1, 5);
  pixels('#cbd7e5', -7, -37, 5, 1);
  pixels('#91e0d9', -12, -14, 2, 1);
  pixels('#ffbf62', 10, -14, 2, 1);
}

/**
 * The smaller support ship that brought the two extra crew members to Mars (see the Mars
 * arrival cinematic). Purely visual: it stands on the rock two tiles below the main ship, a
 * tile nobody can walk or build on, so the rules and the walkthroughs do not change.
 * AI-assisted: Claude Code (claude-opus-5-5).
 */
export const MARS_SUPPORT_SHIP = { x: 9, y: 10 } as const;

export function drawSupportShip(g: CanvasRenderingContext2D, x: number, y: number): void {
  g.save();
  // Same lander as the main ship, mirrored to face it and about three quarters of its size.
  g.translate(x * TILE_PX + 12, (y + 1) * TILE_PX - 1);
  g.scale(-0.74, 0.74);
  g.translate(-12, -22);
  drawLunarLander(g, 0, 0);
  // Blue trim and a radio mast, as in the cinematic.
  g.fillStyle = '#a8bcff';
  g.fillRect(2, 10, 20, 2);
  g.fillStyle = '#312d51';
  g.fillRect(15, -18, 1, 8);
  g.fillStyle = '#a8bcff';
  g.fillRect(14, -19, 3, 1);
  g.restore();
}

export function drawAtlasFrame(
  g: CanvasRenderingContext2D,
  art: MapArt,
  key: Sheet,
  index: number,
  x: number,
  y: number,
  height = TILE_PX,
): boolean {
  const img = art.get(key);
  if (!img?.complete || !img.naturalWidth) return false;

  g.drawImage(img, index * TILE_PX, 0, TILE_PX, height,
    x * TILE_PX, (y + 1) * TILE_PX - height, TILE_PX, height);
  return true;
}

export function drawTerrainAccent(
  g: CanvasRenderingContext2D,
  mars: boolean,
  x: number,
  y: number,
): void {
  const left = x * TILE_PX;
  const top = y * TILE_PX;
  // Bands cross tile boundaries in board coordinates, so they read as geology.
  for (let row = 0; row < TILE_PX; row++) {
    for (let col = 0; col < TILE_PX; col++) {
      const px = left + col;
      const py = top + row;
      if (mars) {
        const strata = (py + Math.floor(px / 5) + Math.floor(px * px / 1900)) % 93;
        if (strata < 2) g.fillStyle = 'rgba(246, 187, 137, .24)';
        else if (strata < 9) g.fillStyle = 'rgba(127, 53, 33, .16)';
        else if (strata >= 81) g.fillStyle = 'rgba(237, 152, 100, .18)';
        else continue;
      } else {
        const chain = (px + Math.floor(py / 3) + Math.floor(py * py / 1450)) % 109;
        if (chain < 3) g.fillStyle = 'rgba(51, 63, 87, .17)';
        else if (chain === 105) g.fillStyle = 'rgba(222, 232, 248, .27)';
        else continue;
      }
      g.fillRect(px, py, 1, 1);
    }
  }
}

export type MapEffect = 'build' | 'collect' | 'explore' | 'dust';
export const EFFECT_DURATION: Record<MapEffect, number> = { build: 400, collect: 300, explore: 320, dust: 500 };

export function drawMapEffect(
  g: CanvasRenderingContext2D,
  art: MapArt,
  kind: MapEffect,
  index: number,
  x: number,
  y: number,
): void {
  if (kind !== 'explore') {
    drawAtlasFrame(g, art, kind, index, x, y);
    return;
  }
  const radius = 4 + index * 2;
  const left = x * TILE_PX + 12 - radius;
  const top = y * TILE_PX + 12 - radius;
  const size = radius * 2;
  g.fillStyle = index < 2 ? '#bdf4ff' : '#6abcdb';
  g.fillRect(left, top, size, 1);
  g.fillRect(left, top + size - 1, size, 1);
  g.fillRect(left, top, 1, size);
  g.fillRect(left + size - 1, top, 1, size);
}
