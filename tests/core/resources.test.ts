// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { advanceDay, applyAction, createCampaign } from '../../src/core/index';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

describe('Resource conservation and caps (U-REC-01..04)', () => {
  it('U-REC-01: every day obeys end = start + produced - consumed - wasted for each resource', () => {
    let s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    for (let d = 1; d <= 5; d++) {
      const startRes = { ...s.mission.resources };
      const adv = advanceDay(s, data);
      const rep = adv.report;
      const endRes = adv.state.mission.resources;

      expect(endRes.energia).toBe(
        rep.energy.start + rep.energy.generated - rep.energy.used - rep.energy.wasted,
      );
      expect(endRes.oxigeno).toBe(
        startRes.oxigeno +
          rep.produced.oxigeno -
          rep.crewConsumed.oxigeno -
          (rep.wasted.oxigeno ?? 0),
      );
      expect(endRes.agua).toBe(
        startRes.agua +
          rep.produced.agua -
          rep.moduleInputs.agua -
          rep.crewConsumed.agua -
          (rep.wasted.agua ?? 0),
      );
      expect(endRes.alimentos).toBe(
        startRes.alimentos +
          rep.produced.alimentos -
          rep.crewConsumed.alimentos -
          (rep.wasted.alimentos ?? 0),
      );

      s = adv.state;
      s.mission.phase = 'planning';
    }
  });

  it('U-REC-02: harvest with nearly full storage caps at capacity and records waste', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    s.mission.resources.alimentos = 30; // cap is 40
    s.mission.resources.energia = 20;
    s.mission.resources.agua = 20;
    s.mission.buildings.push({
      id: 2,
      type: 'invernadero',
      x: 24,
      y: 24,
      placedDay: 1,
      operationalFromDay: 1,
      enabled: true,
      growth: 3, // will reach 4 today and harvest 24
      stress: 0,
      damaged: false,
    });

    const adv = advanceDay(s, data);
    // 30 + 24 - 4 (crew) = 50 -> capped at 40, wasted = 10
    expect(adv.state.mission.resources.alimentos).toBe(40);
    expect(adv.report.wasted.alimentos).toBe(10);
  });

  it('U-REC-03: any rejected action leaves state identical', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const res = applyAction(s, { type: 'COLLECT', x: 25, y: 25 }, data);
    expect(res.ok).toBe(false);
    expect(res.state).toBe(s);
  });

  it('U-REC-04: END_DAY without building does not change materials', () => {
    const s = createCampaign('media', 'EA-DEMO', data, { canonical: true });
    const before = s.mission.resources.materiales;
    const adv = advanceDay(s, data);
    expect(adv.state.mission.resources.materiales).toBe(before);
  });
});
