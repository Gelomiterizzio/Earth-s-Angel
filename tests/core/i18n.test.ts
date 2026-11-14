// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { createI18n } from '../../src/app/i18n';
import enSim from '../../src/data/i18n/en/sim.json';
import esSim from '../../src/data/i18n/es/sim.json';
import enContent from '../../src/data/i18n/en/content.json';
import esContent from '../../src/data/i18n/es/content.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      keys.push(path);
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, path));
    }
  }
  return keys.sort();
}

describe('Localization i18n (U-LOC-01..03)', () => {
  it('U-LOC-01: substitutes parameters {need} and {have} in active language', () => {
    const i18n = createI18n('en');
    const enMsg = i18n.t('sim.error.NO_MATERIALS', { need: 6, have: 5 });
    expect(enMsg).toContain('6');
    expect(enMsg).toContain('5');

    i18n.setLang('es');
    expect(i18n.getLang()).toBe('es');
    const esMsg = i18n.t('sim.error.NO_MATERIALS', { need: 6, have: 5 });
    expect(esMsg).toContain('6');
    expect(esMsg).toContain('5');
    expect(esMsg).not.toBe(enMsg);
  });

  it('U-LOC-02: falls back to English when missing in Spanish, and returns [key] when missing in both', () => {
    const i18n = createI18n('es', {
      en: { 'custom.only.en': 'English fallback {n}' },
      es: {},
    });

    expect(i18n.t('custom.only.en', { n: 42 })).toBe('English fallback 42');
    expect(i18n.t('nonexistent.key.xyz')).toContain('nonexistent.key.xyz');
  });

  it('U-LOC-03: en/*.json and es/*.json have identical key sets', () => {
    expect(collectKeys(enSim)).toEqual(collectKeys(esSim));
    expect(collectKeys(enContent)).toEqual(collectKeys(esContent));
  });
});
