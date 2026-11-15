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
  // Same economy as tests/core/plans/mars.ts, with the base laid out so the astronaut can
  // always walk from the west side to the east side (columns 10 to 12 stay open) and reach
  // every target on foot.
  1: { caption: 'mars1', actions: [explore(12, 8), build('panel', 8, 7), build('generador', 8, 8), build('invernadero', 13, 7)] },
  2: { caption: 'mars2', actions: [build('panel', 9, 7), build('extractor', 9, 6), explore(14, 8), explore(11, 11)] },
  3: { actions: [collect(15, 8), build('extractor', 10, 6), build('reciclador', 13, 9)] },
  4: { caption: 'mars4', actions: [explore(12, 13), collect(12, 13), build('panel', 10, 7), clean] },
  5: { actions: [build('panel', 11, 7), build('bateria', 14, 9), explore(13, 6), explore(15, 5), explore(6, 10)] },
  6: { actions: [explore(16, 3), explore(18, 4), clean] },
  7: { actions: [collect(19, 4), build('invernadero', 15, 7), build('panel', 14, 7)] },
  8: { actions: [explore(4, 10), explore(2, 10), collect(2, 10)] },
  // Keep (7,7) open so the crew can reach the north extractor for the Sol 16 repair.
  9: { caption: 'mars9', actions: [build('refugio', 6, 9), build('refugio', 7, 8)] },
  10: { actions: [explore(5, 8), explore(16, 8), explore(18, 9), clean] },
  11: { caption: 'mars11', actions: [explore(20, 9), collect(20, 9), build('comunicaciones', 14, 5)] },
  14: { actions: [explore(15, 1), collect(14, 0), build('generador', 7, 9)] },
  15: { actions: [build('panel', 10, 8), clean] },
};

/**
 * Script for the defeat demo (key Z): the crew only builds power and wanders around. Nobody
 * builds water, oxygen or food, mission control's warnings are ignored and air runs out.
 */
export const LOSING_MOON_SCRIPT: Record<number, ScriptDay> = {
  1: { caption: 'lose1', actions: [build('panel', 24, 24), build('panel', 25, 24), explore(28, 28)] },
  2: { caption: 'lose2', actions: [build('bateria', 24, 26), collect(23, 27)] },
  3: { caption: 'lose3', actions: [explore(22, 28), build('panel', 23, 24)] },
  4: { caption: 'lose4', actions: [] },
  5: { caption: 'lose5', actions: [] },
  6: { caption: 'lose6', actions: [] },
  7: { caption: 'lose7', actions: [] },
};

export interface MissionScript {
  days: Record<number, ScriptDay>;
  /** Shelter the crew when a storm decision comes up. */
  shelter: (level: string, day: number) => boolean;
  /** Caption keys for days without their own caption and for storm decisions. */
  idleCaption: string;
  stormCaption: string;
}

export const MOON_PLAN: MissionScript = {
  days: MOON_SCRIPT, shelter: (_level, day) => day === 8, idleCaption: 'moonDay', stormCaption: 'moonStorm',
};
export const MARS_PLAN: MissionScript = {
  days: MARS_SCRIPT, shelter: () => true, idleCaption: 'marsDay', stormCaption: 'marsStorm',
};
export const LOSING_PLAN: MissionScript = {
  days: LOSING_MOON_SCRIPT, shelter: () => false, idleCaption: 'loseDay', stormCaption: 'loseStorm',
};

export type ScriptStep =
  | { kind: 'caption'; key: string; day: number }
  | { kind: 'action'; action: Action; pause: 'short' | 'report' | 'decision' };

/**
 * Steps for the mission currently in the state, until it has a result. Reads the state again
 * after every step, so the caller can dispatch through the store (browser) or the core (tests).
 */
export function* missionSteps(
  getState: () => import('../core/types').GameState,
  plan?: MissionScript,
): Generator<ScriptStep, void, void> {
  const level = getState().mission.level;
  const chosen = plan ?? (level === 'luna' ? MOON_PLAN : MARS_PLAN);
  const script = chosen.days;
  for (let guard = 0; guard < 200; guard++) {
    const state = getState();
    const { mission } = state;
    if (mission.result || mission.level !== level || mission.phase === 'ended') return;
    const day = mission.day;
    if (mission.phase === 'decision') {
      yield { kind: 'caption', key: chosen.stormCaption, day };
      const shelter = chosen.shelter(level, day);
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
    yield { kind: 'caption', key: entry?.caption ?? chosen.idleCaption, day };
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

/**
 * Mission designs the presentations choose on the design screen, in this order, before the
 * launch. X picks a sensible design; Z cuts corners and carries nothing for life support.
 */
export const PRESENTATION_DESIGN: import('../core/design').MissionDesign = {
  objective: 'autosuficiente',
  rocket: 'medio',
  trajectory: 'estandar',
  payload: ['agua', 'alimentos', 'sensor', 'herramientas'],
};
export const LOSING_DESIGN: import('../core/design').MissionDesign = {
  objective: 'autosuficiente',
  rocket: 'ligero',
  trajectory: 'economica',
  payload: ['materiales', 'bateria'],
};
