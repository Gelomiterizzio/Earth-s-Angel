// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
import { describe, expect, it } from 'vitest';
import {
  applyAction,
  computeForecast,
  createCampaign,
  DEFAULT_DESIGN,
  deserialize,
  evaluateDesign,
  launchWithDesign,
  objectiveAchieved,
  serialize,
  startDay,
  validateState,
} from '../../src/core';
import type { GameState, MissionDesign, MissionResult } from '../../src/core';
import { loadGameData } from '../../src/data';

const data = loadGameData();
const table = data.missionDesign!;

function fresh(): GameState {
  return startDay(createCampaign('media', 'EA-DEMO', data, { canonical: true }), data).state;
}

function launch(payload: MissionDesign['payload'], extra: Partial<MissionDesign> = {}): GameState {
  const state = launchWithDesign(fresh(), { ...DEFAULT_DESIGN, rocket: 'pesado', payload, ...extra }, data);
  if (!state) throw new Error('design rejected');
  return state;
}

describe('mission design: budget and mass', () => {
  it('accepts the default design, which costs only the medium rocket', () => {
    expect(evaluateDesign(DEFAULT_DESIGN, 'media', data)).toMatchObject({
      cost: table.rockets.medio.cost, mass: 0, problem: null,
    });
  });

  it('rejects a payload heavier than the rocket can lift', () => {
    const heavy: MissionDesign = { ...DEFAULT_DESIGN, rocket: 'ligero', payload: ['oxigeno', 'agua', 'alimentos', 'materiales'] };
    expect(evaluateDesign(heavy, 'media', data).problem).toBe('mass');
    expect(launchWithDesign(fresh(), heavy, data)).toBeNull();
  });

  it('rejects a design over budget', () => {
    const pricey: MissionDesign = {
      ...DEFAULT_DESIGN, rocket: 'pesado', trajectory: 'rapida',
      payload: ['espectrometro', 'sensor', 'exotraje', 'taladro', 'herramientas'],
    };
    expect(evaluateDesign(pricey, 'media', data).problem).toBe('budget');
  });

  it('rejects repeated or unknown items', () => {
    expect(evaluateDesign({ ...DEFAULT_DESIGN, payload: ['agua', 'agua'] }, 'media', data).problem).toBe('unknown');
  });
});

describe('mission design: effects', () => {
  it('the default design leaves the campaign exactly as before', () => {
    const before = fresh();
    const after = launchWithDesign(before, DEFAULT_DESIGN, data)!;
    expect(after.mission).toEqual(before.mission);
    expect(after.campaign.earthDaysRemaining).toBe(before.campaign.earthDaysRemaining);
  });

  it('supplies land with the crew, capped by storage', () => {
    const before = fresh();
    const after = launch(['oxigeno', 'agua', 'bateria']);
    expect(after.mission.resources.oxigeno).toBe(Math.min(before.mission.caps.oxigeno, before.mission.resources.oxigeno + 12));
    expect(after.mission.resources.agua).toBe(before.mission.resources.agua + 12);
    expect(after.mission.resources.energia).toBe(Math.min(before.mission.caps.energia, before.mission.resources.energia + 10));
    expect(validateState(after, data)).toEqual([]);
  });

  it('the spectrometer maps more ground around the landing site', () => {
    const explored = (s: GameState) => s.mission.map.tiles.filter((t) => t.explored).length;
    expect(explored(launch(['espectrometro']))).toBeGreaterThan(explored(fresh()));
  });

  it('the radiation sensor warns a day earlier', () => {
    const plain = computeForecast(fresh(), data).length;
    const warned = launch(['sensor']);
    expect(computeForecast(warned, data).length).toBeGreaterThanOrEqual(plain);
  });

  it('a faster trajectory saves Earth days', () => {
    expect(launch([], { trajectory: 'rapida' }).campaign.earthDaysRemaining)
      .toBe(fresh().campaign.earthDaysRemaining + table.trajectories.rapida.earthDays);
  });

  it('the sampling drill collects more material from each mineral', () => {
    const collect = (s: GameState) => applyAction(s, { type: 'COLLECT', x: 23, y: 27 }, data);
    const plain = collect(fresh());
    const drilled = collect(launch(['taladro']));
    if (!plain.ok || !drilled.ok) throw new Error('collect failed');
    expect(drilled.state.mission.resources.materiales - launch(['taladro']).mission.resources.materiales)
      .toBeGreaterThan(plain.state.mission.resources.materiales - fresh().mission.resources.materiales);
  });

  it('keeps the design through a retry and a save', () => {
    const launched = launch(['agua', 'herramientas']);
    const retried = applyAction(launched, { type: 'RESTART_MISSION' }, data);
    if (!retried.ok) throw new Error('restart failed');
    expect(retried.state.campaign.design?.payload).toEqual(['agua', 'herramientas']);
    expect(retried.state.mission.resources.agua).toBe(launched.mission.resources.agua);
    const loaded = deserialize(serialize(launched), data);
    expect(loaded.ok && loaded.state.campaign.design).toEqual(launched.campaign.design);
  });

  it('judges the chosen objective on the mission result', () => {
    const state = launch([], { objective: 'autosuficiente' });
    const result: MissionResult = {
      outcome: 'victory', level: 'luna', difficulty: 'media', seed: 'EA-DEMO', daysUsed: 9,
      earthDaysRemaining: 40, resources: state.mission.resources,
      margins: { oxigeno: 8, agua: 8, alimentos: 8, energia: 10 }, maxExposure: 14,
      incidents: [], principleKey: '', suggestionKey: '',
    };
    expect(objectiveAchieved(state, { ...result }, data)).toBe(true);
    expect(objectiveAchieved(state, { ...result, margins: { ...result.margins, agua: 2 } }, data)).toBe(false);
    expect(objectiveAchieved(state, { ...result, outcome: 'defeat' }, data)).toBe(false);
  });
});
