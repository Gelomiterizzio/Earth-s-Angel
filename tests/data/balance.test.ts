// AI-assisted: Cursor (Composer), reviewed by B
import { describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/index';
import { validateConstants, validateLunaMap, dataError } from '../../src/data/validate';
import constants from '../../src/data/balance/constants.json';
import buildings from '../../src/data/content/buildings.json';
import difficulty from '../../src/data/balance/difficulty.json';
import lunaBalance from '../../src/data/balance/luna.json';
import lunaLevel from '../../src/data/content/levels/luna.json';
import type { SimConstants, LevelConfig } from '../../src/core/types';

describe('D-BAL-01 constants', () => {
  it('matches difficulty-y-balance table', () => {
    expect(constants.panelOutput).toBe(8);
    expect(constants.batteryCapacity).toBe(20);
    expect(constants.extractorWater).toBe(6);
    expect(constants.recyclePct).toBe(75);
    expect(constants.generatorWaterIn).toBe(2);
    expect(constants.generatorOxygenOut).toBe(6);
    expect(constants.greenhouseWaterIn).toBe(2);
    expect(constants.greenhouseCycleDays).toBe(4);
    expect(constants.greenhouseHarvest).toBe(24);
    expect(constants.greenhouseStressPenalty).toBe(6);
    expect(constants.crewNeedPerDay).toBe(1);
    expect(constants.backgroundExposure).toBe(1);
    expect(constants.exposure['1']).toEqual({ unsheltered: 25, sheltered: 2 });
    expect(constants.exposure['2']).toEqual({ unsheltered: 50, sheltered: 5 });
    expect(constants.exposureCaution).toBe(50);
    expect(constants.exposureLimit).toBe(100);
    expect(constants.healthPenalty).toEqual({ oxigeno: 50, agua: 25, alimentos: 15 });
    expect(constants.healthRecovery).toBe(10);
    expect(constants.exploreRevealRadius).toBe(1);
  });
});

describe('D-BAL-02 buildings', () => {
  it('matches P0 catalog', () => {
    expect(buildings.panel).toMatchObject({
      cost: 6,
      apCost: 1,
      buildDays: 1,
      requiresTerrain: 'llano',
    });
    expect(buildings.bateria).toMatchObject({ cost: 5, capacity: 20 });
    expect(buildings.generador).toMatchObject({ cost: 8, apCost: 2, energyPerDay: 4, priority: 1 });
    expect(buildings.reciclador).toMatchObject({ cost: 8, energyPerDay: 3, priority: 2 });
    expect(buildings.extractor).toMatchObject({
      cost: 8,
      requiresTerrain: 'hielo',
      priority: 3,
    });
    expect(buildings.invernadero).toMatchObject({ cost: 10, energyPerDay: 4, priority: 4 });
    expect(buildings.refugio).toMatchObject({
      cost: 14,
      apCost: 3,
      buildDays: 2,
      capacity: 4,
      priority: 0,
    });
  });
});

describe('D-BAL-03 luna + difficulty', () => {
  it('matches campaign and luna tables', () => {
    expect(difficulty.facil).toEqual({ earthDays: 64, bonusDays: 12 });
    expect(difficulty.media).toEqual({ earthDays: 54, bonusDays: 10 });
    expect(difficulty.imposible).toEqual({ earthDays: 44, bonusDays: 8 });

    expect(lunaBalance.media.dayLimit).toBe(20);
    expect(lunaBalance.media.initial).toEqual({
      energia: 10,
      oxigeno: 24,
      agua: 24,
      alimentos: 32,
      materiales: 40,
    });
    expect(lunaBalance.media.mineralYield).toBe(15);
    expect(lunaBalance.media.reserveThreshold).toBe(16);
    expect(lunaBalance.media.energyThreshold).toBe(10);
    expect(lunaBalance.media.streakDays).toBe(3);
    expect(lunaBalance.media.shelterEnergy).toBe(6);
    expect(lunaBalance.facil.events[1].sourceRef).toBe('2024-05-13T14:00:00-SEP-001');
    expect(lunaBalance.media.events[1].sourceRef).toBe('2017-09-10T16:25:00-SEP-001');
    expect(lunaBalance.imposible.events[1].durationDays).toBe(2);
  });
});

describe('D-BAL-04 luna map', () => {
  it('keeps the original 12×12 sector, shifted by (20, 20), with its S/i/m/? counts', () => {
    validateLunaMap(lunaLevel as unknown as LevelConfig);
    expect([lunaLevel.width, lunaLevel.height]).toEqual([73, 73]);
    expect(lunaLevel.ship).toEqual({ x: 25, y: 25 });
    const original = lunaLevel.rows.slice(20, 32).map((row) => row.slice(20, 32));
    const joined = original.join('');
    expect(joined.match(/S/g)?.length).toBe(1);
    expect(joined.match(/i/g)?.length).toBe(3);
    expect(joined.match(/m/g)?.length).toBe(5);
    expect(joined.match(/\?/g)?.length).toBe(1);
  });
});

describe('D-BAL-05 broken data names file and key', () => {
  it('rejects negative constant', () => {
    const bad = structuredClone(constants) as SimConstants;
    bad.panelOutput = -1;
    expect(() => validateConstants(bad)).toThrow(/constants\.json/);
    expect(() => validateConstants(bad)).toThrow(/panelOutput/);
  });

  it('loadGameData succeeds for packaged data', () => {
    const data = loadGameData();
    expect(data.levels.luna.width).toBe(lunaLevel.width);
    expect(data.nasa.sep.length).toBeGreaterThanOrEqual(2);
  });

  it('dataError message format', () => {
    const err = dataError('balance/luna.json', 'media.dayLimit', 'less than last event day');
    expect(err.message).toBe(
      '[balance/luna.json] media.dayLimit: less than last event day',
    );
  });
});
