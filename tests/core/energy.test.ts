// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { advanceDay, applyAction, createCampaign } from '../../src/core/index';
import { computeEnergyCap, resolveEnergyStep } from '../../src/core/energy';
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

describe('Energy generation, cap, and allocation (U-ENE-01..06)', () => {
  it('U-ENE-01: 2 operational panels at 100% solar generate 16', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.buildings = [b(1, 'nave', 5, 5), b(2, 'panel', 4, 4), b(3, 'panel', 5, 4)];
    const res = resolveEnergyStep(s.mission, 2, 100, 6, data);
    expect(res.generated).toBe(16);
  });

  it('U-ENE-02: Media Day 4 (2 panels, solar 25%, stored 20, four modules) -> generated 4, available 24, used 14, end 10', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.day = 4;
    s.mission.resources.energia = 20;
    s.mission.buildings = [
      b(1, 'nave', 5, 5),
      b(2, 'panel', 4, 4),
      b(3, 'panel', 5, 4),
      b(4, 'extractor', 9, 8),
      b(5, 'reciclador', 6, 4),
      b(6, 'generador', 4, 5),
      b(7, 'invernadero', 6, 6),
    ];
    const res = resolveEnergyStep(s.mission, 4, 25, 6, data);
    expect(res.generated).toBe(4);
    expect(res.start + res.generated).toBe(24);
    expect(res.used).toBe(14);
    expect(res.remaining).toBe(10);
  });

  it('U-ENE-03: one operational battery gives cap 40', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.buildings = [b(1, 'nave', 5, 5), b(2, 'bateria', 4, 6)];
    expect(computeEnergyCap(s.mission, 2, data)).toBe(40);
  });

  it('U-ENE-04: available 8, default priority, 4 modules -> generador (4) & reciclador (3) powered; extractor (5) & invernadero (6) unpowered; remaining 1', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.energia = 8;
    s.mission.buildings = [
      b(1, 'nave', 5, 5),
      b(2, 'generador', 4, 5),
      b(3, 'reciclador', 6, 4),
      b(4, 'extractor', 9, 8),
      b(5, 'invernadero', 6, 6),
    ];
    const res = resolveEnergyStep(s.mission, 2, 100, 6, data);
    expect(res.poweredIds.has(2)).toBe(true);
    expect(res.poweredIds.has(3)).toBe(true);
    expect(res.unpoweredIds).toEqual([4, 5]);
    expect(res.remaining).toBe(1);
  });

  it('U-ENE-05: custom priority with invernadero first powers invernadero & generador; incomplete priority returns INVALID_PRIORITY', () => {
    let s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.energia = 8;
    s.mission.buildings = [
      b(1, 'nave', 5, 5),
      b(2, 'generador', 4, 5),
      b(3, 'reciclador', 6, 4),
      b(4, 'extractor', 9, 8),
      b(5, 'invernadero', 6, 6),
    ];

    const okOrder = applyAction(
      s,
      {
        type: 'SET_ENERGY_PRIORITY',
        order: ['invernadero', 'generador', 'reciclador', 'extractor'],
      },
      data,
    );
    expect(okOrder.ok).toBe(true);
    if (!okOrder.ok) return;
    s = okOrder.state;

    const res = resolveEnergyStep(s.mission, 2, 100, 6, data);
    expect(res.poweredIds.has(5)).toBe(true);
    expect(res.poweredIds.has(2)).toBe(true);
    expect(res.unpoweredIds).toEqual([3, 4]);
    expect(res.remaining).toBe(0);

    const badOrder = applyAction(
      s,
      { type: 'SET_ENERGY_PRIORITY', order: ['invernadero', 'generador'] },
      data,
    );
    expect(badOrder.ok).toBe(false);
    if (!badOrder.ok) {
      expect(badOrder.error.code).toBe('INVALID_PRIORITY');
      expect(badOrder.state).toBe(s);
    }
  });

  it('U-ENE-06: available 10 with shelter cost 6 powers shelter & generador only; excess above cap 20 (30 -> 20, wasted 10)', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.energia = 10;
    s.mission.shelterToday = true;
    s.mission.buildings = [
      b(1, 'nave', 5, 5),
      b(2, 'generador', 4, 5),
      b(3, 'reciclador', 6, 4),
      b(4, 'extractor', 9, 8),
      b(5, 'invernadero', 6, 6),
      b(6, 'refugio', 6, 5),
    ];
    const res = resolveEnergyStep(s.mission, 2, 100, 6, data);
    expect(res.shelterActive).toBe(true);
    expect(res.poweredIds.has(2)).toBe(true);
    expect(res.unpoweredIds).toEqual([3, 4, 5]);
    expect(res.remaining).toBe(0);

    // Cap 20 and available 30 -> end 20, wasted 10
    const s2 = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s2.mission.resources.energia = 14;
    s2.mission.buildings = [b(1, 'nave', 5, 5), b(2, 'panel', 4, 4), b(3, 'panel', 5, 4)];
    const adv = advanceDay(s2, data);
    expect(adv.report.energy.end).toBe(20);
    expect(adv.report.energy.wasted).toBe(10);
  });
});
