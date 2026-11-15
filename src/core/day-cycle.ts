// AI-assisted: Antigravity (Gemini), reviewed by A

import { designStorageBonus, designSuitShield } from './design';
import type {
  DayReport,
  GameData,
  GameState,
  ResourceId,
  Resources,
  SimEvent,
} from './types';
import { computeCrewAp, consumeCrewRationsStep } from './crew';
import { computeEnergyCap, resolveEnergyStep } from './energy';
import {
  getActiveEvents,
  getDecisionEventForDay,
  getForecast,
  getRadiationForDay,
  getSolarFactorForDay,
} from './events';
import { operateModulesStep } from './life-support';
import {
  buildCauseEffectKeys,
  computeDayStability,
  evaluateMissionOutcome,
  evaluateObjectives,
} from './objectives';
import { forecastHorizon } from './progression';
import { applyRadiationStep } from './radiation';

const ALL_RESOURCES: ResourceId[] = [
  'energia',
  'oxigeno',
  'agua',
  'alimentos',
  'materiales',
];

export function startDay(
  state: GameState,
  data: GameData,
): { state: GameState; events: SimEvent[] } {
  const { mission, campaign } = state;
  const day = mission.day;
  const events: SimEvent[] = [];

  for (const b of mission.buildings) {
    if (b.operationalFromDay === day && b.type !== 'nave') {
      events.push({
        type: 'building/operational',
        buildingId: b.id,
        building: b.type,
      });
    }
  }

  const ap = computeCrewAp(mission.crew, data);
  const decisionEvt = getDecisionEventForDay(mission.schedule, day);
  const phase = decisionEvt ? 'decision' : 'planning';
  const decisionPending = decisionEvt ? decisionEvt.id : null;

  events.push({ type: 'day/started', day });

  if (decisionEvt) {
    events.push({
      type: 'decision/required',
      eventId: decisionEvt.id,
      ...(decisionEvt.sourceRef ? { sourceRef: decisionEvt.sourceRef } : {}),
    });
  }

  let buildings = mission.buildings;
  for (const event of getActiveEvents(mission.schedule, day)) {
    if (event.type !== 'averia' || event.startDay !== day || !event.target) continue;
    const target = buildings.find((b) => b.type === event.target && !b.damaged && b.operationalFromDay <= day);
    if (!target) continue;
    buildings = buildings.map((b) => b.id === target.id ? { ...b, damaged: true } : b);
    events.push({ type: 'building/damaged', buildingId: target.id, building: target.type });
  }

  const nextState: GameState = {
    campaign: { ...campaign },
    mission: {
      ...mission,
      phase,
      buildings,
      ap,
      apSpentToday: 0,
      shelterToday: false,
      decisionPending,
    },
  };

  const forecast = getForecast(mission.schedule, day, forecastHorizon(nextState, data));
  for (const item of forecast) events.push({ type: 'event/forecast', item });
  return { state: nextState, events };
}

