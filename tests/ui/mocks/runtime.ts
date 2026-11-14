// AI-assisted: Cursor Grok 4.7, reviewed by C
// Preview stand-in for src/core. The real summaries belong to A.

export function summarizeHud(state) {
  const crew = Math.max(1, state.mission.crew.length);
  const margin = Math.min(
    Math.floor(state.mission.resources.oxigeno / crew),
    Math.floor(state.mission.resources.agua / crew),
    Math.floor(state.mission.resources.alimentos / crew),
  );
  const exposure = state.mission.crew.reduce((max, member) => Math.max(max, member.exposure), 0);
  return {
    energia: {
      status: state.mission.resources.energia >= 10 ? 'seguro' : 'preventivo',
      stored: state.mission.resources.energia,
      cap: state.mission.caps.energia,
      generationToday: 8,
      demandToday: 4,
    },
    soporte: {
      status: margin <= 1 ? 'critico' : margin < 4 ? 'preventivo' : 'seguro',
      marginDays: margin,
      limiting: 'oxigeno',
    },
    proteccion: {
      status: exposure >= 75 ? 'critico' : exposure >= 50 ? 'preventivo' : 'seguro',
      maxExposure: exposure,
      shelterReady: state.mission.buildings.some((building) => building.type === 'refugio'),
      alertInDays: 2,
    },
  };
}

export function computeForecast() {
  return [{ eventId: 'luna-sep-1', type: 'tormenta-solar', inDays: 2, durationDays: 1, radiationLevel: 2, sourceRef: '2017-09-10T16:25:00-SEP-001' }];
}

export function previewEnergy() {
  return { generated: 8, demand: 4, shelterAffordable: true };
}

export function previewAction(state, action, data) {
  if (action.type !== 'BUILD') return null;
  if (state.mission.phase !== 'planning') return { code: 'WRONG_PHASE', messageKey: 'sim.error.WRONG_PHASE' };
  const def = data.buildings[action.building];
  if (!def) return { code: 'UNKNOWN_BUILDING', messageKey: 'sim.error.UNKNOWN_BUILDING' };
  if (state.mission.resources.materiales < def.cost) {
    return { code: 'NO_MATERIALS', messageKey: 'sim.error.NO_MATERIALS', params: { need: def.cost, have: state.mission.resources.materiales } };
  }
  if (state.mission.ap < def.apCost) return { code: 'NO_AP', messageKey: 'sim.error.NO_AP' };
  return null;
}
