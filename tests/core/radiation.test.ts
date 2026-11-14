// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { applyAction, createCampaign, fixtureState } from '../../src/core/index';
import { applyRadiationStep } from '../../src/core/radiation';
import type { Building, CrewMember } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function shelterBuilding(operationalFromDay = 1): Building {
  return {
    id: 10,
    type: 'refugio',
    x: 6,
    y: 5,
    placedDay: 1,
    operationalFromDay,
    enabled: true,
    growth: 0,
    stress: 0,
    damaged: false,
  };
}

function makeCrew(exposures: number[]): CrewMember[] {
  return exposures.map((exposure, id) => ({
    id,
    nameKey: `sim.crew.${id}`,
    health: 100,
    exposure,
  }));
}

describe('Radiation and shelter decisions (U-RAD-01..07)', () => {
  it('U-RAD-01: day without event adds +1 background exposure', () => {
    const res = applyRadiationStep(makeCrew([0, 0, 0, 0]), [], 2, 0, false, data);
    expect(res.crew.map((c) => c.exposure)).toEqual([1, 1, 1, 1]);
  });

  it('U-RAD-02: severe storm (level 2) with shelter adds +6 exposure', () => {
    const res = applyRadiationStep(
      makeCrew([0, 0, 0, 0]),
      [shelterBuilding()],
      8,
      2,
      true,
      data,
    );
    expect(res.crew.map((c) => c.exposure)).toEqual([6, 6, 6, 6]);
  });

  it('U-RAD-03: severe storm (level 2) without shelter adds +51 exposure', () => {
    const res = applyRadiationStep(makeCrew([0, 0, 0, 0]), [], 8, 2, false, data);
    expect(res.crew.map((c) => c.exposure)).toEqual([51, 51, 51, 51]);
  });

  it('U-RAD-04: moderate storm (level 1) with and without shelter adds +3 and +26', () => {
    const withShelter = applyRadiationStep(
      makeCrew([0, 0, 0, 0]),
      [shelterBuilding()],
      9,
      1,
      true,
      data,
    );
    expect(withShelter.crew.map((c) => c.exposure)).toEqual([3, 3, 3, 3]);

    const withoutShelter = applyRadiationStep(
      makeCrew([0, 0, 0, 0]),
      [],
      9,
      1,
      false,
      data,
    );
    expect(withoutShelter.crew.map((c) => c.exposure)).toEqual([26, 26, 26, 26]);
  });

  it('U-RAD-05: DECIDE_SHELTER(true) without shelter or with shelter under construction returns NO_SHELTER', () => {
    const s = fixtureState('media-dia-8');
    const noShelterState = {
      ...s,
      mission: {
        ...s.mission,
        buildings: s.mission.buildings.filter((b) => b.type !== 'refugio'),
      },
    };
    const r1 = applyAction(
      noShelterState,
      { type: 'DECIDE_SHELTER', shelter: true, day: 8 },
      data,
    );
    expect(r1.ok).toBe(false);
    if (!r1.ok) {
      expect(r1.error.code).toBe('NO_SHELTER');
      expect(r1.state).toBe(noShelterState);
    }

    const wipShelterState = {
      ...s,
      mission: {
        ...s.mission,
        buildings: s.mission.buildings.map((b) =>
          b.type === 'refugio' ? { ...b, operationalFromDay: 9 } : b,
        ),
      },
    };
    const r2 = applyAction(
      wipShelterState,
      { type: 'DECIDE_SHELTER', shelter: true, day: 8 },
      data,
    );
    expect(r2.ok).toBe(false);
    if (!r2.ok) {
      expect(r2.error.code).toBe('NO_SHELTER');
      expect(r2.state).toBe(wipShelterState);
    }
  });

  it('U-RAD-06: insufficient energy + generation returns NO_ENERGY_FOR_SHELTER; DECIDE_SHELTER in planning returns WRONG_PHASE', () => {
    const s = fixtureState('media-dia-8');
    const lowEnergyState = {
      ...s,
      mission: {
        ...s.mission,
        resources: { ...s.mission.resources, energia: 2 },
        buildings: s.mission.buildings.filter((b) => b.type !== 'panel'),
      },
    };
    const r1 = applyAction(
      lowEnergyState,
      { type: 'DECIDE_SHELTER', shelter: true, day: 8 },
      data,
    );
    expect(r1.ok).toBe(false);
    if (!r1.ok) {
      expect(r1.error.code).toBe('NO_ENERGY_FOR_SHELTER');
      expect(r1.state).toBe(lowEnergyState);
    }

    const planningState = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const r2 = applyAction(
      planningState,
      { type: 'DECIDE_SHELTER', shelter: true, day: 1 },
      data,
    );
    expect(r2.ok).toBe(false);
    if (!r2.ok) {
      expect(r2.error.code).toBe('WRONG_PHASE');
      expect(r2.state).toBe(planningState);
    }
  });

  it('U-RAD-07: 6 crew, 4 shelter seats, exposures [5, 9, 7, 7, 3, 8] -> sheltered: ids 1, 5, 2, 3; unsheltered: 0 and 4', () => {
    const crew = makeCrew([5, 9, 7, 7, 3, 8]);
    const res = applyRadiationStep(crew, [shelterBuilding()], 8, 2, true, data);

    expect(res.shelteredById.get(1)).toBe(true);
    expect(res.shelteredById.get(5)).toBe(true);
    expect(res.shelteredById.get(2)).toBe(true);
    expect(res.shelteredById.get(3)).toBe(true);
    expect(res.shelteredById.get(0)).toBe(false);
    expect(res.shelteredById.get(4)).toBe(false);
  });
});
