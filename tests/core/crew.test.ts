// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { computeCrewAp, consumeCrewRationsStep } from '../../src/core/crew';
import type { CrewMember, Resources } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function makeCrew(healths: number[], exposures: number[] = [0, 0, 0, 0]): CrewMember[] {
  return healths.map((health, id) => ({
    id,
    nameKey: `sim.crew.${id}`,
    health,
    exposure: exposures[id] ?? 0,
  }));
}

function makeRes(overrides?: Partial<Resources>): Resources {
  return {
    energia: 20,
    oxigeno: 20,
    agua: 20,
    alimentos: 20,
    materiales: 20,
    ...overrides,
  };
}

describe('Crew consumption, health, and AP (U-TRI-01..06)', () => {
  it('U-TRI-01: all rations covered with health 95 recovers to 100', () => {
    const res = consumeCrewRationsStep(makeCrew([95, 100, 100, 100]), makeRes(), data);
    expect(res.crew[0].health).toBe(100);
  });

  it('U-TRI-02: oxygen 0 with 4 crew deals -50 health to all four', () => {
    const res = consumeCrewRationsStep(
      makeCrew([100, 100, 100, 100]),
      makeRes({ oxigeno: 0 }),
      data,
    );
    expect(res.crew.map((c) => c.health)).toEqual([50, 50, 50, 50]);
  });

  it('U-TRI-03: oxygen for 2 of 4 crew with healths 100, 80, 100, 60 penalizes ids 0 and 2', () => {
    const res = consumeCrewRationsStep(
      makeCrew([100, 80, 100, 60]),
      makeRes({ oxigeno: 2 }),
      data,
    );
    expect(res.crew.find((c) => c.id === 0)?.health).toBe(50);
    expect(res.crew.find((c) => c.id === 2)?.health).toBe(50);
    expect(res.crew.find((c) => c.id === 1)?.health).toBe(90);
    expect(res.crew.find((c) => c.id === 3)?.health).toBe(70);
  });

  it('U-TRI-04: without oxygen and without water deals -75 health', () => {
    const res = consumeCrewRationsStep(
      makeCrew([100, 100, 100, 100]),
      makeRes({ oxigeno: 0, agua: 0 }),
      data,
    );
    expect(res.crew.map((c) => c.health)).toEqual([25, 25, 25, 25]);
  });

  it('U-TRI-05: exposures 10, 55, 60, 49 yield 3 action points', () => {
    const crew = makeCrew([100, 100, 100, 100], [10, 55, 60, 49]);
    expect(computeCrewAp(crew, data)).toBe(3);
  });

  it('U-TRI-06: water for 3 of 4 crew produces wastewater 3', () => {
    const res = consumeCrewRationsStep(
      makeCrew([100, 100, 100, 100]),
      makeRes({ agua: 3 }),
      data,
    );
    expect(res.wastewater).toBe(3);
  });
});
