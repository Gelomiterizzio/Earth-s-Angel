// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  applyAction,
  createCampaign,
  evaluateObjectives,
  fixtureState,
  summarizeHud,
} from '../../src/core/index';
import type { Building } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function b(id: number, type: Building['type'], x = 4, y = 4): Building {
  return {
    id,
    type,
    x,
    y,
    placedDay: 1,
    operationalFromDay: 1,
    enabled: true,
    growth: 0,
    stress: 0,
    damaged: false,
  };
}

describe('Objectives evaluation (U-OBJ-01..08)', () => {
  it('U-OBJ-01: missing any of extractor, recycler, or generator leaves soporte unmet', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const objs = evaluateObjectives(s, data, {
      lsOk: false,
      greenhouseRan: false,
      stable: false,
    });
    expect(objs.find((o) => o.id === 'soporte')?.met).toBe(false);
  });

  it('U-OBJ-02: built generator that had no power today leaves soporte unmet', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.energia = 0;
    s.mission.buildings = [
      b(1, 'nave', 5, 5),
      b(2, 'extractor', 9, 8),
      b(3, 'reciclador', 6, 4),
      b(4, 'generador', 4, 5),
    ];
    const adv = advanceDay(s, data);
    expect(adv.report.objectives.find((o) => o.id === 'soporte')?.met).toBe(false);
  });

  it('U-OBJ-03: 2 panels (nominal 16) with nominal demand 14 meets energia; with nominal demand 18 does not', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.energia = 12;
    s.mission.buildings = [
      b(1, 'nave', 5, 5),
      b(2, 'panel', 4, 4),
      b(3, 'panel', 5, 4),
      b(4, 'extractor', 9, 8),
      b(5, 'reciclador', 6, 4),
      b(6, 'generador', 4, 5),
      b(7, 'invernadero', 6, 6),
    ];
    const objs14 = evaluateObjectives(s, data, {
      lsOk: true,
      greenhouseRan: true,
      stable: true,
    });
    expect(objs14.find((o) => o.id === 'energia')?.met).toBe(true);

    s.mission.buildings.push(b(8, 'invernadero', 7, 6)); // demand 14 + 4 = 18 > 16
    const objs18 = evaluateObjectives(s, data, {
      lsOk: true,
      greenhouseRan: true,
      stable: true,
    });
    expect(objs18.find((o) => o.id === 'energia')?.met).toBe(false);
  });

  it('U-OBJ-04: greenhouse running today but harvests === 0 leaves alimentos unmet', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.harvests = 0;
    const objs = evaluateObjectives(s, data, {
      lsOk: true,
      greenhouseRan: true,
      stable: true,
    });
    expect(objs.find((o) => o.id === 'alimentos')?.met).toBe(false);
  });

  it('U-OBJ-05: reserves at 16 with threshold 16 -> met; at 15 -> unmet', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources = {
      energia: 16,
      oxigeno: 16,
      agua: 16,
      alimentos: 16,
      materiales: 10,
    };
    expect(
      evaluateObjectives(s, data, { lsOk: true, greenhouseRan: true, stable: true }).find(
        (o) => o.id === 'reservas',
      )?.met,
    ).toBe(true);

    s.mission.resources.alimentos = 15;
    expect(
      evaluateObjectives(s, data, { lsOk: true, greenhouseRan: true, stable: false }).find(
        (o) => o.id === 'reservas',
      )?.met,
    ).toBe(false);
  });

  it('U-OBJ-06: Media end of day 7 -> proteccion false; end of day 8 with shelter -> true; end of day 8 without shelter built -> false', () => {
    const s8 = fixtureState('media-dia-8');
    // At end of day 7 (day = 7):
    const s7 = { ...s8, mission: { ...s8.mission, day: 7, phase: 'planning' as const, decisionPending: null } };
    expect(
      evaluateObjectives(s7, data, { lsOk: true, greenhouseRan: true, stable: true }).find(
        (o) => o.id === 'proteccion',
      )?.met,
    ).toBe(false);

    // At end of day 8 with shelter:
    expect(
      evaluateObjectives(s8, data, { lsOk: true, greenhouseRan: true, stable: true }).find(
        (o) => o.id === 'proteccion',
      )?.met,
    ).toBe(true);

    // At end of day 8 without shelter built:
    const s8NoShelter = {
      ...s8,
      mission: {
        ...s8.mission,
        buildings: s8.mission.buildings.filter((item) => item.type !== 'refugio'),
      },
    };
    expect(
      evaluateObjectives(s8NoShelter, data, {
        lsOk: true,
        greenhouseRan: true,
        stable: false,
      }).find((o) => o.id === 'proteccion')?.met,
    ).toBe(false);
  });

  it('U-OBJ-07: three stable days and one unstable day -> streak 1, 2, 3, 0', () => {
    let s = fixtureState('media-dia-8');
    s.mission.streak = 0;
    s.mission.day = 5;
    s.mission.phase = 'planning';
    s.mission.decisionPending = null;
    s.mission.resources = {
      energia: 30,
      oxigeno: 30,
      agua: 30,
      alimentos: 30,
      materiales: 14,
    };

    // Day 5 stable -> streak 1
    s = advanceDay(s, data).state;
    expect(s.mission.streak).toBe(1);
    s.mission.phase = 'planning';

    // Day 6 stable -> streak 2
    s = advanceDay(s, data).state;
    expect(s.mission.streak).toBe(2);
    s.mission.phase = 'planning';

    // Day 7 stable -> streak 3
    s = advanceDay(s, data).state;
    expect(s.mission.streak).toBe(3);

    // Day 8: work without shelter during storm -> unstable -> streak 0
    const dec = applyAction(
      { ...s, mission: { ...s.mission, phase: 'decision', decisionPending: 'luna-sep-1' } },
      { type: 'DECIDE_SHELTER', shelter: false, day: 8 },
      data,
    );
    if (!dec.ok) return;
    const end8 = advanceDay(dec.state, data);
    expect(end8.state.mission.streak).toBe(0);
  });

  it('U-OBJ-08: five objectives met and insufficient streak -> no victory', () => {
    const s8 = fixtureState('media-dia-8');
    const dec = applyAction(s8, { type: 'DECIDE_SHELTER', shelter: true, day: 8 }, data);
    if (!dec.ok) return;
    const adv = advanceDay(dec.state, data);
    // On day 8 close, 5 objectives are met and racha is 2/3 -> result is null
    expect(adv.report.objectives.filter((o) => o.met)).toHaveLength(5);
    expect(adv.report.result).toBeNull();
  });
});

