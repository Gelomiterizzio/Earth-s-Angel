// AI-assisted: OpenAI Codex. Human review pending.
import { describe, expect, it } from 'vitest';
import { createI18n } from '../../src/app/i18n';
import { getSolarFactorForDay } from '../../src/core/events';
import { resolveEnergyStep } from '../../src/core/energy';
import { createMission } from '../../src/core/mission';
import { loadGameData, validateGameData } from '../../src/data';
import { actionForTool } from '../../src/map/map-input';

const data = loadGameData();

describe('D-BAL-06/07 Mars data and campaign content', () => {
  it('loads the 20×20 board, deposits, clues and expanded building catalog', () => {
    const { marte, luna } = data.levels;
    expect(marte).toMatchObject({
      width: 20, height: 20, ship: { x: 9, y: 8 },
      forecastHorizonDays: 1, forecastHorizonWithComms: 3,
      secret: { beacon: { x: 17, y: 12 } },
    });
    if (!marte) throw new Error('Missing Mars data');
    expect(marte.rows).toHaveLength(20);
    expect(marte.rows.every((row) => row.length === 20)).toBe(true);
    expect(marte.rows[3][16]).toBe('?');
    expect(marte.rows[12][17]).toBe('.');
    expect([[10, 5], [9, 6], [10, 6]].map(([x, y]) => marte.rows[y][x])).toEqual(['i', 'i', 'i']);
    expect(marte.rows.join('').match(/m/g)).toHaveLength(8);
    expect(marte.objectives).toEqual(['soporte', 'energia', 'alimentos', 'reservas', 'proteccion', 'comunicaciones', 'autonomia']);
    expect(marte.availableBuildings).toHaveLength(11);
    expect(luna.secret?.beacon).toEqual({ x: 10, y: 2 });
    expect(luna.rows[2][10]).toBe('.');
    expect(luna.availableBuildings).toContain('laboratorio');
    expect(data.buildings.extractor.levels).toContain('marte');
    expect(data.buildings.deposito).toMatchObject({ cost: 8, apCost: 1, buildDays: 1, energyPerDay: 0, capacity: 30 });
    expect(data.buildings.comunicaciones).toMatchObject({ cost: 12, apCost: 2, buildDays: 2, energyPerDay: 3 });
    expect(data.buildings.laboratorio).toMatchObject({ cost: 12, apCost: 2, buildDays: 2, energyPerDay: 4 });
    expect(data.buildings.habitat).toMatchObject({ cost: 16, apCost: 3, buildDays: 2, energyPerDay: 2, capacity: 2 });
    expect(data.constants).toMatchObject({ labClueDays: 3, repairCost: 2 });
    expect(actionForTool({ kind: 'scan' }, 17, 12)).toEqual({ type: 'SCAN', x: 17, y: 12 });
  });

  it.each([
    ['facil', 20, 60, 18, 10, 4, 3, 2, 20, 6, null, [3], [], 1],
    ['media', 12, 50, 24, 15, 5, 4, 3, 30, 5, null, [3, 3], [3], 1],
    ['imposible', 6, 55, 24, 15, 6, 5, 4, 40, 4, 9, [4, 4], [5], 2],
  ] as const)('loads exact Mars balance and event counts for %s', (
    id, supplies, materiales, reserveThreshold, energyThreshold, streakDays, linkDays,
    dustPerDay, dustCap, near, far, regional, global, solarCount,
  ) => {
    const mars = data.difficulty[id].levels.marte;
    expect(mars).toMatchObject({
      crewSize: 6, dayLimit: null,
      initial: { energia: 12, oxigeno: supplies, agua: supplies, alimentos: supplies, materiales },
      reserveThreshold, energyThreshold, streakDays, linkDays, dustPerDay, dustCap, logistics: { near, far },
    });
    if (!mars) throw new Error('Missing Mars balance');
    const { events } = mars;
    const dustDays = (factor: number) => events.filter((e) =>
      e.type === 'tormenta-polvo' && e.solarFactorPct === factor).map((e) => e.durationDays);
    expect(dustDays(65)).toEqual(regional);
    expect(dustDays(20)).toEqual(global);
    const solar = events.filter((e) => e.type === 'tormenta-solar');
    expect(solar).toHaveLength(solarCount);
    expect(solar.every((e) => e.radiationLevel === 1 && e.durationDays === 2)).toBe(true);
    expect(events).toContainEqual({ type: 'averia', startDay: 16, durationDays: 1, target: 'extractor' });
  });

  it('compares clean panels, a regional storm and accumulated dust via the core', () => {
    const mission = createMission('marte', 'media', 'EA-DEMO', true, data);
    const ship = mission.buildings[0];
    mission.buildings.push({ ...ship, id: 2, type: 'panel', x: 8 },
      { ...ship, id: 3, type: 'panel', x: 10 });
    const production = (day: number, dust: number) =>
      resolveEnergyStep({ ...mission, dust }, day, getSolarFactorForDay(mission.schedule, day), 0, data).generated;
    expect(production(6, 0)).toBe(16);
    expect(production(7, 0)).toBe(10);
    expect(production(7, 30)).toBe(7);
    expect(production(20, 30)).toBe(2);
  });

  it('identifies a broken beacon, logistics threshold and Earth target in the pack', () => {
    const broken = structuredClone(data);
    if (!broken.levels.marte?.secret || !broken.difficulty.imposible.levels.marte?.logistics || !broken.earth) {
      throw new Error('Missing campaign data');
    }
    broken.levels.marte.secret.beacon = broken.levels.marte.ship;
    expect(() => validateGameData(broken)).toThrow(/marte\.json.*secret\.beacon/);
    broken.levels.marte.secret.beacon = { x: 17, y: 12 };
    broken.difficulty.imposible.levels.marte.logistics.far = 3;
    expect(() => validateGameData(broken)).toThrow(/marte\.json.*logistics\.far/);
    broken.difficulty.imposible.levels.marte.logistics.far = 9;
    broken.earth.difficulty.imposible.targets.agua = 101;
    expect(() => validateGameData(broken)).toThrow(/tierra\.json.*targets\.agua/);
  });

  it.each(['en', 'es'] as const)('resolves Mars events and Earth result copy in %s', (lang) => {
    const { t } = createI18n(lang);
    const keys = [
      'content.event.tormenta-polvo.name', 'content.event.averia.name',
      'content.earth.error.staleSeason', 'content.earth.report.lowWater',
      'content.earth.result.water.principle', 'content.earth.result.deadline.suggestion',
    ];
    for (const key of keys) expect(t(key)).not.toBe(key);
  });
});
