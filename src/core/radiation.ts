// AI-assisted: Antigravity (Gemini), reviewed by A

import type { Building, CrewMember, GameData, RadiationLevel } from './types';

export interface RadiationStepResult {
  crew: CrewMember[];
  exposureDeltas: Map<number, number>;
  shelteredById: Map<number, boolean>;
  shelterSeats: number;
}

export function getOperationalShelterSeats(
  buildings: Building[],
  day: number,
  data: GameData,
): number {
  let seats = 0;
  for (const b of buildings) {
    if (
      (b.type === 'refugio' || b.type === 'habitat') &&
      b.enabled &&
      !b.damaged &&
      day >= b.operationalFromDay
    ) {
      seats += data.buildings[b.type]?.capacity ?? 0;
    }
  }
  return seats;
}

export function applyRadiationStep(
  crew: CrewMember[],
  buildings: Building[],
  day: number,
  radiationLevel: RadiationLevel,
  shelterActive: boolean,
  data: GameData,
): RadiationStepResult {
  const shelterSeats = getOperationalShelterSeats(buildings, day, data);
  const shelteredById = new Map<number, boolean>();

  for (const c of crew) {
    shelteredById.set(c.id, false);
  }

  if (shelterActive && shelterSeats > 0) {
    const sorted = crew
      .slice()
      .sort((a, b) => b.exposure - a.exposure || a.id - b.id);
    const count = Math.min(shelterSeats, sorted.length);
    for (let i = 0; i < count; i++) {
      shelteredById.set(sorted[i].id, true);
    }
  }

  const exposureDeltas = new Map<number, number>();
  const nextCrew: CrewMember[] = crew.map((c) => {
    const isSheltered = shelteredById.get(c.id) ?? false;
    let delta = data.constants.backgroundExposure;
    if (radiationLevel > 0) {
      const key = String(radiationLevel) as '1' | '2';
      const entry = data.constants.exposure[key];
      delta += isSheltered ? entry.sheltered : entry.unsheltered;
    }
    const nextExposure = c.exposure + delta;
    exposureDeltas.set(c.id, delta);
    return {
      ...c,
      exposure: nextExposure,
    };
  });

  return {
    crew: nextCrew,
    exposureDeltas,
    shelteredById,
    shelterSeats,
  };
}
