// AI-assisted: Claude Code (claude-opus-5-5).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TRIVIA } from '../../src/data/trivia';
import en from '../../src/data/i18n/en/ui.json';
import es from '../../src/data/i18n/es/ui.json';
import { nextTriviaId } from '../../src/ui/panels/space-trivia';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('space questions', () => {
  it('has at least 50 questions with every text in English and Spanish', () => {
    expect(TRIVIA.length).toBeGreaterThanOrEqual(50);
    for (const { id } of TRIVIA) {
      for (const part of ['prompt', 'right', 'wrong1', 'wrong2', 'why']) {
        const key = `ui.trivia.${id}.${part}`;
        expect((en as Record<string, string>)[key], key).toBeTruthy();
        expect((es as Record<string, string>)[key], key).toBeTruthy();
      }
    }
  });

  it('never repeats a question until the whole bank was asked', () => {
    const asked = new Set<string>();
    for (let i = 0; i < TRIVIA.length; i++) asked.add(nextTriviaId());
    expect(asked.size).toBe(TRIVIA.length);
    const again = nextTriviaId();
    expect(TRIVIA.some((q) => q.id === again)).toBe(true);
  });
});
