// AI-assisted: Antigravity (Gemini), reviewed by A

import type { GameData, GameState, SaveData } from './types';
import { validateState } from './validate';

export function serialize(state: GameState): SaveData {
  return {
    schema: 'earths-angel/save',
    version: 1,
    savedAtDay: state.mission.day,
    state: JSON.parse(JSON.stringify(state)) as GameState,
  };
}

export function deserialize(
  raw: unknown,
  data: GameData,
):
  | { ok: true; state: GameState }
  | { ok: false; reason: 'ausente' | 'corrupto' | 'incompatible' | 'invalido' } {
  if (raw === null || raw === undefined || raw === '') {
    return { ok: false, reason: 'ausente' };
  }

  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, reason: 'corrupto' };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, reason: 'corrupto' };
  }

  const envelope = parsed as Partial<SaveData>;
  if (envelope.schema !== 'earths-angel/save' || envelope.version !== 1) {
    return { ok: false, reason: 'incompatible' };
  }

  if (!envelope.state || typeof envelope.state !== 'object') {
    return { ok: false, reason: 'invalido' };
  }

  try {
    if (validateState(envelope.state, data).length > 0) return { ok: false, reason: 'invalido' };
  } catch {
    return { ok: false, reason: 'invalido' };
  }

  const state = JSON.parse(JSON.stringify(envelope.state)) as GameState;
  // P0 saves can lack energy-priority entries added for the secret route.
  for (const type of data.levels[state.mission.level]?.availableBuildings ?? []) {
    if (data.buildings[type].energyPerDay > 0 && !state.mission.energyPriority.includes(type)) {
      state.mission.energyPriority.push(type);
    }
  }
  return { ok: true, state };
}
