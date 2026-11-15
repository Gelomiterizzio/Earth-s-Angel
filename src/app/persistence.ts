// AI-assisted: Antigravity (Gemini), reviewed by A

import { deserialize, serialize } from '../core/save';
import { parseMapTiles } from '../core/mission';
import type { GameData, GameState, SaveData } from '../core/types';
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

function migrateSurveyMap(raw: string, data: GameData) {
  try {
    const envelope = JSON.parse(raw) as Partial<SaveData> | null;
    const state = envelope?.state;
    if (envelope?.schema !== 'earths-angel/save' || envelope.version !== 1 || !state) return null;
    const { mission, campaign } = state;
    const { level: id, map } = mission;
    if (id !== 'luna' && id !== 'marte') return null;
    const level = data.levels[id];
    if (!level) return null;
    const { width, height, tiles: oldTiles } = map;
    if (width === level.width && height === level.height) return null;
    const beforeLunarShift = id === 'luna' && ((width === 12 && height === 12) || (width === 30 && height === 28));
    const beforeExpansion = id === 'luna' ? width === 51 && height === 51 : width === 20 && height === 20;
    if ((!beforeLunarShift && !beforeExpansion) || oldTiles.length !== width * height) return null;
    const offset = beforeLunarShift ? 20 : 0;
    if (width + offset > level.width || height + offset > level.height) return null;

    const tiles = parseMapTiles(level.rows, level.width, level.height, level.ship, level.initialExploredRadius);
    for (const [index, tile] of oldTiles.entries()) {
      if (tile.x !== index % width || tile.y !== Math.floor(index / width)
        || typeof tile.explored !== 'boolean' || typeof tile.collected !== 'boolean') return null;
      const target = tiles[(tile.y + offset) * level.width + tile.x + offset];
      target.explored ||= tile.explored;
      target.collected = tile.collected;
    }
    mission.map = { width: level.width, height: level.height, tiles };
    if (beforeLunarShift) {
      const shiftId = (clue: string): string =>
        clue.replace(/^misterio-(\d+)-(\d+)$/, (_, x: string, y: string) =>
          `misterio-${Number(x) + offset}-${Number(y) + offset}`);
      mission.buildings = mission.buildings.map((b) => ({ ...b, x: b.x + offset, y: b.y + offset }));
      mission.discoveries = mission.discoveries.map(shiftId);
      campaign.clues = campaign.clues.map(shiftId);
      const signal = campaign.clueSignals?.luna;
      if (signal && campaign.clueSignals) {
        campaign.clueSignals.luna = { ...signal, x: signal.x + offset, y: signal.y + offset };
      }
    }
    const migrated = deserialize(envelope, data);
    return migrated.ok ? migrated : null;
  } catch {
    return null;
  }
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
      const parsed = deserialize(raw, data);
      const res = !parsed.ok && parsed.reason === 'invalido'
        ? migrateSurveyMap(raw, data) ?? parsed
        : parsed;
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
