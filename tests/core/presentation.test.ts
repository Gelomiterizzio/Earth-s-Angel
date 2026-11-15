// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
import { describe, expect, it } from 'vitest';
import { applyAction, applyTransition, createCampaign, launchWithDesign, startDay } from '../../src/core';
import type { GameState } from '../../src/core';
import { loadGameData } from '../../src/data';
import { LOSING_DESIGN, missionSteps, PRESENTATION_DESIGN, PRESENTATION_DIFFICULTY, PRESENTATION_SEED } from '../../src/app/presentation-script';

const data = loadGameData();

function play(state: GameState): { state: GameState; captions: string[] } {
  const captions: string[] = [];
  let current = state;
  for (const step of missionSteps(() => current)) {
    if (step.kind === 'caption') {
      captions.push(step.key);
      continue;
    }
    const result = applyAction(current, step.action, data);
    if (!result.ok) throw new Error(`${step.action.type} on day ${current.mission.day}: ${result.error.code}`);
    current = result.state;
  }
  return { state: current, captions };
}

describe('presentation mode script', () => {
  it('wins the Moon and then Mars with the demo seed', () => {
    const created = createCampaign(PRESENTATION_DIFFICULTY, PRESENTATION_SEED, data, { canonical: true });
    // Same design the presentation picks on the design screen.
    const launched = launchWithDesign(startDay(created, data).state, PRESENTATION_DESIGN, data);
    if (!launched) throw new Error('design rejected');
    const moon = play(launched);
    expect(moon.state.mission.result).toMatchObject({ level: 'luna', outcome: 'victory' });
    expect(moon.captions).toContain('moonStorm');

    const moved = applyTransition(moon.state, 'luna->marte', data);
    if (!moved.ok) throw new Error('transition failed');
    const mars = play(moved.state);
    expect(mars.state.mission.result).toMatchObject({ level: 'marte', outcome: 'victory' });
    expect(mars.captions[0]).toBe('mars1');
  });
});

describe('defeat presentation script (key Z)', () => {
  it('loses the Moon mission because life support runs out', async () => {
    const { LOSING_PLAN } = await import('../../src/app/presentation-script');
    const created = createCampaign(PRESENTATION_DIFFICULTY, PRESENTATION_SEED, data, { canonical: true });
    const launched = launchWithDesign(startDay(created, data).state, LOSING_DESIGN, data);
    if (!launched) throw new Error('design rejected');
    let state = launched;
    for (const step of missionSteps(() => state, LOSING_PLAN)) {
      if (step.kind !== 'action') continue;
      const result = applyAction(state, step.action, data);
      if (!result.ok) throw new Error(`${step.action.type} on day ${state.mission.day}: ${result.error.code}`);
      state = result.state;
    }
    expect(state.mission.result).toMatchObject({ level: 'luna', outcome: 'defeat' });
    expect(state.mission.day).toBeLessThanOrEqual(10);
  });
});
