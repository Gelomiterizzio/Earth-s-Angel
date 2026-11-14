// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import {
  buildSchedule,
  computeForecast,
  createCampaign,
  getRadiationForDay,
  getSolarFactorForDay,
} from '../../src/core/index';
import type { ScheduledEvent } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

describe('Environmental events and forecast (U-EVE-01..05)', () => {
  it('U-EVE-01: canonical schedule for each difficulty matches the balance table', () => {
    const facil = buildSchedule('facil', 'luna', 'EA-DEMO', true, data);
    expect(facil).toEqual([
      {
        id: 'sombra-5',
        type: 'sombra',
        startDay: 5,
        durationDays: 1,
        solarFactorPct: 50,
      },
      {
        id: 'tormenta-solar-9',
        type: 'tormenta-solar',
        startDay: 9,
        durationDays: 1,
        radiationLevel: 1,
        sourceRef: '2024-05-13T14:00:00-SEP-001',
      },
    ]);

    const media = buildSchedule('media', 'luna', 'EA-DEMO', true, data);
    expect(media).toEqual([
      {
        id: 'sombra-4',
        type: 'sombra',
        startDay: 4,
        durationDays: 1,
        solarFactorPct: 25,
      },
      {
        id: 'tormenta-solar-8',
        type: 'tormenta-solar',
        startDay: 8,
        durationDays: 1,
        radiationLevel: 2,
        sourceRef: '2017-09-10T16:25:00-SEP-001',
      },
    ]);

    const imp = buildSchedule('imposible', 'luna', 'EA-DEMO', true, data);
    expect(imp).toEqual([
      {
        id: 'sombra-5',
        type: 'sombra',
        startDay: 5,
        durationDays: 2,
        solarFactorPct: 25,
      },
      {
        id: 'tormenta-solar-8',
        type: 'tormenta-solar',
        startDay: 8,
        durationDays: 2,
        radiationLevel: 2,
        sourceRef: '2017-09-10T16:25:00-SEP-001',
      },
    ]);
  });

  it('U-EVE-02: two missions with same seed in non-canonical mode produce identical schedules', () => {
    const a = buildSchedule('media', 'luna', 'SEED-ABC-123', false, data);
    const b = buildSchedule('media', 'luna', 'SEED-ABC-123', false, data);
    expect(a).toEqual(b);
  });

  it('U-EVE-03: 50 seeds in non-canonical Media put storm on day 7, 8, or 9 with a level-2 NASA record', () => {
    const level2Ids = new Set(
      data.nasa.sep.filter((r) => r.game.radiationLevel === 2).map((r) => r.nasa.sepID),
    );
    for (let i = 0; i < 50; i++) {
      const sched = buildSchedule('media', 'luna', `SEED-${i}`, false, data);
      const storm = sched.find((e) => e.type === 'tormenta-solar');
      expect(storm).toBeDefined();
      if (storm) {
        expect(storm.startDay).toBeGreaterThanOrEqual(7);
        expect(storm.startDay).toBeLessThanOrEqual(9);
        expect(storm.radiationLevel).toBe(2);
        expect(level2Ids.has(storm.sourceRef ?? '')).toBe(true);
      }
    }
  });

  it('U-EVE-04: two active events on same day use min solarFactorPct and max radiationLevel', () => {
    const schedule: ScheduledEvent[] = [
      { id: 's1', type: 'sombra', startDay: 5, durationDays: 1, solarFactorPct: 25, radiationLevel: 0 },
      { id: 't1', type: 'tormenta-solar', startDay: 5, durationDays: 1, solarFactorPct: 75, radiationLevel: 2 },
    ];
    expect(getSolarFactorForDay(schedule, 5)).toBe(25);
    expect(getRadiationForDay(schedule, 5)).toBe(2);
  });

  it('U-EVE-05: Media forecast on days 2, 6, and 7 announces shadow in 2d, storm in 2d, storm in 1d', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.day = 2;
    const f2 = computeForecast(s, data);
    expect(f2).toHaveLength(1);
    expect(f2[0].type).toBe('sombra');
    expect(f2[0].inDays).toBe(2);

    s.mission.day = 6;
    const f6 = computeForecast(s, data);
    expect(f6).toHaveLength(1);
    expect(f6[0].type).toBe('tormenta-solar');
    expect(f6[0].inDays).toBe(2);

    s.mission.day = 7;
    const f7 = computeForecast(s, data);
    expect(f7).toHaveLength(1);
    expect(f7[0].type).toBe('tormenta-solar');
    expect(f7[0].inDays).toBe(1);
  });
});
