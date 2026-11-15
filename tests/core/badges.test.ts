// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
import { describe, expect, it } from 'vitest';
import { applyAction, createCampaign, startDay } from '../../src/core';
import type { GameState } from '../../src/core';
import { loadGameData } from '../../src/data';
import { missionSteps } from '../../src/app/presentation-script';
import { earnedBadges } from '../../src/ui/screens/badges';

const data = loadGameData();

function freshMoon(): GameState {
  return startDay(createCampaign('media', 'EA-DEMO', data, { canonical: true }), data).state;
}

describe('learning badges', () => {
  it('starts a mission with no badges', () => {
    expect(earnedBadges(freshMoon()).size).toBe(0);
  });

  it('awards the life-support and storm badges after the Medium walkthrough', () => {
    let state = freshMoon();
    for (const step of missionSteps(() => state)) {
      if (step.kind !== 'action') continue;
      const result = applyAction(state, step.action, data);
      if (!result.ok) throw new Error(result.error.code);
      state = result.state;
    }
    const earned = earnedBadges(state);
    for (const id of ['power', 'waterLoop', 'airFromWater', 'stormSafe'] as const) expect(earned.has(id)).toBe(true);
  });
});
