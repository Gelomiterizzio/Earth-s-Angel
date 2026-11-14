// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { operateModulesStep } from '../../src/core/life-support';
import type { Building, Resources } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function baseRes(overrides?: Partial<Resources>): Resources {
  return {
    energia: 20,
    oxigeno: 20,
    agua: 10,
    alimentos: 20,
    materiales: 20,
    ...overrides,
  };
}

function mod(id: number, type: Building['type']): Building {
  return {
    id,
    type,
    x: 4,
    y: 4,
    placedDay: 1,
    operationalFromDay: 1,
    enabled: true,
    growth: 0,
    stress: 0,
    damaged: false,
  };
}

describe('Water, oxygen, and food modules (U-AGU-01..07)', () => {
  it('U-AGU-01: powered extractor produces +6 water', () => {
    const res = operateModulesStep(
      baseRes({ agua: 10 }),
      [mod(1, 'extractor')],
      0,
      2,
      new Set([1]),
      4,
      data,
    );
    expect(res.produced.agua).toBe(6);
    expect(res.resources.agua).toBe(16);
  });

  it('U-AGU-02: recycler with wastewater 4 produces +3 water; with 0 produces +0', () => {
    const r4 = operateModulesStep(
      baseRes({ agua: 10 }),
      [mod(1, 'reciclador')],
      4,
      2,
      new Set([1]),
      4,
      data,
    );
    expect(r4.produced.agua).toBe(3);
    expect(r4.resources.agua).toBe(13);

    const r0 = operateModulesStep(
      baseRes({ agua: 10 }),
      [mod(1, 'reciclador')],
      0,
      2,
      new Set([1]),
      4,
      data,
    );
    expect(r0.produced.agua).toBe(0);
    expect(r0.resources.agua).toBe(10);
  });

  it('U-AGU-03: powered generator with water 10 and 4 crew uses 2 water and produces 6 oxygen', () => {
    const res = operateModulesStep(
      baseRes({ agua: 10, oxigeno: 20 }),
      [mod(1, 'generador')],
      0,
      2,
      new Set([1]),
      4,
      data,
    );
    expect(res.moduleInputs.agua).toBe(2);
    expect(res.produced.oxigeno).toBe(6);
    expect(res.resources.agua).toBe(8);
    expect(res.resources.oxigeno).toBe(26);
    expect(res.generatorRan).toBe(true);
  });

  it('U-AGU-04: powered generator with water 5 and 4 crew does not operate (only 1 spare water for modules)', () => {
    const res = operateModulesStep(
      baseRes({ agua: 5, oxigeno: 20 }),
      [mod(1, 'generador')],
      0,
      2,
      new Set([1]),
      4,
      data,
    );
    expect(res.generatorRan).toBe(false);
    expect(res.resources.agua).toBe(5);
    expect(res.resources.oxigeno).toBe(20);
    expect(res.noWaterForModule).toBe(true);
  });

  it('U-AGU-05: greenhouse operating 4 consecutive days harvests +24 food on day 4 and resets growth to 0', () => {
    let buildings = [mod(1, 'invernadero')];
    let resources = baseRes({ agua: 30, alimentos: 10 });

    for (let d = 1; d <= 3; d++) {
      const step = operateModulesStep(
        resources,
        buildings,
        0,
        2,
        new Set([1]),
        4,
        data,
      );
      resources = step.resources;
      buildings = step.buildings;
      expect(step.harvestAmounts).toHaveLength(0);
      expect(buildings[0].growth).toBe(d);
    }

    const day4 = operateModulesStep(
      resources,
      buildings,
      0,
      2,
      new Set([1]),
      4,
      data,
    );
    expect(day4.produced.alimentos).toBe(24);
    expect(day4.harvestAmounts).toEqual([24]);
    expect(day4.buildings[0].growth).toBe(0);
    expect(day4.buildings[0].stress).toBe(0);
  });

  it('U-AGU-06: greenhouse with 1 non-operating day in between harvests 18 one day later', () => {
    let buildings = [mod(1, 'invernadero')];
    let resources = baseRes({ agua: 30, alimentos: 10 });

    // Day 1: powered
    let step = operateModulesStep(resources, buildings, 0, 2, new Set([1]), 4, data);
    buildings = step.buildings;
    // Day 2: unpowered -> stress = 1, growth stays 1
    step = operateModulesStep(resources, buildings, 0, 2, new Set(), 4, data);
    buildings = step.buildings;
    expect(buildings[0].growth).toBe(1);
    expect(buildings[0].stress).toBe(1);
    // Day 3, 4: powered -> growth 2, 3
    step = operateModulesStep(resources, buildings, 0, 2, new Set([1]), 4, data);
    buildings = step.buildings;
    step = operateModulesStep(resources, buildings, 0, 2, new Set([1]), 4, data);
    buildings = step.buildings;
    expect(step.harvestAmounts).toHaveLength(0);
    // Day 5: powered -> growth reaches 4 with stress 1 -> harvest 24 - 6 = 18
    step = operateModulesStep(resources, buildings, 0, 2, new Set([1]), 4, data);
    expect(step.produced.alimentos).toBe(18);
    expect(step.harvestAmounts).toEqual([18]);
    expect(step.buildings[0].growth).toBe(0);
    expect(step.buildings[0].stress).toBe(0);
  });

  it('U-AGU-07: water 6, 4 crew, powered generator and greenhouse -> generator runs, greenhouse lacks water and gains stress', () => {
    const res = operateModulesStep(
      baseRes({ agua: 6, oxigeno: 20 }),
      [mod(1, 'generador'), mod(2, 'invernadero')],
      0,
      2,
      new Set([1, 2]),
      4,
      data,
    );
    expect(res.generatorRan).toBe(true);
    expect(res.greenhouseRan).toBe(false);
    expect(res.greenhouseStressed).toBe(true);
    expect(res.buildings.find((b) => b.id === 2)?.stress).toBe(1);
    expect(res.resources.agua).toBe(4);
  });
});
