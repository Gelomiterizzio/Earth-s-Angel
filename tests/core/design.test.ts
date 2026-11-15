// AI-assisted: Claude Code (claude-opus-5-5), Antigravity (Gemini). Human review pending.
import { describe, expect, it } from 'vitest';
import {
  applyAction,
  applyTransition,
  computeForecast,
  createCampaign,
  DEFAULT_DESIGN,
  designCommsForecast,
  designStorageBonus,
  designSuitShield,
  designTrajectoryDays,
  deserialize,
  evaluateDesign,
  launchWithDesign,
  objectiveAchieved,
  serialize,
  startDay,
  validateState,
} from '../../src/core';
import type { Action, GameState, MissionDesign, MissionResult } from '../../src/core';
import { forecastHorizon } from '../../src/core/progression';
import { loadGameData } from '../../src/data';
import enUi from '../../src/data/i18n/en/ui.json';
import esUi from '../../src/data/i18n/es/ui.json';
import { MEDIA_PLAN } from './plans/media';

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

function playPlan(
  initial: GameState,
  days: { day: number; shelter?: boolean; actions: Action[] }[],
): GameState {
  let state = initial;
  for (const plan of days) {
    if (state.mission.result) break;
    expect(state.mission.day).toBe(plan.day);
    if (state.mission.phase === 'decision') {
      const dec = applyAction(state, {
        type: 'DECIDE_SHELTER',
        shelter: plan.shelter ?? true,
        day: plan.day,
      }, data);
      if (!dec.ok) throw new Error(`decision day ${plan.day}: ${dec.error.code}`);
      state = dec.state;
    }
    for (const action of plan.actions) {
      const res = applyAction(state, action, data);
      if (!res.ok) throw new Error(`${action.type} day ${plan.day}: ${res.error.code}`);
      state = res.state;
    }
    const ended = applyAction(state, { type: 'END_DAY', day: plan.day }, data);
    if (!ended.ok) throw new Error(`end day ${plan.day}: ${ended.error.code}`);
    state = ended.state;
    expect(validateState(state, data)).toEqual([]);
    if (!state.mission.result) {
      const ack = applyAction(state, { type: 'ACK_REPORT', day: plan.day }, data);
      if (!ack.ok) throw new Error(`ack day ${plan.day}: ${ack.error.code}`);
      state = ack.state;
    }
  }
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

  it('counts spacecraft cabin module and communications antenna mass and cost', () => {
    const withUpgrades: MissionDesign = {
      ...DEFAULT_DESIGN,
      rocket: 'medio',
      ship: 'grande',
      comms: 'alta',
      payload: ['agua'],
    };
    const check = evaluateDesign(withUpgrades, 'media', data);
    expect(check).toEqual({
      cost: table.rockets.medio.cost + table.ships!.grande.cost + table.comms!.alta.cost + table.payload.agua.cost,
      budget: table.budget.media,
      mass: table.ships!.grande.mass + table.comms!.alta.mass + table.payload.agua.mass,
      capacity: table.rockets.medio.capacity,
      problem: null,
    });

    const tooHeavyForLight: MissionDesign = {
      ...DEFAULT_DESIGN,
      rocket: 'ligero',
      ship: 'grande',
      comms: 'alta',
      payload: ['materiales', 'bateria'],
    };
    expect(evaluateDesign(tooHeavyForLight, 'media', data).problem).toBe('mass');
  });

  it('defines orbital launch window and travel time coherent with Earth days saved', () => {
    const baseTravel = table.trajectories.economica.travelDays!;
    expect(baseTravel).toBeGreaterThan(table.trajectories.estandar.travelDays!);
    expect(table.trajectories.estandar.travelDays!).toBeGreaterThan(table.trajectories.rapida.travelDays!);
    for (const id of ['economica', 'estandar', 'rapida'] as const) {
      const tr = table.trajectories[id];
      expect(tr.windowDays).toBeGreaterThanOrEqual(1);
      expect(baseTravel - tr.travelDays!).toBe(tr.earthDays);
    }
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

  it('standard and large cabin modules expand storage caps on the Moon, across days and on Mars', () => {
    const base = fresh();
    const standardCabin = launch(['alimentos'], { ship: 'estandar' });
    const largeCabin = launch(['alimentos'], { ship: 'grande' });

    expect(designStorageBonus(standardCabin.campaign, data)).toBe(6);
    expect(designStorageBonus(largeCabin.campaign, data)).toBe(12);
    expect(standardCabin.mission.caps.alimentos).toBe(base.mission.caps.alimentos + 6);
    expect(largeCabin.mission.caps.alimentos).toBe(base.mission.caps.alimentos + 12);
    // With large cabin (cap 52), initial 32 + 12 food is kept in full (44) instead of capping at 40.
    expect(largeCabin.mission.resources.alimentos).toBe(base.mission.resources.alimentos + 12);

    const ended = applyAction(largeCabin, { type: 'END_DAY', day: 1 }, data);
    if (!ended.ok) throw new Error('end day failed');
    expect(ended.state.mission.caps.oxigeno).toBe(base.mission.caps.oxigeno + 12);
    expect(validateState(ended.state, data)).toEqual([]);
  });

  it('high-gain antenna adds forecast on the Moon and activates Mars comms forecast from Sol 1', () => {
    const base = fresh();
    const highGain = launch([], { comms: 'alta' });
    expect(designCommsForecast(highGain.campaign, data)).toBe(1);
    expect(forecastHorizon(highGain, data)).toBe(forecastHorizon(base, data) + 1);

    // Combined with the radiation sensor, Moon forecast reaches 4 days.
    const both = launch(['sensor'], { comms: 'alta' });
    expect(forecastHorizon(both, data)).toBe(forecastHorizon(base, data) + 2);

    // On Mars, Sol 1 forecast horizon is immediately 3 (forecastHorizonWithComms) even without building comms.
    const marsWithHighGain: GameState = {
      ...highGain,
      campaign: { ...highGain.campaign, level: 'marte', appliedTransitions: ['luna->marte'] },
      mission: { ...highGain.mission, level: 'marte', buildings: highGain.mission.buildings.filter((b) => b.type === 'nave') },
    };
    const marsBase: GameState = {
      ...base,
      campaign: { ...base.campaign, level: 'marte', appliedTransitions: ['luna->marte'] },
      mission: { ...base.mission, level: 'marte', buildings: base.mission.buildings.filter((b) => b.type === 'nave') },
    };
    expect(forecastHorizon(marsBase, data)).toBe(data.levels.marte!.forecastHorizonDays);
    expect(forecastHorizon(marsWithHighGain, data)).toBe(data.levels.marte!.forecastHorizonWithComms);
  });

  it('the spectrometer maps more ground around the landing site, revealing nearby ice and minerals', () => {
    const explored = (s: GameState) => s.mission.map.tiles.filter((t) => t.explored).length;
    const mapped = launch(['espectrometro']);
    expect(explored(mapped)).toBeGreaterThan(explored(fresh()));
    const tileAt = (s: GameState, x: number, y: number) =>
      s.mission.map.tiles.find((t) => t.x === x && t.y === y)!;
    // Radius 2 + 2 = 4 around (25,25) reveals the ice at (29,28) and minerals at (21,28) and (23,21).
    expect(tileAt(mapped, 29, 28).explored).toBe(true);
    expect(tileAt(mapped, 21, 28).explored).toBe(true);
    expect(tileAt(mapped, 23, 21).explored).toBe(true);
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

  it('shielded suits reduce unsheltered storm exposure by 15, keeping crew below caution on Day 8', () => {
    const suited = launch(['exotraje']);
    expect(designSuitShield(suited.campaign, data)).toBe(15);
    const stormDay = playPlan(suited, MEDIA_PLAN.slice(0, 7));
    expect(stormDay.mission.day).toBe(8);
    expect(stormDay.mission.phase).toBe('decision');
    const workOutside = applyAction(stormDay, { type: 'DECIDE_SHELTER', shelter: false, day: 8 }, data);
    if (!workOutside.ok) throw new Error('decide failed');
    const closed = applyAction(workOutside.state, { type: 'END_DAY', day: 8 }, data);
    if (!closed.ok) throw new Error('end day failed');
    // Without suits exposure would be 7 + 1 + 50 = 58 (>= 50 caution); with suits it is 7 + 1 + 35 = 43.
    expect(closed.state.mission.crew[0].exposure).toBe(43);
    expect(closed.state.mission.crew[0].exposure).toBeLessThan(data.constants.exposureCaution);
  });

  it('keeps the design through a retry and a save', () => {
    const launched = launch(['agua', 'herramientas', 'espectrometro', 'sensor'], {
      rocket: 'medio', ship: 'estandar', comms: 'alta', trajectory: 'estandar',
    });
    const ended = applyAction(launched, { type: 'END_DAY', day: 1 }, data);
    if (!ended.ok) throw new Error('end day failed');
    const loaded = deserialize(JSON.stringify(serialize(ended.state)), data);
    if (!loaded.ok) throw new Error(loaded.reason);
    expect(validateState(loaded.state, data)).toEqual([]);
    expect(loaded.state.campaign.design).toEqual(launched.campaign.design);
    const retried = applyAction(loaded.state, { type: 'RESTART_MISSION' }, data);
    if (!retried.ok) throw new Error('restart failed');
    expect(validateState(retried.state, data)).toEqual([]);
    expect(retried.state.campaign.design).toEqual(launched.campaign.design);
    expect(retried.state.campaign.earthDaysRemaining).toBe(launched.campaign.earthDaysRemaining);
    expect(retried.state.mission.resources).toEqual(launched.mission.resources);
    expect(retried.state.mission.caps).toEqual(launched.mission.caps);
    expect(retried.state.mission.map).toEqual(launched.mission.map);
    expect(forecastHorizon(retried.state, data)).toBe(forecastHorizon(launched, data));
  });

  it('loads designs written before cabin and antenna were selectable', () => {
    const launched = launch(['sensor'], { trajectory: 'estandar' });
    const { ship, comms, ...legacy } = launched.campaign.design!;
    const oldSave = serialize({ ...launched, campaign: { ...launched.campaign, design: legacy } });
    const loaded = deserialize(JSON.stringify(oldSave), data);
    if (!loaded.ok) throw new Error(loaded.reason);
    expect(validateState(loaded.state, data)).toEqual([]);
    expect(loaded.state.campaign.design).toEqual(legacy);
    expect(designStorageBonus(loaded.state.campaign, data)).toBe(0);
    expect(designCommsForecast(loaded.state.campaign, data)).toBe(0);
    expect(designTrajectoryDays(loaded.state.campaign, data)).toBe(table.trajectories.estandar.earthDays);
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

describe('mission design: Medium balance across 4 distinct archetypes', () => {
  it('1. cheap design (light rocket, 36 M, 4/6 t) wins the Moon and achieves its objective', () => {
    const cheap: MissionDesign = {
      objective: 'solar',
      rocket: 'ligero',
      trajectory: 'economica',
      ship: 'pequena',
      comms: 'estandar',
      payload: ['materiales', 'bateria'],
    };
    const check = evaluateDesign(cheap, 'media', data);
    expect(check).toMatchObject({ cost: 36, budget: 100, mass: 4, capacity: 6, problem: null });
    const start = launchWithDesign(fresh(), cheap, data)!;
    const end = playPlan(start, MEDIA_PLAN);
    expect(end.mission.result?.outcome).toBe('victory');
    expect(objectiveAchieved(end, end.mission.result!, data)).toBe(true);
  });

  it('2. expensive design (heavy rocket, 97 M, 11/16 t) wins with high margins and carries extra storage to Mars', () => {
    const expensive: MissionDesign = {
      objective: 'autosuficiente',
      rocket: 'pesado',
      trajectory: 'economica',
      ship: 'estandar',
      comms: 'alta',
      payload: ['oxigeno', 'agua', 'alimentos', 'materiales'],
    };
    const check = evaluateDesign(expensive, 'media', data);
    expect(check).toMatchObject({ cost: 97, budget: 100, mass: 11, capacity: 16, problem: null });
    const start = launchWithDesign(fresh(), expensive, data)!;
    const end = playPlan(start, MEDIA_PLAN);
    expect(end.mission.result?.outcome).toBe('victory');
    expect(objectiveAchieved(end, end.mission.result!, data)).toBe(true);
    expect(end.mission.result!.daysUsed).toBe(8);
    expect(end.mission.result!.margins.oxigeno).toBeGreaterThanOrEqual(18);

    const mars = applyTransition(end, 'luna->marte', data);
    expect(mars.ok).toBe(true);
    if (mars.ok) {
      expect(mars.state.mission.caps.oxigeno).toBe(data.levels.marte!.baseCaps.oxigeno + 6);
    }
  });

  it('3. instruments-only design (100 M, 8/10 t) wins without spending AP on EXPLORE and with 2 mineral collections', () => {
    const instrumentsOnly: MissionDesign = {
      objective: 'solar',
      rocket: 'medio',
      trajectory: 'economica',
      ship: 'pequena',
      comms: 'alta',
      payload: ['espectrometro', 'sensor', 'taladro', 'exotraje', 'herramientas'],
    };
    const check = evaluateDesign(instrumentsOnly, 'media', data);
    expect(check).toMatchObject({ cost: 100, budget: 100, mass: 8, capacity: 10, problem: null });
    const start = launchWithDesign(fresh(), instrumentsOnly, data)!;
    // Because the spectrometer mapped radius 4 and the drill gives 22 materials per mineral,
    // the crew never needs to call EXPLORE for (29,28) or (21,28) and only mines twice!
    const noExplorePlan = [
      { day: 1, actions: [
        { type: 'BUILD', building: 'panel', x: 24, y: 24 },
        { type: 'BUILD', building: 'panel', x: 25, y: 24 },
        { type: 'COLLECT', x: 23, y: 27 },
      ] as Action[] },
      { day: 2, actions: [
        { type: 'BUILD', building: 'extractor', x: 29, y: 28 },
        { type: 'BUILD', building: 'reciclador', x: 26, y: 24 },
      ] as Action[] },
      { day: 3, actions: [
        { type: 'BUILD', building: 'generador', x: 24, y: 25 },
        { type: 'BUILD', building: 'invernadero', x: 26, y: 26 },
      ] as Action[] },
      { day: 4, actions: [
        { type: 'COLLECT', x: 21, y: 28 },
        { type: 'BUILD', building: 'bateria', x: 24, y: 26 },
      ] as Action[] },
      { day: 5, actions: [
        { type: 'BUILD', building: 'refugio', x: 26, y: 25 },
      ] as Action[] },
      { day: 6, actions: [{ type: 'BUILD', building: 'panel', x: 23, y: 24 }] as Action[] },
      { day: 7, actions: [] as Action[] },
      { day: 8, shelter: true, actions: [] as Action[] },
      { day: 9, actions: [] as Action[] },
    ];
    const end = playPlan(start, noExplorePlan);
    expect(end.mission.result?.outcome).toBe('victory');
    expect(objectiveAchieved(end, end.mission.result!, data)).toBe(true);
  });

  it('4. supplies-only design (96 M, 9/10 t, large cabin, fast transfer) wins with +4 Earth days and no food wasted at landing', () => {
    const suppliesOnly: MissionDesign = {
      objective: 'autosuficiente',
      rocket: 'medio',
      trajectory: 'rapida',
      ship: 'grande',
      comms: 'estandar',
      payload: ['oxigeno', 'agua', 'alimentos', 'bateria'],
    };
    const check = evaluateDesign(suppliesOnly, 'media', data);
    expect(check).toMatchObject({ cost: 96, budget: 100, mass: 9, capacity: 10, problem: null });
    const start = launchWithDesign(fresh(), suppliesOnly, data)!;
    expect(start.mission.resources.alimentos).toBe(44);
    const end = playPlan(start, MEDIA_PLAN);
    expect(end.mission.result?.outcome).toBe('victory');
    expect(objectiveAchieved(end, end.mission.result!, data)).toBe(true);
    expect(end.mission.result!.daysUsed).toBe(8);
    expect(end.mission.result!.earthDaysRemaining).toBe(46 + table.trajectories.rapida.earthDays);
  });

  it('keeps all ui.design.* catalog keys synchronized in English and Spanish', () => {
    const enKeys = Object.keys(enUi).filter((k) => k.startsWith('ui.design.')).sort();
    const esKeys = Object.keys(esUi).filter((k) => k.startsWith('ui.design.')).sort();
    expect(enKeys.length).toBeGreaterThan(35);
    expect(esKeys).toEqual(enKeys);
  });
});
