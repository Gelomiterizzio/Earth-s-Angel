// AI-assisted: Claude Code (claude-opus-5-5).
import { describe, expect, it } from 'vitest';
import { createOptionsService, getDefaultOptions, OPTIONS_STORAGE_KEY, sanitizeOptions } from '../../src/app/options';
import { createI18n } from '../../src/app/i18n';
import enTouch from '../../src/data/i18n-touch/en.json';
import esTouch from '../../src/data/i18n-touch/es.json';
import { CONTROL_LABEL_KEYS } from '../../src/ui/shortcuts';

const memory = (seed: Record<string, string> = {}) => {
  const data = new Map(Object.entries(seed));
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
};

describe('platform mode', () => {
  it('starts on PC, accepts Mobile/Tablet, and a new session never restores it from storage', () => {
    expect(getDefaultOptions().platform).toBe('pc');
    expect(sanitizeOptions({ platform: 'mobile' }).platform).toBe('mobile');
    expect(sanitizeOptions({ platform: 'tv' }).platform).toBe('pc');
    const storage = memory();
    const first = createOptionsService(storage);
    first.set('platform', 'mobile');
    expect(first.get().platform).toBe('mobile');
    const saved = JSON.parse(storage.getItem(OPTIONS_STORAGE_KEY) ?? '{}');
    expect(saved.platform).toBe('mobile');
    // Next session: options load again and the platform is back to PC.
    expect(createOptionsService(storage).get().platform).toBe('pc');
  });

  it('touch wording replaces only existing texts, in both languages', () => {
    const i18n = createI18n('en');
    for (const [name, catalog] of [['en', enTouch], ['es', esTouch]] as const) {
      i18n.setLang(name);
      for (const key of Object.keys(catalog)) {
        expect(i18n.t(key), `${name}: ${key} must exist in the main catalog`).not.toMatch(/^\[/);
      }
    }
    expect(Object.keys(enTouch).sort()).toEqual(Object.keys(esTouch).sort());
  });

  it('switches every control label to touch and back without touching other texts', () => {
    const i18n = createI18n('es');
    const pc = CONTROL_LABEL_KEYS.map((key) => i18n.t(key));
    i18n.setVariant?.('touch');
    const touch = CONTROL_LABEL_KEYS.map((key) => i18n.t(key));
    expect(touch.join(' ')).not.toMatch(/\bWASD\b/);
    expect(i18n.t('content.map.walk.goal')).toContain('✋');
    expect(i18n.t('ui.title.newGame')).toBe(createI18n('es').t('ui.title.newGame'));
    i18n.setVariant?.(null);
    expect(CONTROL_LABEL_KEYS.map((key) => i18n.t(key))).toEqual(pc);
  });
});
