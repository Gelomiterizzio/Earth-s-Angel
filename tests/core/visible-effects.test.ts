// AI-assisted: OpenAI Codex (GPT-6). Human review by C pending.
import { describe, expect, it } from 'vitest';
import { createI18n } from '../../src/app/i18n';
import { createCampaign, fixtureReport } from '../../src/core';
import { DEFAULT_DESIGN, designSuitShield } from '../../src/core/design';
import { applyRadiationStep } from '../../src/core/radiation';
import { loadGameData } from '../../src/data';
import { describeActionOption, mineralPayloadExtra } from '../../src/map/map-input';
import { suitExposureReduction } from '../../src/ui/panels/day-report';

const data = loadGameData();
const ctx = { data, t: createI18n().t };

describe('Visible effects of mission equipment', () => {
  it('counts extra minerals only when the drill actually adds them to storage', () => {
    const state = createCampaign('media', 'visible-effects', data);
    const base = data.difficulty.media.levels.luna.mineralYield;
    expect(mineralPayloadExtra(state, data, base + 2)).toBe(0);
    state.campaign.design = { ...DEFAULT_DESIGN, payload: ['taladro'] };
    expect(mineralPayloadExtra(state, data, base - 1)).toBe(0);
    expect(mineralPayloadExtra(state, data, base + 1)).toBe(1);
  });

  it('shows the discounted repair cost in the action preview', () => {
    const state = createCampaign('media', 'visible-effects', data);
    const target = state.mission.buildings[0];
    target.damaged = true;
    const action = { type: 'REPAIR', buildingId: target.id } as const;
    expect(describeActionOption(ctx, state, action).costMaterials).toBe(data.constants.repairCost);
    state.campaign.design = { ...DEFAULT_DESIGN, payload: ['herramientas'] };
    expect(describeActionOption(ctx, state, action).costMaterials).toBe(0);
  });

  it('reports suit shielding on storm days for crew members outside the shelter', () => {
    const state = createCampaign('media', 'visible-effects', data);
    const report = fixtureReport();
    report.radiationLevel = 2;
    for (const member of report.crew) member.sheltered = true;
    state.campaign.design = { ...DEFAULT_DESIGN, payload: ['exotraje'] };
    expect(suitExposureReduction(state, report, data)).toBe(0);
    report.crew[0].sheltered = false;
    const crew = state.mission.crew;
    const base = applyRadiationStep(crew, [], report.day, 2, false, data);
    const suited = applyRadiationStep(crew, [], report.day, 2, false, data, designSuitShield(state.campaign, data));
    const id = report.crew[0].id;
    const reduction = base.exposureDeltas.get(id)! - suited.exposureDeltas.get(id)!;
    expect(reduction).toBeGreaterThan(0);
    expect(suitExposureReduction(state, report, data)).toBe(reduction);
    expect(suitExposureReduction(state, { ...report, radiationLevel: 0 }, data)).toBe(0);
  });
});
