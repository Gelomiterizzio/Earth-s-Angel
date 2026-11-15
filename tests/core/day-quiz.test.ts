// AI-assisted: Claude Code (claude-opus-5-5). Human review pending.
import { describe, expect, it } from 'vitest';
import { fixtureReport, fixtureState } from '../../src/core/index';
import type { DayReport } from '../../src/core/types';
import { quizForReport, type DayQuizId } from '../../src/ui/panels/day-quiz';

const state = fixtureState('media-dia-8');
const base = fixtureReport();
const quietDay = (patch: Partial<DayReport> = {}): DayReport => ({
  ...base,
  day: 7,
  solarFactorPct: 100,
  radiationLevel: 0,
  produced: { agua: 0, oxigeno: 0, alimentos: 0 },
  crewConsumed: { oxigeno: 4, agua: 4, alimentos: 4 },
  energy: { ...base.energy, unpowered: [] },
  ...patch,
});
const none = new Set<DayQuizId>();

describe('quick question after the day report', () => {
  it('asks nothing after a quiet day', () => {
    expect(quizForReport(quietDay(), state, none, { skipStorm: false })).toBeNull();
  });

  it('asks about batteries after a low-light day', () => {
    expect(quizForReport(quietDay({ solarFactorPct: 25 }), state, none, { skipStorm: false })).toBe('power');
  });

  it('asks about oxygen once the generator has produced it', () => {
    const day = quietDay({ produced: { agua: 0, oxigeno: 6, alimentos: 0 } });
    expect(quizForReport(day, state, none, { skipStorm: false })).toBe('airFromWater');
  });

  it('asks about water recycling when the recycler ran', () => {
    const day = quietDay({ produced: { agua: 9, oxigeno: 0, alimentos: 0 } });
    expect(quizForReport(day, state, none, { skipStorm: false })).toBe('waterLoop');
  });

  it('puts the storm first, and skips it while the final learning question is pending', () => {
    const day = quietDay({ radiationLevel: 2, solarFactorPct: 25 });
    expect(quizForReport(day, state, none, { skipStorm: false })).toBe('solarStorm');
    expect(quizForReport(day, state, none, { skipStorm: true })).toBe('power');
  });

  it('shows each question only once per game', () => {
    const day = quietDay({ solarFactorPct: 25, produced: { agua: 0, oxigeno: 6, alimentos: 0 } });
    expect(quizForReport(day, state, new Set<DayQuizId>(['power']), { skipStorm: false })).toBe('airFromWater');
    expect(quizForReport(day, state, new Set<DayQuizId>(['power', 'airFromWater']), { skipStorm: false })).toBeNull();
  });
});
