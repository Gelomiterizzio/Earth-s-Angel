// AI-assisted: Antigravity (Gemini), reviewed by A

import type {
  DefeatCause,
  GameData,
  GameState,
  HudSummary,
  MissionResult,
  ObjectiveId,
  ObjectiveStatus,
  RadiationLevel,
  Status,
} from './types';
import { resolveEnergyStep } from './energy';
import { getForecast, getRadiationForDay, getSolarFactorForDay } from './events';
import { forecastHorizon } from './progression';
import { getOperationalShelterSeats } from './radiation';

export interface DayStabilityFacts {
  lsOk: boolean;
  greenhouseRan: boolean;
  noShortage: boolean;
  protectedToday: boolean;
  reservesOk: boolean;
  energyOk: boolean;
  stable: boolean;
}

export function computeDayStability(
  state: GameState,
  data: GameData,
  facts: {
    lsOk: boolean;
    greenhouseRan: boolean;
    shortages: { oxigeno: number; agua: number; alimentos: number };
    radiationLevel: RadiationLevel;
    allCrewSheltered: boolean;
  },
): DayStabilityFacts {
  const { mission, campaign } = state;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;

  const noShortage =
    facts.shortages.oxigeno === 0 &&
    facts.shortages.agua === 0 &&
    facts.shortages.alimentos === 0;
  const protectedToday = facts.radiationLevel === 0 || facts.allCrewSheltered;
  const reservesOk =
    mission.resources.oxigeno >= cfg.reserveThreshold &&
    mission.resources.agua >= cfg.reserveThreshold &&
    mission.resources.alimentos >= cfg.reserveThreshold;
  const energyOk = mission.resources.energia >= cfg.energyThreshold;
  const linkOk = mission.level !== 'marte' || (mission.linkStreak ?? 0) > 0;
  const stable = facts.lsOk && noShortage && protectedToday && reservesOk && energyOk && linkOk;

  return {
    lsOk: facts.lsOk,
    greenhouseRan: facts.greenhouseRan,
    noShortage,
    protectedToday,
    reservesOk,
    energyOk,
    stable,
  };
}

export function evaluateObjectives(
  state: GameState,
  data: GameData,
  today: { lsOk: boolean; greenhouseRan: boolean; stable: boolean } = {
    lsOk: false,
    greenhouseRan: false,
    stable: false,
  },
): ObjectiveStatus[] {
  const { mission, campaign } = state;
  const levelCfg = data.levels[mission.level] ?? data.levels.luna;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;
  const day = mission.day;

  const activePanels = mission.buildings.filter(
    (b) => b.type === 'panel' && b.enabled && !b.damaged && day >= b.operationalFromDay,
  ).length;
  const nominalGen = activePanels * data.constants.panelOutput;
  const nominalConsumption = mission.buildings
    .filter((b) => b.enabled && !b.damaged && day >= b.operationalFromDay)
    .reduce((sum, b) => sum + (data.buildings[b.type]?.energyPerDay ?? 0), 0);

  const energyOk = mission.resources.energia >= cfg.energyThreshold;
  const reservesMin = Math.min(
    mission.resources.oxigeno,
    mission.resources.agua,
    mission.resources.alimentos,
  );
  const reservesOk =
    mission.resources.oxigeno >= cfg.reserveThreshold &&
    mission.resources.agua >= cfg.reserveThreshold &&
    mission.resources.alimentos >= cfg.reserveThreshold;

  const shelterSeats = getOperationalShelterSeats(mission.buildings, day, data);
  const allRadiationFinished = mission.schedule
    .filter((e) => (e.radiationLevel ?? 0) > 0)
    .every((e) => e.startDay + e.durationDays - 1 <= day);
  const noLimitExceeded = mission.crew.every((c) => c.exposure < data.constants.exposureLimit);

  return levelCfg.objectives.map((id: ObjectiveId): ObjectiveStatus => {
    switch (id) {
      case 'soporte':
        return { id: 'soporte', met: today.lsOk };
      case 'energia':
        return {
          id: 'energia',
          met: energyOk && nominalGen >= nominalConsumption,
          current: mission.resources.energia,
          target: cfg.energyThreshold,
        };
      case 'alimentos':
        return {
          id: 'alimentos',
          met: today.greenhouseRan && mission.harvests >= 1,
          current: mission.harvests,
          target: 1,
        };
      case 'reservas':
        return {
          id: 'reservas',
          met: reservesOk,
          current: reservesMin,
          target: cfg.reserveThreshold,
        };
      case 'proteccion':
        return {
          id: 'proteccion',
          met: shelterSeats >= mission.crew.length && allRadiationFinished && noLimitExceeded,
          current: shelterSeats,
          target: mission.crew.length,
        };
      case 'racha':
        return {
          id: 'racha',
          met: mission.streak >= cfg.streakDays,
          current: mission.streak,
          target: cfg.streakDays,
        };
      case 'comunicaciones':
        return {
          id: 'comunicaciones',
          met: (mission.linkStreak ?? 0) >= (cfg.linkDays ?? 1),
          current: mission.linkStreak ?? 0,
          target: cfg.linkDays ?? 1,
        };
      case 'autonomia':
        return {
          id: 'autonomia',
          met: mission.streak >= cfg.streakDays && (mission.dust ?? 0) < (cfg.dustCap ?? Infinity),
          current: mission.streak,
          target: cfg.streakDays,
        };
    }
  });
}

