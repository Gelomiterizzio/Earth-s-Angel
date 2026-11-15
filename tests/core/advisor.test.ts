// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
import { describe, expect, it } from 'vitest';
import { fixtureState } from '../../src/core/index';
import type { GameState } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';
import { lifeSupportAdvice } from '../../src/map/advisor';

const data = loadGameData();

function withReserves(o2: number, water: number, food: number, edit?: (s: GameState) => void): GameState {
  const state = fixtureState('media-dia-1');
  state.mission.resources = { ...state.mission.resources, oxigeno: o2, agua: water, alimentos: food };
  state.mission.buildings = state.mission.buildings.filter((b) => b.type === 'nave');
  edit?.(state);
  return state;
}

const need = (state: GameState): number => state.mission.crew.length * data.constants.crewNeedPerDay;

describe('mission control advisor', () => {
  it('stays quiet while every reserve covers more than three days', () => {
    const s = withReserves(0, 0, 0);
    const plenty = need(s) * 6;
    s.mission.resources = { ...s.mission.resources, oxigeno: plenty, agua: plenty, alimentos: plenty };
    expect(lifeSupportAdvice(s, data)).toBeNull();
  });

  it('names the reserve that runs out first and suggests its producer', () => {
    const s = withReserves(0, 0, 0);
    const n = need(s);
    s.mission.resources = { ...s.mission.resources, oxigeno: n * 2, agua: n * 6, alimentos: n * 6 };
    expect(lifeSupportAdvice(s, data)).toMatchObject({
      reserve: 'oxigeno', days: 2, severity: 'preventivo', tip: 'build', building: 'generador',
    });
  });

  it('marks one day or less as critical', () => {
    const s = withReserves(0, 0, 0);
    const n = need(s);
    s.mission.resources = { ...s.mission.resources, oxigeno: n * 6, agua: n, alimentos: n * 6 };
    expect(lifeSupportAdvice(s, data)).toMatchObject({ reserve: 'agua', days: 1, severity: 'critico', tip: 'build' });
  });

  it('asks to fix a producer that is switched off', () => {
    const s = withReserves(0, 0, 0);
    const n = need(s);
    s.mission.resources = { ...s.mission.resources, oxigeno: n * 6, agua: n * 6, alimentos: n * 2 };
    s.mission.buildings.push({
      id: 900, type: 'invernadero', x: 1, y: 1, placedDay: 0, operationalFromDay: 0,
      enabled: false, growth: 0, stress: 0, damaged: false,
    } as GameState['mission']['buildings'][number]);
    expect(lifeSupportAdvice(s, data)).toMatchObject({ reserve: 'alimentos', tip: 'fix', building: 'invernadero' });
  });

  it('gives no tip while the producer is still being built', () => {
    const s = withReserves(0, 0, 0);
    const n = need(s);
    s.mission.resources = { ...s.mission.resources, oxigeno: n * 2, agua: n * 6, alimentos: n * 6 };
    s.mission.buildings.push({
      id: 900, type: 'generador', x: 1, y: 1, placedDay: 1, operationalFromDay: s.mission.day + 1,
      enabled: true, growth: 0, stress: 0, damaged: false,
    } as GameState['mission']['buildings'][number]);
    expect(lifeSupportAdvice(s, data)).toMatchObject({ reserve: 'oxigeno', tip: null, building: 'generador' });
  });
});
