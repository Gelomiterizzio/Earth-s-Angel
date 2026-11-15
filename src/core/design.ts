// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
// Mission design before the launch from Earth to the Moon: mission objective, launch vehicle,
// trajectory, and the payload (supplies, science instruments and crew equipment), limited by
// budget and by the rocket's mass capacity. Pure: integers only, no DOM, no clock, no random.
// The default design changes nothing, so the walkthroughs and saved games behave as before.
import type {
  CampaignState,
  DifficultyId,
  GameData,
  GameState,
  MissionResult,
  MissionState,
} from './types';

export type RocketId = 'ligero' | 'medio' | 'pesado';
export type TrajectoryId = 'economica' | 'estandar' | 'rapida';
export type PayloadId =
  | 'oxigeno' | 'agua' | 'alimentos' | 'materiales' | 'bateria'
  | 'espectrometro' | 'sensor'
  | 'herramientas' | 'taladro' | 'exotraje';
export type DesignObjectiveId = 'autosuficiente' | 'hielo' | 'solar';

export interface MissionDesign {
  objective: DesignObjectiveId;
  rocket: RocketId;
  trajectory: TrajectoryId;
  payload: PayloadId[];
}

export interface PayloadDef {
  kind: 'supply' | 'instrument' | 'crew';
  mass: number;
  cost: number;
  /** Effect size: resource units, extra explored radius, forecast days, percent or shielding. */
  amount: number;
}

export interface MissionDesignData {
  budget: Record<DifficultyId, number>;
  rockets: Record<RocketId, { capacity: number; cost: number }>;
  trajectories: Record<TrajectoryId, { cost: number; earthDays: number }>;
  payload: Record<PayloadId, PayloadDef>;
  objectives: {
    autosuficiente: { minMargin: number };
    hielo: { minIceTiles: number };
    solar: { maxExposure: number };
  };
}

export const ROCKETS: readonly RocketId[] = ['ligero', 'medio', 'pesado'];
export const TRAJECTORIES: readonly TrajectoryId[] = ['economica', 'estandar', 'rapida'];
export const PAYLOAD: readonly PayloadId[] = [
  'oxigeno', 'agua', 'alimentos', 'materiales', 'bateria',
  'espectrometro', 'sensor',
  'herramientas', 'taladro', 'exotraje',
];
export const DESIGN_OBJECTIVES: readonly DesignObjectiveId[] = ['autosuficiente', 'hielo', 'solar'];

/** What a campaign without a chosen design uses: no extras, so nothing changes. */
export const DEFAULT_DESIGN: MissionDesign = {
  objective: 'autosuficiente',
  rocket: 'medio',
  trajectory: 'economica',
  payload: [],
};

export interface DesignBudget {
  cost: number;
  budget: number;
  mass: number;
  capacity: number;
  /** Why the design cannot launch, or null when it can. */
  problem: 'budget' | 'mass' | 'unknown' | null;
}

function designData(data: GameData): MissionDesignData | null {
  return (data as GameData & { missionDesign?: MissionDesignData }).missionDesign ?? null;
}

export function designOf(campaign: CampaignState): MissionDesign {
  return (campaign as CampaignState & { design?: MissionDesign }).design ?? DEFAULT_DESIGN;
}

function hasPayload(campaign: CampaignState, id: PayloadId): boolean {
  return designOf(campaign).payload.includes(id);
}

/** Cost, mass and whether the design fits the budget and the rocket. */
export function evaluateDesign(design: MissionDesign, difficulty: DifficultyId, data: GameData): DesignBudget {
  const table = designData(data);
  if (!table) return { cost: 0, budget: 0, mass: 0, capacity: 0, problem: 'unknown' };
  const rocket = table.rockets[design.rocket];
  const trajectory = table.trajectories[design.trajectory];
  const items = design.payload.map((id) => table.payload[id]);
  if (!rocket || !trajectory || items.some((item) => !item)
    || new Set(design.payload).size !== design.payload.length
    || !DESIGN_OBJECTIVES.includes(design.objective)) {
    return { cost: 0, budget: table.budget[difficulty] ?? 0, mass: 0, capacity: 0, problem: 'unknown' };
  }
  const cost = rocket.cost + trajectory.cost + items.reduce((sum, item) => sum + item.cost, 0);
  const mass = items.reduce((sum, item) => sum + item.mass, 0);
  const budget = table.budget[difficulty] ?? 0;
  const problem = cost > budget ? 'budget' : mass > rocket.capacity ? 'mass' : null;
  return { cost, budget, mass, capacity: rocket.capacity, problem };
}

