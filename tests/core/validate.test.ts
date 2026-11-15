// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { createCampaign, validateState } from '../../src/core/index';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

describe('State validation (U-VAL-01..04)', () => {
  it('U-VAL-01: new mission in every difficulty produces an empty issue list', () => {
    for (const diff of ['facil', 'media', 'imposible'] as const) {
      const s = createCampaign(diff, 'EA-DEMO', data, { canonical: true });
      expect(validateState(s, data)).toEqual([]);
    }
  });

  it('U-VAL-02: negative resource produces an issue naming that resource', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.oxigeno = -1;
    const issues = validateState(s, data);
    expect(issues.some((msg) => msg.includes('oxigeno'))).toBe(true);
  });

  it('U-VAL-03: building placed on rock produces an issue naming the building', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    // (22, 23) is '#' (roca) inside explored radius? Wait: ship is (25, 25), radius 2 is 3..7. Let's mark (22, 23) explored and put panel on it.
    s.mission.map.tiles[3 * 12 + 2].explored = true;
    s.mission.buildings.push({
      id: 99,
      type: 'panel',
      x: 22,
      y: 23,
      placedDay: 1,
      operationalFromDay: 2,
      enabled: true,
      growth: 0,
      stress: 0,
      damaged: false,
    });
    const issues = validateState(s, data);
    expect(issues.some((msg) => msg.includes('panel'))).toBe(true);
  });

  it('U-VAL-04: phase ended without result produces a phase issue', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.phase = 'ended';
    s.mission.result = null;
    const issues = validateState(s, data);
    expect(issues.some((msg) => msg.includes('phase'))).toBe(true);
  });
});
