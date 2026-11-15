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
  it('is off by default, and an old options file without it stays off', () => {
    expect(getDefaultOptions().randomMap).toBe(false);
    expect(sanitizeOptions({ language: 'es' }).randomMap).toBe(false);
    expect(sanitizeOptions({ randomMap: true }).randomMap).toBe(true);
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
