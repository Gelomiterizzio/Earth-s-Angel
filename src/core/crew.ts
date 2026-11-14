// AI-assisted: Antigravity (Gemini), reviewed by A

import type { CrewMember, GameData, Resources } from './types';

export interface CrewStepResult {
  crew: CrewMember[];
  resources: Resources;
  consumed: { oxigeno: number; agua: number; alimentos: number };
  shortages: { oxigeno: number; agua: number; alimentos: number };
  healthDeltas: Map<number, number>;
  wastewater: number;
}

export function createInitialCrew(crewSize: number): CrewMember[] {
  const crew: CrewMember[] = [];
  for (let i = 0; i < crewSize; i++) {
    crew.push({
      id: i,
      nameKey: `sim.crew.${i}`,
      health: 100,
      exposure: 0,
    });
  }
  return crew;
}

export function computeCrewAp(crew: CrewMember[], data: GameData): number {
  let operational = 0;
  let observation = 0;
  for (const c of crew) {
    if (c.health <= 0 || c.exposure >= data.constants.exposureLimit) continue;
    if (c.exposure < data.constants.exposureCaution) {
      operational += 1;
    } else {
      observation += 1;
    }
  }
  return operational + Math.floor(observation / 2);
}

export function consumeCrewRationsStep(
  crew: CrewMember[],
  resources: Resources,
  data: GameData,
): CrewStepResult {
  const nextRes: Resources = { ...resources };
  const activeCrew = crew.filter((c) => c.health > 0);
  const needPerResource = activeCrew.length * data.constants.crewNeedPerDay;

  const consumed = { oxigeno: 0, agua: 0, alimentos: 0 };
  const shortages = { oxigeno: 0, agua: 0, alimentos: 0 };
  const penaltyByCrewId = new Map<number, number>();

  const order: ('oxigeno' | 'agua' | 'alimentos')[] = ['oxigeno', 'agua', 'alimentos'];

  // Sort by highest initial health, then lowest id
  const sortedActive = activeCrew
    .slice()
    .sort((a, b) => b.health - a.health || a.id - b.id);

  for (const res of order) {
    const given = Math.min(needPerResource, nextRes[res]);
    nextRes[res] -= given;
    const shortage = needPerResource - given;
    consumed[res] = given;
    shortages[res] = shortage;

    if (shortage > 0) {
      const affectedCount = Math.min(shortage, sortedActive.length);
      const pen = data.constants.healthPenalty[res];
      for (let i = 0; i < affectedCount; i++) {
        const member = sortedActive[i];
        penaltyByCrewId.set(member.id, (penaltyByCrewId.get(member.id) ?? 0) + pen);
      }
    }
  }

  const healthDeltas = new Map<number, number>();
  const nextCrew: CrewMember[] = crew.map((c) => {
    if (c.health <= 0) {
      healthDeltas.set(c.id, 0);
      return { ...c, health: 0 };
    }
    const penalty = penaltyByCrewId.get(c.id) ?? 0;
    const nextHealth =
      penalty > 0
        ? Math.max(0, c.health - penalty)
        : Math.min(100, c.health + data.constants.healthRecovery);
    healthDeltas.set(c.id, nextHealth - c.health);
    return {
      ...c,
      health: nextHealth,
    };
  });

  return {
    crew: nextCrew,
    resources: nextRes,
    consumed,
    shortages,
    healthDeltas,
    wastewater: consumed.agua,
  };
}
