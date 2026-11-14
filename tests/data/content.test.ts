// AI-assisted: Cursor (Composer), reviewed by B
import { describe, expect, it } from 'vitest';
import cards from '../../src/data/content/cards.json';
import tutorial from '../../src/data/content/tutorial.json';
import en from '../../src/data/i18n/en/content.json';
import es from '../../src/data/i18n/es/content.json';

function getPath(obj: unknown, dotted: string): unknown {
  const parts = dotted.replace(/^content\./, '').split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in (cur as object))) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return prefix ? [prefix] : [];
  if (Array.isArray(obj)) return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...collectKeys(v, path));
    } else {
      out.push(path);
    }
  }
  return out;
}

describe('D-CON-01 nasa cards have sources', () => {
  it('every nasa-tagged card has url', () => {
    for (const card of cards) {
      if (card.tag === 'nasa') {
        expect(card.source?.url, card.id).toMatch(/^https?:\/\//);
      }
    }
  });
});

describe('D-CON-02 keys in both languages', () => {
  it('card and tutorial keys exist in en and es', () => {
    const keys: string[] = [];
    for (const card of cards) {
      keys.push(card.titleKey, card.bodyKey);
    }
    for (const step of tutorial) {
      keys.push(step.textKey);
    }
    for (const key of keys) {
      expect(typeof getPath(en, key), `en ${key}`).toBe('string');
      expect(typeof getPath(es, key), `es ${key}`).toBe('string');
    }
  });

  it('en and es content key sets match', () => {
    const enKeys = collectKeys(en).sort();
    const esKeys = collectKeys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });
});

describe('D-CON-03 tutorial steps', () => {
  it('unlock cards and highlights exist', () => {
    const cardIds = new Set(cards.map((c) => c.id));
    for (const step of tutorial) {
      expect(step.id).toBeTruthy();
      expect(step.textKey).toBeTruthy();
      for (const id of step.unlockCards ?? []) {
        expect(cardIds.has(id), id).toBe(true);
      }
    }
    expect(tutorial.length).toBe(11);
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });
});