export function advanceDay(
  state: GameState,
  data: GameData,
): { state: GameState; report: DayReport; events: SimEvent[] } {
  const { mission, campaign } = state;
  const levelCfg = data.levels[mission.level] ?? data.levels.luna;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;

  const closedDay = mission.day;
  const events: SimEvent[] = [];

  // Step 2: Active events, solar factor, radiation level
  const activeEvts = getActiveEvents(mission.schedule, closedDay);
  const activeEventsSummary = activeEvts.map((e) => ({
    id: e.id,
    type: e.type,
    ...(e.sourceRef ? { sourceRef: e.sourceRef } : {}),
  }));
  const solarFactorPct = getSolarFactorForDay(mission.schedule, closedDay);
  const radiationLevel = getRadiationForDay(mission.schedule, closedDay);

  // Step 3 & 4: Generate & allocate electricity
  const energyCap = computeEnergyCap(mission, closedDay, data);
  const energyStep = resolveEnergyStep(
    mission,
    closedDay,
    solarFactorPct,
    cfg.shelterEnergy,
    data,
  );

  for (const unpoweredId of energyStep.unpoweredIds) {
    const b = mission.buildings.find((item) => item.id === unpoweredId);
    if (b) {
      events.push({
        type: 'building/unpowered',
        buildingId: b.id,
        building: b.type,
      });
    }
  }

  // Step 5: Operate modules
  const activeCrewCount = mission.crew.filter((c) => c.health > 0).length;
  const modulesStep = operateModulesStep(
    mission.resources,
    mission.buildings,
    mission.wastewater,
    closedDay,
    energyStep.poweredIds,
    activeCrewCount,
    data,
  );

  for (const amount of modulesStep.harvestAmounts) {
    events.push({ type: 'harvest/done', amount });
  }
  const nextHarvests = mission.harvests + modulesStep.harvestAmounts.length;

  // Step 6: Crew consumption
  const crewStep = consumeCrewRationsStep(
    mission.crew,
    modulesStep.resources,
    data,
  );

  const rationTypes: ('oxigeno' | 'agua' | 'alimentos')[] = [
    'oxigeno',
    'agua',
    'alimentos',
  ];
  for (const r of rationTypes) {
    if (crewStep.shortages[r] > 0) {
      events.push({
        type: 'alert/shortage',
        resource: r,
        crewAffected: crewStep.shortages[r],
      });
    }
  }

  // Step 7: Radiation exposure
  const radStep = applyRadiationStep(
    crewStep.crew,
    modulesStep.buildings,
    closedDay,
    radiationLevel,
    energyStep.shelterActive,
    data,
    designSuitShield(campaign, data),
  );

  const allCrewSheltered =
    radStep.crew.length > 0 &&
    radStep.crew.every((c) => radStep.shelteredById.get(c.id) === true);

  if (radiationLevel > 0) {
    events.push({
      type: 'alert/radiation',
      level: radiationLevel,
      sheltered: allCrewSheltered,
    });
  }

  // Step 8: Reserves & caps
  const extraDepotCap = modulesStep.buildings
    .filter(
      (b) =>
        b.type === 'deposito' &&
        b.enabled &&
        !b.damaged &&
        closedDay >= b.operationalFromDay,
    )
    .reduce((sum, b) => sum + (data.buildings[b.type]?.capacity ?? 0), 0);

  const storageBonus = designStorageBonus(campaign, data);
  const nextCaps: Resources = {
    energia: energyCap,
    oxigeno: levelCfg.baseCaps.oxigeno + extraDepotCap + storageBonus,
    agua: levelCfg.baseCaps.agua + extraDepotCap + storageBonus,
    alimentos: levelCfg.baseCaps.alimentos + extraDepotCap + storageBonus,
    materiales: levelCfg.baseCaps.materiales + extraDepotCap + storageBonus,
  };

  const nextResources: Resources = {
    ...crewStep.resources,
    energia: energyStep.remaining,
  };

  const wasted: Partial<Resources> = {};
  for (const r of ALL_RESOURCES) {
    if (nextResources[r] > nextCaps[r]) {
      wasted[r] = nextResources[r] - nextCaps[r];
      nextResources[r] = nextCaps[r];
    }
  }
  const energyWasted = wasted.energia ?? 0;

  // Step 9: Evaluate stability, streak, objectives, outcome
  const lsOk =
    modulesStep.extractorRan &&
    modulesStep.recyclerRan &&
    modulesStep.generatorRan;

  const stateAtClose: GameState = {
    campaign: {
      ...campaign,
      appliedTransitions: [...campaign.appliedTransitions],
      clues: [...campaign.clues],
      narrativeFlags: { ...campaign.narrativeFlags },
      history: [...campaign.history],
    },
    mission: {
      ...mission,
      day: closedDay,
      resources: nextResources,
      caps: nextCaps,
      map: {
        width: mission.map.width,
        height: mission.map.height,
        tiles: mission.map.tiles.map((t) => ({ ...t })),
      },
      buildings: modulesStep.buildings,
      crew: radStep.crew,
      schedule: mission.schedule.map((e) => ({ ...e })),
      energyPriority: [...mission.energyPriority],
      wastewater: crewStep.wastewater,
      harvests: nextHarvests,
      streak: mission.streak,
      objectives: mission.objectives.map((o) => ({ ...o })),
      discoveries: [...mission.discoveries],
    },
  };

  if (mission.level === 'marte') {
    stateAtClose.mission.dust = Math.min(cfg.dustCap ?? 0, (mission.dust ?? 0) + (cfg.dustPerDay ?? 0));
  }
  const antenna = modulesStep.buildings.find((b) => b.type === 'comunicaciones' && energyStep.poweredIds.has(b.id));
  const online = antenna !== undefined;
  if (mission.level === 'marte') {
    const linkStreak = online ? (mission.linkStreak ?? 0) + 1 : 0;
    stateAtClose.mission.linkStreak = linkStreak;
    stateAtClose.mission.linkEstablished = Boolean(mission.linkEstablished || linkStreak >= (cfg.linkDays ?? 1));
    stateAtClose.mission.linkOutageDays = !online && mission.linkEstablished ? (mission.linkOutageDays ?? 0) + 1 : 0;
  }

  if (levelCfg.secret) {
    const laboratory = modulesStep.buildings.some((b) => b.type === 'laboratorio' && energyStep.poweredIds.has(b.id));
    const labDays = (mission.labDays ?? 0) + Number(laboratory);
    if (labDays) stateAtClose.mission.labDays = labDays;
    const clues = stateAtClose.campaign.clues;
    const addClue = (kind: 'signal' | 'row') => {
      const id = mission.level + '.' + kind;
      if (!clues.includes(id)) {
        clues.push(id);
        events.push({ type: 'discovery/found', discoveryId: id });
      }
    };
    if (antenna) {
      addClue('signal');
      const { x, y } = antenna;
      const beacon = levelCfg.secret.beacon;
      stateAtClose.campaign.clueSignals = {
        ...campaign.clueSignals,
        [mission.level]: { x, y, distance: Math.max(Math.abs(x - beacon.x), Math.abs(y - beacon.y)) },
      };
    }
    if (labDays >= (data.constants.labClueDays ?? 3)) addClue('row');
  }

  const stability = computeDayStability(stateAtClose, data, {
    lsOk,
    greenhouseRan: modulesStep.greenhouseRan,
    shortages: crewStep.shortages,
    radiationLevel,
    allCrewSheltered,
  });

  const prevStreak = mission.streak;
  const nextStreak = stability.stable ? prevStreak + 1 : 0;
  if (nextStreak !== prevStreak) {
    events.push({ type: 'streak/changed', streak: nextStreak });
  }
  stateAtClose.mission.streak = nextStreak;

  const nextObjectives = evaluateObjectives(stateAtClose, data, {
    lsOk,
    greenhouseRan: modulesStep.greenhouseRan,
    stable: stability.stable,
  });

  for (const nextObj of nextObjectives) {
    const prevObj = mission.objectives.find((o) => o.id === nextObj.id);
    if (nextObj.met && (!prevObj || !prevObj.met)) {
      events.push({ type: 'objective/met', objective: nextObj.id });
    }
  }
  stateAtClose.mission.objectives = nextObjectives;

  const enteredObservation = radStep.crew.some((c) => {
    const prev = mission.crew.find((p) => p.id === c.id);
    return (
      prev !== undefined &&
      prev.exposure < data.constants.exposureCaution &&
      c.exposure >= data.constants.exposureCaution &&
      c.exposure < data.constants.exposureLimit
    );
  });

  const incidents: string[] = [];
  if (crewStep.shortages.oxigeno > 0) incidents.push('sim.incident.shortage_oxigeno');
  if (crewStep.shortages.agua > 0) incidents.push('sim.incident.shortage_agua');
  if (crewStep.shortages.alimentos > 0) incidents.push('sim.incident.shortage_alimentos');
  if (energyStep.unpoweredIds.length > 0) incidents.push('sim.incident.unpowered');
  if (radiationLevel > 0 && !allCrewSheltered) {
    incidents.push('sim.incident.radiation_unsheltered');
  }
  if (modulesStep.greenhouseStressed) {
    incidents.push('sim.incident.greenhouse_stressed');
  }

  const nextEarthDaysRemaining = campaign.earthDaysRemaining - 1;
  const result = evaluateMissionOutcome({
    state: stateAtClose,
    data,
    closedDay,
    nextEarthDaysRemaining,
    objectives: nextObjectives,
    shortages: crewStep.shortages,
    incidents,
  });

  // Step 10: Clock & report
  const causeEffectKeys = buildCauseEffectKeys({
    solarFactorPct,
    unpoweredCount: energyStep.unpoweredIds.length,
    noWaterForModule: modulesStep.noWaterForModule,
    greenhouseStressed: modulesStep.greenhouseStressed,
    harvestCount: modulesStep.harvestAmounts.length,
    energyWasted,
    shortages: crewStep.shortages,
    radiationLevel,
    allCrewSheltered,
    enteredObservation,
    prevStreak,
    nextStreak,
    stability,
    prevObjectives: mission.objectives,
    nextObjectives,
  });

  const crewReport = radStep.crew.map((c) => ({
    id: c.id,
    health: c.health,
    healthDelta: crewStep.healthDeltas.get(c.id) ?? 0,
    exposure: c.exposure,
    exposureDelta: radStep.exposureDeltas.get(c.id) ?? 0,
    sheltered: radStep.shelteredById.get(c.id) ?? false,
  }));

  const report: DayReport = {
    day: closedDay,
    level: mission.level,
    activeEvents: activeEventsSummary,
    solarFactorPct,
    radiationLevel,
    energy: {
      start: energyStep.start,
      generated: energyStep.generated,
      used: energyStep.used,
      end: nextResources.energia,
      cap: energyCap,
      wasted: energyWasted,
      unpowered: energyStep.unpoweredIds,
    },
    produced: modulesStep.produced,
    moduleInputs: modulesStep.moduleInputs,
    crewConsumed: crewStep.consumed,
    shortages: crewStep.shortages,
    wasted,
    crew: crewReport,
    shelter: {
      requested: mission.shelterToday,
      active: energyStep.shelterActive,
    },
    stable: stability.stable,
    streak: nextStreak,
    objectives: nextObjectives,
    causeEffectKeys,
    result,
  };

  events.push({ type: 'day/ended', report });

  const nextHistory = result
    ? [...campaign.history, result]
    : [...campaign.history];

  if (result) {
    events.push({
      type: result.outcome === 'victory' ? 'mission/victory' : 'mission/defeat',
      result,
    });
  }

  const finalState: GameState = {
    campaign: {
      ...stateAtClose.campaign,
      earthDaysRemaining: nextEarthDaysRemaining,
      history: nextHistory,
    },
    mission: {
      ...stateAtClose.mission,
      day: closedDay + 1,
      phase: result ? 'ended' : 'report',
      lastReport: report,
      result,
    },
  };

  return { state: finalState, report, events };
}
