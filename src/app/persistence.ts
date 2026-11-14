// AI-assisted: Antigravity (Gemini), reviewed by A

import { deserialize, serialize } from '../core/save';
import type { GameData, GameState } from '../core/types';
import type { StorageLike } from './options';

export const SAVE_STORAGE_KEY = 'ea.save.v1';
export const CORRUPT_STORAGE_KEY = 'ea.save.corrupt';
export const LEARNING_STORAGE_KEY = 'ea.learning.v1';

export interface PersistenceService {
  saveCampaign(state: GameState): boolean;
  loadCampaign(
    data: GameData,
  ):
    | { ok: true; state: GameState }
    | { ok: false; reason: 'ausente' | 'corrupto' | 'incompatible' | 'invalido' };
  clearCampaign(): void;
}

export function createPersistenceService(
  customStorage?: (StorageLike & { removeItem?(k: string): void }) | null,
): PersistenceService {
  const storage =
    customStorage !== undefined
      ? customStorage
      : (() => {
          try {
            return typeof localStorage !== 'undefined' ? localStorage : null;
          } catch {
            return null;
          }
        })();

  return {
    saveCampaign(state: GameState): boolean {
      if (!storage) return false;
      try {
        const payload = serialize(state);
        storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    },

    loadCampaign(data: GameData) {
      if (!storage) return { ok: false, reason: 'ausente' as const };
      let raw: string | null = null;
      try {
        raw = storage.getItem(SAVE_STORAGE_KEY);
      } catch {
        return { ok: false, reason: 'ausente' as const };
      }
      if (!raw) {
        return { ok: false, reason: 'ausente' as const };
      }
      const res = deserialize(raw, data);
      if (!res.ok && res.reason !== 'ausente') {
        try {
          storage.setItem(CORRUPT_STORAGE_KEY, raw);
        } catch {
          // ignore
        }
      }
      return res;
    },

    clearCampaign(): void {
      if (!storage || !storage.removeItem) return;
      try {
        storage.removeItem(SAVE_STORAGE_KEY);
      } catch {
        // ignore
      }
    },
  };
}
