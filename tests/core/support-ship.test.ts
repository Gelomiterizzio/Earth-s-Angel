// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
// The small support ship drawn on Mars is decoration: its tile must stay a rock nobody can use.
import { describe, expect, it } from 'vitest';
import { applyTransition, createCampaign, startDay } from '../../src/core';
import { loadGameData } from '../../src/data';
import { MARS_SUPPORT_SHIP } from '../../src/map/art';
import { canWalk } from '../../src/map';
import { MOON_PLAN, missionSteps } from '../../src/app/presentation-script';
import { applyAction } from '../../src/core';

const data = loadGameData();

describe('Mars support ship', () => {
  it('stands on an explored rock beside the main ship, where nobody can walk or build', () => {
    let state = startDay(createCampaign('media', 'EA-DEMO', data, { canonical: true }), data).state;
    for (const step of missionSteps(() => state, MOON_PLAN)) {
      if (step.kind !== 'action') continue;
      const result = applyAction(state, step.action, data);
      if (!result.ok) throw new Error(result.error.code);
      state = result.state;
    }
    const moved = applyTransition(state, 'luna->marte', data);
    if (!moved.ok) throw new Error('transition failed');
    const mars = moved.state;
    const ship = data.levels.marte!.ship;
    const tile = mars.mission.map.tiles[MARS_SUPPORT_SHIP.y * mars.mission.map.width + MARS_SUPPORT_SHIP.x];
    expect(tile).toMatchObject({ terrain: 'roca', explored: true });
    expect(canWalk(mars, MARS_SUPPORT_SHIP)).toBe(false);
    expect(Math.abs(ship.x - MARS_SUPPORT_SHIP.x) + Math.abs(ship.y - MARS_SUPPORT_SHIP.y)).toBeLessThanOrEqual(2);
    const build = applyAction(mars, { type: 'BUILD', building: 'panel', ...MARS_SUPPORT_SHIP }, data);
    expect(build.ok).toBe(false);
  });
});
