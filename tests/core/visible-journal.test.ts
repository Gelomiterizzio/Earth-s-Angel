// AI-assisted: OpenAI Codex (GPT-6). Human review by C pending.
import { describe, expect, it } from 'vitest';
import { createI18n } from '../../src/app/i18n';
import { createCampaign } from '../../src/core';
import { DEFAULT_DESIGN, type DesignObjectiveId } from '../../src/core/design';
import { loadGameData } from '../../src/data';
import { designProgress } from '../../src/ui/panels/onboard-journal';

const data = loadGameData();
const ctx = { data, t: createI18n('es').t };
const targets = data.missionDesign!.objectives;

function lunarMission(objective: DesignObjectiveId) {
  const state = createCampaign('media', 'visible-journal', data, { canonical: true });
  state.campaign.design = { ...DEFAULT_DESIGN, objective };
  return state;
}

describe('Mission design progress in the journal', () => {
  it('distinguishes the objective reserve margin from full days of life support', () => {
    const state = lunarMission('autosuficiente');
    const need = state.mission.crew.length * data.constants.crewNeedPerDay;
    Object.assign(state.mission.resources, { oxigeno: 5 * need, agua: 4 * need + 1, alimentos: 7 * need });
    const margin = 4 * need + 1 - data.difficulty.media.levels.luna.reserveThreshold;
    expect(designProgress(ctx, state)).toBe(
      `Margen de reserva ${margin} / ${targets.autosuficiente.minMargin} unidades sobre el mínimo · Días de soporte vital 4`,
    );
  });

  it('counts mapped ice and changes the extractor status after construction', () => {
    const state = lunarMission('hielo');
    const ice = state.mission.map.tiles.filter(({ terrain }) => terrain === 'hielo');
    ice.forEach((tile, index) => { tile.explored = index < 2; });
    const mapped = `Casillas de hielo cartografiadas: 2 / ${targets.hielo.minIceTiles}`;
    expect(designProgress(ctx, state)).toBe(`${mapped} · Extractor construido: No`);
    state.mission.buildings.push({ ...state.mission.buildings[0], id: 2, type: 'extractor' });
    expect(designProgress(ctx, state)).toBe(`${mapped} · Extractor construido: Sí`);
  });

  it('shows the highest exposure of the crew and whether they built a shelter', () => {
    const state = lunarMission('solar');
    state.mission.crew[0].exposure = 7;
    state.mission.crew[1].exposure = 12;
    const exposure = `Exposición máxima: 12 (límite ${targets.solar.maxExposure})`;
    expect(designProgress(ctx, state)).toBe(`${exposure} · Refugio construido: No`);
    state.mission.buildings.push({ ...state.mission.buildings[0], id: 2, type: 'refugio' });
    expect(designProgress(ctx, state)).toBe(`${exposure} · Refugio construido: Sí`);
  });
});
