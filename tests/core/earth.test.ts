// AI-assisted: OpenAI Codex. Human review pending.
import { describe, expect, it } from 'vitest';
import { applyEarth, createEarth, previewEarth } from '../../src/core/earth';
import { createCampaign } from '../../src/core/mission';
import type { DifficultyId, EarthAction, EarthLine, EarthState, GameData, GameState, MissionResult } from '../../src/core/types';
import { loadGameData } from '../../src/data';

const data = loadGameData();
const marsVictory: MissionResult = {
  outcome: 'victory',
  level: 'marte',
  difficulty: 'media',
  seed: 'EA-DEMO',
  daysUsed: 28,
  earthDaysRemaining: 27,
  resources: { energia: 30, oxigeno: 40, agua: 42, alimentos: 36, materiales: 20 },
  margins: { energia: 2, oxigeno: 6, agua: 7, alimentos: 6 },
  maxExposure: 21,
  incidents: [],
  principleKey: 'sim.principle.victory',
  suggestionKey: 'sim.suggestion.victory',
};

function start(difficulty: DifficultyId = 'media', gameData = data): GameState & { earth: EarthState } {
  const state = createCampaign(difficulty, 'EA-DEMO', gameData, { level: 'marte' });
  return {
    ...state,
    campaign: { ...state.campaign, level: 'tierra' },
    mission: { ...state.mission, phase: 'ended', result: { ...marsVictory, difficulty } },
    earth: createEarth(difficulty, gameData),
  };
}

function act(state: GameState, action: EarthAction, gameData = data) {
  const result = applyEarth(state, action, gameData);
  if (!result.ok) throw new Error(result.error.messageKey);
  if (!result.state.earth) throw new Error('Missing Earth state');
  return { state: { ...result.state, earth: result.state.earth }, events: result.events };
}

function invest(state: GameState, line: EarthLine, count: number, gameData = data) {
  for (let i = 0; i < count; i++) state = act(state, { type: 'EARTH_INVEST', action: line }, gameData).state;
  if (!state.earth) throw new Error('Missing Earth state');
  return { ...state, earth: state.earth };
}

type Investments = Partial<Record<EarthLine, number>>;
type Route = [DifficultyId, Investments[], [number, number, number][]];

const routes: Route[] = [
  ['facil', [
    { energia: 3, restauracion: 1 },
    { reciclaje: 2, agua: 1, restauracion: 2 },
    { energia: 2, agua: 2, reciclaje: 1 },
    { agua: 2, reciclaje: 2, restauracion: 1 },
    { restauracion: 1 },
  ], [
    [28, 9, 12], [31, 20, 20], [41, 38, 28], [59, 58, 39],
    [77, 78, 53], [95, 98, 67], [100, 100, 81], [100, 100, 95],
  ]],
  ['media', [
    { reciclaje: 2, agua: 2 },
    { energia: 3, restauracion: 1 },
    { energia: 1, agua: 1, restauracion: 1, reciclaje: 1 },
    { energia: 1, agua: 2, restauracion: 1 },
    { reciclaje: 2, restauracion: 2 },
  ], [
    [36, 2, 9], [42, 13, 11], [52, 28, 16], [68, 46, 24],
    [86, 66, 38], [100, 86, 52], [100, 100, 66], [100, 100, 80],
  ]],
  ['imposible', [
    { energia: 3 },
    { restauracion: 2, reciclaje: 1 },
    { restauracion: 1, reciclaje: 1, agua: 2 },
    { agua: 2, energia: 1, restauracion: 1 },
    { restauracion: 1, agua: 1, energia: 1 },
    { reciclaje: 3 },
  ], [
    [28, 9, 9], [27, 19, 14], [33, 30, 22], [45, 44, 33],
    [60, 61, 47], [78, 81, 61], [96, 100, 75], [100, 100, 89],
  ]],
];