/** Supplies and instruments land with the crew: applied to a freshly created Moon mission. */
export function applyDesignToMission(mission: MissionState, campaign: CampaignState, data: GameData): MissionState {
  const table = designData(data);
  const design = designOf(campaign);
  if (!table || mission.level !== 'luna' || design.payload.length === 0) return mission;
  const resources = { ...mission.resources };
  const add = (key: keyof typeof resources, amount: number): void => {
    resources[key] = Math.min(mission.caps[key], resources[key] + amount);
  };
  for (const id of design.payload) {
    const item = table.payload[id];
    if (id === 'oxigeno' || id === 'agua' || id === 'alimentos' || id === 'materiales') add(id, item.amount);
    if (id === 'bateria') add('energia', item.amount);
  }
  let { map } = mission;
  if (design.payload.includes('espectrometro')) {
    // The spectrometer maps the ground around the landing site from orbit.
    const level = data.levels.luna;
    const radius = level.initialExploredRadius + table.payload.espectrometro.amount;
    map = {
      ...map,
      tiles: map.tiles.map((tile) => tile.explored
        || Math.max(Math.abs(tile.x - level.ship.x), Math.abs(tile.y - level.ship.y)) > radius
        ? tile : { ...tile, explored: true }),
    };
  }
  return { ...mission, resources, map };
}

/** Choose a design for a new campaign: stores it, applies its effects and the trajectory time. */
export function launchWithDesign(state: GameState, design: MissionDesign, data: GameData): GameState | null {
  const check = evaluateDesign(design, state.campaign.difficulty, data);
  if (check.problem) return null;
  if (state.mission.level !== 'luna' || state.mission.day !== 1) return null;
  const table = designData(data);
  const campaign = {
    ...state.campaign,
    design: { ...design, payload: [...design.payload] },
    earthDaysRemaining: state.campaign.earthDaysRemaining + (table?.trajectories[design.trajectory].earthDays ?? 0),
  } as CampaignState;
  return { ...state, campaign, mission: applyDesignToMission(state.mission, campaign, data) };
}

// Effects that last the whole campaign, read by the rules.

/** Earth days the chosen trajectory saves (added to the Earth countdown at launch). */
export function designTrajectoryDays(campaign: CampaignState, data: GameData): number {
  return designData(data)?.trajectories[designOf(campaign).trajectory]?.earthDays ?? 0;
}

/** Extra forecast days from the radiation sensor. */
export function designForecastBonus(campaign: CampaignState, data: GameData): number {
  return hasPayload(campaign, 'sensor') ? designData(data)?.payload.sensor.amount ?? 0 : 0;
}

/** Materials to repair a building: the tool kit makes repairs free. */
export function designRepairCost(campaign: CampaignState, base: number): number {
  return hasPayload(campaign, 'herramientas') ? 0 : base;
}

/** Mineral yield with the sampling drill (percent bonus, rounded down). */
export function designMineralYield(campaign: CampaignState, base: number, data: GameData): number {
  if (!hasPayload(campaign, 'taladro')) return base;
  const percent = designData(data)?.payload.taladro.amount ?? 0;
  return base + Math.floor((base * percent) / 100);
}

/** Exposure the shielded suits remove from an unsheltered storm day. */
export function designSuitShield(campaign: CampaignState, data: GameData): number {
  return hasPayload(campaign, 'exotraje') ? designData(data)?.payload.exotraje.amount ?? 0 : 0;
}

/** Whether the chosen objective was achieved, judged on the Moon mission result. */
export function objectiveAchieved(state: GameState, result: MissionResult, data: GameData): boolean {
  const table = designData(data);
  const design = designOf(state.campaign);
  if (!table || result.outcome !== 'victory') return false;
  switch (design.objective) {
    case 'autosuficiente':
      return Math.min(result.margins.oxigeno, result.margins.agua, result.margins.alimentos)
        >= table.objectives.autosuficiente.minMargin;
    case 'hielo': {
      const ice = state.mission.map.tiles.filter((t) => t.terrain === 'hielo' && t.explored).length;
      const extractor = state.mission.buildings.some((b) => b.type === 'extractor');
      return extractor && ice >= table.objectives.hielo.minIceTiles;
    }
    case 'solar':
      return result.maxExposure <= table.objectives.solar.maxExposure
        && state.mission.buildings.some((b) => b.type === 'refugio');
  }
}
