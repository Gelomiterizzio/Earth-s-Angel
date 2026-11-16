// AI-assisted: Antigravity (Gemini), reviewed by A

export interface I18nService {
  t(key: string, params?: Record<string, string | number>): string;
  getLang(): 'en' | 'es';
  setLang(lang: 'en' | 'es'): void;
  subscribe(fn: () => void): () => void;
  /** 'touch' swaps texts that name keys for their touch-control wording (Mobile/Tablet mode). */
  setVariant?(variant: 'touch' | null): void;
}

type RawJsonModule = { default?: Record<string, unknown> } & Record<string, unknown>;

function flattenInto(
  obj: Record<string, unknown>,
  prefix: string,
  target: Record<string, string>,
  namespace?: string,
): void {
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'default') continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      target[path] = v;
      if (namespace && !path.startsWith(`${namespace}.`)) {
        target[`${namespace}.${path}`] = v;
      }
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flattenInto(v as Record<string, unknown>, path, target, namespace);
    }
  }
}

function loadBundledDictionaries(): Record<'en' | 'es', Record<string, string>> {
  const dicts: Record<'en' | 'es', Record<string, string>> = {
    en: {},
    es: {},
  };

  const modules = import.meta.glob('../data/i18n/*/*.json', {
    eager: true,
  }) as Record<string, RawJsonModule>;

  for (const [filePath, mod] of Object.entries(modules)) {
    const match = /\/i18n\/(en|es)\/([^/]+)\.json$/.exec(filePath.replace(/\\/g, '/'));
    if (!match) continue;
    const lang = match[1] as 'en' | 'es';
    const namespace = match[2];
    const content = (mod.default ?? mod) as Record<string, unknown>;
    flattenInto(content, '', dicts[lang], namespace);
  }

  return dicts;
}

/**
 * Touch wording, kept apart from the main catalogs so it never overwrites them. Each file is
 * flat: the key of the original text and the version for touch controls.
 */
function loadTouchDictionaries(): Record<'en' | 'es', Record<string, string>> {
  const modules = import.meta.glob('../data/i18n-touch/*.json', { eager: true }) as Record<string, RawJsonModule>;
  const out: Record<'en' | 'es', Record<string, string>> = { en: {}, es: {} };
  for (const [filePath, mod] of Object.entries(modules)) {
    const match = /\/(en|es)\.json$/.exec(filePath.replace(/\\/g, '/'));
    if (!match) continue;
    const content = (mod.default ?? mod) as Record<string, unknown>;
    for (const [k, v] of Object.entries(content)) if (typeof v === 'string') out[match[1] as 'en' | 'es'][k] = v;
  }
  return out;
}

export function createI18n(
  initialLang: 'en' | 'es' = 'en',
  customDictionaries?: Partial<Record<'en' | 'es', Record<string, string>>>,
): I18nService {
  const bundled = loadBundledDictionaries();
  const dicts: Record<'en' | 'es', Record<string, string>> = {
    en: { ...bundled.en, ...(customDictionaries?.en ?? {}) },
    es: { ...bundled.es, ...(customDictionaries?.es ?? {}) },
  };

  let currentLang: 'en' | 'es' = initialLang;
  let variant: 'touch' | null = null;
  const touch = loadTouchDictionaries();
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
  }

  const listeners = new Set<() => void>();

  return {
    t(key: string, params?: Record<string, string | number>): string {
      let template = variant === 'touch'
        ? touch[currentLang]?.[key] ?? (currentLang !== 'en' && dicts[currentLang]?.[key] === undefined ? touch.en?.[key] : undefined)
        : undefined;
      if (template === undefined) template = dicts[currentLang]?.[key];
      if (template === undefined && currentLang !== 'en') {
        template = dicts.en?.[key];
      }
      if (template === undefined) {
        if (import.meta.env?.DEV) {
          console.warn(`[i18n] Missing translation key: ${key}`);
        }
        return `[${key}]`;
      }
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (_, token: string) => {
        const val = params[token];
        return val !== undefined ? String(val) : `{${token}}`;
      });
    },

    getLang(): 'en' | 'es' {
      return currentLang;
    },

    setLang(lang: 'en' | 'es'): void {
      if (currentLang === lang) return;
      currentLang = lang;
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = currentLang;
      }
      for (const fn of [...listeners]) {
        fn();
      }
    },

    setVariant(next: 'touch' | null): void {
      if (variant === next) return;
      variant = next;
      for (const fn of [...listeners]) fn();
    },

    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