describe('HUD summary and Result causes/principles (U-HUD-01..03, U-RES-01..05)', () => {
  it('U-HUD-01: reserves >= threshold, battery >= threshold, no alert -> all 3 meters seguro', () => {
    const s = fixtureState('media-dia-8');
    s.mission.day = 5;
    const hud = summarizeHud(s, data);
    expect(hud.energia.status).toBe('seguro');
    expect(hud.soporte.status).toBe('seguro');
    expect(hud.proteccion.status).toBe('seguro');
  });

  it('U-HUD-02: oxygen 8 with 4 crew -> soporte preventivo, marginDays 2, limiting oxigeno', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.oxigeno = 8;
    const hud = summarizeHud(s, data);
    expect(hud.soporte.status).toBe('preventivo');
    expect(hud.soporte.marginDays).toBe(2);
    expect(hud.soporte.limiting).toBe('oxigeno');
  });

  it('U-HUD-03: oxygen 4 -> soporte critico; exposure 80 -> proteccion critico', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.oxigeno = 4;
    s.mission.crew[0].exposure = 80;
    const hud = summarizeHud(s, data);
    expect(hud.soporte.status).toBe('critico');
    expect(hud.proteccion.status).toBe('critico');
  });

  it('U-RES-01: shadow day report includes sim.cause.lowLight in causeEffectKeys', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.day = 4;
    const adv = advanceDay(s, data);
    expect(adv.report.causeEffectKeys).toContain('sim.cause.lowLight');
  });

  it('U-RES-02: storm day with shelter includes sim.cause.sheltered; without shelter includes sim.cause.unsheltered', () => {
    const s8 = fixtureState('media-dia-8');
    const decShelter = applyAction(
      s8,
      { type: 'DECIDE_SHELTER', shelter: true, day: 8 },
      data,
    );
    if (!decShelter.ok) return;
    const repShelter = advanceDay(decShelter.state, data).report;
    expect(repShelter.causeEffectKeys).toContain('sim.cause.sheltered');

    const decWork = applyAction(
      s8,
      { type: 'DECIDE_SHELTER', shelter: false, day: 8 },
      data,
    );
    if (!decWork.ok) return;
    const repWork = advanceDay(decWork.state, data).report;
    expect(repWork.causeEffectKeys).toContain('sim.cause.unsheltered');
  });

  it('U-RES-03: defeat by oxygen shortage gives oxygen principle and suggestion', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.oxigeno = 0;
    s.mission.crew = s.mission.crew.map((c) => ({ ...c, health: 40 }));
    const adv = advanceDay(s, data);
    expect(adv.report.result?.outcome).toBe('defeat');
    expect(adv.report.result?.cause).toBe('soporte-vital');
    expect(adv.report.result?.principleKey).toBe('sim.principle.soporte-vital.oxigeno');
    expect(adv.report.result?.suggestionKey).toBe('sim.suggestion.soporte-vital.oxigeno');
  });

  it('U-RES-04: defeat by exposure gives exposure principle and suggestion', () => {
    const s8 = fixtureState('media-dia-8');
    s8.mission.crew = s8.mission.crew.map((c) => ({ ...c, exposure: 60 }));
    const decWork = applyAction(
      s8,
      { type: 'DECIDE_SHELTER', shelter: false, day: 8 },
      data,
    );
    if (!decWork.ok) return;
    const adv = advanceDay(decWork.state, data);
    expect(adv.report.result?.outcome).toBe('defeat');
    expect(adv.report.result?.cause).toBe('exposicion');
    expect(adv.report.result?.principleKey).toBe('sim.principle.exposicion');
    expect(adv.report.result?.suggestionKey).toBe('sim.suggestion.exposicion');
  });

  it('U-RES-05: defeat by deadline without shelter gives suggestion to reserve materials for shelter', () => {
    const s8 = fixtureState('media-dia-8');
    const s20 = {
      ...s8,
      mission: {
        ...s8.mission,
        day: 20,
        phase: 'planning' as const,
        decisionPending: null,
        buildings: s8.mission.buildings.filter((item) => item.type !== 'refugio'),
      },
    };
    const adv = advanceDay(s20, data);
    expect(adv.report.result?.outcome).toBe('defeat');
    expect(adv.report.result?.cause).toBe('plazo');
    expect(adv.report.result?.suggestionKey).toBe('sim.suggestion.plazo.proteccion');
  });
});
