// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
// The presentations must look like someone playing: the astronaut walks next to every tile it
// builds on, explores or collects. This replays the scripts and checks that each target can
// be reached on foot (a diagonal neighbour counts).
import { describe, expect, it } from 'vitest';
import { applyAction, applyTransition, createCampaign, startDay } from '../../src/core';
import type { GameState } from '../../src/core';
import { loadGameData } from '../../src/data';
import { canWalk } from '../../src/map';
import { findWalkPath } from '../../src/app/presentation';
import { LOSING_PLAN, missionSteps, type MissionScript } from '../../src/app/presentation-script';

const data = loadGameData();

function farTargets(start: GameState, plan?: MissionScript): { state: GameState; far: string[] } {
  let state = start;
  const ship = data.levels[state.mission.level]!.ship;
  let at = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }]
    .map((d) => ({ x: ship.x + d.x, y: ship.y + d.y }))
    .find((p) => canWalk(state, p))!;
  const far: string[] = [];
  for (const step of missionSteps(() => state, plan)) {
    if (step.kind !== 'action') continue;
    const { action } = step;
    if ('x' in action && 'y' in action) {
      const path = findWalkPath(state, at, { x: action.x, y: action.y }, true) ?? [];
      if (path.length) at = path[path.length - 1];
      const gap = Math.max(Math.abs(at.x - action.x), Math.abs(at.y - action.y));
      if (gap > 1) far.push(`${state.mission.level} day ${state.mission.day} ${action.type} (${action.x},${action.y}) from (${at.x},${at.y})`);
    }
    const result = applyAction(state, action, data);
    if (!result.ok) throw new Error(result.error.code);
    state = result.state;
  }
  return { state, far };
}

const fresh = (): GameState => startDay(createCampaign('media', 'EA-DEMO', data, { canonical: true }), data).state;

describe('presentation scripts are played on foot', () => {
  it('reaches every target of the Moon and Mars presentation (X)', () => {
    const moon = farTargets(fresh());
    expect(moon.far).toEqual([]);
    const moved = applyTransition(moon.state, 'luna->marte', data);
    if (!moved.ok) throw new Error('transition failed');
    expect(farTargets(moved.state).far).toEqual([]);
  });

  it('reaches every target of the defeat demo (Z)', () => {
    expect(farTargets(fresh(), LOSING_PLAN).far).toEqual([]);
  });
});
