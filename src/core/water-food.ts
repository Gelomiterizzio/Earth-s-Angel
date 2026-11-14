// AI-assisted: Antigravity (Gemini), reviewed by A

import type { Building, GameData } from './types';

export function computeRecycledWater(wastewater: number, recyclePct: number): number {
  return Math.floor((wastewater * recyclePct) / 100);
}

export function computeAvailableWaterForModules(
  currentWater: number,
  activeCrewCount: number,
  crewNeedPerDay: number,
): number {
  return Math.max(0, currentWater - activeCrewCount * crewNeedPerDay);
}

export interface GreenhouseStepOutcome {
  buildings: Building[];
  waterUsed: number;
  foodProduced: number;
  harvestAmounts: number[];
  anyGreenhouseRan: boolean;
  anyGreenhouseStressed: boolean;
  noWaterForPoweredGreenhouse: boolean;
}

export function stepGreenhouses(
  buildings: Building[],
  day: number,
  poweredIds: Set<number>,
  initialWater: number,
  activeCrewCount: number,
  data: GameData,
): GreenhouseStepOutcome {
  let water = initialWater;
  let waterUsed = 0;
  let foodProduced = 0;
  const harvestAmounts: number[] = [];
  let anyGreenhouseRan = false;
  let anyGreenhouseStressed = false;
  let noWaterForPoweredGreenhouse = false;

  const updated = buildings.map((b) => ({ ...b }));
  const operationalGreenhouses = updated
    .filter((b) => b.type === 'invernadero' && !b.damaged && day >= b.operationalFromDay)
    .sort((a, b) => a.id - b.id);

  for (const gh of operationalGreenhouses) {
    const isPowered = gh.enabled && poweredIds.has(gh.id);
    const availableForModules = computeAvailableWaterForModules(
      water,
      activeCrewCount,
      data.constants.crewNeedPerDay,
    );

    if (isPowered && availableForModules >= data.constants.greenhouseWaterIn) {
      water -= data.constants.greenhouseWaterIn;
      waterUsed += data.constants.greenhouseWaterIn;
      gh.growth += 1;
      anyGreenhouseRan = true;
    } else {
      if (isPowered && availableForModules < data.constants.greenhouseWaterIn) {
        noWaterForPoweredGreenhouse = true;
      }
      gh.stress += 1;
      anyGreenhouseStressed = true;
    }

    if (gh.growth >= data.constants.greenhouseCycleDays) {
      const harvest = Math.max(
        0,
        data.constants.greenhouseHarvest - data.constants.greenhouseStressPenalty * gh.stress,
      );
      foodProduced += harvest;
      harvestAmounts.push(harvest);
      gh.growth = 0;
      gh.stress = 0;
    }
  }

  return {
    buildings: updated,
    waterUsed,
    foodProduced,
    harvestAmounts,
    anyGreenhouseRan,
    anyGreenhouseStressed,
    noWaterForPoweredGreenhouse,
  };
}
