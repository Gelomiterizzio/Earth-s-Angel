// AI-assisted: Cursor (Composer), reviewed by B
import { describe, expect, it } from 'vitest';
import { applyAction, previewAction, previewEnergy } from '../../src/core/index';
import { fixtureState } from '../../src/core/fixtures';
import { loadGameData } from '../../src/data/index';
import { radiationLevelForInstrument } from '../../src/data/validate';

const data = loadGameData();

describe('planning actions on the media day-1 fixture', () => {
  it('builds a panel, collects the nearby mineral, and reveals southeast ice', () => {
    let state = fixtureState('media-dia-1');
    const build = applyAction(state, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(build.ok).toBe(true);
    if (!build.ok) return;
    expect(build.state).not.toBe(state);
    expect(build.state.mission.resources.materiales).toBe(34);
    expect(build.state.mission.ap).toBe(3);
    expect(build.state.mission.buildings.at(-1)?.operationalFromDay).toBe(2);

    state = build.state;
    const collect = applyAction(state, { type: 'COLLECT', x: 3, y: 7 }, data);
    expect(collect.ok).toBe(true);
    if (!collect.ok) return;
    expect(collect.state.mission.resources.materiales).toBe(49);

    state = collect.state;
    const explore = applyAction(state, { type: 'EXPLORE', x: 8, y: 8 }, data);
    expect(explore.ok).toBe(true);
    if (!explore.ok) return;
    const ice = explore.state.mission.map.tiles.filter(
      (tile) => tile.explored && tile.terrain === 'hielo',
    );
    expect(ice.some((tile) => tile.x === 9 && tile.y === 8)).toBe(true);
    expect(ice.some((tile) => tile.x === 9 && tile.y === 9)).toBe(true);
  });

  it('rejects an extractor on flat ground and keeps the same state object', () => {
    const state = fixtureState('media-dia-1');
    const result = applyAction(state, { type: 'BUILD', building: 'extractor', x: 4, y: 4 }, data);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.state).toBe(state);
    expect(result.error.code).toBe('WRONG_TERRAIN');
    expect(previewAction(state, { type: 'BUILD', building: 'extractor', x: 9, y: 8 }, data)?.code).toBe(
      'TILE_UNEXPLORED',
    );
  });

  it('shelters on the day-8 storm and then blocks a second decision', () => {
    const state = fixtureState('media-decision-8');
    expect(previewEnergy(state, data).shelterAffordable).toBe(true);
    const decided = applyAction(state, { type: 'DECIDE_SHELTER', shelter: true, day: 8 }, data);
    expect(decided.ok).toBe(true);
    if (!decided.ok) return;
    expect(decided.state.mission.phase).toBe('planning');
    expect(decided.state.mission.shelterToday).toBe(true);
    expect(decided.state.mission.ap).toBe(0);
    const again = applyAction(
      decided.state,
      { type: 'DECIDE_SHELTER', shelter: false, day: 8 },
      data,
    );
    expect(again.ok).toBe(false);
  });
});

describe('instrument channel', () => {
  it('does not treat a 13-100 MeV range as the >100 MeV channel', () => {
    expect(radiationLevelForInstrument('GOES-P: SEISS >100 MeV')).toBe(2);
    expect(radiationLevelForInstrument('GOES-P: SEISS >10 MeV')).toBe(1);
    expect(radiationLevelForInstrument('STEREO A: IMPACT 13-100 MeV')).toBeNull();
  });
});
