// AI-assisted: Antigravity (Gemini), reviewed by A

import { isCanonicalSeed } from '../core/rng';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRandomSeed(length = 8): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = (i * 37 + 101) & 0xff;
    }
  }
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function resolveSeed(search?: string): { seed: string; canonical: boolean } {
  const rawSearch =
    search !== undefined
      ? search
      : typeof location !== 'undefined'
        ? location.search
        : '';

  const params = new URLSearchParams(rawSearch);
  const param = params.get('seed')?.trim();

  if (param === 'demo') {
    return { seed: 'EA-DEMO', canonical: true };
  }
  if (param && param.length > 0) {
    return { seed: param, canonical: isCanonicalSeed(param) };
  }
  return { seed: generateRandomSeed(8), canonical: false };
}
