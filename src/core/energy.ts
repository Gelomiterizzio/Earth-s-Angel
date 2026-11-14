// AI-assisted: Antigravity (Gemini), reviewed by A

import type { BuildingType, GameData, MissionState } from './types';

export interface EnergyStepResult {
  start: number;
  generated: number;
  used: number;
  remaining: number;
  shelterActive: boolean;
  poweredIds: Set<number>;
  unpoweredIds: number[];
}

export function isDefaultEnergyOrderValid(
  order: BuildingType[],
  expectedTypes: BuildingType[],
): boolean {
  if (order.length !== expectedTypes.length) return false;
  const set = new Set(order);
  if (set.size !== expectedTypes.length) return false;
  for (const t of expectedTypes) {
    if (!set.has(t)) return false;
  }
  return true;
}

export function getDefaultEnergyPriority(
  levelAvailable: BuildingType[],
  data: GameData,
): BuildingType[] {
  return levelAvailable
    .filter((t) => (data.buildings[t]?.energyPerDay ?? 0) > 0)
    .slice()
    .sort((a, b) => data.buildings[a].priority - data.buildings[b].priority);
}

export function computeEnergyCap(mission: MissionState, day: number, data: GameData): number {
  const levelCfg = data.levels[mission.level] ?? data.levels.luna;
  const activeBatteries = mission.buildings.filter(
    (b) => b.type === 'bateria' && b.enabled && !b.damaged && day >= b.operationalFromDay,
  ).length;
  return levelCfg.baseCaps.energia + activeBatteries * data.constants.batteryCapacity;
}

export function resolveEnergyStep(
  mission: MissionState,
  day: number,
  solarFactorPct: number,
  shelterEnergy: number,
  data: GameData,
): EnergyStepResult {
  const activePanels = mission.buildings.filter(
    (b) => b.type === 'panel' && b.enabled && !b.damaged && day >= b.operationalFromDay,
  ).length;

  const start = mission.resources.energia;
  const generated = Math.floor(
    (activePanels * data.constants.panelOutput * solarFactorPct * (100 - (mission.dust ?? 0))) / 10_000,
  );
  let available = start + generated;
  let used = 0;

  const hasOperationalShelter = mission.buildings.some(
    (b) =>
      (b.type === 'refugio' || b.type === 'habitat') &&
      b.enabled &&
      !b.damaged &&
      day >= b.operationalFromDay,
  );

  let shelterActive = false;
  if (mission.shelterToday && hasOperationalShelter && available >= shelterEnergy) {
    available -= shelterEnergy;
    used += shelterEnergy;
    shelterActive = true;
  }

  const poweredIds = new Set<number>();
  const unpoweredIds: number[] = [];

  for (const bType of mission.energyPriority) {
    const candidates = mission.buildings
      .filter((b) => b.type === bType && b.enabled && !b.damaged && day >= b.operationalFromDay)
      .slice()
      .sort((a, b) => a.id - b.id);

    for (const b of candidates) {
      const need = data.buildings[b.type]?.energyPerDay ?? 0;
      if (need <= 0) {
        poweredIds.add(b.id);
      } else if (available >= need) {
        available -= need;
        used += need;
        poweredIds.add(b.id);
      } else {
        unpoweredIds.push(b.id);
      }
    }
  }

  return {
    start,
    generated,
    used,
    remaining: available,
    shelterActive,
    poweredIds,
    unpoweredIds,
  };
}
