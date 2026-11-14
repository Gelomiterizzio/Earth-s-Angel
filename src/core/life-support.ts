// AI-assisted: Antigravity (Gemini), reviewed by A

import type { Building, GameData, Resources } from './types';
import {
  computeAvailableWaterForModules,
  computeRecycledWater,
  stepGreenhouses,
} from './water-food';

export interface ModulesStepResult {
  resources: Resources;
  buildings: Building[];
  produced: { agua: number; oxigeno: number; alimentos: number };
  moduleInputs: { agua: number };
  harvestAmounts: number[];
  extractorRan: boolean;
  recyclerRan: boolean;
  generatorRan: boolean;
  greenhouseRan: boolean;
  greenhouseStressed: boolean;
  noWaterForModule: boolean;
}

export function operateModulesStep(
  resources: Resources,
  buildings: Building[],
  wastewater: number,
  day: number,
  poweredIds: Set<number>,
  activeCrewCount: number,
  data: GameData,
): ModulesStepResult {
  const nextRes: Resources = { ...resources };
  let producedAgua = 0;
  let producedOxigeno = 0;
  let moduleInputsAgua = 0;
  let extractorRan = false;
  let recyclerRan = false;
  let generatorRan = false;
  let noWaterForModule = false;

  // 5.1 Extractor
  const poweredExtractors = buildings
    .filter(
      (b) =>
        b.type === 'extractor' &&
        b.enabled &&
        !b.damaged &&
        day >= b.operationalFromDay &&
        poweredIds.has(b.id),
    )
    .sort((a, b) => a.id - b.id);

  for (const _ext of poweredExtractors) {
    nextRes.agua += data.constants.extractorWater;
    producedAgua += data.constants.extractorWater;
    extractorRan = true;
  }

  // 5.2 Reciclador
  const poweredRecyclers = buildings
    .filter(
      (b) =>
        b.type === 'reciclador' &&
        b.enabled &&
        !b.damaged &&
        day >= b.operationalFromDay &&
        poweredIds.has(b.id),
    )
    .sort((a, b) => a.id - b.id);

  let remainingWastewater = wastewater;
  for (const _rec of poweredRecyclers) {
    const recovered = computeRecycledWater(remainingWastewater, data.constants.recyclePct);
    nextRes.agua += recovered;
    producedAgua += recovered;
    remainingWastewater = 0;
    recyclerRan = true;
  }

  // 5.3 Generador de O2
  const operationalGenerators = buildings
    .filter((b) => b.type === 'generador' && b.enabled && !b.damaged && day >= b.operationalFromDay)
    .sort((a, b) => a.id - b.id);

  for (const gen of operationalGenerators) {
    if (!poweredIds.has(gen.id)) continue;
    const availForModules = computeAvailableWaterForModules(
      nextRes.agua,
      activeCrewCount,
      data.constants.crewNeedPerDay,
    );
    if (availForModules >= data.constants.generatorWaterIn) {
      nextRes.agua -= data.constants.generatorWaterIn;
      moduleInputsAgua += data.constants.generatorWaterIn;
      nextRes.oxigeno += data.constants.generatorOxygenOut;
      producedOxigeno += data.constants.generatorOxygenOut;
      generatorRan = true;
    } else {
      noWaterForModule = true;
    }
  }

  // 5.4 Invernaderos
  const ghOutcome = stepGreenhouses(
    buildings,
    day,
    poweredIds,
    nextRes.agua,
    activeCrewCount,
    data,
  );
  nextRes.agua -= ghOutcome.waterUsed;
  moduleInputsAgua += ghOutcome.waterUsed;
  nextRes.alimentos += ghOutcome.foodProduced;

  if (ghOutcome.noWaterForPoweredGreenhouse) {
    noWaterForModule = true;
  }

  return {
    resources: nextRes,
    buildings: ghOutcome.buildings,
    produced: {
      agua: producedAgua,
      oxigeno: producedOxigeno,
      alimentos: ghOutcome.foodProduced,
    },
    moduleInputs: { agua: moduleInputsAgua },
    harvestAmounts: ghOutcome.harvestAmounts,
    extractorRan,
    recyclerRan,
    generatorRan,
    greenhouseRan: ghOutcome.anyGreenhouseRan,
    greenhouseStressed: ghOutcome.anyGreenhouseStressed,
    noWaterForModule,
  };
}
