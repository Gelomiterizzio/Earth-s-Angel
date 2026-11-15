// AI-assisted: Antigravity (Gemini), reviewed by A

import type { ForecastItem, GameData, GameState } from './types';
import { forecastHorizon } from './progression';
import { getForecast } from './events';

export * from './types';
export { hashSeed, isCanonicalSeed, mulberry32, randInt } from './rng';
export { createCampaign, createMission, parseMapTiles } from './mission';
export { applyAction, previewAction } from './actions';
export { advanceDay, startDay } from './day-cycle';
export {
  computeDayStability,
  evaluateMissionOutcome,
  evaluateObjectives,
  previewEnergy,
  summarizeHud,
} from './objectives';
export {
  buildSchedule,
  getActiveEvents,
  getDecisionEventForDay,
  getForecast,
  getRadiationForDay,
  getSolarFactorForDay,
} from './events';
export { applyTransition, portalRequirements } from './progression';
export { validateState } from './validate';
export { buildTerrain } from './terrain';
export { deserialize, serialize } from './save';
export { fixtureGameData, fixtureReport, fixtureState } from './fixtures';

export function computeForecast(state: GameState, data: GameData): ForecastItem[] {
  return getForecast(
    state.mission.schedule,
    state.mission.day,
    forecastHorizon(state, data),
  );
}