export function buildCauseEffectKeys(params: {
  solarFactorPct: number;
  unpoweredCount: number;
  noWaterForModule: boolean;
  greenhouseStressed: boolean;
  harvestCount: number;
  energyWasted: number;
  shortages: { oxigeno: number; agua: number; alimentos: number };
  radiationLevel: RadiationLevel;
  allCrewSheltered: boolean;
  enteredObservation: boolean;
  prevStreak: number;
  nextStreak: number;
  stability: DayStabilityFacts;
  prevObjectives: ObjectiveStatus[];
  nextObjectives: ObjectiveStatus[];
}): string[] {
  const keys: string[] = [];

  // 1. Shortages
  if (params.shortages.oxigeno > 0) keys.push('sim.cause.shortage.oxigeno');
  if (params.shortages.agua > 0) keys.push('sim.cause.shortage.agua');
  if (params.shortages.alimentos > 0) keys.push('sim.cause.shortage.alimentos');

  // 2. Radiation
  if (params.radiationLevel > 0) {
    keys.push(params.allCrewSheltered ? 'sim.cause.sheltered' : 'sim.cause.unsheltered');
  }
  if (params.enteredObservation) {
    keys.push('sim.cause.observation');
  }

  // 3. Streak reset
  if (params.prevStreak > 0 && params.nextStreak === 0) {
    if (!params.stability.noShortage) {
      keys.push('sim.cause.streakReset.escasez');
    } else if (!params.stability.protectedToday) {
      keys.push('sim.cause.streakReset.proteccion');
    } else if (!params.stability.lsOk) {
      keys.push('sim.cause.streakReset.soporte');
    } else if (!params.stability.reservesOk) {
      keys.push('sim.cause.streakReset.reservas');
    } else if (!params.stability.energyOk) {
      keys.push('sim.cause.streakReset.energia');
    }
  }

  // 4. Unpowered modules & low light & water/greenhouse
  if (params.unpoweredCount > 0) {
    keys.push('sim.cause.unpowered');
  }
  if (params.solarFactorPct < 100) {
    keys.push('sim.cause.lowLight');
  }
  if (params.noWaterForModule) {
    keys.push('sim.cause.noWaterForModule');
  }
  if (params.greenhouseStressed) {
    keys.push('sim.cause.greenhouseStress');
  }

  // 5. Rest (harvest, streakUp, objectives, energyWasted)
  if (params.harvestCount > 0) {
    keys.push('sim.cause.harvest');
  }
  if (params.nextStreak > params.prevStreak) {
    keys.push('sim.cause.streakUp');
  }
  for (const nextObj of params.nextObjectives) {
    const prevObj = params.prevObjectives.find((o) => o.id === nextObj.id);
    if (nextObj.met && (!prevObj || !prevObj.met)) {
      keys.push(`sim.cause.objectiveMet.${nextObj.id}`);
    }
  }
  if (params.energyWasted > 0) {
    keys.push('sim.cause.energyWasted');
  }

  return keys.slice(0, 5);
}

function missingEssentialBuilding(state: GameState): boolean {
  const types = new Set(state.mission.buildings.map((building) => building.type));
  return (['panel', 'extractor', 'reciclador', 'generador', 'invernadero', 'comunicaciones'] as const)
    .some((type) => !types.has(type))
    || (!types.has('refugio') && !types.has('habitat'));
}

