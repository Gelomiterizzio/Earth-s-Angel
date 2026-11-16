// AI-assisted: Antigravity (Gemini), reviewed by A

import type { Options, OptionsService } from './context';

export const OPTIONS_STORAGE_KEY = 'ea.options.v1';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function getDefaultOptions(): Options {
  const prefersReduced =
    typeof matchMedia !== 'undefined' &&
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    language: 'en',
    volumeMaster: 80,
    volumeMusic: 60,
    volumeSfx: 80,
    muted: false,
    subtitles: true,
    reducedMotion: Boolean(prefersReduced),
    fullscreen: false,
    tutorial: true,
    learningCheck: true,
    randomMap: true,
  };
}

function isValidVolume(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;
}

export function sanitizeOptions(raw: unknown, defaults = getDefaultOptions()): Options {
  if (!raw || typeof raw !== 'object') {
    return { ...defaults };
  }
  const obj = raw as Record<string, unknown>;
  return {
    language: obj.language === 'en' || obj.language === 'es' ? obj.language : defaults.language,
    volumeMaster: isValidVolume(obj.volumeMaster)
      ? Math.round(obj.volumeMaster)
      : defaults.volumeMaster,
    volumeMusic: isValidVolume(obj.volumeMusic)
      ? Math.round(obj.volumeMusic)
      : defaults.volumeMusic,
    volumeSfx: isValidVolume(obj.volumeSfx)
      ? Math.round(obj.volumeSfx)
      : defaults.volumeSfx,
    muted: typeof obj.muted === 'boolean' ? obj.muted : defaults.muted,
    subtitles: typeof obj.subtitles === 'boolean' ? obj.subtitles : defaults.subtitles,
    reducedMotion:
      typeof obj.reducedMotion === 'boolean' ? obj.reducedMotion : defaults.reducedMotion,
    fullscreen: typeof obj.fullscreen === 'boolean' ? obj.fullscreen : defaults.fullscreen,
    tutorial: typeof obj.tutorial === 'boolean' ? obj.tutorial : defaults.tutorial,
    learningCheck:
      typeof obj.learningCheck === 'boolean' ? obj.learningCheck : defaults.learningCheck,
    randomMap: typeof obj.randomMap === 'boolean' ? obj.randomMap : defaults.randomMap,
  };
}

function resolveDefaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // localStorage blocked
  }
  return null;
}

export function createOptionsService(customStorage?: StorageLike | null): OptionsService {
  const storage = customStorage !== undefined ? customStorage : resolveDefaultStorage();
  const defaults = getDefaultOptions();

  let current: Options = { ...defaults };
  if (storage) {
    try {
      const raw = storage.getItem(OPTIONS_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        current = sanitizeOptions(parsed, defaults);
      }
    } catch {
      current = { ...defaults };
    }
  }

  function applyDomClasses(opts: Options): void {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = opts.language;
    const stage = document.getElementById('stage');
    if (stage) {
      stage.classList.toggle('reduced-motion', opts.reducedMotion);
    }
  }

  function persist(opts: Options): void {
    if (!storage) return;
    try {
      storage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(opts));
    } catch {
      // ignore storage quota/security errors
    }
  }

  applyDomClasses(current);
  const listeners = new Set<(o: Options) => void>();

  function notify(): void {
    const snapshot = { ...current };
    for (const fn of [...listeners]) {
      fn(snapshot);
    }
  }

  return {
    get(): Options {
      return { ...current };
    },

    set<K extends keyof Options>(key: K, value: Options[K]): void {
      const candidate = sanitizeOptions({ ...current, [key]: value }, defaults);
      current = candidate;
      applyDomClasses(current);
      persist(current);
      notify();
    },

    reset(): void {
      current = { ...getDefaultOptions() };
      applyDomClasses(current);
      persist(current);
      notify();
    },

    subscribe(listener: (o: Options) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