describe('Earth seasons', () => {
  it.each(routes)('wins in %s at season eight with exact indicators each season', (difficulty, plan, expected) => {
    let state = start(difficulty);
    const { mission, campaign } = state;
    for (let index = 0; index < expected.length; index++) {
      for (const [line, count] of Object.entries(plan[index] ?? {})) {
        state = invest(state, line as EarthLine, count);
      }
      const season = index + 1;
      const { state: next, events } = act(state, { type: 'EARTH_END_SEASON', season });
      const [agua, emisiones, ecosistemas] = expected[index];
      expect(next.earth.indicators).toEqual({ agua, emisiones, ecosistemas });
      expect(next.earth.lastReport?.season).toBe(season);
      expect(events[0]).toEqual({ type: 'earth/season', report: next.earth.lastReport });
      if (season < expected.length) {
        expect(next.earth.result).toBeNull();
        expect(events).toHaveLength(1);
      } else {
        expect(events[1]).toEqual({ type: 'mission/victory', result: next.earth.result });
      }
      state = next;
    }
    expect(state.earth.result).toMatchObject({
      level: 'tierra',
      outcome: 'victory',
      earth: { indicators: state.earth.indicators, targets: data.earth?.difficulty[difficulty].targets, seasonsUsed: 8 },
    });
    expect(state.mission).toBe(mission);
    expect(state.campaign).toBe(campaign);
  });

  it('reproduces the first-season example and rejects a repeated close', () => {
    const original = start();
    const invested = invest(invest(original, 'reciclaje', 2), 'agua', 2);
    expect(original.earth.budget).toBe(10);
    expect(invested.earth.budget).toBe(2);
    const end = { type: 'EARTH_END_SEASON', season: 1 } as const;
    const { state } = act(invested, end);
    expect(state.earth.season).toBe(2);
    expect(state.earth.budget).toBe(12);
    expect(state.earth.indicators).toEqual({ agua: 36, emisiones: 2, ecosistemas: 9 });
    expect(state.earth.lastReport).toMatchObject({
      gains: { agua: 8, emisiones: 2, ecosistemas: 0 },
      drift: { agua: -2, emisiones: 0, ecosistemas: -1 },
      causeEffectKeys: expect.arrayContaining(['content.earth.report.recyclingBoost']),
    });
    expect(previewEarth(state, end, data)?.code).toBe('STALE_DAY');
    const repeated = applyEarth(state, end, data);
    expect(repeated.ok).toBe(false);
    expect(repeated.state).toBe(state);
  });

  it('enforces immediate discounts, budget and the level cap without mutating rejected state', () => {
    const power = invest(start('facil'), 'energia', 3);
    expect(power.earth.budget).toBe(3);
    const restoration = { type: 'EARTH_INVEST', action: 'restauracion' } as const;
    expect(previewEarth(power, restoration, data)).toBeNull();
    const invested = act(power, restoration).state;
    expect(invested.earth.budget).toBe(0);
    const tooExpensive = applyEarth(invested, restoration, data);
    expect(tooExpensive).toMatchObject({ ok: false, error: { code: 'NO_BUDGET', params: { cost: 3 } } });
    expect(tooExpensive.state).toBe(invested);
    const capped = invest(start(), 'agua', 5);
    const overCap = applyEarth(capped, { type: 'EARTH_INVEST', action: 'agua' }, data);
    expect(overCap).toMatchObject({ ok: false, error: { code: 'MAX_LEVEL' } });
    expect(overCap.state).toBe(capped);
  });

  it('halves restoration using opening water and rounds the gain down', () => {
    const state = startWithWater(19);
    const invested = invest(invest(state, 'agua', 3), 'restauracion', 1);
    const next = act(invested, { type: 'EARTH_END_SEASON', season: 1 }).state;
    expect(next.earth.indicators).toEqual({ agua: 23, emisiones: 0, ecosistemas: 10 });
    expect(next.earth.lastReport?.gains.ecosistemas).toBe(1);
    const following = act(next, { type: 'EARTH_END_SEASON', season: 2 }).state;
    expect(following.earth.lastReport?.gains.ecosistemas).toBe(3);
    expect(following.earth.indicators.ecosistemas).toBe(12);
  });

  it('ends in defeat immediately at zero water and rejects later turns', () => {
    const { state, events } = act(startWithWater(1), { type: 'EARTH_END_SEASON', season: 1 });
    expect(state.earth.indicators.agua).toBe(0);
    expect(state.earth.result).toMatchObject({ outcome: 'defeat', cause: 'soporte-vital', earth: { seasonsUsed: 1 } });
    expect(events[1]).toEqual({ type: 'mission/defeat', result: state.earth.result });
    const invalid = applyEarth(state, { type: 'EARTH_END_SEASON', season: 1 }, data);
    expect(invalid).toMatchObject({ ok: false, error: { code: 'WRONG_PHASE' } });
    expect(invalid.state).toBe(state);
  });

  it.each([
    [null, { agua: 14, emisiones: 0, ecosistemas: 2 }],
    ['agua', { agua: 94, emisiones: 0, ecosistemas: 2 }],
  ] as const)('fails the deadline if investments are limited to %s', (line, indicators) => {
    let state = start();
    if (line) state = invest(state, line, 5);
    for (let season = 1; season <= 8; season++) {
      state = act(state, { type: 'EARTH_END_SEASON', season }).state;
      expect(state.earth.budget).toBe(season === 1 && line ? 10 : 12);
    }
    expect(state.earth.indicators).toEqual(indicators);
    expect(state.earth.result).toMatchObject({ outcome: 'defeat', cause: 'plazo', earth: { seasonsUsed: 8 } });
  });

  it('rejects an Earth action outside the Earth mission', () => {
    const state = createCampaign('media', 'EA-DEMO', data);
    const response = applyEarth(state, { type: 'EARTH_INVEST', action: 'agua' }, data);
    expect(response).toMatchObject({ ok: false, error: { code: 'NOT_ON_EARTH' } });
    expect(response.state).toBe(state);
  });
});

function startWithWater(agua: number) {
  if (!data.earth) throw new Error('Missing Earth data');
  const gameData: GameData = { ...data, earth: { ...data.earth, start: { ...data.earth.start, agua } } };
  return start('media', gameData);
}