export function evaluateMissionOutcome(params: {
  state: GameState;
  data: GameData;
  closedDay: number;
  nextEarthDaysRemaining: number;
  objectives: ObjectiveStatus[];
  shortages: { oxigeno: number; agua: number; alimentos: number };
  incidents: string[];
}): MissionResult | null {
  const { state, data, closedDay, nextEarthDaysRemaining, objectives, shortages, incidents } =
    params;
  const { mission, campaign } = state;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;

  let outcome: 'victory' | 'defeat' | null = null;
  let cause: DefeatCause | undefined;

  if (mission.crew.some((c) => c.health <= 0)) {
    outcome = 'defeat';
    cause = 'soporte-vital';
  } else if (mission.crew.some((c) => c.exposure >= data.constants.exposureLimit)) {
    outcome = 'defeat';
    cause = 'exposicion';
  } else if (objectives.length > 0 && objectives.every((o) => o.met)) {
    outcome = 'victory';
  } else if (
    mission.level === 'marte' && mission.resources.materiales === 0
    && mission.map.tiles.every((tile) => tile.terrain !== 'mineral' || tile.collected)
    && missingEssentialBuilding(state)
  ) {
    outcome = 'defeat';
    cause = 'escasez';
  } else if (cfg.maxLinkOutage !== undefined && (mission.linkOutageDays ?? 0) > cfg.maxLinkOutage) {
    outcome = 'defeat';
    cause = 'objetivos';
  } else if (
    (cfg.dayLimit !== null && closedDay >= cfg.dayLimit) ||
    nextEarthDaysRemaining <= 0
  ) {
    outcome = 'defeat';
    cause = 'plazo';
  }

  if (!outcome) return null;

  let principleKey = 'sim.principle.victory';
  let suggestionKey = 'sim.suggestion.victory';

  if (outcome === 'defeat') {
    if (cause === 'soporte-vital') {
      if (shortages.oxigeno > 0 || mission.resources.oxigeno === 0) {
        principleKey = 'sim.principle.soporte-vital.oxigeno';
        suggestionKey = 'sim.suggestion.soporte-vital.oxigeno';
      } else if (shortages.agua > 0 || mission.resources.agua === 0) {
        principleKey = 'sim.principle.soporte-vital.agua';
        suggestionKey = 'sim.suggestion.soporte-vital.agua';
      } else {
        principleKey = 'sim.principle.soporte-vital.alimentos';
        suggestionKey = 'sim.suggestion.soporte-vital.alimentos';
      }
    } else if (cause === 'exposicion') {
      principleKey = 'sim.principle.exposicion';
      suggestionKey = 'sim.suggestion.exposicion';
    } else if (cause === 'plazo') {
      const protMet = objectives.find((o) => o.id === 'proteccion')?.met ?? false;
      const rachaMet = objectives.find((o) => o.id === 'racha')?.met ?? false;
      const resMet = objectives.find((o) => o.id === 'reservas')?.met ?? false;
      if (!protMet) {
        principleKey = 'sim.principle.plazo.proteccion';
        suggestionKey = 'sim.suggestion.plazo.proteccion';
      } else if (!rachaMet || !resMet) {
        principleKey = 'sim.principle.plazo.racha';
        suggestionKey = 'sim.suggestion.plazo.racha';
      } else {
        principleKey = 'sim.principle.plazo.otro';
        suggestionKey = 'sim.suggestion.plazo.otro';
      }
    } else if (cause === 'escasez') {
      principleKey = 'sim.principle.escasez';
      suggestionKey = 'sim.suggestion.escasez';
    } else {
      principleKey = 'sim.principle.objetivos';
      suggestionKey = 'sim.suggestion.objetivos';
    }
  }

  const maxExposure = Math.max(0, ...mission.crew.map((c) => c.exposure));
  const result: MissionResult = {
    outcome,
    ...(cause ? { cause } : {}),
    level: mission.level,
    difficulty: campaign.difficulty,
    seed: campaign.seed,
    daysUsed: closedDay,
    earthDaysRemaining: nextEarthDaysRemaining,
    resources: { ...mission.resources },
    margins: {
      oxigeno: mission.resources.oxigeno - cfg.reserveThreshold,
      agua: mission.resources.agua - cfg.reserveThreshold,
      alimentos: mission.resources.alimentos - cfg.reserveThreshold,
      energia: mission.resources.energia - cfg.energyThreshold,
    },
    maxExposure,
    incidents: [...new Set(incidents)],
    principleKey,
    suggestionKey,
  };

  return result;
}

