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
