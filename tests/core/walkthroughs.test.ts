// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { applyAction, createCampaign } from '../../src/core/index';
import { loadGameData } from '../../src/data/index';
import { FACIL_EXPECTED, FACIL_PLAN } from './plans/facil';
import { IMPOSIBLE_EXPECTED, IMPOSIBLE_PLAN } from './plans/imposible';
import { MEDIA_EXPECTED, MEDIA_PLAN } from './plans/media';
import { type DayPlan, runPlan } from './plans/runner';

const data = loadGameData();

describe('Golden Walkthroughs & Variants (I-REC-*, I-DER-01..05, I-BOR-01..03)', () => {
  it('I-REC-FACIL: matches every row of the Fácil walkthrough table and wins on Day 9', () => {
    const res = runPlan('facil', FACIL_PLAN, data);
    expect(res.snapshots).toEqual(FACIL_EXPECTED);
    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(9);
    expect(res.finalState.campaign.earthDaysRemaining).toBe(55);
  });

  it('I-REC-MEDIA: matches every row of the Media walkthrough table and wins on Day 9', () => {
    const res = runPlan('media', MEDIA_PLAN, data);
    expect(res.snapshots).toEqual(MEDIA_EXPECTED);
    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(9);
    expect(res.finalState.campaign.earthDaysRemaining).toBe(45);
  });

  it('I-REC-IMPOSIBLE: matches every row of the Imposible walkthrough table and wins on Day 13', () => {
    const res = runPlan('imposible', IMPOSIBLE_PLAN, data);
    expect(res.snapshots).toEqual(IMPOSIBLE_EXPECTED);
    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(13);
    expect(res.finalState.campaign.earthDaysRemaining).toBe(31);
  });

  it('I-REC-MEDIA-B: Media working on Day 8 (invernadero at (7,6), explore (8,4) and (10,4)) -> Day 8 exposure 58, streak 0; 2 AP from Day 9; victory Day 11, exposure 61, materials 4, earthDays 43', () => {
    const planB: DayPlan[] = MEDIA_PLAN.slice(0, 7).concat([
      {
        day: 8,
        shelter: false,
        actions: [
          { type: 'BUILD', building: 'invernadero', x: 7, y: 6 },
          { type: 'EXPLORE', x: 8, y: 4 },
          { type: 'EXPLORE', x: 10, y: 4 },
        ],
      },
    ]);

    const res = runPlan('media', planB, data);
    const d8 = res.snapshots.find((s) => s.day === 8);
    expect(d8?.exposure).toBe(58);
    expect(d8?.streak).toBe(0);

    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(11);
    expect(res.finalState.mission.result?.maxExposure).toBe(61);
    expect(res.finalState.mission.resources.materiales).toBe(4);
    expect(res.finalState.campaign.earthDaysRemaining).toBe(43);
  });

  it('I-REC-MEDIA-C: Media with greenhouse disabled Day 4 and re-enabled Day 5 -> food 4 on Day 7 and 18 on Day 8, victory on Day 14', () => {
    // Greenhouse in MEDIA_PLAN is built on Day 3 as building id 7
    const planC: DayPlan[] = MEDIA_PLAN.map((p) => {
      if (p.day === 4) {
        return {
          ...p,
          actions: [
            ...p.actions,
            { type: 'TOGGLE_BUILDING', buildingId: 7, enabled: false },
          ],
        };
      }
      if (p.day === 5) {
        return {
          ...p,
          actions: [
            ...p.actions,
            { type: 'TOGGLE_BUILDING', buildingId: 7, enabled: true },
          ],
        };
      }
      return p;
    });

    const res = runPlan('media', planC, data);
    const d7 = res.snapshots.find((s) => s.day === 7);
    const d8 = res.snapshots.find((s) => s.day === 8);
    expect(d7?.alimentos).toBe(4);
    expect(d8?.alimentos).toBe(18);
    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(14);
  });

  it('I-REC-FACIL-B: Fácil without sheltering on Day 9 wins on Day 11 with exposure 36', () => {
    const planFacilB: DayPlan[] = FACIL_PLAN.map((p) =>
      p.day === 9 ? { ...p, shelter: false } : p,
    );
    const res = runPlan('facil', planFacilB, data);
    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(11);
    expect(res.finalState.mission.result?.maxExposure).toBe(36);
  });

  it('I-DER-01: Fácil with no actions -> first shortage Day 9, defeat soporte-vital Day 10', () => {
    const res = runPlan('facil', [], data);
    const r9 = res.reports.find((r) => r.day === 9);
    expect(
      (r9?.shortages.oxigeno ?? 0) +
        (r9?.shortages.agua ?? 0) +
        (r9?.shortages.alimentos ?? 0),
    ).toBeGreaterThan(0);
    expect(res.finalState.mission.result?.outcome).toBe('defeat');
    expect(res.finalState.mission.result?.cause).toBe('soporte-vital');
    expect(res.finalState.mission.result?.daysUsed).toBe(10);
  });

  it('I-DER-02: Media with no actions -> first shortage Day 7 (health 25), defeat soporte-vital Day 8', () => {
    const res = runPlan('media', [], data);
    const r7 = res.reports.find((r) => r.day === 7);
    expect(r7?.crew.every((c) => c.health === 25)).toBe(true);
    expect(res.finalState.mission.result?.outcome).toBe('defeat');
    expect(res.finalState.mission.result?.cause).toBe('soporte-vital');
    expect(res.finalState.mission.result?.daysUsed).toBe(8);
  });

  it('I-DER-03: Imposible with no actions -> first shortage Day 6, defeat soporte-vital Day 7', () => {
    const res = runPlan('imposible', [], data);
    const r6 = res.reports.find((r) => r.day === 6);
    expect(
      (r6?.shortages.oxigeno ?? 0) +
        (r6?.shortages.agua ?? 0) +
        (r6?.shortages.alimentos ?? 0),
    ).toBeGreaterThan(0);
    expect(res.finalState.mission.result?.outcome).toBe('defeat');
    expect(res.finalState.mission.result?.cause).toBe('soporte-vital');
    expect(res.finalState.mission.result?.daysUsed).toBe(7);
  });

  it('I-DER-04: Imposible walkthrough without sheltering on Days 8 and 9 -> defeat exposicion on Day 9 with exposure 109', () => {
    const planNoShelter: DayPlan[] = IMPOSIBLE_PLAN.map((p) =>
      p.day === 8 || p.day === 9 ? { ...p, shelter: false } : p,
    );
    const res = runPlan('imposible', planNoShelter, data);
    expect(res.finalState.mission.result?.outcome).toBe('defeat');
    expect(res.finalState.mission.result?.cause).toBe('exposicion');
    expect(res.finalState.mission.result?.daysUsed).toBe(9);
    expect(res.finalState.mission.result?.maxExposure).toBe(109);
  });

  it('I-DER-05: Media walkthrough without building shelter -> defeat plazo on Day 20 with exposure 70 and only proteccion unmet', () => {
    const planNoShelterBuild: DayPlan[] = MEDIA_PLAN.map((p) => {
      if (p.day === 5) {
        return {
          ...p,
          actions: p.actions.filter(
            (a) => !(a.type === 'BUILD' && a.building === 'refugio'),
          ),
        };
      }
      if (p.day === 8) {
        return { ...p, shelter: false };
      }
      return p;
    });

    const res = runPlan('media', planNoShelterBuild, data, 25);
    expect(res.finalState.mission.result?.outcome).toBe('defeat');
    expect(res.finalState.mission.result?.cause).toBe('plazo');
    expect(res.finalState.mission.result?.daysUsed).toBe(20);
    expect(res.finalState.mission.result?.maxExposure).toBe(70);

    const unmet = res.finalState.mission.objectives.filter((o) => !o.met);
    expect(unmet.map((o) => o.id)).toEqual(['proteccion']);
  });

  it('I-BOR-01: two consecutive END_DAY with same day -> first advances, second returns STALE_DAY or WRONG_PHASE', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const r1 = applyAction(s, { type: 'END_DAY', day: 1 }, data);
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;

    const r2 = applyAction(r1.state, { type: 'END_DAY', day: 1 }, data);
    expect(r2.ok).toBe(false);

    const ack = applyAction(r1.state, { type: 'ACK_REPORT', day: 1 }, data);
    expect(ack.ok).toBe(true);
    if (!ack.ok) return;

    const r3 = applyAction(ack.state, { type: 'END_DAY', day: 1 }, data);
    expect(r3.ok).toBe(false);
    if (!r3.ok) {
      expect(r3.error.code).toBe('STALE_DAY');
    }
  });

  it('I-BOR-02: Media with dayLimit 9 -> victory on Day 9 (success beats deadline)', () => {
    const dataLimit9 = {
      ...data,
      difficulty: {
        ...data.difficulty,
        media: {
          ...data.difficulty.media,
          levels: {
            ...data.difficulty.media.levels,
            luna: { ...data.difficulty.media.levels.luna, dayLimit: 9 },
          },
        },
      },
    };
    const res = runPlan('media', MEDIA_PLAN, dataLimit9);
    expect(res.finalState.mission.result?.outcome).toBe('victory');
    expect(res.finalState.mission.result?.daysUsed).toBe(9);
  });

  it('I-BOR-03: Media with dayLimit 8 -> defeat plazo on Day 8', () => {
    const dataLimit8 = {
      ...data,
      difficulty: {
        ...data.difficulty,
        media: {
          ...data.difficulty.media,
          levels: {
            ...data.difficulty.media.levels,
            luna: { ...data.difficulty.media.levels.luna, dayLimit: 8 },
          },
        },
      },
    };
    const res = runPlan('media', MEDIA_PLAN, dataLimit8);
    expect(res.finalState.mission.result?.outcome).toBe('defeat');
    expect(res.finalState.mission.result?.cause).toBe('plazo');
    expect(res.finalState.mission.result?.daysUsed).toBe(8);
  });
});