export function previewEnergy(
  state: GameState,
  data: GameData,
): { generated: number; demand: number; shelterAffordable: boolean } {
  const { mission, campaign } = state;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;
  const solar = getSolarFactorForDay(mission.schedule, mission.day);

  const activePanels = mission.buildings.filter(
    (b) => b.type === 'panel' && b.enabled && !b.damaged && mission.day >= b.operationalFromDay,
  ).length;

  const generated = Math.floor((activePanels * data.constants.panelOutput * solar * (100 - (mission.dust ?? 0))) / 10_000);
  const moduleDemand = mission.buildings
    .filter((b) => b.enabled && !b.damaged && mission.day >= b.operationalFromDay)
    .reduce((sum, b) => sum + (data.buildings[b.type]?.energyPerDay ?? 0), 0);

  const demand = moduleDemand + (mission.shelterToday ? cfg.shelterEnergy : 0);
  const hasShelter = getOperationalShelterSeats(mission.buildings, mission.day, data) > 0;
  const shelterAffordable =
    hasShelter && mission.resources.energia + generated >= cfg.shelterEnergy;

  return { generated, demand, shelterAffordable };
}

export function summarizeHud(state: GameState, data: GameData): HudSummary {
  const { mission, campaign } = state;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;

  const solar = getSolarFactorForDay(mission.schedule, mission.day);
  const radToday = getRadiationForDay(mission.schedule, mission.day);
  const preview = previewEnergy(state, data);
  const energySim = resolveEnergyStep(
    mission,
    mission.day,
    solar,
    cfg.shelterEnergy,
    data,
  );

  const lsUnpowered = mission.buildings.some(
    (b) =>
      (b.type === 'extractor' || b.type === 'reciclador' || b.type === 'generador') &&
      b.enabled &&
      !b.damaged &&
      mission.day >= b.operationalFromDay &&
      energySim.unpoweredIds.includes(b.id),
  );

  let energiaStatus: Status = 'seguro';
  if (lsUnpowered) {
    energiaStatus = 'critico';
  } else if (
    mission.resources.energia < cfg.energyThreshold ||
    preview.demand > preview.generated
  ) {
    energiaStatus = 'preventivo';
  }

  const activeCrewCount = Math.max(1, mission.crew.filter((c) => c.health > 0).length);
  const dailyCrewNeed = Math.max(1, activeCrewCount * data.constants.crewNeedPerDay);

  const daysO2 = Math.floor(mission.resources.oxigeno / dailyCrewNeed);
  const daysH2O = Math.floor(mission.resources.agua / dailyCrewNeed);
  const daysFood = Math.floor(mission.resources.alimentos / dailyCrewNeed);
  const marginDays = Math.min(daysO2, daysH2O, daysFood);

  let limiting: 'oxigeno' | 'agua' | 'alimentos' = 'oxigeno';
  let minVal = mission.resources.oxigeno;
  if (mission.resources.agua < minVal) {
    minVal = mission.resources.agua;
    limiting = 'agua';
  }
  if (mission.resources.alimentos < minVal) {
    minVal = mission.resources.alimentos;
    limiting = 'alimentos';
  }

  const allReservesAboveThreshold =
    mission.resources.oxigeno >= cfg.reserveThreshold &&
    mission.resources.agua >= cfg.reserveThreshold &&
    mission.resources.alimentos >= cfg.reserveThreshold;

  let soporteStatus: Status = 'seguro';
  if (marginDays <= 1) {
    soporteStatus = 'critico';
  } else if (!allReservesAboveThreshold) {
    soporteStatus = 'preventivo';
  }

  const maxExposure = Math.max(0, ...mission.crew.map((c) => c.exposure));
  const shelterSeats = getOperationalShelterSeats(mission.buildings, mission.day, data);
  const shelterReady = shelterSeats >= mission.crew.length;
  const forecast = getForecast(mission.schedule, mission.day, forecastHorizon(state, data));
  const radAlerts = forecast.filter((f) => (f.radiationLevel ?? 0) > 0);
  const alertInDays =
    radAlerts.length > 0 ? Math.min(...radAlerts.map((f) => f.inDays)) : null;

  let proteccionStatus: Status = 'seguro';
  if (maxExposure >= 75 || (radToday > 0 && !shelterReady)) {
    proteccionStatus = 'critico';
  } else if (maxExposure >= data.constants.exposureCaution || (alertInDays !== null && !shelterReady)) {
    proteccionStatus = 'preventivo';
  }

  return {
    energia: {
      status: energiaStatus,
      stored: mission.resources.energia,
      cap: mission.caps.energia,
      generationToday: preview.generated,
      demandToday: preview.demand,
    },
    soporte: {
      status: soporteStatus,
      marginDays,
      limiting,
    },
    proteccion: {
      status: proteccionStatus,
      maxExposure,
      shelterReady,
      alertInDays,
    },
  };
}
