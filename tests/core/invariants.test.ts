// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import {
  applyAction,
  createCampaign,
  hashSeed,
  mulberry32,
   previewAction,
  randInt,
  startDay,
  validateState,
} from '../../src/core/index';
import type { Action, BuildingType, DifficultyId, GameState } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();
const DIFFICULTIES: DifficultyId[] = ['facil', 'media', 'imposible'];
const BUILDINGS: BuildingType[] = [
  'panel',
  'bateria',
  'generador',
  'reciclador',
  'extractor',
  'invernadero',
  'refugio',
];

function enumerateValidPlanningActions(state: GameState): Action[] {
  const candidates: Action[] = [];
  const { width, height, tiles } = state.mission.map;

  for (const t of tiles) {
    if (!t.explored) {
      const exploreAct: Action = { type: 'EXPLORE', x: t.x, y: t.y };
      if (!previewAction(state, exploreAct, data)) {
        candidates.push(exploreAct);
      }
    } else {
      if (t.terrain === 'mineral' && !t.collected) {
        const collectAct: Action = { type: 'COLLECT', x: t.x, y: t.y };
        if (!previewAction(state, collectAct, data)) {
          candidates.push(collectAct);
        }
      }
      for (const b of BUILDINGS) {
        const buildAct: Action = { type: 'BUILD', building: b, x: t.x, y: t.y };
        if (!previewAction(state, buildAct, data)) {
          candidates.push(buildAct);
        }
      }
    }
  }

  // Also allow END_DAY
  const endAct: Action = { type: 'END_DAY', day: state.mission.day };
  if (!previewAction(state, endAct, data)) {
    candidates.push(endAct);
  }

  return candidates;
}

describe('Property / Invariant Fuzzing across 100 seeded games (I-INV-01)', () => {
  it('I-INV-01: 100 seeded games maintain validateState === [], resource bounds, and input immutability after every action', () => {
    for (let gameIdx = 0; gameIdx < 100; gameIdx++) {
      const seed = `FUZZ-SEED-${gameIdx}`;
      const rng = mulberry32(hashSeed(seed));
      const diff = DIFFICULTIES[gameIdx % DIFFICULTIES.length];

      let state = createCampaign(diff, seed, data, { canonical: false });
      state = startDay(state, data).state;
      expect(validateState(state, data)).toEqual([]);

      let steps = 0;
      while (state.mission.phase !== 'ended' && steps < 60) {
        steps += 1;
        let action: Action;

        if (state.mission.phase === 'decision') {
          const canShelter =
            previewAction(
              state,
              { type: 'DECIDE_SHELTER', shelter: true, day: state.mission.day },
              data,
            ) === null;
          const chooseShelter = canShelter && randInt(rng, 0, 1) === 1;
          action = {
            type: 'DECIDE_SHELTER',
            shelter: chooseShelter,
            day: state.mission.day,
          };
        } else if (state.mission.phase === 'report') {
          action = {
            type: 'ACK_REPORT',
            day: state.mission.lastReport?.day ?? state.mission.day - 1,
          };
        } else {
          const valid = enumerateValidPlanningActions(state);
          action = valid[randInt(rng, 0, valid.length - 1)];
        }

        const snapshotBefore = JSON.stringify(state);
        const res = applyAction(state, action, data);
        expect(JSON.stringify(state)).toBe(snapshotBefore);
        expect(res.ok).toBe(true);
        if (!res.ok) break;

        state = res.state;
        const issues = validateState(state, data);
        expect(issues).toEqual([]);
      }
    }
  });
});
