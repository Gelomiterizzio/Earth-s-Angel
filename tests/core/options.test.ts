// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import {
  createOptionsService,
  getDefaultOptions,
  OPTIONS_STORAGE_KEY,
  type StorageLike,
} from '../../src/app/options';
import { createStore } from '../../src/app/store';
import { fixtureState } from '../../src/core/fixtures';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function createMemoryStorage(initial?: Record<string, string>): StorageLike & {
  dump: Record<string, string>;
} {
  const dump: Record<string, string> = { ...(initial ?? {}) };
  return {
    dump,
    getItem(key: string): string | null {
      return key in dump ? dump[key] : null;
    },
    setItem(key: string, value: string): void {
      dump[key] = value;
    },
  };
}

describe('Options persistence and validation (U-OPC-01..04)', () => {
  it('U-OPC-01: with nothing saved, returns the default options from the spec', () => {
    const mem = createMemoryStorage();
    const opts = createOptionsService(mem);
    expect(opts.get()).toEqual({
      language: 'en',
      volumeMaster: 80,
      volumeMusic: 60,
      volumeSfx: 80,
      muted: false,
      subtitles: true,
      reducedMotion: false,
      fullscreen: false,
      tutorial: true,
      learningCheck: true,
      randomMap: true,
      platform: 'pc',
    });
  });

  it('U-OPC-02: changing options and recreating the service preserves the values without altering GameState', () => {
    const mem = createMemoryStorage();
    const state = fixtureState('media-dia-1');
    const store = createStore(data, state);

    const opts1 = createOptionsService(mem);
    opts1.set('language', 'es');
    opts1.set('volumeMusic', 35);
    opts1.set('muted', true);

    const opts2 = createOptionsService(mem);
    expect(opts2.get().language).toBe('es');
    expect(opts2.get().volumeMusic).toBe(35);
    expect(opts2.get().muted).toBe(true);
    expect(store.getState()).toBe(state);
  });

  it('U-OPC-03: non-JSON text in ea.options.v1 falls back to defaults without throwing', () => {
    const mem = createMemoryStorage({
      [OPTIONS_STORAGE_KEY]: '<<<not valid json>>>',
    });
    expect(() => createOptionsService(mem)).not.toThrow();
    const opts = createOptionsService(mem);
    expect(opts.get()).toEqual(getDefaultOptions());
  });

  it('U-OPC-04: invalid volume 500 resets only that field to default while keeping valid fields', () => {
    const mem = createMemoryStorage({
      [OPTIONS_STORAGE_KEY]: JSON.stringify({
        language: 'es',
        volumeMaster: 500,
        volumeMusic: 45,
        volumeSfx: 70,
        muted: true,
        subtitles: false,
        reducedMotion: true,
        fullscreen: false,
        tutorial: false,
        learningCheck: true,
      }),
    });

    const opts = createOptionsService(mem);
    const val = opts.get();
    expect(val.volumeMaster).toBe(80); // reset to default
    expect(val.language).toBe('es');
    expect(val.volumeMusic).toBe(45);
    expect(val.volumeSfx).toBe(70);
    expect(val.muted).toBe(true);
    expect(val.subtitles).toBe(false);
    expect(val.reducedMotion).toBe(true);
    expect(val.tutorial).toBe(false);
  });
});
