// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
// Script for presentation mode (key X): the canonical Medium walkthrough on the Moon and the
// Mars walkthrough, with a caption for each day. Copied from tests/core/plans/media.ts and
// tests/core/plans/mars.ts; tests/core/presentation.test.ts checks that it still wins both.
import type { Action, BuildingType } from '../core/types';

export const PRESENTATION_SEED = 'EA-DEMO';
export const PRESENTATION_DIFFICULTY = 'media' as const;

const build = (building: BuildingType, x: number, y: number): Action => ({ type: 'BUILD', building, x, y });
const explore = (x: number, y: number): Action => ({ type: 'EXPLORE', x, y });
const collect = (x: number, y: number): Action => ({ type: 'COLLECT', x, y });
const clean: Action = { type: 'CLEAN_PANELS' };

export interface ScriptDay {
  actions: Action[];
  /** Catalog key for the caption shown while the day is played. */
  caption?: string;
}

export const MOON_SCRIPT: Record<number, ScriptDay> = {
  1: { caption: 'moon1', actions: [build('panel', 24, 24), build('panel', 25, 24), collect(23, 27), explore(28, 28)] },
  2: { caption: 'moon2', actions: [build('extractor', 29, 28), build('reciclador', 26, 24)] },
  3: { caption: 'moon3', actions: [build('generador', 24, 25), build('invernadero', 26, 26)] },
  4: { caption: 'moon4', actions: [explore(22, 28), collect(21, 28), build('bateria', 24, 26), explore(23, 22)] },
  5: { caption: 'moon5', actions: [build('refugio', 26, 25), collect(23, 21)] },
  6: { caption: 'moon6', actions: [build('panel', 23, 24)] },
  7: { caption: 'moon7', actions: [] },
  8: { caption: 'moon8', actions: [] },
  9: { caption: 'moon9', actions: [] },
};

export const MARS_SCRIPT: Record<number, ScriptDay> = {
  1: { caption: 'mars1', actions: [build('panel', 8, 7), build('generador', 8, 8), build('invernadero', 8, 9), explore(12, 8)] },
  2: { caption: 'mars2', actions: [build('panel', 9, 7), build('extractor', 9, 6), explore(14, 8), explore(11, 11)] },
  3: { actions: [collect(15, 8), build('extractor', 10, 6), build('reciclador', 9, 9)] },
  4: { caption: 'mars4', actions: [explore(12, 13), collect(12, 13), build('panel', 10, 7), clean] },
  5: { actions: [build('panel', 11, 7), build('bateria', 10, 9), explore(13, 6), explore(15, 5), explore(6, 10)] },
  6: { actions: [explore(16, 3), explore(18, 4), clean] },
  7: { actions: [collect(19, 4), build('invernadero', 11, 9), build('panel', 11, 8)] },
  8: { actions: [explore(4, 10), explore(2, 10), collect(2, 10)] },
  9: { caption: 'mars9', actions: [build('refugio', 7, 7), build('refugio', 7, 8)] },
  10: { actions: [explore(5, 8), explore(3, 6), explore(2, 4), clean] },
  11: { caption: 'mars11', actions: [explore(2, 2), collect(2, 2), build('comunicaciones', 10, 10)] },
  14: { actions: [explore(15, 1), collect(14, 0), build('generador', 7, 9)] },
  15: { actions: [build('panel', 10, 8), clean] },
};

export type ScriptStep =
  | { kind: 'caption'; key: string; day: number }
  | { kind: 'action'; action: Action; pause: 'short' | 'report' | 'decision' };

/**
 * Steps for the mission currently in the state, until it has a result. Reads the state again
 * after every step, so the caller can dispatch through the store (browser) or the core (tests).
 */
export function* missionSteps(getState: () => import('../core/types').GameState): Generator<ScriptStep, void, void> {
  const level = getState().mission.level;
  const script = level === 'luna' ? MOON_SCRIPT : MARS_SCRIPT;
  for (let guard = 0; guard < 200; guard++) {
    const state = getState();
    const { mission } = state;
    if (mission.result || mission.level !== level || mission.phase === 'ended') return;
    const day = mission.day;
    if (mission.phase === 'decision') {
      yield { kind: 'caption', key: level === 'luna' ? 'moonStorm' : 'marsStorm', day };
      const shelter = level === 'marte' || day === 8;
      yield { kind: 'action', action: { type: 'DECIDE_SHELTER', shelter, day }, pause: 'decision' };
      // On Mars the walkthrough ends the sol right after the decision, like tests/core/campaign.test.ts.
      if (level === 'marte' && !getState().mission.result) {
        yield { kind: 'action', action: { type: 'END_DAY', day }, pause: 'report' };
        if (!getState().mission.result) yield { kind: 'action', action: { type: 'ACK_REPORT', day }, pause: 'short' };
      }
      continue;
    }
    if (mission.phase === 'report') {
      yield { kind: 'action', action: { type: 'ACK_REPORT', day: mission.lastReport?.day ?? day - 1 }, pause: 'short' };
      continue;
    }
    const entry = script[day];
    yield { kind: 'caption', key: entry?.caption ?? (level === 'luna' ? 'moonDay' : 'marsDay'), day };
    for (const action of entry?.actions ?? []) yield { kind: 'action', action, pause: 'short' };
    if (level === 'marte') {
      for (const b of getState().mission.buildings) {
        if (b.damaged) yield { kind: 'action', action: { type: 'REPAIR', buildingId: b.id }, pause: 'short' };
      }
      if (!entry && (getState().mission.dust ?? 0) > 0) yield { kind: 'action', action: { type: 'CLEAN_PANELS' }, pause: 'short' };
    }
    yield { kind: 'action', action: { type: 'END_DAY', day }, pause: 'report' };
    if (!getState().mission.result) {
      yield { kind: 'action', action: { type: 'ACK_REPORT', day }, pause: 'short' };
    }
  }
}
