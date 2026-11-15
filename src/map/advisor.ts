// AI-assisted: Claude Code (claude-opus-5-5). Human review by C pending.
// Mission control advisor for the field view. It reads the state and the HUD summary and
// says which life-support reserve runs out first and what the base is missing to make it.
// It never changes the game.
import type { BuildingType, GameData, GameState } from '../core/types';
import { summarizeHud } from '../core';

export type Reserve = 'oxigeno' | 'agua' | 'alimentos';

export interface LifeSupportAdvice {
  reserve: Reserve;
  /** Whole days (sols on Mars) the reserve still covers the crew. */
  days: number;
  severity: 'preventivo' | 'critico';
  /** What mission control suggests, or null when the producer is already working. */
  tip: 'build' | 'fix' | 'power' | null;
  /** The building the tip is about, when there is one. */
  building: BuildingType | null;
}

/** Days of margin at or below which the advisor speaks up. */
export const ADVISOR_WARN_DAYS = 3;

const PRODUCERS: Record<Reserve, readonly BuildingType[]> = {
  oxigeno: ['generador'],
  agua: ['extractor', 'reciclador'],
  alimentos: ['invernadero'],
};

export function lifeSupportAdvice(state: GameState, data: GameData): LifeSupportAdvice | null {
  const { mission } = state;
  if (mission.phase !== 'planning' || mission.result) return null;
  const crew = Math.max(1, mission.crew.filter((member) => member.health > 0).length);
  const need = Math.max(1, crew * data.constants.crewNeedPerDay);
  const reserves: Reserve[] = ['oxigeno', 'agua', 'alimentos'];
  const days = (reserve: Reserve): number => Math.floor(mission.resources[reserve] / need);
  const reserve = reserves.reduce((low, next) => (days(next) < days(low) ? next : low));
  const left = days(reserve);
  if (left > ADVISOR_WARN_DAYS) return null;

  const severity = left <= 1 ? 'critico' : 'preventivo';
  const available = new Set(data.levels[mission.level]?.availableBuildings ?? []);
  const producers = mission.buildings.filter((b) => PRODUCERS[reserve].includes(b.type));
  const working = producers.filter((b) => b.enabled && !b.damaged && b.operationalFromDay <= mission.day);
  const advice = { reserve, days: left, severity } as const;

  if (producers.length === 0) {
    const building = PRODUCERS[reserve].find((type) => available.has(type)) ?? null;
    return { ...advice, tip: building ? 'build' : null, building };
  }
  if (working.length === 0) {
    // Under construction counts as "on the way": no tip until it should be running.
    const pending = producers.find((b) => b.operationalFromDay > mission.day);
    if (pending) return { ...advice, tip: null, building: pending.type };
    return { ...advice, tip: 'fix', building: producers[0].type };
  }
  // Built and switched on, but the energy step leaves life support without power.
  if (summarizeHud(state, data).energia.status === 'critico') {
    return { ...advice, tip: 'power', building: working[0].type };
  }
  return { ...advice, tip: null, building: working[0].type };
}
