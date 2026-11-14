// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  applyAction,
  createCampaign,
  fixtureState,
} from '../../src/core/index';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj);
    for (const val of Object.values(obj as Record<string, unknown>)) {
      if (val && typeof val === 'object' && !Object.isFrozen(val)) {
        deepFreeze(val);
      }
    }
  }
  return obj;
}

describe('Day cycle (U-DIA-01..08)', () => {
  it('U-DIA-01: END_DAY in planning increments day (+1), decrements earthDaysRemaining (-1), and transitions to report', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const res = applyAction(s, { type: 'END_DAY', day: 1 }, data);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.mission.day).toBe(2);
    expect(res.state.campaign.earthDaysRemaining).toBe(53);
    expect(res.state.mission.phase).toBe('report');
  });

  it('U-DIA-02: END_DAY with stale day returns STALE_DAY', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const r1 = applyAction(s, { type: 'END_DAY', day: 1 }, data);
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    const ack = applyAction(r1.state, { type: 'ACK_REPORT', day: 1 }, data);
    expect(ack.ok).toBe(true);
    if (!ack.ok) return;

    const rStale = applyAction(ack.state, { type: 'END_DAY', day: 1 }, data);
    expect(rStale.ok).toBe(false);
    if (!rStale.ok) {
      expect(rStale.error.code).toBe('STALE_DAY');
      expect(rStale.state).toBe(ack.state);
    }
  });

  it('U-DIA-03: END_DAY in decision phase returns DECISION_PENDING', () => {
    const s = fixtureState('media-dia-8');
    const res = applyAction(s, { type: 'END_DAY', day: 8 }, data);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('DECISION_PENDING');
      expect(res.state).toBe(s);
    }
  });

  it('U-DIA-04: ACK_REPORT transitions to planning or decision if radiation today; wrong day returns STALE_DAY', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const end1 = applyAction(s, { type: 'END_DAY', day: 1 }, data);
    expect(end1.ok).toBe(true);
    if (!end1.ok) return;

    const badAck = applyAction(end1.state, { type: 'ACK_REPORT', day: 5 }, data);
    expect(badAck.ok).toBe(false);
    if (!badAck.ok) {
      expect(badAck.error.code).toBe('STALE_DAY');
      expect(badAck.state).toBe(end1.state);
    }

    const okAck = applyAction(end1.state, { type: 'ACK_REPORT', day: 1 }, data);
    expect(okAck.ok).toBe(true);
    if (okAck.ok) {
      expect(okAck.state.mission.phase).toBe('planning');
    }
  });

  it('U-DIA-05: Media D8, shelter: true, END_DAY -> energy 28/40, O2 22, water 26, food 24, exposure 13, streak 2, used 20, generated 24', () => {
    const s8 = fixtureState('media-dia-8');
    const dec = applyAction(s8, { type: 'DECIDE_SHELTER', shelter: true, day: 8 }, data);
    expect(dec.ok).toBe(true);
    if (!dec.ok) return;

    const end = applyAction(dec.state, { type: 'END_DAY', day: 8 }, data);
    expect(end.ok).toBe(true);
    if (!end.ok) return;

    const m = end.state.mission;
    expect(m.resources.energia).toBe(28);
    expect(m.caps.energia).toBe(40);
    expect(m.resources.oxigeno).toBe(22);
    expect(m.resources.agua).toBe(26);
    expect(m.resources.alimentos).toBe(24);
    expect(m.crew.every((c) => c.exposure === 13)).toBe(true);
    expect(m.streak).toBe(2);
    expect(m.lastReport?.energy.used).toBe(20);
    expect(m.lastReport?.energy.generated).toBe(24);
  });

  it('U-DIA-06: Media D8, shelter: false (work), no further actions, END_DAY -> energy 34, exposure 58, streak 0, used 14', () => {
    const s8 = fixtureState('media-dia-8');
    const dec = applyAction(s8, { type: 'DECIDE_SHELTER', shelter: false, day: 8 }, data);
    expect(dec.ok).toBe(true);
    if (!dec.ok) return;

    const end = applyAction(dec.state, { type: 'END_DAY', day: 8 }, data);
    expect(end.ok).toBe(true);
    if (!end.ok) return;

    const m = end.state.mission;
    expect(m.resources.energia).toBe(34);
    expect(m.crew.every((c) => c.exposure === 58)).toBe(true);
    expect(m.streak).toBe(0);
    expect(m.lastReport?.energy.used).toBe(14);
  });

  it('U-DIA-07: Media D9 victory beats dayLimit 9; health 0 with all objectives met causes soporte-vital defeat', () => {
    const s8 = fixtureState('media-dia-8');
    const dec = applyAction(s8, { type: 'DECIDE_SHELTER', shelter: true, day: 8 }, data);
    if (!dec.ok) return;
    const end8 = applyAction(dec.state, { type: 'END_DAY', day: 8 }, data);
    if (!end8.ok) return;
    const ack8 = applyAction(end8.state, { type: 'ACK_REPORT', day: 8 }, data);
    if (!ack8.ok) return;

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

    const win9 = advanceDay(ack8.state, dataLimit9);
    expect(win9.report.result?.outcome).toBe('victory');

    // Now if a crew member drops to 0 health on day 9 while all objectives are met:
    const dyingState = {
      ...ack8.state,
      mission: {
        ...ack8.state.mission,
        crew: ack8.state.mission.crew.map((c, idx) =>
          idx === 0 ? { ...c, health: 0 } : { ...c },
        ),
      },
    };
    const loss9 = advanceDay(dyingState, dataLimit9);
    expect(loss9.report.result?.outcome).toBe('defeat');
    expect(loss9.report.result?.cause).toBe('soporte-vital');
  });

  it('U-DIA-08: advanceDay with deeply frozen input does not throw or mutate input', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    deepFreeze(s);
    expect(() => advanceDay(s, data)).not.toThrow();
    expect(s.mission.day).toBe(1);
  });
});
