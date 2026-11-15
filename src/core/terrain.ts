// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
import type { Terrain, Tile } from './types';

/**
 * Terrain used for building rules. A mineral deposit that has been collected is
 * plain ground, so it can be built on like any flat tile.
 */
export function buildTerrain(tile: Tile): Terrain {
  return tile.terrain === 'mineral' && tile.collected ? 'llano' : tile.terrain;
}
