// AI-assisted: Antigravity (Gemini), reviewed by A

export interface I18nService {
  t(key: string, params?: Record<string, string | number>): string;
  getLang(): 'en' | 'es';
  setLang(lang: 'en' | 'es'): void;
  subscribe(fn: () => void): () => void;
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
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
  }

  const listeners = new Set<() => void>();

  return {
    t(key: string, params?: Record<string, string | number>): string {
      let template = dicts[currentLang]?.[key];
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

    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
