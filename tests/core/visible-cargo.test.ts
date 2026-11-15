// AI-assisted: OpenAI Codex (GPT-6). Human review by C pending.
import { describe, expect, it } from 'vitest';
import { createCampaign, createMission, previewAction } from '../../src/core';
import { DEFAULT_DESIGN } from '../../src/core/design';
import { loadGameData } from '../../src/data';
import { canWalk } from '../../src/map';
import { lunarCargoProps } from '../../src/map/art';

const data = loadGameData();

describe('Lunar cargo scenery', () => {
  it('shows crates for supplies and an antenna for the radiation sensor, on the Moon only', () => {
    const state = createCampaign('media', 'visible-cargo', data);
    expect(lunarCargoProps(state, data)).toEqual([]);
    state.campaign.design = { ...DEFAULT_DESIGN, payload: ['herramientas'] };
    expect(lunarCargoProps(state, data)).toEqual([]);
    state.campaign.design.payload = ['agua'];
    expect(lunarCargoProps(state, data).map(({ kind }) => kind)).toEqual(['crates']);
    state.campaign.design.payload = ['sensor'];
    expect(lunarCargoProps(state, data).map(({ kind }) => kind)).toEqual(['sensor']);
    state.mission = createMission('marte', 'media', 'visible-cargo', true, data);
    expect(lunarCargoProps(state, data)).toEqual([]);
  });

  it('places both props near the ship on preexisting blocked terrain without exploring it', () => {
    const state = createCampaign('media', 'visible-cargo', data);
    state.campaign.design = { ...DEFAULT_DESIGN, payload: ['agua', 'sensor'] };
    const { ship } = data.levels.luna;
    const props = lunarCargoProps(state, data);
    expect(props).toHaveLength(2);
    for (const { x, y } of props) {
      const tile = state.mission.map.tiles[y * state.mission.map.width + x];
      expect(Math.abs(ship.x - x) + Math.abs(ship.y - y)).toBeLessThanOrEqual(4);
      expect(tile).toMatchObject({ terrain: 'roca', explored: false });
      tile.explored = true;
      expect(canWalk(state, { x, y })).toBe(false);
      expect(previewAction(state, { type: 'BUILD', building: 'panel', x, y }, data)?.code).toBe('TILE_BLOCKED');
    }
  });
});
