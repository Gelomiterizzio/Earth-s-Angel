// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
import { describe, expect, it } from 'vitest';
import { applyAction, applyTransition, createCampaign, launchWithDesign, parseMapTiles, startDay, validateState } from '../../src/core';
import type { GameState, Terrain, Tile } from '../../src/core';
import { loadGameData } from '../../src/data';
import { getDefaultOptions, sanitizeOptions } from '../../src/app/options';
import { missionSteps, PRESENTATION_DESIGN } from '../../src/app/presentation-script';

const data = loadGameData();
const luna = data.levels.luna;
const fixedLuna = parseMapTiles(luna.rows, luna.width, luna.height, luna.ship, luna.initialExploredRadius);

const count = (tiles: Tile[], terrain: Terrain) => tiles.filter((t) => t.terrain === terrain).length;
const layout = (tiles: Tile[]) => tiles.map((t) => t.terrain).join('');
const moon = (seed: string, randomMap?: boolean): GameState =>
  startDay(createCampaign('media', seed, data, { canonical: false, randomMap }), data).state;

describe('random map option', () => {
  it('is on by default, an old options file without it turns it on, and off stays off', () => {
    expect(getDefaultOptions().randomMap).toBe(true);
    expect(sanitizeOptions({ language: 'es' }).randomMap).toBe(true);
    expect(sanitizeOptions({ randomMap: false }).randomMap).toBe(false);
  });

  it('without the option, the Moon keeps its fixed layout', () => {
    expect(layout(moon('EA-FIXED').mission.map.tiles)).toBe(layout(fixedLuna));
    expect(moon('EA-FIXED').campaign.randomMap).toBeUndefined();
  });

  it('with the option, moves ice and minerals but keeps how many there are', () => {
    const tiles = moon('EA-RANDOM-1', true).mission.map.tiles;
    expect(layout(tiles)).not.toBe(layout(fixedLuna));
    for (const terrain of ['hielo', 'mineral', 'roca', 'crater', 'misterio', 'llano'] as const) {
      expect(count(tiles, terrain)).toBe(count(fixedLuna, terrain));
    }
    // Only ice and minerals swap places with flat ground.
    tiles.forEach((tile, i) => {
      if (tile.terrain !== fixedLuna[i].terrain) {
        expect(['hielo', 'mineral', 'llano']).toContain(tile.terrain);
        expect(['hielo', 'mineral', 'llano']).toContain(fixedLuna[i].terrain);
      }
    });
    expect(validateState(moon('EA-RANDOM-1', true), data)).toEqual([]);
  });

  it('is decided by the seed: same seed, same map; another seed, another map', () => {
    expect(layout(moon('EA-RANDOM-1', true).mission.map.tiles)).toBe(layout(moon('EA-RANDOM-1', true).mission.map.tiles));
    expect(layout(moon('EA-RANDOM-1', true).mission.map.tiles)).not.toBe(layout(moon('EA-RANDOM-2', true).mission.map.tiles));
  });

  it('never touches the landing site, the clues or the hidden lunar corner', () => {
    for (const seed of ['A', 'B', 'C', 'D']) {
      const tiles = moon(seed, true).mission.map.tiles;
      tiles.forEach((tile, i) => {
        const nearShip = Math.max(Math.abs(tile.x - luna.ship.x), Math.abs(tile.y - luna.ship.y)) <= 1;
        const corner = tile.x >= luna.width - 4 && tile.y < 4;
        const beacon = luna.secret?.beacon;
        const nearBeacon = beacon && Math.max(Math.abs(tile.x - beacon.x), Math.abs(tile.y - beacon.y)) <= 1;
        if (nearShip || corner || nearBeacon) expect(tile.terrain).toBe(fixedLuna[i].terrain);
      });
    }
  });

  it('keeps the same random map after a retry, and Mars is random too', () => {
    const start = moon('EA-RANDOM-3', true);
    const retried = applyAction(start, { type: 'RESTART_MISSION' }, data);
    if (!retried.ok) throw new Error('restart failed');
    expect(layout(retried.state.mission.map.tiles)).toBe(layout(start.mission.map.tiles));
    expect(retried.state.campaign.randomMap).toBe(true);

    // Win the fixed Moon with the presentation script, then switch the option on for Mars.
    let state = launchWithDesign(startDay(createCampaign('media', 'EA-DEMO', data, { canonical: true }), data).state,
      PRESENTATION_DESIGN, data)!;
    for (const step of missionSteps(() => state)) {
      if (step.kind !== 'action') continue;
      const result = applyAction(state, step.action, data);
      if (!result.ok) throw new Error(result.error.code);
      state = result.state;
    }
    const fixedMars = applyTransition(state, 'luna->marte', data);
    const randomMars = applyTransition({ ...state, campaign: { ...state.campaign, randomMap: true } }, 'luna->marte', data);
    if (!fixedMars.ok || !randomMars.ok) throw new Error('transition failed');
    expect(layout(randomMars.state.mission.map.tiles)).not.toBe(layout(fixedMars.state.mission.map.tiles));
    expect(count(randomMars.state.mission.map.tiles, 'hielo')).toBe(count(fixedMars.state.mission.map.tiles, 'hielo'));
  });
});

/** Is there a mineral the astronaut can walk up to on day 1, without exploring? */
function mineralOnFoot(state: GameState): boolean {
  const { width, height, tiles } = state.mission.map;
  const at = (x: number, y: number) => (x >= 0 && y >= 0 && x < width && y < height ? tiles[y * width + x] : undefined);
  const walkable = (t?: Tile) => Boolean(t && t.explored && !['roca', 'crater', 'nave', 'mineral'].includes(t.terrain));
  const ship = luna.ship;
  const queue = [[ship.x, ship.y + 1], [ship.x, ship.y - 1], [ship.x + 1, ship.y], [ship.x - 1, ship.y]]
    .filter(([x, y]) => walkable(at(x, y)));
  const seen = new Set(queue.map(([x, y]) => y * width + x));
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = at(x + dx, y + dy);
      if (next?.terrain === 'mineral' && next.explored && !next.collected) return true;
      const key = (y + dy) * width + (x + dx);
      if (walkable(next) && !seen.has(key)) { seen.add(key); queue.push([x + dx, y + dy]); }
    }
  }
  return false;
}

describe('random map, first day', () => {
  it('always leaves a mineral reachable on foot from the start zone (250 seeds)', () => {
    expect(mineralOnFoot(moon('EA-FIXED'))).toBe(true);
    const missing = [];
    for (let i = 0; i < 250; i++) if (!mineralOnFoot(moon(`EA-R${i}`, true))) missing.push(i);
    expect(missing).toEqual([]);
  }, 60_000);
});
