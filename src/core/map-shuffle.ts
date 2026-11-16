// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
// Optional "random map": moves the ice and the minerals of a level to other flat tiles at a
// similar distance from the ship, so every campaign seed explores a different map with the same
// amount of resources and about the same difficulty. Seeded and deterministic (the same seed
// always gives the same map). Without the option the level keeps its fixed layout, which the
// walkthroughs, the tutorial and the presentations (X and Z) rely on.
import { hashSeed, mulberry32, randInt } from './rng';
import type { LevelConfig, LevelId, Terrain, Tile } from './types';

/** Terrains that move when the map is random. */
const MOVABLE: readonly Terrain[] = ['hielo', 'mineral'];
/** Size of the hidden lunar corner (top right) that must stay as it is. */
const SECRET_CORNER = 4;

const chebyshev = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

/** Tiles that never receive or lose a resource: around the ship, the clues and the lunar corner. */
function isProtected(tile: Tile, level: LevelId, cfg: LevelConfig, landmarks: { x: number; y: number }[]): boolean {
  if (chebyshev(tile, cfg.ship) <= 1) return true;
  // The zone visible on day 1 keeps its layout: the first-day tutorial (collect the mineral,
  // then explore) needs a mineral the astronaut can walk to before knowing how to explore.
  if (tile.explored) return true;
  if (landmarks.some((mark) => chebyshev(tile, mark) <= 1)) return true;
  return level === 'luna' && tile.x >= cfg.width - SECRET_CORNER && tile.y < SECRET_CORNER;
}

export function shuffleResources(tiles: Tile[], level: LevelId, cfg: LevelConfig, seed: string): Tile[] {
  const rng = mulberry32(hashSeed(`${seed}:map:${level}`));
  const next = tiles.map((tile) => ({ ...tile }));
  const landmarks = [
    ...(cfg.secret ? [cfg.secret.beacon] : []),
    ...next.filter((tile) => tile.terrain === 'misterio'),
  ];
  const free = new Set(next
    .filter((tile) => tile.terrain === 'llano' && !isProtected(tile, level, cfg, landmarks))
    .map((tile) => tile.y * cfg.width + tile.x));
  const sources = next.filter((tile) => MOVABLE.includes(tile.terrain) && !isProtected(tile, level, cfg, landmarks));

  for (const source of sources) {
    const distance = chebyshev(source, cfg.ship);
    // Prefer a tile at about the same distance from the ship; widen the band if none is left.
    for (const band of [2, 5, 10]) {
      const options = [...free].filter((index) => {
        const tile = next[index];
        return Math.abs(chebyshev(tile, cfg.ship) - distance) <= band;
      });
      if (options.length === 0) continue;
      const target = next[options[randInt(rng, 0, options.length - 1)]];
      free.delete(target.y * cfg.width + target.x);
      target.terrain = source.terrain;
      source.terrain = 'llano';
      break;
    }
  }
  return next;
}
